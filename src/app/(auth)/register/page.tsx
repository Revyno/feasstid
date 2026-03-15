"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaceIcon, ImageIcon, SunIcon } from "@radix-ui/react-icons"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
// import Image from "next/image";
// import Logo from "@/public/logo/1.png";
import Image from "next/image";
export default function RegisterPage() {
  const router = useRouter();
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

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone, role: "customer" } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/login?registered=true");
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1320] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-white/10 bg-white text-white">
        <CardHeader className="text-center">
          <Image className="mx-auto mb-4"
            src="/logo/1.jpg"
            alt="Feast.id"
            width={100}
            height={100}
          />
          <CardDescription className="text-black">
            Daftar sebagai Customer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="name" className="text-black">
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Nama lengkap"
                className="mt-1.5 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-black">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="mt-1.5 bg-white border-gray-700 text-black"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-black">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+62 xxx"
                className="mt-1.5 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-black">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Min 6 characters"
                className="mt-1.5 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Register"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
