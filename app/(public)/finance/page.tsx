"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { getUserRole } from "@/lib/auth";
import { CheckCircle, DollarSign, FileCheck2 } from "lucide-react";
//
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

  /* ---------- Firestore load ---------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRole = await getUserRole();
        setRole(userRole);

        const docRef = doc(db, "pages", "finance");
        const snap = await getDoc(docRef, { source: "server" });

        if (snap.exists()) {
          const data = snap.data() as Partial<FinanceData>;
          // asigură fallback-uri pentru câmpuri lipsă
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

  /* ---------- Save ---------- */
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

  /* ---------- Upload helper ---------- */
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

  const handlePartnerUpload = async (
    rowIndex: number,
    colIndex: number,
    file: File | null
  ) => {
    const url = await uploadImage(file);
    if (!url) return;
    setContent((prev) => {
      const updated = [...(prev.rows || [])];
      updated[rowIndex].items[colIndex].image = url;
      return { ...prev, rows: updated };
    });
  };

  /* ---------- Add / Remove ---------- */
  const addRow = () => {
    setContent((prev) => ({
      ...prev,
      rows: [
        ...(prev.rows || []),
        {
          items: [
            {
              image: "/images/placeholder.jpg",
              link: "#",
              name: "New Partner",
            },
            {
              image: "/images/placeholder.jpg",
              link: "#",
              name: "New Partner",
            },
            {
              image: "/images/placeholder.jpg",
              link: "#",
              name: "New Partner",
            },
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

  /* ---------- JSX ---------- */
  return (
    <section className="bg-white text-gray-900 min-h-screen">
      {/* 🏁 Hero Section */}
      <div className="relative w-full h-[50vh] min-h-[420px] flex items-center justify-center text-center overflow-hidden">
        <Image
          src={content.heroImage || "/images/placeholder-hero.jpg"}
          alt="Finance Hero"
          fill
          sizes="100vw"
          priority
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />

        <div className="relative z-10 max-w-3xl px-6">
          {isEditing ? (
            <>
              <input
                type="file"
                onChange={(e) => handleHeroUpload(e.target.files?.[0] || null)}
                className="text-xs bg-white/80 p-1 rounded mb-2"
              />
              <input
                value={content.title}
                onChange={(e) =>
                  setContent({ ...content, title: e.target.value })
                }
                className="text-4xl md:text-5xl font-bold text-center border-b border-blue-400 focus:outline-none bg-transparent text-white w-full mb-2"
              />
              <textarea
                value={content.subtitle}
                onChange={(e) =>
                  setContent({ ...content, subtitle: e.target.value })
                }
                className="w-full text-center text-white bg-transparent border p-2 rounded-md text-sm"
              />
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 drop-shadow">
                {content.title}
              </h1>
              <p className="text-gray-200 text-lg max-w-2xl mx-auto">
                {content.subtitle}
              </p>
            </>
          )}
        </div>
      </div>

      {/* 💬 Description Section */}
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        {isEditing ? (
          <textarea
            value={content.description}
            onChange={(e) =>
              setContent({ ...content, description: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 text-center"
          />
        ) : (
          <p className="text-gray-600 text-lg leading-relaxed">
            {content.description}
          </p>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20 space-y-20">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div className="relative w-full min-h-[300px] h-[420px] rounded-[28px] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1400&q=80"
              alt="Luxury vehicles showroom"
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
              unoptimized
            />
          </div>

          <div>
            <h3 className="text-4xl md:text-5xl font-semibold leading-tight text-[#171a36]">
              HGreg Lux Exclusively
              <span className="block text-[#d7b15d] italic font-normal mt-1">
                Low Rates
              </span>
            </h3>
            <p className="text-gray-600 mt-6 leading-relaxed text-lg">
              It&apos;s no secret, our success in the industry gives us the
              benefits of incredibly low interest rates for those looking to
              finance their luxury vehicle. At HGreg Lux, when you&apos;re one click
              away from getting the best rates on the market, nothing will stop
              you from driving home your dream car.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center">
          <div>
            <h3 className="text-5xl font-semibold leading-tight text-[#171a36]">
              We&apos;ve got you
              <span className="text-[#d7b15d] italic font-normal ml-3">
                covered
              </span>
            </h3>
            <p className="text-gray-500 mt-4">A sound investment.</p>
            <p className="text-gray-600 mt-4 leading-relaxed">
              There is no need to take chances with your valued investment when
              HGreg Lux offers a wide selection of warranty plans, catered to
              your every need.
            </p>

            <ul className="mt-6 space-y-3 text-gray-800">
              {[
                "Day One, Mile One Coverage",
                "Nationwide Service Facilities",
                "24/7 Roadside Assistance & Towing",
                "Exceptional Claims Service",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#d7b15d] text-[#d7b15d] text-xs">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-[28px] overflow-hidden min-h-[320px] h-[460px]">
            <Image
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80"
              alt="Performance car coverage"
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent" />

            <div className="absolute top-8 left-8 right-8 text-white">
              <h4 className="text-3xl font-semibold mb-4">Parts covered include:</h4>
              <div className="grid sm:grid-cols-2 gap-2 text-sm md:text-base">
                {[
                  "Suspension",
                  "Brake System",
                  "Air Conditioning",
                  "Transmission/Transfer Case",
                  "Drive Axle",
                  "Engine",
                  "Steering",
                  "Electrical",
                  "Seals & Gaskets",
                  "High Tech",
                ].map((part) => (
                  <div key={part} className="flex items-center gap-2">
                    <span className="text-[#d7b15d]">✓</span>
                    <span>{part}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ Benefits Section */}
     {/* <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto text-center">
          {isEditing ? (
            <input
              value={content.benefitsTitle}
              onChange={(e) =>
                setContent({ ...content, benefitsTitle: e.target.value })
              }
              className="text-3xl font-bold border-b border-blue-400 bg-transparent mb-8 text-gray-900"
            />
          ) : (
            <h2 className="text-3xl font-bold mb-8 text-gray-900">
              {content.benefitsTitle}
            </h2>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {(content.benefits || []).map((b, i) => (
              <div
                key={i}
                className="flex flex-col items-center bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition"
              >
                <div className="text-blue-600 mb-3">
                  {i === 0 ? (
                    <DollarSign size={28} />
                  ) : i === 1 ? (
                    <FileCheck2 size={28} />
                  ) : (
                    <CheckCircle size={28} />
                  )}
                </div>
                {isEditing ? (
                  <textarea
                    value={b}
                    onChange={(e) => {
                      const benefits = [...(content.benefits || [])];
                      benefits[i] = e.target.value;
                      setContent({ ...content, benefits });
                    }}
                    className="w-full border p-2 rounded text-center text-sm"
                  />
                ) : (
                  <p className="text-gray-600 text-base">{b}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>*/}

      {/* 💰 Finance Partners */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-center text-3xl font-bold mb-10 text-gray-900">
          Our Financing Partners
        </h2>

        {(content.rows || []).map((row, rowIndex) => (
          <div key={rowIndex} className="relative mb-12">
            {isEditing && (
              <button
                onClick={() => removeRow(rowIndex)}
                className="absolute -top-8 right-0 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                🗑️ Remove Row
              </button>
            )}

            <div className="grid md:grid-cols-3 gap-8">
              {(row.items || []).map((item, colIndex) => (
                <div
                  key={colIndex}
                  className="flex flex-col items-center bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden"
                >
                  <div className="relative w-full aspect-[16/9] bg-gray-50 overflow-hidden">
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
                        onChange={(e) =>
                          handlePartnerUpload(
                            rowIndex,
                            colIndex,
                            e.target.files?.[0] || null
                          )
                        }
                        className="absolute bottom-2 left-2 text-xs bg-white/80 p-1 rounded"
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
                            updated[rowIndex].items[colIndex].name =
                              e.target.value;
                            setContent({ ...content, rows: updated });
                          }}
                          className="w-full border p-1 rounded mb-1 text-sm text-center"
                        />
                        <input
                          type="text"
                          value={item.link}
                          onChange={(e) => {
                            const updated = [...(content.rows || [])];
                            updated[rowIndex].items[colIndex].link =
                              e.target.value;
                            setContent({ ...content, rows: updated });
                          }}
                          className="w-full border p-1 rounded text-sm text-center"
                          placeholder="Partner link"
                        />
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold text-gray-900 text-base mb-1">
                          {item.name}
                        </h3>
                        <a
                          href={item.link || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
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
            <button
              onClick={addRow}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium"
            >
              + Add Row
            </button>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="relative rounded-[30px] overflow-hidden min-h-[300px] md:min-h-[360px] flex items-center justify-center text-center px-8">
          <Image
            src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1800&q=80"
            alt="Finance luxury vehicle"
            fill
            sizes="100vw"
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/55" />

          <div className="relative z-10 max-w-3xl text-white">
            <h3 className="text-4xl md:text-6xl font-semibold mb-4">
              Finance my
              <span className="text-[#d7b15d] italic font-normal ml-3">
                Luxury Vehicle
              </span>
            </h3>
            <p className="text-sm md:text-lg text-gray-200 mb-8">
              Whether you&apos;re looking to purchase, or finance your next vehicle
              from HGreg Lux, our simple online financing form takes only a few
              minutes to fill out, and a response will be sent shortly!
            </p>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-full border border-[#d7b15d] text-[#f2c764] font-semibold px-10 py-3 hover:bg-[#d7b15d]/10 transition"
            >
              Apply Now
            </a>
          </div>
        </div>
      </div>

      {/* 🧭 Admin Controls */}
      {role === "superadmin" && (
        <div className="text-center mt-12 pb-16">
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${
              isEditing
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {isEditing ? "💾 Save Changes" : "✏️ Edit Page"}
          </button>
          {status && (
            <p className="mt-3 text-green-600 text-sm font-medium">{status}</p>
          )}
        </div>
      )}
    </section>
  );
}
