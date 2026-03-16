"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeOpenIcon } from "@radix-ui/react-icons";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // cek email sudah ada atau belum
    const { data: existing } = await supabase
      .from("customers")
      .select("email")
      .eq("email", email)
      .single();

    if (existing) {
      setError("Email sudah digunakan");
      setLoading(false);
      return;
    }

    // insert customer
    const { error } = await supabase.from("customers").insert([
      {
        name,
        email,
        password,
        phone,
      },
    ]);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/login?registered=true");
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
            Sign Up
          </h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="name" className="font-semibold text-sm">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
              className="mt-2 h-12"
            />
          </div>

          <div>
            <Label htmlFor="email" className="font-semibold text-sm">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="mt-2 h-12"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="font-semibold text-sm">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+62 xxx"
              className="mt-2 h-12"
            />
          </div>

          <div>
            <Label htmlFor="password" className="font-semibold text-sm">
              Password
            </Label>

            <div className="relative mt-2">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 pr-12"
              />

              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400"
                onClick={() => {
                  const input = document.getElementById(
                    "password"
                  ) as HTMLInputElement;

                  input.type =
                    input.type === "password" ? "text" : "password";
                }}
              >
                <EyeOpenIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:underline">
              Login
            </Link>
          </p>

          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#FF9900] hover:bg-[#FF9900]/90 text-white font-semibold rounded-xl w-40 h-12"
            >
              {loading ? "memuat..." : "Register"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}