"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeOpenIcon } from "@radix-ui/react-icons";
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
          <h2 className="text-[28px] font-extrabold mt-6 text-black">Sign Up</h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="name" className="text-black font-semibold text-sm">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your username"
              className="mt-2 text-black bg-white border border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:border-gray-300 rounded-xl h-12 px-4 shadow-sm"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-black font-semibold text-sm">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="mt-2 text-black bg-white border border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:border-gray-300 rounded-xl h-12 px-4 shadow-sm"
            />
          </div>

          <div className="hidden">
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+62 xxx"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-black font-semibold text-sm">
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
                className="text-black bg-white border border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:border-gray-300 rounded-xl h-12 px-4 shadow-sm pr-12"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => {
                  const input = document.getElementById("password") as HTMLInputElement;
                  if (input.type === "password") {
                    input.type = "text";
                  } else {
                    input.type = "password";
                  }
                }}
              >
                <EyeOpenIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                className="h-4 w-4 bg-white border-gray-300 rounded text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm font-medium text-black">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="#" className="font-semibold text-black hover:text-gray-600 underline">
                Forgot Password?
              </Link>
            </div>
          </div>
          <p className="mb-5 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:underline">
              Login
            </Link>
          </p>
          <div className="pt-6 pb-2 flex justify-center">
            <Button
              type="submit"
              className="bg-[#FF9900] hover:bg-[#FF9900]/90 text-white text-base font-semibold rounded-xl px-12 h-12 w-40 shadow-sm transition-colors"
              disabled={loading}
            >
              {loading ? "..." : "Regsiter"}
            </Button>
  
          </div>
        </form>
      </div>
    </div>
  );
}
