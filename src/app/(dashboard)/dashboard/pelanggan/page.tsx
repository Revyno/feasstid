"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Customer } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";

const membershipColors: Record<string, string> = {
  regular: "bg-gray-100 text-gray-700",
  silver: "bg-slate-200 text-slate-800",
  gold: "bg-yellow-100 text-yellow-800",
  platinum: "bg-purple-100 text-purple-800",
};

export default function PelangganPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    setItems((data as Customer[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = items.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus pelanggan ini?")) return;
    await supabase.from("customers").delete().eq("id", id);
    fetchData();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: fd.get("phone") as string,
      address: fd.get("address") as string,
      membership_level: fd.get("membership_level") as string,
    };
    if (editing) {
      await supabase.from("customers").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("customers").insert(payload);
    }
    setDialogOpen(false);
    setEditing(null);
    fetchData();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pelanggan</h1>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger render={<Button />}>
            <PlusIcon className="w-4 h-4 mr-2" /> Tambah Pelanggan
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Tambah"} Pelanggan</DialogTitle></DialogHeader>
            <form key={editing?.id ?? "new"} onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Nama</Label><Input name="name" defaultValue={editing?.name ?? ""} required className="mt-1" /></div>
              <div><Label>Email</Label><Input name="email" type="email" defaultValue={editing?.email ?? ""} required className="mt-1" /></div>
              <div><Label>Phone</Label><Input name="phone" defaultValue={editing?.phone ?? ""} className="mt-1" /></div>
              <div><Label>Alamat</Label><Input name="address" defaultValue={editing?.address ?? ""} className="mt-1" /></div>
              <div>
                <Label>Membership</Label>
                <select name="membership_level" defaultValue={editing?.membership_level ?? "regular"} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="regular">Regular</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
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
            <CardTitle className="text-lg">Daftar Pelanggan</CardTitle>
            <Input placeholder="Cari nama/email..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-muted-foreground py-8 text-center">Loading...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Belum ada data</TableCell></TableRow>
                ) : filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.phone ?? "-"}</TableCell>
                    <TableCell>{c.total_points}</TableCell>
                    <TableCell><Badge variant="secondary" className={membershipColors[c.membership_level]}>{c.membership_level}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setDialogOpen(true); }}><Pencil1Icon className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><TrashIcon className="w-4 h-4 text-red-500" /></Button>
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
