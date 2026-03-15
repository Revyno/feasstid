"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LaporanLaundry } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon, BarChartIcon } from "@radix-ui/react-icons";

export default function LaporanPage() {
  const [items, setItems] = useState<LaporanLaundry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data } = await supabase.from("laporan_laundries").select("*").order("periode_awal", { ascending: false });
    setItems((data as LaporanLaundry[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function fmt(v: number) { return `Rp ${Number(v).toLocaleString("id-ID")}`; }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      periode_awal: fd.get("periode_awal") as string,
      periode_akhir: fd.get("periode_akhir") as string,
      total_pendapatan: Number(fd.get("total_pendapatan")),
      total_pengeluaran: Number(fd.get("total_pengeluaran")),
      total_profit: Number(fd.get("total_pendapatan")) - Number(fd.get("total_pengeluaran")),
      total_pesanan: Number(fd.get("total_pesanan")),
      total_sepatu: Number(fd.get("total_sepatu")),
      pesanan_selesai: Number(fd.get("pesanan_selesai")),
      pesanan_batal: Number(fd.get("pesanan_batal")),
    };
    await supabase.from("laporan_laundries").insert(payload);
    setDialogOpen(false);
    fetchData();
  }

  // Summary stats
  const totalPendapatan = items.reduce((s, l) => s + Number(l.total_pendapatan), 0);
  const totalProfit = items.reduce((s, l) => s + Number(l.total_profit), 0);
  const totalPesanan = items.reduce((s, l) => s + l.total_pesanan, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Laporan</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}><PlusIcon className="w-4 h-4 mr-2" /> Tambah Laporan</DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Tambah Laporan</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Periode Awal</Label><Input name="periode_awal" type="date" required className="mt-1" /></div>
                <div><Label>Periode Akhir</Label><Input name="periode_akhir" type="date" required className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Total Pendapatan</Label><Input name="total_pendapatan" type="number" required className="mt-1" /></div>
                <div><Label>Total Pengeluaran</Label><Input name="total_pengeluaran" type="number" required className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Total Pesanan</Label><Input name="total_pesanan" type="number" required className="mt-1" /></div>
                <div><Label>Total Sepatu</Label><Input name="total_sepatu" type="number" required className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Pesanan Selesai</Label><Input name="pesanan_selesai" type="number" required className="mt-1" /></div>
                <div><Label>Pesanan Batal</Label><Input name="pesanan_batal" type="number" required className="mt-1" /></div>
              </div>
              <Button type="submit" className="w-full">Simpan</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Pendapatan</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-600">{fmt(totalPendapatan)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Profit</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{fmt(totalProfit)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Pesanan</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalPesanan}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><BarChartIcon className="w-5 h-5" /> Laporan Periodik</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-muted-foreground py-8 text-center">Loading...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periode</TableHead><TableHead>Pendapatan</TableHead><TableHead>Pengeluaran</TableHead><TableHead>Profit</TableHead><TableHead>Pesanan</TableHead><TableHead>Selesai</TableHead><TableHead>Batal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Belum ada laporan</TableCell></TableRow>
                ) : items.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-sm">{l.periode_awal} — {l.periode_akhir}</TableCell>
                    <TableCell className="text-emerald-600 font-medium">{fmt(l.total_pendapatan)}</TableCell>
                    <TableCell className="text-red-500">{fmt(l.total_pengeluaran)}</TableCell>
                    <TableCell className="text-blue-600 font-medium">{fmt(l.total_profit)}</TableCell>
                    <TableCell>{l.total_pesanan}</TableCell>
                    <TableCell>{l.pesanan_selesai}</TableCell>
                    <TableCell>{l.pesanan_batal}</TableCell>
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
