"use client";

import { Star } from "lucide-react";

const reviews = [
  { name: "Maria Smiley", text: "Greg can’t be beat, best price in town and best service!", image: "https://i.pravatar.cc/80?img=32" },
  { name: "Naranjo Vega", text: "I’m really happy with my car. Everything worked smoothly and everyone was great.", image: "https://i.pravatar.cc/80?img=12" },
  { name: "Eric Linderman", text: "I found exactly the car I wanted, in perfect condition and at the right price.", image: "https://i.pravatar.cc/80?img=15" },
  { name: "Jonathan Easterling", text: "Leo was extremely helpful and I received a great service.", image: "https://i.pravatar.cc/80?img=18" },
  { name: "Alyssa Brown", text: "Professional team, transparent process and very fast delivery.", image: "https://i.pravatar.cc/80?img=47" },
  { name: "Carmen Popa", text: "Masina arata impecabil si a fost exact cum era descrisa in anunt.", image: "https://i.pravatar.cc/80?img=45" },
  { name: "Daniel White", text: "No hidden fees, no pressure. One of the best buying experiences.", image: "https://i.pravatar.cc/80?img=51" },
  { name: "Elena Marin", text: "Comunicare excelenta si suport rapid pe tot parcursul achizitiei.", image: "https://i.pravatar.cc/80?img=56" },
  { name: "George Kim", text: "I was able to finance quickly and drive away the same day.", image: "https://i.pravatar.cc/80?img=59" },
  { name: "Irina Vasile", text: "Recomand 100%, masina este super si serviciile au fost premium.", image: "https://i.pravatar.cc/80?img=24" },
  { name: "Kevin Holt", text: "Exactly as advertised. Super clean inventory and honest team.", image: "https://i.pravatar.cc/80?img=64" },
  { name: "Luca Sandu", text: "Am primit toate detaliile, pozele si istoricul complet inainte de vizita.", image: "https://i.pravatar.cc/80?img=36" },
  { name: "Maya Singh", text: "Customer support answered every question, even after purchase.", image: "https://i.pravatar.cc/80?img=38" },
  { name: "Nicoleta Radu", text: "Pret foarte bun pentru ce ofera masina, plus garantie si verificare.", image: "https://i.pravatar.cc/80?img=41" },
  { name: "Oliver Grant", text: "Smooth transaction from test drive to paperwork.", image: "https://i.pravatar.cc/80?img=68" },
  { name: "Paul Ionescu", text: "Seriosi, punctuali si foarte atenti la detalii. Voi reveni cu drag.", image: "https://i.pravatar.cc/80?img=20" },
  { name: "Roxana Ilie", text: "Mi-a placut mult prezentarea masinii si consultanta oferita.", image: "https://i.pravatar.cc/80?img=29" },
  { name: "Samuel Lee", text: "The whole process felt premium and stress-free.", image: "https://i.pravatar.cc/80?img=75" },
  { name: "Tina Flores", text: "Best dealership experience I’ve had in years.", image: "https://i.pravatar.cc/80?img=26" },
  { name: "Victor Matei", text: "Foarte multumit de masina si de intreaga experienta de cumparare.", image: "https://i.pravatar.cc/80?img=23" },
];

export default function ReviewsCarousel() {
  const loopReviews = [...reviews, ...reviews];

  return (
    <section className="mt-14 border-t border-gray-200 pt-10 overflow-hidden">
      <h3 className="text-3xl font-semibold text-[#161b33] mb-6">See why customers love us</h3>

      <div className="reviews-track">
        {loopReviews.map((review, idx) => (
          <article key={`${review.name}-${idx}`} className="min-w-[320px] max-w-[320px] bg-[#e9e9e9] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <img
                src={review.image}
                alt={review.name}
                className="w-10 h-10 rounded-full object-cover"
                loading="lazy"
              />
              <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-900">
                <Star size={14} className="fill-yellow-400 text-yellow-400" /> 5.00
              </span>
            </div>
            <p className="text-[15px] text-gray-800 leading-relaxed">
              “{review.text}” – {review.name}
            </p>
          </article>
        ))}
      </div>

      <style jsx>{`
        .reviews-track {
          display: flex;
          gap: 16px;
          width: max-content;
          animation: reviews-scroll 60s linear infinite;
        }

        .reviews-track:hover {
          animation-play-state: paused;
        }

        @keyframes reviews-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
