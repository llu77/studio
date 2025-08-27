
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
  const { user, login, loading: authLoading, error: authError, clearError } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('admin@branchflow.com');
  const [password, setPassword] = useState('123456');

  useEffect(() => {
    if (user) {
        router.push('/');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بعودتك! سيتم توجيهك الآن.",
      });

      // The useEffect above will handle the redirection.
    } catch (err: any) {
      // The error is already set in the auth context,
      // so we just show a generic toast. The alert will show the specific error.
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الدخول",
        description: authError || "الرجاء التحقق من بياناتك والمحاولة مرة أخرى.",
      });
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
            {authError && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>خطأ في تسجيل الدخول</AlertTitle>
                    <AlertDescription>{authError}</AlertDescription>
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
                disabled={authLoading}
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
                disabled={authLoading}
                />
            </div>
            <Button type="submit" className="w-full text-lg font-bold" size="lg" disabled={authLoading}>
              {authLoading ? <Loader2 className="animate-spin" /> : 'تسجيل الدخول'}
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
