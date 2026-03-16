"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EnvelopeClosedIcon,
  ClockIcon,
} from "@radix-ui/react-icons";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <section className="bg-[#444444] py-16 pt-28">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block border-2 border-white rounded-full px-6 py-3 text-white text-3xl font-bold uppercase mb-4">
            Contact Us
          </span>
          <p className="text-white text-lg">
            Have questions about our services? Want to schedule a pickup? Get in touch!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Get In Touch</h2>
            <div className="space-y-6">
              <InfoRow icon="📍" title="Address" text="Feast.id Cuci Sepatu Kilat, Jl. Jatisari 3 No.44, Pepelegi, Kec. Waru, Kabupaten Sidoarjo, Jawa Timur 61256" />
              <InfoRow icon="📞" title="Phone" text="+62 812-3456-7890" />
              <div className="flex items-start gap-4">
                <div className="bg-[#0B1320] rounded-full p-3 text-white ">
                  <EnvelopeClosedIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                  <p className="text-gray-600">feasst.id@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-[#0B1320] rounded-full p-3 text-white flex-shrink-0">
                  <ClockIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Business Hours</h3>
                  <p className="text-gray-600">Mon – Sat: 8:00 AM – 8:00 PM<br />Sun: 10:00 AM – 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>

            {submitted && (
              <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6">
                Pesan Anda berhasil dikirim! Kami akan segera menghubungi Anda.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" required placeholder="Your full name" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" required placeholder="you@example.com" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+62 xxx" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <select
                  id="subject"
                  className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="services">Services Information</option>
                  <option value="pickup">Schedule Pickup</option>
                  <option value="complaint">Complaint</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={5} required placeholder="Tell us how we can help you..." className="mt-1.5" />
              </div>
              <Button type="submit" className="w-full bg-[#0B1320] hover:bg-[#111827]">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="bg-[#0B1320] rounded-full p-3 text-white flex-shrink-0 w-11 h-11 flex items-center justify-center text-lg">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
}
