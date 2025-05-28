"use client";

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import Link from 'next/link';
import { Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;
type RegisterFormInputs = z.infer<typeof registerSchema>;

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const { login, register: authRegister } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentSchema = mode === 'login' ? loginSchema : registerSchema;
  type CurrentFormInputs = typeof mode extends 'login' ? LoginFormInputs : RegisterFormInputs;

  const { register, handleSubmit, formState: { errors } } = useForm<CurrentFormInputs>({
    resolver: zodResolver(currentSchema),
  });

  const onSubmit: SubmitHandler<CurrentFormInputs> = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        const { email } = data as LoginFormInputs;
        // In a real app, you'd verify password. Here, we just use email and a dummy name.
        login(email, email.split('@')[0] || "User"); 
      } else {
        const { email, name } = data as RegisterFormInputs;
        authRegister(email, name);
      }
      // AuthProvider handles navigation on success
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setIsLoading(false);
    }
    // setIsLoading(false) will be handled by navigation or error display
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">{mode === 'login' ? 'Welcome Back!' : 'Create an Account'}</CardTitle>
        <CardDescription>
          {mode === 'login' ? "Sign in to continue to DecentralizeIt." : "Join us to make your voice heard."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="name" type="text" placeholder="John Doe" {...register('name' as any)} className="pl-10" />
              </div>
              {errors.name && <p className="text-sm text-destructive">{(errors.name as any).message}</p>}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} className="pl-10" />
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} className="pl-10" />
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'login' ? 'Login' : 'Create Account'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href={mode === 'login' ? '/auth/register' : '/auth/login'}>
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </Link>
            </Button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
