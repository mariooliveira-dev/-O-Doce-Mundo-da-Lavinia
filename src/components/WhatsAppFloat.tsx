import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const WhatsAppFloat: React.FC = () => {
  const { siteConfig } = useAdmin();

  const phoneRaw = siteConfig.phoneRaw || '557399527100';
  const founderName = siteConfig.founderName?.split(' ')[0] || 'Lavínia';
  const whatsappUrl = `https://wa.me/${phoneRaw}?text=Olá%20${founderName}!%20Vim%20pelo%20site%20e%20gostaria%20de%20tirar%20uma%20dúvida%20ou%20fazer%20uma%20encomenda!`;

  return (
    <div className="fixed bottom-6 right-6 z-40 group">
      {/* Pulse effect rings */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75 animate-ping" />

      {/* Main button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Falar com ${founderName} no WhatsApp`}
        className="relative flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group-hover:pr-6"
      >
        <MessageCircle className="w-7 h-7 fill-white stroke-[#25D366]" />

        {/* Text label visible on desktop or expandable on hover */}
        <span className="font-bold text-sm hidden sm:inline-block whitespace-nowrap drop-shadow-xs">
          Falar com {founderName}
        </span>

        {/* Small badge dot */}
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-bounce" />
      </a>

      {/* Tooltip on mobile hover */}
      <div className="absolute right-0 bottom-full mb-2 hidden group-hover:flex sm:hidden bg-[#3D231D] text-white text-xs px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap font-medium">
        WhatsApp da {founderName}
      </div>
    </div>
  );
};
