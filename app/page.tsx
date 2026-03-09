"use client";

export const dynamic = "force-dynamic";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCars } from "@/lib/firestore";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getUserRole } from "@/lib/auth";
import type { Car } from "@/lib/types";
import { CarFront, Handshake, ShieldCheck, Search, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

function findValue(schemaData: any, key: string) {
  if (!schemaData || typeof schemaData !== "object") return undefined;
  const needle = key.trim().toLowerCase();
  for (const section of Object.values(schemaData)) {
    if (section && typeof section === "object") {
      for (const [k, v] of Object.entries(section as Record<string, any>)) {
        if (k.trim().toLowerCase() === needle) return v;
      }
    }
  }
  return undefined;
}

function getFeaturedImage(car: any): string {
  const ext = car?.schemaData?.Exterior?.images?.[0]?.src;
  if (ext) return ext;

  if (car?.schemaData) {
    for (const section of Object.values(car.schemaData)) {
      const img = (section as any)?.images?.[0]?.src;
      if (img) return img;
    }
  }

  return car?.images?.exterior?.[0] || "/images/hero-listings.jpg";
}

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [homeSearch, setHomeSearch] = useState("");
  const router = useRouter();
  const [content, setContent] = useState({
    heroSubtitle: "EXOTIC LUXURY CARS",
    heroTitle: "FOR SALE",
    heroText: "Quick search our inventory by Stock, Make or Model",
    heroImage: "/images/hero-listings.jpg",
    cta1: "Browse our Inventory",
    cta2: "Consign with us",
    bannerTitle: "See what people have to say about us",
    bannerText: "Trusted by buyers and sellers nationwide.",
  });

  const visibleCars = cars.filter(
    (car) =>
      car.status &&
      !["sold", "pending", "rejected", "draft"].includes(
        car.status.toLowerCase(),
      ),
  );

  useEffect(() => {
    (async () => {
      const r = await getUserRole();
      setRole(r);

      try {
        const data = await getCars();
        setCars(data);
      } catch (e) {
        console.error("Failed to load cars:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folderType", "main");
    const res = await fetch("/api/upload-page", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.url) setContent((prev) => ({ ...prev, heroImage: data.url }));
  };

  const featured = visibleCars.slice(0, 6);

  const brands = [
    "BMW",
    "PORSCHE",
    "FERRARI",
    "LAMBORGHINI",
    "RANGE ROVER",
    "MASERATI",
  ];

  const brandLogos = [
    { name: "BMW", src: "/uploads/pages/bmw.png", className: "h-6" },
    { name: "Porsche", src: "/uploads/pages/porsche.png", className: "h-3.5" },
    { name: "Ferrari", src: "/uploads/pages/ferrari.png", className: "h-4" },
    {
      name: "Lamborghini",
      src: "/uploads/pages/lamborghini.png",
      className: "h-3.5",
    },
    {
      name: "Range Rover",
      src: "/uploads/pages/range-rover.png",
      className: "h-4.5",
    },
    { name: "Maserati", src: "/uploads/pages/maserati.png", className: "h-5" },
  ];

  const handleHomeSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!homeSearch.trim()) return;
    router.push(`/listings?query=${encodeURIComponent(homeSearch.trim())}`);
    setHomeSearch("");
  };

  const showroomCards = [
    {
      city: "Orlando",
      address: "2510 Jetport Dr, Suite B",
      phone: "407 680 1635",
      image: "/public-showroom-orlando.jpg",
    },
    {
      city: "Pompano Beach",
      address: "2500 West Sample Rd",
      phone: "754-318-9003",
      image: "/public-showroom-pompano.jpg",
    },
    {
      city: "Miami",
      address: "17305 S Dixie Hwy",
      phone: "305-259-2638",
      image: "/public-showroom-miami.jpg",
    },
  ];

  const heroImageToShow =
    !content.heroImage || content.heroImage === "/images/hero-vintage.jpg"
      ? "/images/hero-listings.jpg"
      : content.heroImage;

  return (
    <main className="bg-[#f3f3f3] text-[#1e2240]">
      <section className="relative min-h-[760px] overflow-hidden">
        <Image
          src={heroImageToShow}
          alt="Hero"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative mx-auto flex min-h-[760px] w-full max-w-[1280px] flex-col items-center px-4 pb-16 pt-28 text-center text-white">
          {isEditing ? (
            <div className="w-full max-w-3xl space-y-2 rounded-2xl bg-white/90 p-4 text-left text-black">
              <input
                value={content.heroSubtitle}
                onChange={(e) =>
                  setContent({ ...content, heroSubtitle: e.target.value })
                }
                className="w-full rounded border p-2"
              />
              <input
                value={content.heroTitle}
                onChange={(e) =>
                  setContent({ ...content, heroTitle: e.target.value })
                }
                className="w-full rounded border p-2"
              />
              <input
                value={content.heroText}
                onChange={(e) =>
                  setContent({ ...content, heroText: e.target.value })
                }
                className="w-full rounded border p-2"
              />
              <input
                type="file"
                onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
                className="w-full"
              />
            </div>
          ) : (
            <>
              <h1 className="text-5xl font-semibold uppercase tracking-wide md:text-7xl">
                {content.heroSubtitle}
              </h1>
              <p className="mt-2 font-serif text-5xl italic text-[#f2c94c] md:text-6xl">
                {content.heroTitle}
              </p>

              <p className="mt-4 text-lg text-white/90 max-w-xl">
                {content.heroText}
              </p>
              <form
                onSubmit={handleHomeSearch}
                className="mt-8 flex w-full max-w-2xl items-center overflow-hidden rounded-full bg-white px-5 py-3 text-gray-500 shadow-xl"
              >
                <input
                  type="text"
                  value={homeSearch}
                  onChange={(e) => setHomeSearch(e.target.value)}
                  placeholder={
                    content.heroText || "Search by stock, make or model"
                  }
                  className="flex-1 bg-transparent text-left text-sm text-gray-700 outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#f5c62d] p-3 text-black hover:bg-[#e6b821] transition"
                >
                  <Search size={18} />
                </button>
              </form>
            </>
          )}

          <div className="mt-14 w-full max-w-[1160px] rounded-[24px] border border-white/8 bg-[linear-gradient(90deg,rgba(0,0,0,0.5)_0%,rgba(14,18,28,0.78)_50%,rgba(0,0,0,0.5)_100%)] px-5 py-1.5 shadow-[0_6px_18px_rgba(0,0,0,0.22)] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2">
              {brandLogos.map((brand) => (
                <div
                  key={brand.name}
                  className="flex flex-1 items-center justify-center"
                >
                  <img
                    src={brand.src}
                    alt={brand.name}
                    className={`${brand.className} w-auto max-w-[88px] object-contain opacity-80`}
                  />
                </div>
              ))}

              <Link
                href="/listings"
                className="inline-flex h-[34px] min-w-[108px] shrink-0 items-center justify-center rounded-full bg-[#f5c62d] px-4 text-[14px] font-semibold text-black transition hover:bg-[#e6b821]"
              >
                And More!
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] px-4 py-20 text-center">
        <h2 className="text-5xl font-semibold leading-tight">
          Luxury Cars for Sale
          <br />
          <span className="font-serif italic text-[#f2c66d]">
            at the Best Price
          </span>
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="relative h-[460px] overflow-hidden rounded-2xl">
            <Image
              src={
                featured[0]
                  ? getFeaturedImage(featured[0])
                  : "/images/hero-listings.jpg"
              }
              alt="Inventory"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-x-0 bottom-8 text-center text-white">
              <p className="text-4xl font-semibold">Explore Luxury Cars</p>
              <p className="font-serif text-5xl italic text-[#f5c852]">
                Incredible Discounts
              </p>
              <Link
                href="/listings"
                className="mt-4 inline-block rounded-full bg-[#f5c62d] px-8 py-3 font-semibold text-black"
              >
                {content.cta1}
              </Link>
            </div>
          </div>
          <div className="relative h-[460px] overflow-hidden rounded-2xl">
            <Image
              src={
                featured[1]
                  ? getFeaturedImage(featured[1])
                  : "/images/hero-consign.jpg"
              }
              alt="Consign"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-x-0 bottom-8 text-center text-white">
              <p className="text-4xl font-semibold">Consign with the largest</p>
              <p className="font-serif text-5xl italic text-[#f5c852]">
                Luxury Dealership
              </p>
              <Link
                href="/consign"
                className="mt-4 inline-block rounded-full bg-[#f5c62d] px-8 py-3 font-semibold text-black"
              >
                {content.cta2}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1700px] px-4 pb-16">
        <div className="rounded-3xl bg-black px-6 py-14 text-white md:px-14">
          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                icon: <ShieldCheck className="mx-auto text-[#f5c62d]" />,
                title: "Why Discerning Drivers Choose Us",
                text: "Elite brands, transparent support and a premium buying experience from start to finish.",
              },
              {
                icon: <Handshake className="mx-auto text-[#f5c62d]" />,
                title: "Concierge-Like Service",
                text: "Our team helps you discover the perfect vehicle quickly, with full guidance on every step.",
              },
              {
                icon: <CarFront className="mx-auto text-[#f5c62d]" />,
                title: "Unmatched Selection",
                text: "From modern exotics to timeless icons, we deliver one of the strongest luxury inventories.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                {item.icon}
                <h3 className="mt-4 text-3xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-lg text-white/80">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] px-4 py-12 text-center">
        <h3 className="text-6xl font-semibold">
          Our{" "}
          <span className="font-serif italic text-[#f2c66d]">showrooms</span>
        </h3>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[#4e516a]">
          At Vercel2, we redefine the luxury car-buying experience with premium
          selection and dedicated support.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {showroomCards.map((room, idx) => (
            <article
              key={room.city}
              className="rounded-2xl bg-white p-3 shadow-sm"
            >
              <div className="relative h-44 overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src={
                    featured[idx + 2]
                      ? getFeaturedImage(featured[idx + 2])
                      : "/images/hero-about.jpg"
                  }
                  alt={room.city}
                  fill
                  className="object-cover"
                />
              </div>
              <h4 className="mt-4 text-3xl font-semibold">{room.city}</h4>
              <p className="mt-2 text-sm text-[#4e516a]">{room.address}</p>
              <p className="mt-1 flex items-center justify-center gap-2 text-sm font-medium">
                <Phone size={14} /> {room.phone}
              </p>
            </article>
          ))}
        </div>
        <button className="mt-8 rounded-full bg-[#f5c62d] px-10 py-3 font-semibold text-black">
          See More
        </button>
      </section>

      <section className="mx-auto max-w-[1120px] px-4 py-12">
        <div className="relative h-[320px] overflow-hidden rounded-3xl">
          <Image
            src={
              featured[5]
                ? getFeaturedImage(featured[5])
                : "/images/hero-contact.jpg"
            }
            alt="Reviews"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
            <h3 className="text-5xl font-semibold leading-tight">
              See what people have to say about{" "}
              <span className="font-serif italic text-[#f5c852]">Vercel2</span>
            </h3>
            <button className="mt-6 rounded-full bg-[#f5c62d] px-10 py-3 font-semibold text-black">
              View reviews
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 pb-16 pt-8 text-center">
        <h3 className="text-6xl font-semibold">
          We <span className="font-serif italic text-[#f2c66d]">Support</span>
        </h3>

        <div className="mt-12 flex items-center justify-center gap-10">
          {brandLogos.map((brand) => (
            <img
              key={`bottom-${brand.name}`}
              src={brand.src}
              alt={brand.name}
              className="h-6 w-auto object-contain grayscale opacity-25 hover:opacity-60 transition"
            />
          ))}

          <Link
            href="/listings"
            className="shrink-0 rounded-full bg-[#f5c62d] px-5 py-2 text-sm font-semibold text-black hover:bg-[#e6b821] transition"
          >
            And More!
          </Link>
        </div>
      </section>

      {role === "superadmin" && (
        <div className="pb-10 text-center">
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={`rounded-full px-6 py-2 text-sm font-semibold text-white ${isEditing ? "bg-green-600" : "bg-[#1e2240]"}`}
          >
            {isEditing ? "💾 Save Changes" : "✏️ Edit Page"}
          </button>
          {status && (
            <p className="mt-3 text-sm font-medium text-green-600">{status}</p>
          )}
        </div>
      )}

      {loading && (
        <div className="pb-8 text-center text-sm text-gray-500">
          Loading inventory...
        </div>
      )}
    </main>
  );
}
