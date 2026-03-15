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
import { Separator } from "@/components/ui/separator";
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
          Feast<span className="text-blue-400">.id</span>
        </Link>
        <p className="text-xs text-sidebar-foreground/60 mt-0.5">Admin Dashboard</p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton isActive={pathname === item.href}>
                    <Link href={item.href}>
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
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium text-muted-foreground">Dashboard</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
