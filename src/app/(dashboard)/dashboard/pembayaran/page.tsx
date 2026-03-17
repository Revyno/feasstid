"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Pembayaran } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  partial: "bg-orange-100 text-orange-800",
  paid: "bg-green-100 text-green-800",
  refund: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
};

export default function PembayaranPage() {
  const [items, setItems] = useState<Pembayaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Pembayaran | null>(null);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data } = await supabase.from("pembayarans").select("*, pesanan:pesanans(kode_pesanan)").order("created_at", { ascending: false });
    setItems((data as Pembayaran[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = items.filter(
    (p) => p.nomor_referensi?.toLowerCase().includes(search.toLowerCase()) || (p.pesanan as unknown as { kode_pesanan: string })?.kode_pesanan?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (!confirm("Yakin?")) return;
    await supabase.from("pembayarans").delete().eq("id", id);
    fetchData();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      pesanan_id: fd.get("pesanan_id") as string,
      tanggal_pembayaran: fd.get("tanggal_pembayaran") as string,
      jumlah_dibayar: Number(fd.get("jumlah_dibayar")),
      metode_pembayaran: fd.get("metode_pembayaran") as string,
      status_pembayaran: fd.get("status_pembayaran") as string,
      nomor_referensi: fd.get("nomor_referensi") as string,
      catatan: fd.get("catatan") as string,
    };
    if (editing) {
      await supabase.from("pembayarans").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("pembayarans").insert(payload);
    }
    setDialogOpen(false);
    setEditing(null);
    fetchData();
  }

  function fmt(v: number) { return `Rp ${Number(v).toLocaleString("id-ID")}`; }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pembayaran</h1>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger render={<Button />}><PlusIcon className="w-4 h-4 mr-2" /> Tambah Pembayaran</DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Tambah"} Pembayaran</DialogTitle></DialogHeader>
            <form key={editing?.id ?? "new"} onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Pesanan ID</Label><Input name="pesanan_id" defaultValue={editing?.pesanan_id ?? ""} required className="mt-1" /></div>
              <div><Label>Tanggal Pembayaran</Label><Input name="tanggal_pembayaran" type="date" defaultValue={editing?.tanggal_pembayaran ?? new Date().toISOString().slice(0, 10)} required className="mt-1" /></div>
              <div><Label>Jumlah Dibayar</Label><Input name="jumlah_dibayar" type="number" defaultValue={editing?.jumlah_dibayar ?? 0} required className="mt-1" /></div>
              <div>
                <Label>Metode</Label>
                <select name="metode_pembayaran" defaultValue={editing?.metode_pembayaran ?? "cash"} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="cash">Cash</option><option value="transfer">Transfer</option><option value="ewallet">E-Wallet</option><option value="qris">QRIS</option><option value="debit">Debit</option><option value="credit">Credit</option>
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select name="status_pembayaran" defaultValue={editing?.status_pembayaran ?? "pending"} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="pending">Pending</option><option value="partial">Partial</option><option value="paid">Paid</option><option value="refund">Refund</option><option value="failed">Failed</option>
                </select>
              </div>
              <div><Label>Nomor Referensi</Label><Input name="nomor_referensi" defaultValue={editing?.nomor_referensi ?? ""} className="mt-1" /></div>
              <div><Label>Catatan</Label><Textarea name="catatan" defaultValue={editing?.catatan ?? ""} className="mt-1" /></div>
              <Button type="submit" className="w-full">{editing ? "Update" : "Simpan"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Daftar Pembayaran</CardTitle>
            <Input placeholder="Cari referensi/kode..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-muted-foreground py-8 text-center">Loading...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Pesanan</TableHead><TableHead>Tanggal</TableHead><TableHead>Jumlah</TableHead><TableHead>Metode</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Belum ada data</TableCell></TableRow>
                ) : filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">{(p.pesanan as unknown as { kode_pesanan: string })?.kode_pesanan ?? "-"}</TableCell>
                    <TableCell>{p.tanggal_pembayaran}</TableCell>
                    <TableCell>{fmt(p.jumlah_dibayar)}</TableCell>
                    <TableCell className="capitalize">{p.metode_pembayaran}</TableCell>
                    <TableCell><Badge variant="secondary" className={statusColors[p.status_pembayaran]}>{p.status_pembayaran}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setDialogOpen(true); }}><Pencil1Icon className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><TrashIcon className="w-4 h-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
