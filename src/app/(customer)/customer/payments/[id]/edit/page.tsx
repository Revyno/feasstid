"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCustomerSession } from "@/lib/auth-utils";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function PaymentEditPage({ params }: { params: { id: string } }) {   
    const router = useRouter();
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    useEffect(() => {
        async function fetchCustomer() {
            const session = getCustomerSession();
            if (session) {
                setCustomer(session);
            }
            setLoading(false);
        }
        fetchCustomer();
    }, []);

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
        await supabase.from("pembayarans").update(payload).eq("id", params.id);
        toast.success("Pembayaran berhasil diperbarui");
        router.push("/customer/payments");
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!customer) {
        return <div>Customer not found</div>;
    }

    return (
        <div className="p-6">
            <Button variant="outline" className="mb-4" onClick={() => router.back()}><ArrowLeft className="w-4 h-4 mr-2" /> Kembali</Button>    
            <h2 className="text-2xl font-bold mb-4">Edit Pembayaran</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="pesanan_id">ID Pesanan</Label>
                    <Input type="text" name="pesanan_id" id="pesanan_id" required />
                </div>
                <div>
                    <Label htmlFor="tanggal_pembayaran">Tanggal Pembayaran</Label>
                    <Input type="date" name="tanggal_pembayaran" id="tanggal_pembayaran" required />
                </div>
                <div>
                    <Label htmlFor="jumlah_dibayar">Jumlah Dibayar</Label>
                    <Input type="number" name="jumlah_dibayar" id="jumlah_dibayar" required />
                </div>
                <div>
                    <Label htmlFor="metode_pembayaran">Metode Pembayaran</Label>
                    <Input type="text" name="metode_pembayaran" id="metode_pembayaran" required />
                </div>
                <div>
                    <Label htmlFor="status_pembayaran">Status Pembayaran</Label>
                    <Input type="text" name="status_pembayaran" id="status_pembayaran" required />
                </div>
                <div>
                    <Label htmlFor="nomor_referensi">Nomor Referensi</Label>
                    <Input type="text" name="nomor_referensi" id="nomor_referensi" />
                </div>
                <div>
                    <Label htmlFor="catatan">Catatan</Label>
                    <Input type="text" name="catatan" id="catatan" />
                </div>
                <Button type="submit">Simpan</Button>
            </form>
        </div>
    );
}