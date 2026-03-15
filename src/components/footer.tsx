import Link from "next/link";
import {
  InstagramLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";

export default function Footer() {
  return (
    <footer className="bg-[#0B1320] text-gray-400 border-t border-white/10">
      <div className="mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-white text-2xl font-extrabold mb-3">
              Feast<span className="text-blue-400">.id</span>
            </h3>
            <p className="text-sm leading-relaxed">
              Expert shoe cleaning service — bringing your favorite footwear back to life since 2023.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>Shoes Treatment</li>
              <li>Treatment Tas</li>
              <li>Additional Treatment</li>
              <li>Topi, Helm &amp; Koper</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li>Jl. Jatisari 3 No.44, Pepelegi</li>
              <li>Kec. Waru, Kabupaten Sidoarjo</li>
              <li>+62 812-3456-7890</li>
              <li>info@feast.id</li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <InstagramLogoIcon className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <TwitterLogoIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Feast.id — All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
