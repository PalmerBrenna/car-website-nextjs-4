"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { getUserRole } from "@/lib/auth";
import ContactPopup from "@/components/popup/ContactPopup";

interface TeamMember {
  name: string;
  role: string;
  phone: string;
  email: string;
  image: string;
}

interface AboutData {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroText: string;
  heroButtons: { text: string; link: string }[];
  section2Title: string;
  section2Text: string;
  section2Quote: string;
  section2Image: string;
  teamTitle: string;
  team: TeamMember[];
}

export default function AboutPage() {
  const [content, setContent] = useState<AboutData>({
    heroTitle: "A DECADE OF EXPERIENCE IN THE AUTOMOTIVE INDUSTRY",
    heroSubtitle: "Dariella Motors",
    heroImage: "/images/hero-about.jpg",
    heroText:
      "Dariella Motors has distinguished itself as a premier automotive retailer.",
    heroButtons: [
      { text: "CONTACT US", link: "" },
      { text: "VIEW OUR INVENTORY", link: "/listings" },
    ],
    section2Title: "WE PROVIDE CAR BUYING, SELLING & CONSIGNMENT SERVICES NATIONWIDE",
    section2Text:
      "Dariella Motors is located in North Miami, Florida, and serves customers throughout the country and the world.",
    section2Quote:
      "We work hard every day to build a reputation as the most trusted car dealer. I personally inspect and handle each and every car sale.",
    section2Image: "/images/about-team.jpg",
    teamTitle: "OUR TEAM",
    team: [
      
    ],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [contactOpen, setContactOpen] = useState(false);

  // 🔹 Load Firestore content
  useEffect(() => {
    const fetchData = async () => {
      const role = await getUserRole();
      setRole(role);

      const docRef = doc(db, "pages", "about");
      const snap = await getDoc(docRef, { source: "server" });

      if (snap.exists()) setContent(snap.data() as AboutData);
      else await setDoc(docRef, content);
    };
    fetchData();
  }, []);

  // 🔹 Save or create Firestore doc
  const handleSave = async () => {
    const docRef = doc(db, "pages", "about");
    try {
      await updateDoc(docRef, content);
    } catch (err: any) {
      if (err.message.includes("No document to update")) {
        await setDoc(docRef, content);
      } else throw err;
    }
    setIsEditing(false);
    setStatus("✅ About page updated successfully!");
    setTimeout(() => setStatus(""), 3000);
  };

  // 🔹 Image upload helper
  const handleImageUpload = async (key: string, file: File | null) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload-page", { method: "POST", body: formData });
    const data = await res.json();
    if (!data.url) return;

    if (key.startsWith("team[")) {
      const match = key.match(/team\[(\d+)\]\.image/);
      if (match) {
        const index = parseInt(match[1]);
        setContent((prev) => {
          const updatedTeam = [...prev.team];
          updatedTeam[index].image = data.url;
          return { ...prev, team: updatedTeam };
        });
      }
    } else {
      setContent((prev) => ({ ...prev, [key]: data.url }));
    }
  };

  return (
    <section className="bg-[#f4f4f4] text-gray-800 min-h-screen">
      <div className="max-w-[1500px] mx-auto py-8 px-4 lg:px-8 space-y-20">
        <div className="relative rounded-[30px] overflow-hidden min-h-[620px] text-white">
          <Image
            src={content.heroImage}
            alt="About hero"
            fill
            sizes="100vw"
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/60" />

          <div className="relative z-10 max-w-5xl mx-auto px-6 pt-14 pb-16 text-center">
            <h1 className="text-4xl md:text-6xl font-semibold uppercase leading-tight">
              Redefining Luxury with
              <span className="block text-[#e9c46a] italic normal-case font-normal">
                HGreg Lux
              </span>
            </h1>

            {isEditing ? (
              <textarea
                value={content.heroText}
                onChange={(e) => setContent({ ...content, heroText: e.target.value })}
                className="w-full mt-5 bg-black/20 border border-white/30 p-3 rounded text-center"
              />
            ) : (
              <p className="max-w-3xl mx-auto mt-5 text-gray-100">
                {content.heroText}
              </p>
            )}

            {isEditing && (
              <input
                type="file"
                onChange={(e) => handleImageUpload("heroImage", e.target.files?.[0] || null)}
                className="mt-4 text-xs bg-white/90 text-black p-1 rounded"
              />
            )}

            <div className="mt-10 grid md:grid-cols-2 gap-4 text-left">
              {[
                ["HGreg Lux Pompano Beach", "2500 West Sample Rd, Pompano Beach, FL, 33073"],
                ["HGreg Lux West Palm Beach", "551 S Military Trl, Building 3, West Palm Beach, FL, 33415"],
                ["HGreg Lux Costa Mesa", "2115 Harbor Blvd, Costa Mesa, CA, 92627"],
                ["HGreg Lux Miami", "17305 S. Dixie Hwy, Miami, FL 33157"],
                ["HGreg Lux Orlando", "2510 Jetport Dr, Suite B, Orlando, FL 32809"],
                ["HGreg Lux Doral", "8505 NW 12th, Doral, FL 33126"],
                ["HGreg Lux Houston (Coming Soon)", "6737 Southwest Fwy, Houston, TX 77074"],
              ].map(([title, address]) => (
                <div
                  key={title}
                  className="flex items-center gap-4 bg-black/35 border border-[#e9c46a]/50 rounded-2xl px-5 py-3"
                >
                  <div className="w-9 h-9 rounded-full border border-[#e9c46a] flex items-center justify-center text-[#e9c46a] text-sm">
                    ●
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">{title}</h3>
                    <p className="text-sm text-gray-200">{address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-10">
          <h2 className="text-5xl text-center font-semibold leading-tight text-[#272846]">
            At <span className="text-[#e9c46a] italic font-normal">HGreg Lux</span>, we&apos;ve decided to redefine the status quo and
            <span className="text-[#e9c46a] italic font-normal"> do things differently</span>
          </h2>

          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center">
            <ul className="border-l-4 border-[#e9c46a] pl-8 space-y-8 text-4xl">
              {[
                "The Lux Process",
                "Trust in our Expertise",
                "Join the Innovation",
              ].map((item, idx) => (
                <li key={item} className="flex items-center gap-6 text-black">
                  <span className="text-4xl text-gray-400">{`0${idx + 1}`}</span>
                  <span className="text-4xl">{item}</span>
                </li>
              ))}
            </ul>

            <div className="relative h-[560px] rounded-[28px] overflow-hidden">
              <Image
                src={content.section2Image}
                alt="About gallery"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
                unoptimized
              />
              {isEditing && (
                <input
                  type="file"
                  onChange={(e) => handleImageUpload("section2Image", e.target.files?.[0] || null)}
                  className="absolute bottom-2 left-2 text-xs bg-white/90 p-1 rounded"
                />
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-6xl font-semibold text-[#272846]">
            Indulge every step of
            <span className="text-[#e9c46a] italic font-normal"> the way</span>
          </h3>
          <p className="max-w-4xl mx-auto mt-4 text-xl text-gray-700 leading-relaxed">
            We are enthusiastic to be part of the journey to find the craftsmanship you admire, and the qualities you desire, in your next luxury vehicle. At HGreg Lux, we believe helping you invest in a luxury vehicle requires superior expertise as well as genuine commitment, and our team is the ideal embodiment of what our company stands for.
          </p>
          <button
            onClick={() => (content.heroButtons[1]?.link ? (window.location.href = content.heroButtons[1].link) : undefined)}
            className="mt-6 bg-[#f3bf1f] hover:bg-[#e4af11] text-black font-semibold rounded-full px-10 py-4 transition"
          >
            Find your car
          </button>

          <div className="mt-10 grid md:grid-cols-3 gap-8">
            {["/images/hero-consign.jpg", "/images/hero-listings.jpg", "/images/hero-vintage.jpg"].map((img) => (
              <div key={img} className="relative rounded-3xl overflow-hidden h-[420px]">
                <Image src={img} alt="Luxury inventory" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        </div>

        {/* 👥 Team Section */}
<div className="bg-[#f4f4f4] rounded-xl p-8 border border-gray-200">
  <div className="flex items-center justify-between mb-8">
    <h2 className="text-3xl font-bold text-gray-900">
      {content.teamTitle}
    </h2>

    {isEditing && (
      <button
        onClick={() => {
          setContent((prev) => ({
            ...prev,
            team: [
              ...prev.team,
              {
                name: "New Member",
                role: "Role",
                phone: "",
                email: "",
                image: "/images/placeholder-avatar.jpg",
              },
            ],
          }));
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
      >
        ➕ Add Member
      </button>
    )}
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {content.team.map((member, i) => (
      <div
        key={i}
        className="text-center bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition"
      >
        <div className="relative w-full h-[260px] mb-4 rounded-lg overflow-hidden">
          <Image
            src={member.image}
            alt={member.name}
            fill
            sizes="100vw"
            className="object-cover"
            unoptimized
          />
          {isEditing && (
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageUpload(`team[${i}].image`, file);
                }
              }}
              className="absolute bottom-2 left-2 text-xs bg-white/80 p-1 rounded"
            />
          )}
        </div>

        {isEditing ? (
          <>
            <input
              value={member.name}
              onChange={(e) => {
                const team = [...content.team];
                team[i].name = e.target.value;
                setContent({ ...content, team });
              }}
              className="w-full border border-gray-300 p-2 mb-1 rounded"
            />
            <input
              value={member.role}
              onChange={(e) => {
                const team = [...content.team];
                team[i].role = e.target.value;
                setContent({ ...content, team });
              }}
              className="w-full border border-gray-300 p-2 mb-1 rounded"
            />
            <input
              value={member.phone}
              onChange={(e) => {
                const team = [...content.team];
                team[i].phone = e.target.value;
                setContent({ ...content, team });
              }}
              className="w-full border border-gray-300 p-2 mb-1 rounded text-sm"
            />
            <input
              value={member.email}
              onChange={(e) => {
                const team = [...content.team];
                team[i].email = e.target.value;
                setContent({ ...content, team });
              }}
              className="w-full border border-gray-300 p-2 mb-3 rounded text-sm"
            />

            <button
              onClick={() => {
                const updated = [...content.team];
                updated.splice(i, 1);
                setContent({ ...content, team: updated });
              }}
              className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
            >
              🗑 Remove
            </button>
          </>
        ) : (
          <>
            <h3 className="font-bold text-lg text-gray-900">
              {member.name}
            </h3>
            <p className="text-gray-500 text-sm mb-2">{member.role}</p>
            <p className="text-gray-700 text-sm">{member.phone}</p>
            <p className="text-blue-600 text-sm">{member.email}</p>
          </>
        )}
      </div>
    ))}
  </div>
</div>


        {/* Admin Controls */}
        {role === "superadmin" && (
          <div className="text-center mt-8">
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
      </div>
      <ContactPopup open={contactOpen} onClose={() => setContactOpen(false)} />
    </section>
  );
}
