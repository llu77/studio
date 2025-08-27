
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { useRouter } from "next/navigation";
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import type { AuthError } from 'firebase/auth';
// NEW FEATURE: Added Select components for branch selection
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// NEW FEATURE: Import firestore functionalities to fetch branches and user data
import { doc, getDoc, collection, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase'; 

// NEW FEATURE: Mock branches data until Firestore is connected
const mockBranches = [
    { id: 'branch_laban', name: 'فرع لبن' },
    { id: 'branch_tuwaiq', name: 'فرع طويق' },
];


export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading, userDetails } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('admin@branchflow.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);

  // NEW FEATURE: State for branch selection and enhanced security
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState<{id: string, name: string}[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  // NEW FEATURE: Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
        try {
            // In a real scenario, this would fetch from Firestore. Using mock for now.
            // const branchesSnapshot = await getDocs(collection(db, 'branches'));
            // const branchesData = branchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as {id: string, name: string}[];
            setBranches(mockBranches);
        } catch (e) {
            console.error("Failed to fetch branches: ", e);
            setError("فشل في تحميل قائمة الفروع.");
        }
    };
    fetchBranches();
  }, []);

  // NEW FEATURE: Check lock status on component mount
  useEffect(() => {
    const lockTime = localStorage.getItem('lockTime');
    if (lockTime) {
      const timePassed = Date.now() - parseInt(lockTime);
      if (timePassed < 30 * 60 * 1000) { // 30 minutes lock
        setLocked(true);
        const timeLeft = 30 * 60 * 1000 - timePassed;
        setTimeout(() => {
          setLocked(false);
          localStorage.removeItem('lockTime');
        }, timeLeft);
      } else {
        localStorage.removeItem('lockTime');
      }
    }
  }, []);

  useEffect(() => {
    if (user && userDetails) {
        router.push('/');
    }
  }, [user, userDetails, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // NEW FEATURE: Lockout check
    if (locked) {
        setError('الحساب مقفل مؤقتاً. حاول بعد 30 دقيقة.');
        return;
    }

    if (!branchId) {
        setError("الرجاء اختيار الفرع للمتابعة.");
        return;
    }

    try {
      const loggedInUser = await login(email, password);
      
      const userDocRef = doc(db, "users", loggedInUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
          throw new Error("لم يتم العثور على بيانات المستخدم.");
      }
      const userData = userDoc.data();
      
      const userBranchId = userData.branch === 'فرع لبن' ? 'branch_laban' : userData.branch === 'فرع طويق' ? 'branch_tuwaiq' : 'all';

      if (userBranchId !== branchId && userData.role !== 'مدير النظام' && userBranchId !== 'all') {
          await logout();
          throw new Error('الفرع المختار غير صحيح لهذا الحساب.');
      }
       
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp(),
        loginBranch: branchId === 'branch_laban' ? 'فرع لبن' : 'فرع طويق'
      });
      
      setAttempts(0); // Reset attempts on successful login
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بعودتك!",
      });

      router.push("/");

    } catch (err) {
        const authError = err as AuthError | Error;
        let errorMessage = "حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.";
        if ('code' in authError) {
            if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
                errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
            } else if (authError.code === 'auth/invalid-email') {
                errorMessage = "صيغة البريد الإلكتروني غير صحيحة.";
            }
        } else {
            errorMessage = authError.message;
        }

        // NEW FEATURE: Brute-force protection
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 5) {
            setLocked(true);
            localStorage.setItem('lockTime', Date.now().toString());
            setError('تم تجاوز عدد المحاولات المسموح. الحساب مقفل لمدة 30 دقيقة.');
            setTimeout(() => {
              setLocked(false);
              setAttempts(0);
              localStorage.removeItem('lockTime');
            }, 30 * 60 * 1000);
        } else {
            setError(`${errorMessage} (المحاولات المتبقية: ${5 - newAttempts})`);
        }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-border/60">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-3xl font-bold">مرحباً بعودتك</CardTitle>
          <CardDescription>
            سجل الدخول إلى حسابك في BranchFlow لإدارة فروعك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>خطأ في تسجيل الدخول</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="email@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || locked}
                />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || locked}
                />
            </div>

            {/* NEW FEATURE: Branch Selector */}
            <div className="space-y-2">
              <Label htmlFor="branch">الفرع</Label>
              <Select value={branchId} onValueChange={setBranchId} required disabled={loading || locked}>
                <SelectTrigger id="branch">
                  <SelectValue placeholder="اختر الفرع" />
                </SelectTrigger>
                <SelectContent>
                  {branches.length > 0 ? (
                    branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>جاري تحميل الفروع...</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full text-lg font-bold" size="lg" disabled={loading || locked}>
              {loading ? <Loader2 className="animate-spin" /> : locked ? 'الحساب مقفل' : 'تسجيل الدخول'}
            </Button>
          </form>
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">© 2024 BranchFlow. جميع الحقوق محفوظة.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
