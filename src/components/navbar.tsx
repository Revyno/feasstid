"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HamburgerMenuIcon,
  Cross1Icon,
} from "@radix-ui/react-icons";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B1320]/95 backdrop-blur-md border-b border-white/10">
      <div className=" mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-extrabold text-white tracking-tight">
          Feast<span className="text-blue-400">.id</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                pathname === l.href
                  ? "text-blue-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="ml-4 bg-white text-gray-900 px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-all"
          >
            Login
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <Cross1Icon className="w-6 h-6" /> : <HamburgerMenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[#0B1320] border-t border-white/10 px-4 pb-6 animate-in slide-in-from-top-2">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block py-3 text-sm font-medium border-b border-white/5 ${
                pathname === l.href ? "text-blue-400" : "text-gray-300"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-4 block text-center bg-white text-gray-900 px-5 py-2.5 rounded-full text-sm font-bold"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
