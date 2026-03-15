"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { JenisSepatu } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";

export default function JenisSepatuPage() {
  const [items, setItems] = useState<JenisSepatu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JenisSepatu | null>(null);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data } = await supabase.from("jenis_sepatus").select("*").order("created_at", { ascending: false });
    setItems((data as JenisSepatu[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = items.filter((j) => j.nama_jenis.toLowerCase().includes(search.toLowerCase()) || j.merek?.toLowerCase().includes(search.toLowerCase()));

  async function handleDelete(id: string) {
    if (!confirm("Yakin?")) return;
    await supabase.from("jenis_sepatus").delete().eq("id", id);
    fetchData();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      nama_jenis: fd.get("nama_jenis") as string,
      merek: fd.get("merek") as string,
      bahan: fd.get("bahan") as string,
      keterangan: fd.get("keterangan") as string,
      is_active: fd.get("is_active") === "true",
    };
    if (editing) {
      await supabase.from("jenis_sepatus").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("jenis_sepatus").insert(payload);
    }
    setDialogOpen(false);
    setEditing(null);
    fetchData();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Jenis Sepatu</h1>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger render={<Button />}><PlusIcon className="w-4 h-4 mr-2" /> Tambah Jenis</DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Tambah"} Jenis Sepatu</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Nama Jenis</Label><Input name="nama_jenis" defaultValue={editing?.nama_jenis ?? ""} required className="mt-1" /></div>
              <div><Label>Merek</Label><Input name="merek" defaultValue={editing?.merek ?? ""} className="mt-1" /></div>
              <div><Label>Bahan</Label><Input name="bahan" defaultValue={editing?.bahan ?? ""} className="mt-1" /></div>
              <div><Label>Keterangan</Label><Input name="keterangan" defaultValue={editing?.keterangan ?? ""} className="mt-1" /></div>
              <div>
                <Label>Status</Label>
                <select name="is_active" defaultValue={editing?.is_active === false ? "false" : "true"} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="true">Aktif</option><option value="false">Nonaktif</option>
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
            <CardTitle className="text-lg">Daftar Jenis Sepatu</CardTitle>
            <Input placeholder="Cari jenis/merek..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-muted-foreground py-8 text-center">Loading...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Jenis</TableHead><TableHead>Merek</TableHead><TableHead>Bahan</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Belum ada data</TableCell></TableRow>
                ) : filtered.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell className="font-medium">{j.nama_jenis}</TableCell>
                    <TableCell>{j.merek ?? "-"}</TableCell>
                    <TableCell>{j.bahan ?? "-"}</TableCell>
                    <TableCell><Badge variant={j.is_active ? "default" : "secondary"}>{j.is_active ? "Aktif" : "Nonaktif"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(j); setDialogOpen(true); }}><Pencil1Icon className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(j.id)}><TrashIcon className="w-4 h-4 text-red-500" /></Button>
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
