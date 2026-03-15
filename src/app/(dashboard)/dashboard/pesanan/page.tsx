"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Pesanan } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_process: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  ready: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function PesananPage() {
  const [orders, setOrders] = useState<Pesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Pesanan | null>(null);

  const supabase = createClient();

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from("pesanans")
      .select("*, customer:customers(name)")
      .order("created_at", { ascending: false });
    setOrders((data as Pesanan[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter(
    (o) =>
      o.kode_pesanan.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer as unknown as { name: string })?.name?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus pesanan ini?")) return;
    await supabase.from("pesanans").delete().eq("id", id);
    fetchOrders();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      customer_id: fd.get("customer_id") as string,
      tanggal_pesanan: fd.get("tanggal_pesanan") as string,
      status: fd.get("status") as string,
      metode_pengantaran: fd.get("metode_pengantaran") as string,
      catatan: fd.get("catatan") as string,
    };

    if (editing) {
      await supabase.from("pesanans").update(payload).eq("id", editing.id);
    } else {
      const kode = `LND-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(orders.length + 1).padStart(3, "0")}`;
      await supabase.from("pesanans").insert({ ...payload, kode_pesanan: kode });
    }
    setDialogOpen(false);
    setEditing(null);
    fetchOrders();
  }

  function formatCurrency(v: number) {
    return `Rp ${Number(v).toLocaleString("id-ID")}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pesanan</h1>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger render={<Button />}>
            <PlusIcon className="w-4 h-4 mr-2" /> Tambah Pesanan
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Pesanan" : "Tambah Pesanan"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Customer ID</Label>
                <Input name="customer_id" defaultValue={editing?.customer_id ?? ""} required className="mt-1" />
              </div>
              <div>
                <Label>Tanggal Pesanan</Label>
                <Input name="tanggal_pesanan" type="date" defaultValue={editing?.tanggal_pesanan ?? new Date().toISOString().slice(0, 10)} required className="mt-1" />
              </div>
              <div>
                <Label>Status</Label>
                <select name="status" defaultValue={editing?.status ?? "pending"} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="pending">Pending</option>
                  <option value="in_process">In Process</option>
                  <option value="completed">Completed</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <Label>Metode Pengantaran</Label>
                <select name="metode_pengantaran" defaultValue={editing?.metode_pengantaran ?? "drop_off"} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="drop_off">Drop Off</option>
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>
              <div>
                <Label>Catatan</Label>
                <Textarea name="catatan" defaultValue={editing?.catatan ?? ""} className="mt-1" />
              </div>
              <Button type="submit" className="w-full">{editing ? "Update" : "Simpan"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Daftar Pesanan</CardTitle>
            <Input placeholder="Cari kode/customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground py-8 text-center">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">Belum ada data pesanan</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-sm">{o.kode_pesanan}</TableCell>
                      <TableCell>{(o.customer as unknown as { name: string })?.name ?? "-"}</TableCell>
                      <TableCell>{o.tanggal_pesanan}</TableCell>
                      <TableCell>{formatCurrency(o.total_harga)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[o.status] ?? ""}>{o.status.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(o); setDialogOpen(true); }}>
                          <Pencil1Icon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(o.id)}>
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
