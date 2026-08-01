import React from 'react';
import { motion } from 'motion/react';
import { LogoBadge } from './LogoBadge';
import { Sparkles, Heart, Cake, ArrowRight, MapPin } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface HeroProps {
  onOpenKitBuilder?: () => void;
  onScrollToMenu: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToMenu }) => {
  const { siteConfig } = useAdmin();

  return (
    <section id="inicio" className="relative pt-24 pb-16 sm:pt-28 sm:pb-24 overflow-hidden bg-gingham">
      {/* Background Decorative Elements */}
      <div className="absolute top-8 left-6 text-[#F4ACB7]/40 font-script text-4xl animate-pulse pointer-events-none z-0">
        ♡
      </div>
      <div className="absolute top-8 right-6 text-[#F4ACB7]/40 font-script text-5xl animate-pulse pointer-events-none delay-500 z-0">
        ♡
      </div>
      <div className="absolute bottom-6 right-6 text-3xl opacity-30 pointer-events-none animate-bounce z-0">
        🥮
      </div>
      <div className="absolute bottom-6 left-6 text-3xl opacity-30 pointer-events-none animate-bounce delay-300 z-0">
        🍰
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Text & Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6"
          >
            
            {/* Top pill tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#F4ACB7] shadow-xs text-xs sm:text-sm font-semibold text-[#E85D75]">
              <Sparkles className="w-4 h-4 text-[#E85D75]" />
              <span>Por @a_lavss • Teixeira de Freitas</span>
            </div>

            {/* Main Title */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3D231D] leading-tight">
              Bolos Caseirinhos <br className="hidden sm:inline" />
              <span className="font-script text-5xl sm:text-6xl lg:text-7xl text-[#E85D75] inline-block mt-1">
                Sabor que lembra casa.
              </span>
            </h1>

            {/* Tagline snippet matching Instagram profile */}
            <p className="text-base sm:text-lg text-[#5C3A21] max-w-xl font-medium leading-relaxed">
              Feitos com ingredientes selecionados, massa leve, fofinha e receios generosos. Cada bolo caseirinho é preparado artesanalmente para criar doces momentos!
            </p>

            {/* Highlights pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 border border-[#FFE5EC] text-xs font-semibold text-[#3D231D] shadow-2xs">
                <Cake className="w-3.5 h-3.5 text-[#E85D75]" /> 100% Artesanais
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 border border-[#FFE5EC] text-xs font-semibold text-[#3D231D] shadow-2xs">
                <Heart className="w-3.5 h-3.5 text-[#E85D75] fill-[#E85D75]" /> Coberturas Generosas
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 border border-[#FFE5EC] text-xs font-semibold text-[#3D231D] shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-[#E85D75]" /> Teixeira de Freitas
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-4">
              <button
                onClick={onScrollToMenu}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#E85D75] hover:bg-[#D84B65] text-white font-bold text-base shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Ver Cardápio de Bolos</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </motion.div>

          {/* Right Column: Featured Logo Badge Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
            className="lg:col-span-6 flex items-center justify-center relative"
          >
            
            {/* Glowing background halo */}
            <div className="absolute w-80 h-80 bg-[#FFCAD4] rounded-full blur-3xl opacity-50 -z-10" />

            {/* Main Brand Badge reproducing exact design */}
            <div className="transform hover:rotate-1 transition-transform duration-500">
              <LogoBadge size="lg" showSubtitle={true} />
            </div>

            {/* Floating Card Highlight: Bolo Caseirinho de Cenoura */}
            <div className="hidden sm:flex absolute -top-4 -right-2 lg:-right-8 bg-white/95 backdrop-blur-xs p-3 rounded-2xl shadow-xl border border-[#F4ACB7]/40 items-center gap-3 max-w-xs animate-bounce duration-1000 z-20">
              <div className="w-12 h-12 rounded-xl bg-[#FFE5EC] overflow-hidden flex items-center justify-center shrink-0 border border-[#F4ACB7]/30">
                <span className="text-2xl">🥮</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-xs text-[#3D231D]">Bolo Caseirinho de Cenoura</p>
                <p className="text-2xs text-[#E85D75] font-semibold">Com vulcão de brigadeiro ✨</p>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};


