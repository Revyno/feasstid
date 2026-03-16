"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { EyeOpenIcon } from "@radix-ui/react-icons";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // ======================
    // CEK ADMIN LOGIN
    // ======================
    const { data: adminData, error: adminError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (!adminError && adminData.user) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    // ======================
    // CEK CUSTOMER
    // ======================
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("email", email)
      .single();

    if (customerError || !customer) {
      setError("Email atau password salah");
      setLoading(false);
      return;
    }

    if (customer.password !== password) {
      setError("Email atau password salah");
      setLoading(false);
      return;
    }

    // simpan session customer
    document.cookie = `customer=${JSON.stringify(customer)}; path=/`;

    router.push("/customer");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#111317] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white text-black p-8 sm:p-12 rounded-[2.5rem] shadow-2xl relative">

        <div className="text-center mb-8">
          <Image
            className="mx-auto"
            src="/logo/1.jpg"
            alt="Feast.id"
            width={90}
            height={90}
            priority
          />
          <h2 className="text-[28px] font-extrabold mt-6 text-black">
            Sign In
          </h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Password</Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-12"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                onClick={() => {
                  const input = document.getElementById(
                    "password"
                  ) as HTMLInputElement;

                  input.type =
                    input.type === "password" ? "text" : "password";
                }}
              >
                <EyeOpenIcon />
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            Not Have Account ?
            <Link href="/register" className="text-blue-400 hover:underline">
              Register here
            </Link>
          </p>

          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#FF9900] text-white w-40"
            >
              {loading ? "memuat..." : "Login"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}