import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Menu as MenuIcon, X, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { useAdmin } from '../context/AdminContext';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenKitBuilder?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const prevCountRef = useRef(cartCount);
  const { siteConfig, openAdminModal, isLoggedIn } = useAdmin();

  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 500);
      prevCountRef.current = cartCount;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Início', href: '#inicio' },
    { name: 'Sobre a Lavínia', href: '#sobre' },
    { name: 'Cardápio de Bolos', href: '#cardapio' },
    { name: 'Avaliações', href: '#avaliacoes' },
    { name: 'Instagram', href: '#instagram' },
    { name: 'Contato', href: '#contato' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-md py-2 border-b border-[#F4ACB7]/30'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo Brand Header */}
          <a href="#inicio" className="flex items-center gap-2 group">
            {siteConfig.logoUrl ? (
              <img
                src={siteConfig.logoUrl}
                alt="Logo Doce Mundo da Lavínia"
                className="w-10 h-10 rounded-full object-contain bg-white border-2 border-[#F4ACB7] shadow-sm group-hover:scale-105 transition-transform p-0.5"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#FFE5EC] border-2 border-[#F4ACB7] flex items-center justify-center text-[#E85D75] font-script text-xl font-bold shadow-sm group-hover:scale-105 transition-transform">
                🥮
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-script text-2xl text-[#E85D75] font-bold leading-none">
                O Doce Mundo
              </span>
              <span className="font-display text-xs tracking-wider text-[#3D231D] font-semibold uppercase">
                DA LAVÍNIA
              </span>
            </div>
          </a>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="text-[#3D231D] hover:text-[#E85D75] font-medium text-sm transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#E85D75] hover:after:w-full after:transition-all"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons: Cart & Discreet ADM Lock */}
          <div className="flex items-center gap-2.5">
            {/* Cart Button */}
            <motion.button
              onClick={onOpenCart}
              animate={isPulsing ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="relative p-2.5 rounded-full bg-white border border-[#F4ACB7] text-[#E85D75] hover:bg-[#FFE5EC] transition-colors shadow-sm flex items-center justify-center cursor-pointer"
              aria-label="Abrir Carrinho"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="absolute -top-1.5 -right-1.5 bg-[#E85D75] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>

            {/* Subtle ADM Access Button */}
            <button
              onClick={openAdminModal}
              className={`p-2 rounded-full transition-all border ${
                isLoggedIn
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-700'
                  : 'bg-white/80 border-gray-200 text-gray-400 hover:text-[#E85D75] hover:border-pink-300'
              }`}
              title="Área da Confeiteira (ADM)"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#3D231D] hover:bg-[#FFE5EC]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-[#F4ACB7] px-4 pt-3 pb-6 mt-2 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-3">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-[#3D231D] hover:text-[#E85D75] font-medium text-base border-b border-[#FFF0F3]"
              >
                {link.name}
              </a>
            ))}

            <button
              onClick={() => {
                openAdminModal();
                setMobileMenuOpen(false);
              }}
              className="mt-1 py-2 text-2xs text-gray-500 hover:text-[#E85D75] flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Área Restrita Lavínia (ADM)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};


