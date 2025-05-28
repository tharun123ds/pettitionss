"use client";

import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { AppHeader } from '@/components/core/app-header';
import { AppSidebar } from '@/components/core/app-sidebar';
import { SidebarProvider, SidebarInset, useSidebar } from '@/components/ui/sidebar';
import { Spinner } from '@/components/core/spinner';
import { cn } from '@/lib/utils';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }
  
  // Content that needs sidebar state must be child of SidebarProvider
  const MainContent = () => {
    const { state: sidebarState } = useSidebar(); // Access sidebar state here if needed for main content adjustments

    return (
      <div className={cn(
        "flex flex-1 flex-col overflow-hidden",
        // Example: Adjust main content padding based on sidebar state for non-inset variants
        // This might be more complex depending on exact styling goals with ui/sidebar variants
      )}>
        <AppHeader />
        <SidebarInset className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          {children}
        </SidebarInset>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen> {/* Manage open state (e.g., via cookies or user preference) */}
      <div className={cn(
          "flex min-h-screen w-full",
          // Use bg-muted/40 when sidebar is variant="inset" or "floating", otherwise bg-background
          // This depends on the specific variant of <Sidebar> used in AppSidebar
          "bg-muted/20" // A light overall background for the app area
        )}
      >
        <AppSidebar userName={user?.name || "User"} userEmail={user?.email || ""} />
        <MainContent />
      </div>
    </SidebarProvider>
  );
}
