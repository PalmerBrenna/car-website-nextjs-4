"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { getUserRole } from "@/lib/auth";
import Image from "next/image";

interface ContactData {
  title: string;
  intro: string;
  address: string;
  phone: string;
  email: string;
  hours: { [key: string]: string };
  mapEmbed: string;
}

export default function ContactPage() {
  const [content, setContent] = useState<ContactData>({
    title: "Contact Us",
    intro:
      "We’d love to hear from you! Reach out to discuss your next vehicle purchase, or just say hello.",
    address: "",
    phone: "",
    email: "info@dariellamotors.com",
    hours: {
      "Monday - Friday": "9 AM - 5 PM",
      Saturday: "9 AM - 12 PM",
      Sunday: "By Appointment Only",
    },
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3038.503161324587!2d-89.20474632348264!3d40.72392817138439!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880a776d6a3bfb6d%3A0x420c70309d1a1433!2sMidwest%20Classic%20Cars!5e0!3m2!1sen!2sus!4v1705000000000",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const role = await getUserRole();
      setRole(role);

      const docRef = doc(db, "pages", "contact");
      const snap = await getDoc(docRef, { source: "server" });

      if (snap.exists()) setContent(snap.data() as ContactData);
      else await setDoc(docRef, content);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    const docRef = doc(db, "pages", "contact");
    try {
      await updateDoc(docRef, content);
    } catch (err: any) {
      if (err.message.includes("No document to update")) {
        await setDoc(docRef, content);
      } else throw err;
    }
    setIsEditing(false);
    setStatus("✅ Content updated successfully!");
    setTimeout(() => setStatus(""), 3000);
  };

  const openWhatsApp = () => {
    const phoneClean = content.phone.replace(/[^0-9+]/g, "");
    window.open(`https://wa.me/${phoneClean}`, "_blank");
  };

  return (
    <main className="bg-[#f4f4f4] text-gray-800 min-h-screen pb-16">
      <section className="relative w-full min-h-[460px] md:min-h-[560px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1900&q=80"
          alt="Luxury contact hero"
          fill
          sizes="100vw"
          priority
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-semibold leading-tight">
            Get in Touch
            <span className="block italic text-[#e9c46a] font-normal">with Vercel2</span>
          </h1>
          <p className="mt-5 text-lg text-gray-100 max-w-3xl mx-auto leading-relaxed">
            Have questions about a car, financing, or selling your vehicle? Our team is here to help with a seamless luxury experience.
          </p>

          <div className="mt-10 grid md:grid-cols-3 gap-4 text-left">
            <div className="bg-black/35 border border-[#e9c46a]/50 rounded-2xl p-5">
              <p className="text-[#e9c46a] text-sm uppercase tracking-wider">Visit</p>
              <p className="mt-2 text-white/95">{content.address || "Add address from edit mode"}</p>
            </div>
            <div className="bg-black/35 border border-[#e9c46a]/50 rounded-2xl p-5">
              <p className="text-[#e9c46a] text-sm uppercase tracking-wider">Call</p>
              <p className="mt-2 text-white/95">{content.phone || "Add phone from edit mode"}</p>
            </div>
            <div className="bg-black/35 border border-[#e9c46a]/50 rounded-2xl p-5">
              <p className="text-[#e9c46a] text-sm uppercase tracking-wider">Email</p>
              <p className="mt-2 text-white/95 break-all">{content.email}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 -mt-16 relative z-20">
        <div className="bg-white rounded-[30px] shadow-xl border border-gray-200 p-6 md:p-10">
          <div className="flex justify-between items-center mb-8">
            {isEditing ? (
              <input
                type="text"
                value={content.title}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
                className="text-3xl md:text-4xl font-semibold border-b border-gray-300 focus:outline-none w-full max-w-sm"
              />
            ) : (
              <h2 className="text-4xl md:text-5xl font-semibold text-[#272846]">
                {content.title}
              </h2>
            )}

            {role === "superadmin" && (
              <button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                  isEditing
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {isEditing ? "💾 Save Changes" : "✏️ Edit Page"}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-10 items-start">
            <div className="space-y-8">
              {isEditing ? (
                <textarea
                  value={content.intro}
                  onChange={(e) => setContent({ ...content, intro: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none"
                />
              ) : (
                <p className="text-lg text-gray-600 leading-relaxed">{content.intro}</p>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-200 p-4 bg-[#f8f8f8]">
                  <h3 className="text-sm font-semibold uppercase text-gray-900 mb-2">Sale Office</h3>
                  {isEditing ? (
                    <input
                      value={content.address}
                      onChange={(e) => setContent({ ...content, address: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2"
                    />
                  ) : (
                    <p className="text-gray-700">{content.address}</p>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-200 p-4 bg-[#f8f8f8]">
                  <h3 className="text-sm font-semibold uppercase text-gray-900 mb-2">How to Reach Us</h3>
                  {isEditing ? (
                    <>
                      <input
                        value={content.phone}
                        onChange={(e) => setContent({ ...content, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded p-2 mb-2"
                      />
                      <input
                        value={content.email}
                        onChange={(e) => setContent({ ...content, email: e.target.value })}
                        className="w-full border border-gray-300 rounded p-2"
                      />
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-gray-800">{content.phone}</p>
                      <p className="text-blue-600 break-all">{content.email}</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 uppercase text-sm mb-3">Hours</h3>
                <div className="border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden bg-white">
                  {Object.entries(content.hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between py-3 px-4 text-sm">
                      <span className="font-medium">{day}</span>
                      {isEditing ? (
                        <input
                          value={hours}
                          onChange={(e) =>
                            setContent({
                              ...content,
                              hours: {
                                ...content.hours,
                                [day]: e.target.value,
                              },
                            })
                          }
                          className="border border-gray-300 rounded px-2"
                        />
                      ) : (
                        <span>{hours}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {!isEditing && content.phone && (
                <button
                  onClick={openWhatsApp}
                  className="bg-[#f3bf1f] hover:bg-[#e2af18] px-7 py-3 rounded-full text-black font-semibold transition"
                >
                  Contact Us on WhatsApp
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                {isEditing ? (
                  <textarea
                    value={content.mapEmbed}
                    onChange={(e) => setContent({ ...content, mapEmbed: e.target.value })}
                    className="w-full h-[420px] border-0 p-3"
                  />
                ) : (
                  <iframe
                    src={content.mapEmbed}
                    width="100%"
                    height="420"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                )}
              </div>

              <div className="relative h-[210px] rounded-2xl overflow-hidden border border-gray-200">
                <Image
                  src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=80"
                  alt="Luxury showroom"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/25" />
              </div>
            </div>
          </div>

          {status && <p className="mt-6 text-green-600 font-medium text-center">{status}</p>}
        </div>
      </section>
    </main>
  );
}
