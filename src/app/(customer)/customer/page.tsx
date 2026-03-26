"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  ReaderIcon,
  CounterClockwiseClockIcon,
  CheckCircledIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import { Pesanan } from "@/types/database";
import { getCustomerSession } from "@/lib/auth-utils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Stats {
  totalOrders: number;
  ordersInProcess: number;
  pendingOrders: number;
  readyForPickup: number;
}

export default function CustomerDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    ordersInProcess: 0,
    pendingOrders: 0,
    readyForPickup: 0,
  });
  const [orders, setOrders] = useState<Pesanan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const customerSession = getCustomerSession();
      
      if (!customerSession) {
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: ordersData } = await supabase
        .from("pesanans")
        .select("*")
        .eq("customer_id", customerSession.id)
        .order("created_at", { ascending: false });

      const myOrders = ordersData ?? [];
      
      const totalOrders = myOrders.length;
      const ordersInProcess = myOrders.filter((o) => o.status === "in_process").length;
      const pendingOrders = myOrders.filter((o) => o.status === "pending").length;
      const readyForPickup = myOrders.filter((o) => o.status === "ready").length;

      setStats({
        totalOrders,
        ordersInProcess,
        pendingOrders,
        readyForPickup,
      });
      setOrders(myOrders);
      setLoading(false);
    }
    
    load();
  }, []);

  const cards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      desc: "Lifetime",
      icon: <ReaderIcon className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-50",
    },
    {
      title: "Orders in Process",
      value: stats.ordersInProcess.toString().padStart(2, '0'),
      icon: <CounterClockwiseClockIcon className="w-5 h-5 text-yellow-500" />,
      bg: "bg-yellow-50",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders.toString().padStart(2, '0'),
      icon: <CounterClockwiseClockIcon className="w-5 h-5 text-orange-500" />,
      bg: "bg-orange-50",
    },
    {
      title: "Ready for Pickup",
      value: stats.readyForPickup.toString().padStart(2, '0'),
      icon: <CheckCircledIcon className="w-5 h-5 text-emerald-500" />,
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/3 mb-2" />
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {cards.map((c, i) => (
            <Card key={i}>
              <CardContent className="p-4 md:p-6 pt-3 md:pt-4 relative">
                 <div className="flex justify-between items-start mb-3 md:mb-4">
                    <div className={`${c.bg} p-2 rounded-lg`}>{c.icon}</div>
                    {c.desc && <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-500 hidden sm:block">{c.desc}</span>}
                 </div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 leading-tight">{c.title}</div>
                <div className="text-2xl md:text-3xl font-bold">{c.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
          <CardHeader className="p-5 sm:p-8 pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Pesanan Terakhir</CardTitle>
                <Link href="/customer/pesanan" className="text-sm font-bold text-orange-500 hover:underline decoration-2">Lihat Semua</Link>
              </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-8 pt-0">
             {orders.length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-none">
                          <TableHead className="font-black text-[10px] uppercase tracking-widest">Kode</TableHead>
                          <TableHead className="font-black text-[10px] uppercase tracking-widest">Tanggal</TableHead>
                          <TableHead className="font-black text-[10px] uppercase tracking-widest text-right">Total</TableHead>
                          <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.slice(0, 5).map((order) => (
                          <TableRow key={order.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 border-gray-50 transition-colors">
                            <TableCell className="py-4">
                              <Link href={`/customer/pesanan/${order.id}`}>
                                <span className="font-black text-orange-500 group-hover:underline">{order.kode_pesanan}</span>
                              </Link>
                            </TableCell>
                            <TableCell className="py-4 text-sm font-medium text-gray-500">
                                {new Date(order.tanggal_pesanan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                            </TableCell>
                            <TableCell className="py-4 text-right font-bold text-gray-900 dark:text-gray-100">
                                Rp {order.total_harga.toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className="py-4 text-center">
                                <Badge className={cn(
                                    "px-3 py-1 rounded-full font-bold text-[10px] uppercase border bg-transparent",
                                    order.status === 'pending' ? "text-orange-600 border-orange-200" :
                                    order.status === 'in_process' ? "text-blue-600 border-blue-200" :
                                    order.status === 'ready' ? "text-emerald-600 border-emerald-200" :
                                    "text-gray-500 border-gray-200"
                                )}>
                                    {order.status}
                                </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
             ) : (
               <div className="min-h-[300px] flex flex-col items-center justify-center text-center py-10">
                  <div className="bg-orange-50 dark:bg-orange-950/20 p-6 rounded-full mb-6">
                       <ReaderIcon className="w-10 h-10 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2 uppercase tracking-wide">Belum ada pesanan</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8 font-medium">
                      Sepertinya Anda belum memiliki riwayat pesanan aktif. Mulai hari ini dengan sepatu yang bersih dan wangi!
                  </p>
                  <Link 
                    href="/customer/pesanan/create" 
                    className="bg-orange-500 hover:bg-orange-600 text-white gap-2 h-14 px-10 rounded-2xl font-black shadow-xl shadow-orange-100 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                  >
                     <PlusIcon className="w-5 h-5 flex-shrink-0" />
                     Buat Pesanan Baru
                  </Link>
               </div>
             )}
          </CardContent>
      </Card>
      
      <p className="text-sm text-gray-500 flex items-center gap-2">
           <span className="text-orange-500 p-1 bg-orange-50 rounded-full">!</span>
           Orders usually take 24-48 hours for standard processing.
      </p>
      
    </div>
  );
}
