import React from 'react';
import { motion } from 'motion/react';
import { Heart, Award, Sparkles, Instagram, Coffee } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const AboutLavinia: React.FC = () => {
  const { siteConfig } = useAdmin();

  return (
    <section id="sobre" className="py-20 bg-white relative overflow-hidden">
      {/* Soft divider top */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#FFF0F3] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
          
          {/* Left Column: Image / Profile Visual */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative max-w-sm w-full">
              
              {/* Outer decorative frame */}
              <div className="absolute -inset-4 rounded-3xl bg-[#FFE5EC] transform -rotate-3 border-2 border-[#F4ACB7]/40 shadow-md" />
              
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-[#FFF0F3] p-2">
                <img
                  src={siteConfig.profileImage}
                  alt={`${siteConfig.founderName} - Confeiteira`}
                  className="w-full h-80 sm:h-96 object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />

                {/* Overlaid profile badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-[#F4ACB7]/50 shadow-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-bold text-[#3D231D] text-lg">
                      {siteConfig.founderName}
                    </h4>
                    <p className="text-xs text-[#E85D75] font-semibold">
                      {siteConfig.founderTitle}
                    </p>
                  </div>
                  <a
                    href="https://www.instagram.com/odocemundodalavinia?igsh=eWh4eTluOXgwODhp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-[#FFE5EC] text-[#E85D75] hover:bg-[#E85D75] hover:text-white transition-colors"
                    title="Instagram @odocemundodalavinia"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Decorative Stamp */}
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#E85D75] text-white flex flex-col items-center justify-center p-2 shadow-lg transform rotate-12 text-center">
                <Heart className="w-5 h-5 fill-white text-white mb-0.5" />
                <span className="font-script text-xs leading-none">Feito com Amor</span>
              </div>

            </div>
          </div>

          {/* Right Column: Bio & Story */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE5EC] text-[#E85D75] font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Conheça a Confeiteira
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#3D231D]">
              "Oi! Me chamo <span className="font-script text-4xl sm:text-5xl text-[#E85D75]">{siteConfig.founderName}</span>..."
            </h2>

            <div className="space-y-4 text-[#5C3A21] text-base leading-relaxed">
              <p>{siteConfig.profileBio1}</p>
              {siteConfig.profileBio2 && <p>{siteConfig.profileBio2}</p>}
              {siteConfig.profileBio3 && <p className="whitespace-pre-line">{siteConfig.profileBio3}</p>}
            </div>

            {/* Signature Motto from Instagram Post */}
            <div className="p-4 rounded-2xl bg-[#FFF0F3] border border-[#F4ACB7]/50 flex items-center gap-3">
              <span className="text-2xl shrink-0">🍓</span>
              <p className="font-script text-base sm:text-lg text-[#E85D75] font-bold">
                O Mundo Doce da Lavínia – Feito com amor, assado com carinho e servido com gratidão.
              </p>
            </div>

            {/* Value Pillars Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              
              <div className="p-4 rounded-xl bg-[#FFF0F3] border border-[#F4ACB7]/40 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-[#FFE5EC] flex items-center justify-center text-[#E85D75] mb-2">
                  <Heart className="w-5 h-5 fill-[#E85D75]" />
                </div>
                <h4 className="font-bold text-sm text-[#3D231D]">Feito com Amor</h4>
                <p className="text-2xs text-[#5C3A21] mt-0.5">Cuidado em cada detalhe</p>
              </div>

              <div className="p-4 rounded-xl bg-[#FFF0F3] border border-[#F4ACB7]/40 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-[#FFE5EC] flex items-center justify-center text-[#E85D75] mb-2">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#3D231D]">100% Fresquinho</h4>
                <p className="text-2xs text-[#5C3A21] mt-0.5">Produzido no dia do evento</p>
              </div>

              <div className="p-4 rounded-xl bg-[#FFF0F3] border border-[#F4ACB7]/40 flex flex-col items-center text-center col-span-2 sm:col-span-1">
                <div className="w-10 h-10 rounded-full bg-[#FFE5EC] flex items-center justify-center text-[#E85D75] mb-2">
                  <Coffee className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#3D231D]">Receitas Próprias</h4>
                <p className="text-2xs text-[#5C3A21] mt-0.5">Massa aveludada e leve</p>
              </div>

            </div>

            {/* Instagram Link Pills */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <a
                href="https://www.instagram.com/odocemundodalavinia?igsh=eWh4eTluOXgwODhp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFE5EC] hover:bg-[#FFCAD4] text-[#E85D75] font-bold text-xs sm:text-sm transition-all"
              >
                <Instagram className="w-4 h-4" />
                <span>@odocemundodalavinia</span>
              </a>

              <a
                href="https://instagram.com/a_lavss"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-[#3D231D] font-semibold text-xs sm:text-sm transition-all"
              >
                <Instagram className="w-4 h-4 text-pink-500" />
                <span>Perfil Pessoal: @a_lavss</span>
              </a>
            </div>

          </div>

        </motion.div>
      </div>
    </section>
  );
};

