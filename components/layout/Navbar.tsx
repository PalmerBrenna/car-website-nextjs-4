"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Heart, Phone, Search } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [siteInfo, setSiteInfo] = useState<any>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "site_info"));
        if (snap.exists()) setSiteInfo(snap.data());
      } catch (err) {
        console.error(err);
      }
    };
    fetchSiteInfo();
  }, []);

  const navLinks = [
    { href: "/listings", label: "Find Your Car" },
    { href: "/consign", label: "Consignment" },
    { href: "/sold", label: "Sold Vehicles" },
    { href: "/finance", label: "Financing" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/listings?query=${encodeURIComponent(search.trim())}`);
    setOpen(false);
    setSearch("");
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-black/70 via-black/35 to-transparent text-white">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-5">
        <Link href="/" className="flex items-center gap-2">
          {siteInfo?.logoUrl ? (
            <img src={siteInfo.logoUrl} alt={siteInfo.siteName || "Logo"} className="h-10 w-auto" />
          ) : (
            <span className="text-2xl font-semibold tracking-wider">HGREG LUX</span>
          )}
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={pathname === link.href ? "text-[#f5c62d]" : "text-white/90 hover:text-[#f5c62d]"}>
              {link.label}
            </Link>
          ))}
        </div>

        <button onClick={() => setOpen((prev) => !prev)} className="md:hidden">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#121429] px-4 pb-5 pt-3 md:hidden">
          <form onSubmit={handleSearch} className="mb-3 flex items-center rounded-full bg-white px-4 py-2 text-black">
            <Search size={16} />
            <input className="ml-2 flex-1 bg-transparent text-sm outline-none" placeholder="Search inventory" value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-2 text-sm text-white/90 hover:bg-white/10">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
