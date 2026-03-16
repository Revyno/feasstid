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
  ExitIcon,
  CardStackIcon,
} from "@radix-ui/react-icons";

const menuItems = [
  { label: "Dashboard", href: "/customer", icon: DashboardIcon },
  { label: "Pesanan", href: "/customer/pesanan", icon: ReaderIcon },
  { label: "Payments", href: "/customer/payments", icon: CardStackIcon },
  { label: "Profile", href: "/customer/profile", icon: PersonIcon },
];

function CustomerSidebar() {
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
      <SidebarHeader className="p-4 flex items-center gap-2">
        <Image src="/logo/1.jpg" alt="Logo" width={50} height={50} />
        <p className="text-bold text-sidebar-foreground/60 mt-0.5 text-lg">
          Customer Dashboard
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton isActive={isActive}>
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
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

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    const getCustomer = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .limit(1)
        .single();
      if (error) {
        console.error(error);
        return;
      }
      setCustomer(data);
    };
    getCustomer();
  }, []);

  const username =
    customer?.name ||
    customer?.email?.split("@")[0] ||
    "Customer";

  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${username}`;

  return (
    <SidebarProvider>
      <CustomerSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <span className="text-sm font-medium text-muted-foreground">
              Dashboard
            </span>
          </div>
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