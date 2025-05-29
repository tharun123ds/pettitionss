
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
        const { email, password } = data as LoginFormInputs;
        // Password verification is simplified for this demo
        login(email, email.split('@')[0] || "User"); 
      } else {
        const { email, name, password } = data as RegisterFormInputs;
         // Password usage is simplified for this demo
        authRegister(email, name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">{mode === 'login' ? 'Access Your Account' : 'Create Your Secure Account'}</CardTitle>
        <CardDescription>
          {mode === 'login' ? "Access your decentralized identity and continue to DecentralizeIt." : "Join our decentralized platform to make your voice heard. Your identity is key (simulated)."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name / Alias</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="name" type="text" placeholder="Your Public Name" {...register('name' as any)} className="pl-10" />
              </div>
              {errors.name && <p className="text-sm text-destructive">{(errors.name as any).message}</p>}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} className="pl-10" />
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password (Keep it Secret!)</Label>
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
            {mode === 'login' ? 'Unlock Account' : 'Register Secure Account'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            {mode === 'login' ? "Don't have an account? " : "Already have a secure account? "}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href={mode === 'login' ? '/auth/register' : '/auth/login'}>
                {mode === 'login' ? 'Register' : 'Login'}
              </Link>
            </Button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
