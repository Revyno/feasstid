"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Lock, 
  Bell,
  ChevronRight,
  UserCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

import { getCustomerSession } from "@/lib/auth-utils";

export default function ProfilePage() {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const data = getCustomerSession();
      if (data) {
        setCustomer(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      const currentCustomer = getCustomerSession();
      if (!currentCustomer) {
        toast.error("Anda harus login kembali");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase
        .from("customers")
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        })
        .eq("id", currentCustomer.id);

      if (error) throw error;
      
      // Update cookie
      const updatedCustomer = { ...currentCustomer, ...formData };
      document.cookie = `customer=${JSON.stringify(updatedCustomer)}; path=/`;
      setCustomer(updatedCustomer);
      
      toast.success("Profil berhasil diperbarui");
    } catch (error: any) {
      toast.error(`Gagal memperbarui profil: ${error.message}`);
    }
  };

  const username = formData.name || "Customer";

  return (
    <div className="space-y-8 animate-in slide-in-from-top-4 duration-500 max-w-5xl pb-20">
      {/* Header with Title and Notification */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
             <UserCircle className="w-8 h-8 text-orange-500" />
             Edit Profil - {username}
          </h1>
        </div>
      </div>

      <div className="space-y-10">
        {/* Informasi Pribadi */}
        <section className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                    <User className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest pl-1">Informasi Pribadi</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-3">
                    <Label className="text-xs font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest pl-1">Nama Lengkap</Label>
                    <Input 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="h-14 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl focus-visible:ring-orange-500/20 focus-visible:border-orange-500 font-bold dark:text-gray-100" 
                    />
                </div>
                <div className="space-y-3">
                    <Label className="text-xs font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest pl-1">Email</Label>
                    <div className="relative">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <Input 
                            value={formData.email} 
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="h-14 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl focus-visible:ring-orange-500/20 focus-visible:border-orange-500 font-bold dark:text-gray-100" 
                        />
                    </div>
                </div>
                <div className="space-y-3 md:col-span-2">
                    <Label className="text-xs font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest pl-1">Nomor Telepon</Label>
                    <div className="relative">
                         <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                         <Input 
                            value={formData.phone} 
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="h-14 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl focus-visible:ring-orange-500/20 focus-visible:border-orange-500 font-bold dark:text-gray-100" 
                         />
                    </div>
                </div>
            </div>
          </div>
        </section>

        {/* Alamat Pengiriman */}
        <section className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                    <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest pl-1">Alamat Pengiriman</h2>
            </div>
            
            <div className="space-y-3">
                <Label className="text-xs font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest pl-1">Alamat Lengkap</Label>
                <Textarea 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Jl. Melati No. 123..."
                    className="min-h-[140px] border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 rounded-[2rem] p-8 focus-visible:ring-orange-500/20 font-bold text-gray-900 dark:text-gray-100 leading-relaxed" 
                />
            </div>
          </div>
        </section>

        {/* Status Keanggotaan */}
        <section className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest pl-1">Status Keanggotaan</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50/50 dark:bg-gray-800/50 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex items-center justify-between group transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl hover:border-orange-100 dark:hover:border-orange-900/50">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">LEVEL MEMBER</p>
                        <p className="text-2xl font-black text-orange-500 tracking-tight capitalize">{customer?.membership_level || "Regular Member"}</p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-white border-2 border-orange-100 flex items-center justify-center text-orange-400 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                        <Star className="w-8 h-8 fill-current" />
                    </div>
                </div>
                <div className="bg-gray-50/50 dark:bg-gray-800/50 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex items-center justify-between group transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl hover:border-orange-100 dark:hover:border-orange-900/50">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">TOTAL POIN</p>
                        <p className="text-2xl font-black text-orange-500 tracking-tight">{customer?.points || 0} pts</p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-white border-2 border-orange-100 flex items-center justify-center text-orange-400 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                        <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-black text-xs">★</div>
                    </div>
                </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-5 pt-4">
            <Button variant="ghost" onClick={() => window.location.reload()} className="h-14 px-12 rounded-[1.5rem] font-black text-white bg-red-500 hover:bg-red-600 shadow-xl shadow-red-100 transition-all hover:scale-105 active:scale-95 text-lg">
                Batal
            </Button>
            <Button onClick={handleSave} className="h-14 px-12 rounded-[1.5rem] font-black text-white bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-100 transition-all hover:scale-105 active:scale-95 text-lg">
                Simpan Perubahan
            </Button>
        </div>
      </div>
    </div>
  );
}
