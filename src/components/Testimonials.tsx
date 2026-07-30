import React from 'react';
import { REVIEWS } from '../data/products';
import { Star, Quote, Heart } from 'lucide-react';

export const Testimonials: React.FC = () => {
  return (
    <section id="avaliacoes" className="py-20 bg-[#FFF5F7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE5EC] text-[#E85D75] font-semibold text-xs uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-[#E85D75]" /> Depoimentos dos Clientes
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#3D231D]">
            Quem Prova, <span className="font-script text-4xl sm:text-5xl text-[#E85D75]">Se Apaixona!</span>
          </h2>
          <p className="text-sm text-[#5C3A21]">
            O amor colocado em cada receita refletido no carinho e feedback de quem comemora com a gente.
          </p>
        </div>

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-white p-6 rounded-3xl border border-[#F4ACB7]/40 shadow-sm hover:shadow-md transition-all space-y-4 relative flex flex-col justify-between"
            >
              <Quote className="w-8 h-8 text-[#FFE5EC] absolute top-6 right-6 pointer-events-none" />

              <div className="space-y-3">
                {/* Star Rating */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-[#3D231D] leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-[#FFF0F3] flex items-center gap-3">
                <img
                  src={review.avatar}
                  alt={review.author}
                  className="w-10 h-10 rounded-full object-cover border border-[#F4ACB7]"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-xs text-[#3D231D]">{review.author}</h4>
                  <p className="text-2xs text-[#E85D75] font-semibold">
                    {review.productName} • {review.date}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
