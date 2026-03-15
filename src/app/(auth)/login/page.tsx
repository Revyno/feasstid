"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { EyeOpenIcon,EyeNoneIcon } from "@radix-ui/react-icons";
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1320] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-white/10 bg-gray-900 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold">
            Feast<span className="text-blue-400">.id</span>
          </CardTitle>
          <CardDescription className="text-gray-400">Masuk ke Dashboard Admin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@feast.id"
                className="mt-1.5 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              {/* <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="mt-1.5 bg-gray-800 border-gray-700 text-white"
              /> */}
              {/* add eye icon  if  click show password else hide */}
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="mt-1.5 bg-gray-800 border-gray-700 text-white pr-10"
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5" onClick={() => {
                  const input = document.getElementById("password") as HTMLInputElement;
                  if (input.type === "password") {
                    input.type = "text";
                  } else {
                    input.type = "password";
                  }
                }}>
                  <EyeOpenIcon className="h-5 w-5 mt-2 text-gray-400" />
                  {/* <EyeNoneIcon className="h-5 w-5 mt-2 text-gray-400" /> */}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Customer?{" "}
            <Link href="/register" className="text-blue-400 hover:underline">
              Register here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
