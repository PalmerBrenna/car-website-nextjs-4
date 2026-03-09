"use client";

import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#f3f3f3] py-12 text-[#232541]">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 text-sm md:flex-row md:items-center md:justify-between">
        <p>2003-{year} ©Vercel2, All rights reserved</p>
        <div className="flex flex-wrap gap-6">
          <Link href="/listings" className="hover:text-black">Find your car</Link>
          <Link href="/about" className="hover:text-black">About Us</Link>
          <Link href="/consign" className="hover:text-black">Consign</Link>
          <Link href="/contact" className="hover:text-black">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
