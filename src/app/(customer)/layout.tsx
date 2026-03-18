"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { CustomerSidebar } from "@/components/dashboard/customer-sidebar";
import { Input } from "@/components/ui/input";
import { Search, Bell, HelpCircle, ChevronDown, Sun, Moon, Package, Clock, CheckCircle2, CreditCard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCustomerSession } from "@/lib/auth-utils";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [customer, setCustomer] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const session = getCustomerSession();
    if (session) {
      setCustomer(session);
    }
  }, []);

  const notifications = [
    { id: 1, title: "Pesanan Diproses", desc: "Sepatu Nike Air Jordan Anda sedang dalam tahap cleaning.", time: "2 menit lalu", icon: Clock, color: "text-blue-500 bg-blue-50" },
    { id: 2, title: "Pembayaran Berhasil", desc: "Pembayaran untuk kode #FST001 telah dikonfirmasi.", time: "1 jam lalu", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50" },
    { id: 3, title: "Siap Dijemput", desc: "Pesanan #FST002 sudah selesai dan siap diambil.", time: "3 jam lalu", icon: Package, color: "text-orange-500 bg-orange-50" },
  ];

  const username = customer?.name || "Customer";
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${username}`;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#FAFAFA] dark:bg-gray-950 transition-colors duration-300">
        <CustomerSidebar />
        <SidebarInset className="flex flex-col w-full overflow-hidden bg-transparent">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between px-8 bg-transparent">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <SidebarTrigger className="-ml-1" />
              <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                <Input 
                  placeholder="Cari layanan atau bantuan..." 
                  className="w-full pl-11 h-11 border-none bg-white dark:bg-gray-900 shadow-sm rounded-xl focus-visible:ring-1 focus-visible:ring-orange-500 transition-all text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 ml-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={cn(
                    "relative p-2 rounded-xl transition-all shadow-sm hover:shadow-md",
                    showNotifications ? "bg-orange-50 text-orange-500 dark:bg-orange-950/30" : "text-gray-400 hover:text-orange-500 hover:bg-white dark:hover:bg-gray-800"
                  )}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#FAFAFA] dark:border-gray-900" />
                </button>

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white">Notifikasi</h3>
                        <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full uppercase">3 Baru</span>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                        {notifications.map((n) => (
                          <div key={n.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                            <div className="flex gap-3">
                              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", n.color)}>
                                <n.icon className="w-5 h-5" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">{n.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{n.desc}</p>
                                <p className="text-[10px] text-gray-400 font-medium pt-1">{n.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Link href="/customer/notifications" className="block p-3 text-center text-xs font-bold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors border-t border-gray-50 dark:border-gray-800">
                        Lihat Semua Notifikasi
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {mounted && (
                <button 
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 text-gray-400 hover:text-orange-500 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm hover:shadow-md bg-white dark:bg-gray-900"
                  title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              )}
              
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
                <Avatar className="h-10 w-10 border-2 border-white shadow-md ring-1 ring-gray-100 transition-transform hover:scale-105 cursor-pointer">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>{username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start">
                   <div className="flex items-center gap-1 cursor-pointer group">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-orange-500 transition-colors">{username}</span>
                      <ChevronDown className="h-3 w-3 text-gray-400 group-hover:text-orange-500 transition-colors" />
                   </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-8 pb-8 overflow-y-auto">
            <div className="max-w-[1400px] mx-auto">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}