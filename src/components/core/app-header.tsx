"use client";

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, User as UserIcon, PanelLeft } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import Link from 'next/link';
import { Logo } from './logo';

export function AppHeader() {
  const { user, logout } = useAuth();
  const { isMobile } = useSidebar(); // Get isMobile from useSidebar

  const getInitials = (name: string = "") => {
    const names = name.split(' ');
    if (names.length === 1) return names[0]?.[0]?.toUpperCase() || '';
    return (names[0]?.[0] || '') + (names[names.length - 1]?.[0] || '');
  };
  
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden">
          <PanelLeft />
        </SidebarTrigger>
        {/* Logo can be hidden on mobile if space is tight, or shown if SidebarTrigger is part of sidebar */}
        {/* Or shown if sidebar is not of type 'offcanvas' in shadcn terms for md+ */}
        <div className="hidden md:block">
          <Logo />
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatarUrl || `https://placehold.co/100x100.png?text=${getInitials(user?.name)}`} alt={user?.name || "User"} data-ai-hint="person portrait" />
              <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile"> {/* Assuming a profile page */}
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings"> {/* Assuming a settings page */}
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
