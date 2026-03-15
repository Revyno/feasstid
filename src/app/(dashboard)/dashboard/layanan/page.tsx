"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Layanan } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { HARGA_KATEGORI, DURASI_HARI_KATEGORI, type ServiceCategory } from "@/types/database";

export default function LayananPage() {
  const [items, setItems] = useState<Layanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Layanan | null>(null);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data } = await supabase.from("layanans").select("*").order("created_at", { ascending: false });
    setItems((data as Layanan[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = items.filter((l) => l.nama_layanan.toLowerCase().includes(search.toLowerCase()));

  async function handleDelete(id: string) {
    if (!confirm("Yakin?")) return;
    await supabase.from("layanans").delete().eq("id", id);
    fetchData();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const kategori = fd.get("kategori_layanan") as ServiceCategory;
    const payload = {
      nama_layanan: fd.get("nama_layanan") as string,
      kategori_layanan: kategori,
      deskripsi: fd.get("deskripsi") as string,
      durasi_hari: DURASI_HARI_KATEGORI[kategori] ?? 1,
      is_active: fd.get("is_active") === "true",
    };
    if (editing) {
      await supabase.from("layanans").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("layanans").insert(payload);
    }
    setDialogOpen(false);
    setEditing(null);
    fetchData();
  }

  function formatCurrency(v: number) {
    return `Rp ${v.toLocaleString("id-ID")}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Layanan</h1>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger render={<Button />}><PlusIcon className="w-4 h-4 mr-2" /> Tambah Layanan</DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Tambah"} Layanan</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Nama Layanan</Label><Input name="nama_layanan" defaultValue={editing?.nama_layanan ?? ""} required className="mt-1" /></div>
              <div>
                <Label>Kategori</Label>
                <select name="kategori_layanan" defaultValue={editing?.kategori_layanan ?? "basic"} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="deep">Deep Clean</option>
                  <option value="unyellowing">Unyellowing</option>
                  <option value="repaint">Repaint</option>
                  <option value="repair">Repair</option>
                </select>
              </div>
              <div><Label>Deskripsi</Label><Textarea name="deskripsi" defaultValue={editing?.deskripsi ?? ""} className="mt-1" /></div>
              <div>
                <Label>Status</Label>
                <select name="is_active" defaultValue={editing?.is_active === false ? "false" : "true"} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>
              <Button type="submit" className="w-full">{editing ? "Update" : "Simpan"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Daftar Layanan</CardTitle>
            <Input placeholder="Cari layanan..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-muted-foreground py-8 text-center">Loading...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Layanan</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Belum ada data</TableCell></TableRow>
                ) : filtered.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.nama_layanan}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{l.kategori_layanan}</Badge></TableCell>
                    <TableCell>{formatCurrency(HARGA_KATEGORI[l.kategori_layanan])}</TableCell>
                    <TableCell>{l.durasi_hari} hari</TableCell>
                    <TableCell><Badge variant={l.is_active ? "default" : "secondary"}>{l.is_active ? "Aktif" : "Nonaktif"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(l); setDialogOpen(true); }}><Pencil1Icon className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(l.id)}><TrashIcon className="w-4 h-4 text-red-500" /></Button>
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
