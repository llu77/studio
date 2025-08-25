
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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


export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('admin@branchflow.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بعودتك!",
      });
      router.push("/");
    } catch (err) {
        const authError = err as AuthError;
        let errorMessage = "حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.";
        if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
            errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
        } else if (authError.code === 'auth/invalid-email') {
            errorMessage = "صيغة البريد الإلكتروني غير صحيحة.";
        } else if (authError.code) {
            errorMessage = authError.message;
        }
        setError(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="font-headline text-3xl">مرحباً بعودتك</CardTitle>
          <CardDescription>
            سجل الدخول إلى حسابك في BranchFlow
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
                disabled={loading}
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
                disabled={loading}
                />
            </div>
            <Button type="submit" className="w-full font-headline text-lg" size="lg" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'تسجيل الدخول'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
