"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Dashboard", href: "/customer", icon: LayoutDashboard },
  { label: "Pesanan Saya", href: "/customer/pesanan", icon: ShoppingBag },
  { label: "Payments", href: "/customer/payments", icon: CreditCard },
  { label: "Profile", href: "/customer/profile", icon: User },
];

import { getCustomerSession } from "@/lib/auth-utils";

export function CustomerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    const session = getCustomerSession();
    if (session) {
      setCustomer(session);
    }
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Clear customer cookie
    document.cookie = "customer=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    router.push("/login");
    router.refresh();
  }

  const username = customer?.name || "Customer";
  const membership = customer?.membership_level || "Regular Member";
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${username}`;

  return (
    <Sidebar className="border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300" variant="sidebar">
      <SidebarHeader className="p-6 flex items-center justify-center">
        <div className="flex items-center gap-3">
             <div className="w-16 h-16 relative">
                <Image src="/logo/1.jpg" alt="Feast ID" fill className="object-contain" />
             </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      isActive={isActive}
                      className={cn(
                        "h-12 px-4 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-orange-50 text-orange-500 hover:bg-orange-100 hover:text-orange-600 dark:bg-orange-950/30 dark:text-orange-400" 
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3 font-semibold text-lg w-full">
                        <item.icon className={cn("w-6 h-6", isActive ? "text-orange-500 dark:text-orange-400" : "text-gray-400 dark:text-gray-500")} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl group">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{username.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate max-w-[100px]">{username}</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium capitalize">{membership.replace('_', ' ')} Member</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
