"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FilePlus2, ScrollText, LogOut, Settings, Bell } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface AppSidebarProps {
  userName: string;
  userEmail: string;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/petitions/new', label: 'Create Petition', icon: FilePlus2 },
  { href: '/dashboard/my-petitions', label: 'My Petitions', icon: ScrollText, badge: 3 }, // Example badge
];

export function AppSidebar({ userName, userEmail }: AppSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const getInitials = (name: string = "") => {
    const names = name.split(' ');
    if (names.length === 1) return names[0]?.[0]?.toUpperCase() || '';
    return (names[0]?.[0] || '') + (names[names.length - 1]?.[0] || '');
  };

  return (
    <Sidebar side="left" collapsible="icon" variant="sidebar" className="border-r">
      <SidebarHeader className="p-4 border-b">
         {/* Logo for expanded sidebar, icon for collapsed */}
        <div className="group-data-[collapsible=icon]:hidden">
          <Logo />
        </div>
        <div className="hidden group-data-[collapsible=icon]:block text-primary">
           <Link href="/dashboard" className="flex items-center justify-center">
            <LayoutDashboard className="h-7 w-7" /> {/* Using Dashboard icon as placeholder */}
           </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                tooltip={{ children: item.label, className: "capitalize" }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                  {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarSeparator />

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/dashboard/notifications"}
              tooltip={{ children: "Notifications", className: "capitalize" }}
            >
              <Link href="/dashboard/notifications">
                <Bell />
                <span>Notifications</span>
                <SidebarMenuBadge>5</SidebarMenuBadge>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/dashboard/settings"}
              tooltip={{ children: "Settings", className: "capitalize" }}
            >
              <Link href="/dashboard/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <div className="flex items-center gap-2 p-2 rounded-md group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
                <Avatar className="h-8 w-8 group-data-[collapsible=icon]:h-full group-data-[collapsible=icon]:w-full">
                  <AvatarImage src={`https://placehold.co/40x40.png?text=${getInitials(userName)}`} alt={userName} data-ai-hint="person portrait" />
                  <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                </Avatar>
                <div className="group-data-[collapsible=icon]:hidden flex flex-col text-left">
                    <span className="text-sm font-medium truncate">{userName}</span>
                    <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
                </div>
             </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
