"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { getUserRole } from "@/lib/auth";

interface FinanceItem {
  image: string;
  link: string;
  name: string;
}

interface FinanceRow {
  items: FinanceItem[];
}

interface FinanceData {
  heroImage: string;
  title: string;
  subtitle: string;
  description: string;
  benefitsTitle: string;
  benefits: string[];
  rows: FinanceRow[];
}

export default function FinancePage() {
  const defaultData: FinanceData = {
    heroImage: "/images/hero-finance.jpg",
    title: "FINANCE",
    subtitle: "Don't allow your aspirations to be hindered by financial constraints.",
    description:
      "You have the power and the control thru hours financing partners or others of your choice, to find the best solution that sadisfied you and your needs. We are here to help finding the best solution and the Instant promise for tayloring for You a Exclusive offer Proven and Guaranteed Saving money solution from our part.",
    benefitsTitle: "Why Finance With Us?",
    benefits: [
      "Competitive rates from top automotive lenders",
      "Fast and secure online application process",
      "Financing available for both new and pre-owned vehicles",
    ],
    rows: [
      {
        items: [
          { image: "/images/finance1.jpg", link: "#", name: "J.J. Best Banc" },
          { image: "/images/finance2.jpg", link: "#", name: "Woodside Credit" },
          { image: "/images/finance3.jpg", link: "#", name: "LightStream" },
        ],
      },
    ],
  };

  const [content, setContent] = useState<FinanceData>(defaultData);
  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRole = await getUserRole();
        setRole(userRole);

        const docRef = doc(db, "pages", "finance");
        const snap = await getDoc(docRef, { source: "server" });

        if (snap.exists()) {
          const data = snap.data() as Partial<FinanceData>;
          setContent({
            heroImage: data.heroImage || defaultData.heroImage,
            title: data.title || defaultData.title,
            subtitle: data.subtitle || defaultData.subtitle,
            description: data.description || defaultData.description,
            benefitsTitle: data.benefitsTitle || defaultData.benefitsTitle,
            benefits: data.benefits || defaultData.benefits,
            rows: data.rows || defaultData.rows,
          });
        } else {
          await setDoc(docRef, defaultData);
          setContent(defaultData);
        }
      } catch (err) {
        console.error("Error loading Finance page:", err);
        setContent(defaultData);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    const docRef = doc(db, "pages", "finance");
    try {
      await updateDoc(docRef, content);
    } catch {
      await setDoc(docRef, content);
    }
    setIsEditing(false);
    setStatus("✅ Finance page updated!");
    setTimeout(() => setStatus(""), 3000);
  };

  const uploadImage = async (file: File | null): Promise<string | null> => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload-page", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.url || null;
  };

  const handleHeroUpload = async (file: File | null) => {
    const url = await uploadImage(file);
    if (url) setContent((prev) => ({ ...prev, heroImage: url }));
  };

  const handlePartnerUpload = async (rowIndex: number, colIndex: number, file: File | null) => {
    const url = await uploadImage(file);
    if (!url) return;
    setContent((prev) => {
      const updated = [...(prev.rows || [])];
      updated[rowIndex].items[colIndex].image = url;
      return { ...prev, rows: updated };
    });
  };

  const addRow = () => {
    setContent((prev) => ({
      ...prev,
      rows: [
        ...(prev.rows || []),
        {
          items: [
            { image: "/images/placeholder.jpg", link: "#", name: "New Partner" },
            { image: "/images/placeholder.jpg", link: "#", name: "New Partner" },
            { image: "/images/placeholder.jpg", link: "#", name: "New Partner" },
          ],
        },
      ],
    }));
  };

  const removeRow = (rowIndex: number) => {
    setContent((prev) => ({
      ...prev,
      rows: (prev.rows || []).filter((_, i) => i !== rowIndex),
    }));
  };

  return (
    <section className="min-h-screen bg-[#f3f3f3] text-[#1e2240]">
      <div className="relative flex h-[50vh] min-h-[420px] w-full items-center justify-center overflow-hidden text-center">
        <Image
          src={content.heroImage || "/images/placeholder-hero.jpg"}
          alt="Finance Hero"
          fill
          sizes="100vw"
          priority
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 max-w-3xl px-6">
          {isEditing ? (
            <>
              <input
                type="file"
                onChange={(e) => handleHeroUpload(e.target.files?.[0] || null)}
                className="mb-2 rounded bg-white/80 p-1 text-xs"
              />
              <input
                value={content.title}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
                className="mb-2 w-full border-b border-blue-400 bg-transparent text-center text-4xl font-bold text-white focus:outline-none md:text-5xl"
              />
              <textarea
                value={content.subtitle}
                onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                className="w-full rounded-md border bg-transparent p-2 text-center text-sm text-white"
              />
            </>
          ) : (
            <>
              <h1 className="mb-3 text-4xl font-extrabold text-white drop-shadow md:text-5xl">{content.title}</h1>
              <p className="mx-auto max-w-2xl text-lg text-gray-200">{content.subtitle}</p>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1220px] px-6 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative h-[560px] overflow-hidden rounded-[28px]">
            <Image src="/images/hero-finance.jpg" alt="Luxury showroom" fill className="object-cover" />
          </div>
          <div>
            <h2 className="text-6xl font-semibold leading-tight text-[#22243f]">
              HGreg Lux Exclusively
              <span className="block font-serif italic text-[#f0c766]">Low Rates</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[#53566f]">
              It’s no secret, our success in the industry, gives us the benefits of incredibly low interest rates for those
              looking to finance their luxury vehicle. At HGreg Lux, when you’re one click away from getting the best rates
              on the market, nothing will stop you from driving home your dream car.
            </p>
          </div>
        </div>

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h3 className="text-6xl font-semibold leading-tight text-[#22243f]">
              We&apos;ve got you <span className="font-serif italic text-[#f0c766]">covered</span>
            </h3>
            <p className="mt-4 text-[#53566f]">A sound investment.</p>
            <p className="mt-4 text-lg leading-relaxed text-[#53566f]">
              There is no need to take chances with your valued investment when HGreg Lux offers a wide selection of warranty
              plans, catered to your every need. Be sure to leave with a peace of mind for the road ahead, and exploit all the
              pleasures of driving your new luxury vehicle.
            </p>
            <ul className="mt-8 space-y-3 text-lg text-[#22243f]">
              <li>◉ Day One, Mile One Coverage</li>
              <li>◉ Nationwide Service Facilities</li>
              <li>◉ 24/7 Roadside Assistance & Towing</li>
              <li>◉ Exceptional Claims Service</li>
            </ul>
          </div>

          <div className="relative h-[560px] overflow-hidden rounded-[28px]">
            <Image src="/images/hero-contact.jpg" alt="Warranty coverage" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute left-8 top-8 right-8 text-white">
              <h4 className="text-4xl font-semibold">Parts covered include:</h4>
              <div className="mt-6 grid grid-cols-2 gap-4 text-xl">
                <ul className="space-y-2">
                  <li>◉ Suspension</li>
                  <li>◉ Brake System</li>
                  <li>◉ Air Conditioning</li>
                  <li>◉ Transmission/Transfer Case</li>
                  <li>◉ Drive Axle</li>
                </ul>
                <ul className="space-y-2">
                  <li>◉ Engine</li>
                  <li>◉ Steering</li>
                  <li>◉ Electrical</li>
                  <li>◉ Seals & Gaskets</li>
                  <li>◉ High Tech</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">Our Financing Partners</h2>

        <div className="relative mb-14 h-[360px] overflow-hidden rounded-[28px]">
          <Image src="/images/hero-listings.jpg" alt="Finance my Luxury Vehicle" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
            <h3 className="text-6xl font-semibold">
              Finance my <span className="font-serif italic text-[#f0c766]">Luxury Vehicle</span>
            </h3>
            <p className="mt-4 max-w-4xl text-lg text-white/90">
              Whether you’re looking to purchase, or finance your next vehicle from HGreg Lux, our simple online financing
              form takes only a few minutes to fill out, and a response will be sent shortly!
            </p>
            <button className="mt-7 rounded-full border border-[#f0c766] px-10 py-3 text-xl font-semibold text-[#f0c766]">
              Apply Now
            </button>
          </div>
        </div>

        {(content.rows || []).map((row, rowIndex) => (
          <div key={rowIndex} className="relative mb-12">
            {isEditing && (
              <button
                onClick={() => removeRow(rowIndex)}
                className="absolute -top-8 right-0 rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
              >
                🗑️ Remove Row
              </button>
            )}

            <div className="grid gap-8 md:grid-cols-3">
              {(row.items || []).map((item, colIndex) => (
                <div
                  key={colIndex}
                  className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-50">
                    <Image
                      src={item.image || "/images/placeholder.jpg"}
                      alt={item.name || "Finance Partner"}
                      sizes="100vw"
                      fill
                      className="object-cover object-center"
                      unoptimized
                    />
                    {isEditing && (
                      <input
                        type="file"
                        onChange={(e) => handlePartnerUpload(rowIndex, colIndex, e.target.files?.[0] || null)}
                        className="absolute bottom-2 left-2 rounded bg-white/80 p-1 text-xs"
                      />
                    )}
                  </div>

                  <div className="p-4 text-center">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...(content.rows || [])];
                            updated[rowIndex].items[colIndex].name = e.target.value;
                            setContent({ ...content, rows: updated });
                          }}
                          className="mb-1 w-full rounded border p-1 text-center text-sm"
                        />
                        <input
                          type="text"
                          value={item.link}
                          onChange={(e) => {
                            const updated = [...(content.rows || [])];
                            updated[rowIndex].items[colIndex].link = e.target.value;
                            setContent({ ...content, rows: updated });
                          }}
                          className="w-full rounded border p-1 text-center text-sm"
                          placeholder="Partner link"
                        />
                      </>
                    ) : (
                      <>
                        <h3 className="mb-1 text-base font-semibold text-gray-900">{item.name}</h3>
                        <a href={item.link || "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          Visit Partner →
                        </a>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {isEditing && (
          <div className="text-center">
            <button onClick={addRow} className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700">
              + Add Row
            </button>
          </div>
        )}
      </div>

      {role === "superadmin" && (
        <div className="mt-12 pb-16 text-center">
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={`rounded-lg px-6 py-2 text-sm font-semibold transition ${
              isEditing ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isEditing ? "💾 Save Changes" : "✏️ Edit Page"}
          </button>
          {status && <p className="mt-3 text-sm font-medium text-green-600">{status}</p>}
        </div>
      )}
    </section>
  );
}
