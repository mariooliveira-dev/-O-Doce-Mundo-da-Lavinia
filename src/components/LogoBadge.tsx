import React from 'react';
import { useAdmin } from '../context/AdminContext';

interface LogoBadgeProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const LogoBadge: React.FC<LogoBadgeProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const { siteConfig } = useAdmin();

  const scale =
    size === 'sm'
      ? 'scale-75'
      : size === 'md'
      ? 'scale-90 md:scale-100'
      : size === 'lg'
      ? 'scale-100 md:scale-110'
      : 'scale-110 md:scale-125';

  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {/* Outer container mirroring the exact badge in the screenshot */}
      <div
        className={`relative transition-all duration-300 transform ${scale} p-2`}
      >
        {/* Soft pink outer circular badge frame with dashed border & hearts */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-[#FFE5EC] border-4 border-[#F4ACB7] shadow-xl flex items-center justify-center p-3">
          
          {/* Inner white circle with pink stitched outline */}
          <div className="w-full h-full rounded-full bg-white/95 border-2 border-dashed border-[#FF85A1] flex flex-col items-center justify-between py-4 px-3 shadow-inner relative overflow-hidden">
            
            {/* Top Decorative Swirls & Hearts */}
            <div className="absolute top-2 left-6 text-[#F4ACB7] text-xs font-script pointer-events-none select-none">
              ♡ ✨
            </div>
            <div className="absolute top-2 right-6 text-[#F4ACB7] text-xs font-script pointer-events-none select-none">
              ✨ ♡
            </div>

            {siteConfig.logoUrl ? (
              /* Custom uploaded logo image displayed 100% complete, centered, without clipping */
              <div className="w-full h-full flex items-center justify-center p-2 z-10">
                <img
                  src={siteConfig.logoUrl}
                  alt="Logo Doce Mundo da Lavínia"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              /* Default SVG Cupcake & Typography Badge */
              <>
                {/* Cupcake with Cherry on Top illustration */}
                <div className="flex flex-col items-center mt-1 z-10 relative">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                    {/* Plate */}
                    <div className="absolute bottom-0 w-14 h-2 bg-[#F8BBD0] rounded-full opacity-80 shadow-sm" />
                    
                    {/* Cupcake SVG */}
                    <svg
                      viewBox="0 0 100 100"
                      className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-md z-10"
                    >
                      {/* Liner */}
                      <path
                        d="M30,60 L35,88 C35,90 37,92 40,92 L60,92 C63,92 65,90 65,88 L70,60 Z"
                        fill="#F4ACB7"
                        stroke="#D87093"
                        strokeWidth="2"
                      />
                      {/* Liner stripes */}
                      <line x1="38" y1="60" x2="42" y2="90" stroke="#FFE5EC" strokeWidth="2" />
                      <line x1="50" y1="60" x2="50" y2="90" stroke="#FFE5EC" strokeWidth="2" />
                      <line x1="62" y1="60" x2="58" y2="90" stroke="#FFE5EC" strokeWidth="2" />

                      {/* Pink Cream Frosting */}
                      <path
                        d="M25,60 C22,60 20,53 25,48 C28,45 35,45 38,48 C40,43 48,42 50,45 C53,41 62,42 64,48 C68,45 76,46 75,52 C78,57 73,60 70,60 Z"
                        fill="#FFCAD4"
                        stroke="#F4ACB7"
                        strokeWidth="2"
                      />
                      {/* Cream swirl upper layer */}
                      <path
                        d="M32,48 C32,40 42,32 50,30 C58,32 68,40 68,48 C62,44 55,42 50,44 C45,42 38,44 32,48 Z"
                        fill="#FFE5EC"
                      />
                      <circle cx="42" cy="46" r="1.5" fill="#FF85A1" />
                      <circle cx="58" cy="46" r="1.5" fill="#FF85A1" />
                      <circle cx="50" cy="38" r="1.5" fill="#FF85A1" />

                      {/* Cherry Stem */}
                      <path
                        d="M50,22 Q56,12 62,10"
                        fill="none"
                        stroke="#2E7D32"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                      {/* Red Cherry */}
                      <circle cx="50" cy="22" r="7" fill="#E53935" stroke="#B71C1C" strokeWidth="1" />
                      <circle cx="48" cy="20" r="2" fill="#FFFFFF" opacity="0.8" />
                    </svg>
                  </div>
                </div>

                {/* Brand Title Breakdown: O Doce / Mundo / da Lavínia */}
                <div className="flex flex-col items-center my-auto z-10">
                  {/* O Doce */}
                  <span className="font-display text-lg sm:text-xl font-bold tracking-wide text-[#3D231D] leading-none">
                    O Doce
                  </span>

                  {/* Mundo with Hearts and Wire Whisk (Fustete) icon */}
                  <div className="relative flex items-center justify-center my-0.5">
                    <span className="text-[#FF85A1] text-xs font-script mr-1 animate-pulse">
                      ♥
                    </span>

                    <span className="font-script text-3xl sm:text-4xl text-[#E85D75] font-bold drop-shadow-sm px-1">
                      Mundo
                    </span>

                    <span className="text-[#FF85A1] text-xs font-script ml-0.5 mr-1 animate-pulse">
                      ♥
                    </span>

                    <div className="inline-flex items-center justify-center text-[#B87333] transform rotate-12 ml-0.5">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 stroke-current fill-none stroke-[1.8]">
                        <line x1="18" y1="18" x2="14" y2="14" strokeLinecap="round" />
                        <path d="M14 14 C10 10 4 6 6 4 C8 2 12 8 14 14" />
                        <path d="M14 14 C12 8 8 2 6 4 C4 6 10 10 14 14" />
                        <path d="M14 14 C8 12 2 8 4 6 C6 4 10 8 14 14" />
                      </svg>
                    </div>
                  </div>

                  {/* da Lavínia */}
                  <span className="font-display text-lg sm:text-xl font-bold tracking-wide text-[#3D231D] leading-none">
                    da {siteConfig.founderName?.split(' ')[0] || 'Lavínia'}
                  </span>
                </div>
              </>
            )}

            {/* Curved Ribbon at the bottom inside badge */}
            <div className="w-full relative z-20 mt-1 mb-1">
              <div className="relative bg-[#FFCAD4] border border-[#F4ACB7] rounded-full py-1 px-3 shadow-md text-center flex items-center justify-center">
                <span className="text-[#FF85A1] text-xs mr-1">♥</span>
                <p className="font-script text-xs sm:text-sm text-[#4A2E2B] font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                  {siteConfig.logoSlogan || 'Feito com amor para adoçar seus melhores momentos'}
                </p>
                <span className="text-[#FF85A1] text-xs ml-1">♥</span>
              </div>
            </div>

          </div>
        </div>

        {/* Subtitle message underneath */}
        {showSubtitle && (
          <div className="mt-3 flex flex-col items-center">
            <p className="font-display text-sm sm:text-base text-[#3D231D] font-medium italic">
              Feito com amor,
            </p>
            <p className="font-script text-lg sm:text-xl text-[#E85D75] font-bold -mt-1 flex items-center gap-1">
              para adoçar o seu dia! <span className="text-[#E85D75]">♡</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

