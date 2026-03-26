"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  Users,
  Layers,
  BarChart2,
  ShoppingBag,
  Footprints,
  CreditCard,
  LogOut,
  Bell,
  Moon,
  Sun,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navGroups = [
  {
    label: null,
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { label: "Admin", href: "/dashboard/users", icon: Settings },
    ],
  },
  {
    label: "MANAJEMEN USER",
    items: [
      { label: "Pelanggan", href: "/dashboard/pelanggan", icon: Users },
    ],
  },
  {
    label: "LAPORAN",
    items: [
      { label: "Laporan", href: "/dashboard/laporan", icon: BarChart2 },
    ],
  },
  {
    label: "MASTER DATA",
    items: [
      { label: "Layanans", href: "/dashboard/layanan", icon: Layers },
      { label: "Jenis Sepatu", href: "/dashboard/jenis-sepatu", icon: Footprints },
      { label: "Pesanan", href: "/dashboard/pesanan", icon: ShoppingBag },
    ],
  },
  {
    label: "TRANSAKSI",
    items: [
      { label: "Pembayaran", href: "/dashboard/pembayaran", icon: CreditCard },
    ],
  },
];

function AppSidebar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const router = useRouter();

  const username =
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "Admin";

  const email = user?.email ?? "admin@feastid.com";
  const initials = username.slice(0, 2).toUpperCase();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
      <SidebarHeader className="p-4 flex flex-row items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-950 flex items-center justify-center border border-gray-800">
            <Image src="/logo/1.jpg" alt="Logo" width={40} height={40} className="object-cover" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-black text-xs text-gray-900 dark:text-gray-100 tracking-tight">FEAST ID</span>
            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest leading-none">Laundry Sepatu</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {navGroups.map((group, gi) => (
          <SidebarGroup key={gi} className="py-2">
            {group.label && (
              <SidebarGroupLabel className="text-[10px] font-black text-orange-500 uppercase tracking-widest px-2 group-data-[collapsible=icon]:hidden">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        className={cn(
                          "transition-all h-10 px-3 rounded-xl font-bold",
                          isActive 
                            ? "bg-orange-50 text-orange-500 dark:bg-orange-950/20 shadow-sm border-l-4 border-orange-500" 
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                        render={<Link href={item.href} className="flex items-center gap-3" />}
                      >
                        <item.icon className={cn("w-4 h-4", isActive ? "text-orange-500" : "text-gray-400")} />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-50 dark:border-gray-800">
        <div className="flex items-center gap-3 px-1 py-1 group/footer cursor-pointer">
          <Avatar className="w-8 h-8 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm">
             <AvatarFallback className="bg-gray-950 text-white text-[10px] font-black">
               {initials}
             </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-black text-gray-900 dark:text-gray-100 truncate tracking-tight">{username}</span>
            <span className="text-[10px] text-orange-500 font-bold truncate tracking-tight lowercase">{email}</span>
          </div>
          <button 
            onClick={handleLogout}
            title="Sign out"
            className="text-gray-400 hover:text-red-500 transition-colors group-data-[collapsible=icon]:hidden"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  // Build breadcrumb from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumb = segments.map((seg, idx) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, idx + 1).join("/"),
  }));

  const initials = (user?.user_metadata?.username || user?.email?.split("@")[0] || "AL").slice(0, 2).toUpperCase();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 w-full overflow-hidden">
        <AppSidebar user={user} />
        <SidebarInset className="flex flex-col w-full min-h-screen bg-gray-50 dark:bg-gray-950">
          {/* Header */}
          <header className="h-14 md:h-16 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 flex items-center px-3 md:px-6 gap-2 md:gap-4 sticky top-0 z-30 transition-shadow duration-300">
            <SidebarTrigger className="text-gray-400 hover:text-orange-500 transition-colors flex-shrink-0" />
            
            <div className="h-4 w-px bg-gray-100 dark:bg-gray-800 mx-1 md:mx-2 flex-shrink-0" />

            <nav className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-400 flex-1 overflow-hidden">
              {breadcrumb.map((seg, idx) => (
                <React.Fragment key={seg.href}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-gray-200 flex-shrink-0" />}
                  <Link 
                    href={seg.href} 
                    className={cn(
                      "transition-colors hover:text-orange-500 capitalize whitespace-nowrap",
                      idx === breadcrumb.length - 1 ? "text-gray-900 dark:text-gray-100 font-black" : ""
                    )}
                  >
                    {seg.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
            {/* Mobile: page title only */}
            <span className="sm:hidden flex-1 text-sm font-black text-gray-900 dark:text-gray-100 truncate capitalize">
              {breadcrumb[breadcrumb.length - 1]?.label || "Dashboard"}
            </span>

            <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
              <button className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all">
                <Bell className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="hidden sm:block w-px h-6 bg-gray-100 dark:bg-gray-800 mx-1" />

              <div className="flex items-center gap-2">
                 <Avatar className="w-8 h-8 md:w-9 md:h-9 border-2 border-white dark:border-gray-800 shadow-sm">
                   <AvatarFallback className="bg-gray-950 text-white text-[11px] font-black">
                     {initials}
                   </AvatarFallback>
                 </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}