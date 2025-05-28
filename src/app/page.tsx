"use client";

import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/core/logo';
import { Spinner } from '@/components/core/spinner';
import { Cpu, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) { // Only show spinner during initial load, not if redirecting
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }
  
  if (isAuthenticated) { // If authenticated and not loading, router.replace is in progress
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Logo />
          <nav className="space-x-2 sm:space-x-4">
            <Button variant="ghost" asChild><Link href="/auth/login">Login</Link></Button>
            <Button asChild><Link href="/auth/register">Sign Up</Link></Button>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="container mx-auto text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              Empower Change with <span className="text-primary">DecentralizeIt</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Voice your opinions, gather support, and drive action. Create and sign petitions securely and transparently, powered by community.
            </p>
            <Button size="lg" asChild className="group">
              <Link href="/auth/register">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </section>
        
        <section className="py-16 md:py-24">
           <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Image 
                  src="https://placehold.co/600x400.png" 
                  alt="Community Collaboration" 
                  width={600} 
                  height={400} 
                  className="rounded-xl shadow-2xl"
                  data-ai-hint="community collaboration" 
                />
              </div>
              <div>
                <span className="text-sm font-semibold uppercase text-primary">How it works</span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">A New Era of Petitioning</h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  DecentralizeIt revolutionizes how collective voices are heard. From AI-assisted petition creation to community-driven outcome voting, we provide the tools for impactful advocacy.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-accent mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Create with AI</h4>
                      <p className="text-muted-foreground text-sm">Smartly categorize and refine your petitions.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-accent mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Secure Signing</h4>
                      <p className="text-muted-foreground text-sm">Utilize mock wallet integration for transparent signing.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-accent mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Vote on Outcomes</h4>
                      <p className="text-muted-foreground text-sm">Community decides on proposed actions post-petition.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">Why Choose DecentralizeIt?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Cpu className="w-10 h-10 text-primary mb-4" />}
                title="AI-Powered Categorization"
                description="Smartly categorize petitions for better discovery and organization, ensuring your cause reaches the right audience."
              />
              <FeatureCard
                icon={<Users className="w-10 h-10 text-primary mb-4" />}
                title="Community Voting"
                description="Engage your community by proposing outcomes and voting on the best course of action after a petition gains traction."
              />
              <FeatureCard
                icon={<ShieldCheck className="w-10 h-10 text-primary mb-4" />}
                title="Transparent & Secure"
                description="Leverage modern technology for a trustworthy petitioning process. (Wallet signing is simulated for this demo)."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t bg-secondary/50">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} DecentralizeIt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-card p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
      {icon}
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

