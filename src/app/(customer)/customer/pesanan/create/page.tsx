"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
    ChevronRight, 
    Trash2, 
    X,
    Upload, 
    Minus, 
    Plus, 
    Camera,
    MoreVertical,
    Save,
    Info,
    ArrowLeft,
    ChevronDown,
    ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { getCustomerSession } from "@/lib/auth-utils";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";   
import Image from "next/image";
import { Search } from "lucide-react";

export default function PesananCreatePage() {
    const router = useRouter();
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchCustomer() {
            const session = await getCustomerSession();
            if (session) {
                setCustomer(session.user);
            }
            setLoading(false);
        }
        fetchCustomer();
    }, []);

   

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Create Pesanan</h1>
            <p className="text-gray-600">This is the create pesanan page. Here you can create a new pesanan.</p>
        </div>
    );
}