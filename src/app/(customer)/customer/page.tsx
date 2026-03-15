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
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) return;

      const { data: customerData } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", userData.user.id)
        .single();

      if (!customerData) {
         setLoading(false);
         return;
      }

      const { data: ordersData } = await supabase
        .from("pesanans")
        .select("*")
        .eq("customer_id", customerData.id)
        .order("created_at", { ascending: false });

      const myOrders = ordersData ?? [];
      
      const totalOrders = myOrders.length;
      const ordersInProcess = myOrders.filter((o) => o.status === "processing").length;
      const pendingOrders = myOrders.filter((o) => o.status === "pending").length;
      const readyForPickup = myOrders.filter((o) => o.status === "ready_to_deliver" || o.status === "ready_for_pickup").length;

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c, i) => (
            <Card key={i}>
              <CardContent className="p-6 pt-4 relative">
                 <div className="flex justify-between items-start mb-4">
                    <div className={`${c.bg} p-2 rounded-lg`}>{c.icon}</div>
                    {c.desc && <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-500">{c.desc}</span>}
                 </div>
                <div className="text-sm font-medium text-muted-foreground mb-1">{c.title}</div>
                <div className="text-3xl font-bold">{c.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
          <CardHeader>
              <CardTitle>Customer Current Orders</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[300px] flex flex-col items-center justify-center text-center">
             <div className="bg-orange-50 p-4 rounded-full mb-4">
                  <ReaderIcon className="w-8 h-8 text-orange-500" />
             </div>
             <h3 className="text-lg font-bold mb-2">No current orders</h3>
             <p className="text-gray-500 max-w-sm mb-6">
                 It looks like you dont have any active laundry orders at the moment. Need a fresh start?
             </p>
             <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2" type="button">
                 <Link href="/customer/orders/create" className="flex items-center gap-2">
                    <PlusIcon className="w-4 h-4" />
                    Place New Order
                 </Link>
             </Button>
          </CardContent>
      </Card>
      
      <p className="text-sm text-gray-500 flex items-center gap-2">
           <span className="text-orange-500 p-1 bg-orange-50 rounded-full">!</span>
           Orders usually take 24-48 hours for standard processing.
      </p>
      
    </div>
  );
}
