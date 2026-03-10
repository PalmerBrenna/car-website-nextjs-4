"use client";

import { Star } from "lucide-react";

const reviews = [
  { name: "Maria Smiley", text: "Greg can’t be beat. Best price in town and outstanding service!", image: "https://i.pravatar.cc/80?img=32" },
  { name: "Naranjo Vega", text: "I’m really happy with my car. Everything went smoothly and the team was great.", image: "https://i.pravatar.cc/80?img=12" },
  { name: "Eric Linderman", text: "I found exactly the car I wanted, in perfect condition and at the right price.", image: "https://i.pravatar.cc/80?img=15" },
  { name: "Jonathan Easterling", text: "Leo was extremely helpful and I received excellent service from start to finish.", image: "https://i.pravatar.cc/80?img=18" },
  { name: "Alyssa Brown", text: "Professional team, transparent process, and very fast delivery.", image: "https://i.pravatar.cc/80?img=47" },
  { name: "Carmen Brooks", text: "The car looked immaculate and it was exactly as described in the listing.", image: "https://i.pravatar.cc/80?img=45" },
  { name: "Daniel White", text: "No hidden fees and no pressure. One of the best car-buying experiences I’ve had.", image: "https://i.pravatar.cc/80?img=51" },
  { name: "Emily Martin", text: "Excellent communication and quick support throughout the entire purchase process.", image: "https://i.pravatar.cc/80?img=56" },
  { name: "George Kim", text: "I was able to get financing quickly and drive away the same day.", image: "https://i.pravatar.cc/80?img=59" },
  { name: "Irene Wallace", text: "I highly recommend them. The car is amazing and the service felt premium.", image: "https://i.pravatar.cc/80?img=24" },
  { name: "Kevin Holt", text: "Exactly as advertised. Super clean inventory and an honest team.", image: "https://i.pravatar.cc/80?img=64" },
  { name: "Lucas Sanders", text: "I received all the details, photos, and full history before even coming in.", image: "https://i.pravatar.cc/80?img=36" },
  { name: "Maya Singh", text: "Customer support answered every question, even after the purchase.", image: "https://i.pravatar.cc/80?img=38" },
  { name: "Nicole Reed", text: "Great value for the quality of the car, plus warranty and full inspection.", image: "https://i.pravatar.cc/80?img=41" },
  { name: "Oliver Grant", text: "Smooth transaction from the test drive all the way to the paperwork.", image: "https://i.pravatar.cc/80?img=68" },
  { name: "Paul Johnson", text: "Reliable, punctual, and very detail-oriented. I would definitely come back again.", image: "https://i.pravatar.cc/80?img=20" },
  { name: "Rachel Ellis", text: "I really liked the way the car was presented and the guidance I received.", image: "https://i.pravatar.cc/80?img=29" },
  { name: "Samuel Lee", text: "The whole process felt premium, easy, and completely stress-free.", image: "https://i.pravatar.cc/80?img=75" },
  { name: "Tina Flores", text: "Best dealership experience I’ve had in years.", image: "https://i.pravatar.cc/80?img=26" },
  { name: "Victor Miller", text: "Very satisfied with both the car and the overall buying experience.", image: "https://i.pravatar.cc/80?img=23" },

  { name: "Ashley Cooper", text: "The staff was friendly, honest, and never pushy. I felt comfortable the whole time.", image: "https://i.pravatar.cc/80?img=8" },
  { name: "Brandon Hayes", text: "Great selection of vehicles and every car I looked at was spotless.", image: "https://i.pravatar.cc/80?img=9" },
  { name: "Chloe Bennett", text: "They made the process easy and explained every step clearly.", image: "https://i.pravatar.cc/80?img=10" },
  { name: "Derek Collins", text: "Fair pricing, quick paperwork, and an excellent vehicle. Couldn’t ask for more.", image: "https://i.pravatar.cc/80?img=11" },
  { name: "Emma Parker", text: "I appreciated how transparent they were about the car’s history and condition.", image: "https://i.pravatar.cc/80?img=13" },
  { name: "Frank Turner", text: "Very professional experience. The team took care of everything quickly.", image: "https://i.pravatar.cc/80?img=14" },
  { name: "Grace Mitchell", text: "I found a great deal and the customer service was top-notch.", image: "https://i.pravatar.cc/80?img=16" },
  { name: "Henry Foster", text: "The car was clean, well-maintained, and ready to go when I arrived.", image: "https://i.pravatar.cc/80?img=17" },
  { name: "Isabella Price", text: "They answered all my questions with patience and helped me choose the right car.", image: "https://i.pravatar.cc/80?img=19" },
  { name: "Jack Murphy", text: "Fast, easy, and professional. I would recommend them to anyone looking for a car.", image: "https://i.pravatar.cc/80?img=21" },
  { name: "Katherine Ross", text: "The vehicle was exactly what I saw online. No surprises, just great service.", image: "https://i.pravatar.cc/80?img=22" },
  { name: "Logan Perry", text: "One of the smoothest purchases I’ve ever made. Great people to work with.", image: "https://i.pravatar.cc/80?img=25" },
  { name: "Megan Ward", text: "They helped me compare options and never rushed my decision.", image: "https://i.pravatar.cc/80?img=27" },
  { name: "Nathan Brooks", text: "Fantastic service and a very straightforward buying process.", image: "https://i.pravatar.cc/80?img=28" },
  { name: "Olivia Simmons", text: "I loved how organized everything was, from the test drive to signing the papers.", image: "https://i.pravatar.cc/80?img=30" },
  { name: "Patrick Hughes", text: "The team was knowledgeable and helped me get a great financing option.", image: "https://i.pravatar.cc/80?img=31" },
  { name: "Quinn Richardson", text: "Very impressed with the quality of the inventory and the professionalism of the staff.", image: "https://i.pravatar.cc/80?img=33" },
  { name: "Rebecca Barnes", text: "They made buying a car feel simple and stress-free.", image: "https://i.pravatar.cc/80?img=34" },
  { name: "Scott Graham", text: "Honest dealership with fair prices and excellent customer care.", image: "https://i.pravatar.cc/80?img=35" },
  { name: "Taylor Jenkins", text: "Everything was handled efficiently and I drove away feeling confident in my purchase.", image: "https://i.pravatar.cc/80?img=37" },

  { name: "Ulysses Carter", text: "Very smooth experience from the first phone call to final delivery.", image: "https://i.pravatar.cc/80?img=39" },
  { name: "Vanessa Bryant", text: "The team was welcoming, helpful, and very professional throughout.", image: "https://i.pravatar.cc/80?img=40" },
  { name: "William Sanders", text: "I got a great deal on a clean, reliable car with no hassle at all.", image: "https://i.pravatar.cc/80?img=42" },
  { name: "Xavier Bell", text: "Excellent attention to detail and strong communication at every stage.", image: "https://i.pravatar.cc/80?img=43" },
  { name: "Yvonne Coleman", text: "They truly care about their customers and it shows in the service.", image: "https://i.pravatar.cc/80?img=44" },
  { name: "Zachary Fisher", text: "I would absolutely buy from them again. Great team and great inventory.", image: "https://i.pravatar.cc/80?img=46" },
  { name: "Abigail Howard", text: "The whole experience was easy, clear, and surprisingly quick.", image: "https://i.pravatar.cc/80?img=48" },
  { name: "Benjamin Ward", text: "They were upfront about everything and made me feel confident in my choice.", image: "https://i.pravatar.cc/80?img=49" },
  { name: "Claire Peterson", text: "Very responsive, very professional, and the car exceeded my expectations.", image: "https://i.pravatar.cc/80?img=50" },
  { name: "David Ramirez", text: "Outstanding service and a great vehicle. I’m very happy with my purchase.", image: "https://i.pravatar.cc/80?img=52" },
  { name: "Ella Griffin", text: "The process was fast, organized, and completely transparent.", image: "https://i.pravatar.cc/80?img=53" },
  { name: "Finn Powell", text: "A truly hassle-free buying experience with a team that knows what they’re doing.", image: "https://i.pravatar.cc/80?img=54" },
  { name: "Gabriella Hayes", text: "They went above and beyond to help me find the right vehicle.", image: "https://i.pravatar.cc/80?img=55" },
  { name: "Hunter Bryant", text: "Everything was exactly as promised. Honest people and excellent service.", image: "https://i.pravatar.cc/80?img=57" },
  { name: "Jasmine Foster", text: "The car was in excellent condition and the buying process was incredibly smooth.", image: "https://i.pravatar.cc/80?img=58" },
  { name: "Kyle Bennett", text: "Great customer service, great pricing, and no unnecessary pressure.", image: "https://i.pravatar.cc/80?img=60" },
  { name: "Lauren Hayes", text: "They made me feel valued as a customer and took time to explain everything.", image: "https://i.pravatar.cc/80?img=61" },
  { name: "Matthew Reed", text: "One of the most professional dealerships I’ve worked with.", image: "https://i.pravatar.cc/80?img=62" },
  { name: "Natalie Cooper", text: "The team was honest, efficient, and easy to work with from day one.", image: "https://i.pravatar.cc/80?img=63" },
  { name: "Owen Carter", text: "Great experience overall. I found the right car quickly and the process was seamless.", image: "https://i.pravatar.cc/80?img=65" },
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
