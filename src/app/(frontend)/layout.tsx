"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/whatsapp-button";
import PageTransition from "@/components/page-transition";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });
  }, []);

  return (
    <PageTransition>
      <Navbar />
      <main className="overflow-hidden">{children}</main>
      <Footer />
      <WhatsAppButton />
    </PageTransition>
  );
}
