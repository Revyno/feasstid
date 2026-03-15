"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
} from "@/components/ui/sidebar";
import {
  DashboardIcon,
  ReaderIcon,
  PersonIcon,
  GearIcon,
  BarChartIcon,
  CardStackIcon,
  LayersIcon,
  ExitIcon,
  ArchiveIcon,
} from "@radix-ui/react-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

const menuItems = [
  { label: "Overview", href: "/dashboard", icon: DashboardIcon },
  { label: "Pesanan", href: "/dashboard/pesanan", icon: ReaderIcon },
  { label: "Pelanggan", href: "/dashboard/pelanggan", icon: PersonIcon },
  { label: "Layanan", href: "/dashboard/layanan", icon: LayersIcon },
  { label: "Pembayaran", href: "/dashboard/pembayaran", icon: CardStackIcon },
  { label: "Jenis Sepatu", href: "/dashboard/jenis-sepatu", icon: ArchiveIcon },
  { label: "Laporan", href: "/dashboard/laporan", icon: BarChartIcon },
  { label: "Users", href: "/dashboard/users", icon: GearIcon },
];

function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="text-xl font-extrabold text-sidebar-foreground">
          <Image src="/logo/1.jpg" alt="Logo" width={50} height={50}/>
        </Link>
        <h1 className="text-bold text-sidebar-foreground/60 mt-0.5 text-lg">
          Admin Dashboard
        </h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton isActive={pathname === item.href}>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <ExitIcon className="w-4 h-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  const username =
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${username}`;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <span className="text-sm font-medium text-muted-foreground">
            Dashboard
          </span>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm font-medium">
              Welcome {username}
            </span>
            <Avatar>
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}