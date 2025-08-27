
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

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading, error: authError, clearError, userDetails } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('admin@branchflow.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
      if (authError) {
          setError(authError);
      }
  }, [authError]);

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
    clearError();
    setError(null);
    
    if (locked) {
        setError('الحساب مقفل مؤقتاً. حاول بعد 30 دقيقة.');
        return;
    }

    try {
      await login(email, password);
      
      setAttempts(0);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بعودتك!",
      });

      router.push("/");

    } catch (err: any) {
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
            setError(`${err.message} (المحاولات المتبقية: ${5 - newAttempts})`);
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
