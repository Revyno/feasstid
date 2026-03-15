"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import {
  ReaderIcon,
  PersonIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  CardStackIcon,
  ClockIcon,
} from "@radix-ui/react-icons";

interface Stats {
  totalOrders: number;
  totalCustomers: number;
  completedOrders: number;
  orderSuccessRate: number;
  paidPayments: number;
  pendingPayments: number;
  unpaidPayments: number;
  failedPayments: number;
  paymentSuccessRate: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalCustomers: 0,
    completedOrders: 0,
    orderSuccessRate: 0,
    paidPayments: 0,
    pendingPayments: 0,
    unpaidPayments: 0,
    failedPayments: 0,
    paymentSuccessRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const [ordersRes, customersRes, paymentsRes] = await Promise.all([
        supabase.from("pesanans").select("id, status"),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("pembayarans").select("id, status_pembayaran"),
      ]);

      const orders = ordersRes.data ?? [];
      const totalOrders = orders.length;
      const completedOrders = orders.filter((o) =>
        ["completed", "delivered"].includes(o.status)
      ).length;
      const orderSuccessRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

      const payments = paymentsRes.data ?? [];
      const totalPayments = payments.length;
      const paidPayments = payments.filter((p) => p.status_pembayaran === "paid").length;
      const pendingPayments = payments.filter((p) => p.status_pembayaran === "pending").length;
      const failedPayments = payments.filter((p) => p.status_pembayaran === "failed").length;
      const unpaidPayments = totalPayments - paidPayments;
      const paymentSuccessRate = totalPayments > 0 ? (paidPayments / totalPayments) * 100 : 0;

      setStats({
        totalOrders,
        totalCustomers: customersRes.count ?? 0,
        completedOrders,
        orderSuccessRate,
        paidPayments,
        pendingPayments,
        unpaidPayments,
        failedPayments,
        paymentSuccessRate,
      });
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      desc: "Total pesanan yang telah dibuat",
      icon: <ReaderIcon className="w-5 h-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      desc: "Total pelanggan terdaftar",
      icon: <PersonIcon className="w-5 h-5" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Order Success Rate",
      value: `${stats.orderSuccessRate.toFixed(1)}%`,
      desc: `${stats.completedOrders} dari ${stats.totalOrders} pesanan selesai`,
      icon: <CheckCircledIcon className="w-5 h-5" />,
      color:
        stats.orderSuccessRate >= 80
          ? "text-emerald-600"
          : stats.orderSuccessRate >= 60
          ? "text-yellow-600"
          : "text-red-600",
      bg:
        stats.orderSuccessRate >= 80
          ? "bg-emerald-50"
          : stats.orderSuccessRate >= 60
          ? "bg-yellow-50"
          : "bg-red-50",
    },
    {
      title: "Payment Success",
      value: `${stats.paymentSuccessRate.toFixed(1)}%`,
      desc: `${stats.paidPayments} pembayaran lunas`,
      icon: <CardStackIcon className="w-5 h-5" />,
      color:
        stats.paymentSuccessRate >= 80
          ? "text-emerald-600"
          : stats.paymentSuccessRate >= 60
          ? "text-yellow-600"
          : "text-red-600",
      bg:
        stats.paymentSuccessRate >= 80
          ? "bg-emerald-50"
          : stats.paymentSuccessRate >= 60
          ? "bg-yellow-50"
          : "bg-red-50",
    },
    {
      title: "Unpaid Payments",
      value: stats.unpaidPayments,
      desc: "Pembayaran belum lunas",
      icon: <CrossCircledIcon className="w-5 h-5" />,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments,
      desc: "Sedang diproses",
      icon: <ClockIcon className="w-5 h-5" />,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Card key={c.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {c.title}
                </CardTitle>
                <div className={`${c.bg} ${c.color} p-2 rounded-lg`}>{c.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{c.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
