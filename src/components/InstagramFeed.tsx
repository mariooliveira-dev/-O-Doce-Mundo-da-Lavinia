import React from 'react';
import { motion } from 'motion/react';
import { Instagram, CheckCircle2, MapPin, ExternalLink, UserCheck, MessageSquare } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const InstagramFeed: React.FC = () => {
  const { siteConfig } = useAdmin();

  const INSTAGRAM_URL = 'https://www.instagram.com/odocemundodalavinia?igsh=eWh4eTluOXgwODhp';
  const WHATSAPP_URL = `https://wa.me/${siteConfig.phoneRaw || '557399527100'}?text=Ol%C3%A1%20Lav%C3%ADnia!%20Vim%20pelo%20seu%20Instagram!`;

  const profileLogo = siteConfig.logoUrl || '/logo-og.svg';

  return (
    <section id="instagram" className="py-16 sm:py-20 bg-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-2xl mx-auto space-y-2 mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFE5EC] text-[#E85D75] font-semibold text-xs uppercase tracking-wider border border-[#F4ACB7]/40 shadow-2xs">
            <Instagram className="w-3.5 h-3.5 text-[#E85D75]" /> Instagram Oficial
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#3D231D]">
            Siga <span className="font-script text-4xl sm:text-5xl text-[#E85D75]">@odocemundodalavinia</span>
          </h2>
          <p className="text-sm text-[#5C3A21]">
            Acompanhe nossas novidades no Instagram ou entre em contato diretamente para encomendas!
          </p>
        </motion.div>

        {/* INSTAGRAM PROFILE CARD (EXACT MATCH TO INSTAGRAM SCREENSHOT) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
          className="bg-[#000000] text-white rounded-3xl border border-gray-800 p-6 sm:p-8 shadow-xl mb-8"
        >
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            
            {/* Profile Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[3px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-md">
                <div className="w-full h-full rounded-full bg-black p-0.5 overflow-hidden">
                  <img
                    src={profileLogo}
                    alt="O doce mundo Da Lavínia"
                    className="w-full h-full object-contain rounded-full bg-[#FFE5EC]"
                  />
                </div>
              </div>
              <span className="absolute bottom-0 right-0 bg-[#0095F6] text-white text-3xs font-bold px-1.5 py-0.5 rounded-full border border-black shadow-xs">
                NOVO
              </span>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left space-y-3 w-full">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-xl sm:text-2xl tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
                    <span>odocemundodalavinia</span>
                    <CheckCircle2 className="w-5 h-5 text-[#0095F6] fill-[#0095F6]/20" />
                  </h3>
                  <p className="text-sm text-gray-300 font-medium">O doce mundo Da Lavínia</p>
                </div>

                {/* Profile Action Buttons */}
                <div className="flex items-center justify-center gap-2">
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 border border-gray-700"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-pink-400" />
                    <span>Seguindo</span>
                  </a>

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 rounded-lg bg-[#0095F6] hover:bg-[#0081d6] text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Mensagem</span>
                  </a>
                </div>
              </div>

              {/* Exact Stats Counters From Screenshot */}
              <div className="flex items-center justify-center sm:justify-start gap-8 py-2 border-y border-gray-800/80 my-2">
                <div className="text-center sm:text-left">
                  <span className="font-bold text-base text-white">2</span>
                  <span className="text-xs text-gray-400 ml-1.5">posts</span>
                </div>
                <div className="text-center sm:text-left">
                  <span className="font-bold text-base text-white">112</span>
                  <span className="text-xs text-gray-400 ml-1.5">seguidores</span>
                </div>
                <div className="text-center sm:text-left">
                  <span className="font-bold text-base text-white">37</span>
                  <span className="text-xs text-gray-400 ml-1.5">seguindo</span>
                </div>
              </div>

              {/* Exact Bio Text From Screenshot */}
              <div className="space-y-1 text-xs sm:text-sm text-gray-200 leading-relaxed">
                <p>🧁 Bolos caseirinhos | Doces momentos</p>
                <p>🏠 Sabor que lembra casa.</p>
                <p>💛 Por <span className="text-pink-400 font-semibold">@a_lavss</span></p>
                <p className="flex items-center justify-center sm:justify-start gap-1 text-gray-300">
                  <MapPin className="w-3.5 h-3.5 text-pink-500" />
                  <span>Teixeira de Freitas</span>
                </p>
                <p className="text-gray-400 pt-0.5">WhatsApp 👇</p>
                <p>
                  <a
                    href="https://w.app/cuo6jt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#0095F6] hover:underline inline-flex items-center gap-1"
                  >
                    <span>🔗 w.app/cuo6jt</span>
                  </a>
                </p>
              </div>

              {/* Followed By Social Proof From Screenshot */}
              <div className="pt-2 flex items-center justify-center sm:justify-start gap-2 text-3xs text-gray-400">
                <div className="flex -space-x-1.5 overflow-hidden">
                  <div className="inline-block h-5 w-5 rounded-full ring-1 ring-black bg-pink-400 text-3xs text-white font-bold text-center leading-5">R</div>
                  <div className="inline-block h-5 w-5 rounded-full ring-1 ring-black bg-amber-500 text-3xs text-white font-bold text-center leading-5">F</div>
                  <div className="inline-block h-5 w-5 rounded-full ring-1 ring-black bg-[#E85D75] text-3xs text-white font-bold text-center leading-5">L</div>
                </div>
                <span>Seguido(a) por <strong className="text-gray-200">risia.oliveira</strong>, <strong className="text-gray-200">felipesan_00</strong> e outras 5 pessoas</span>
              </div>

            </div>

          </div>

        </motion.div>

        {/* Follow CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
          className="text-center"
        >
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <Instagram className="w-5 h-5" />
            <span>Abrir perfil @odocemundodalavinia no Instagram</span>
            <ExternalLink className="w-4 h-4 opacity-90" />
          </a>
        </motion.div>

      </div>
    </section>
  );
};
