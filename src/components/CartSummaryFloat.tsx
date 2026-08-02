import React from 'react';
import { ShoppingBag, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../types';

interface CartSummaryFloatProps {
  cartItems: CartItem[];
  isCartOpen: boolean;
  onOpenCart: () => void;
}

export const CartSummaryFloat: React.FC<CartSummaryFloatProps> = ({
  cartItems,
  isCartOpen,
  onOpenCart,
}) => {
  const totalItems = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalPrice = cartItems.reduce((acc, curr) => acc + curr.totalPrice, 0);

  const shouldShow = totalItems > 0 && !isCartOpen;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-6 left-4 sm:left-6 z-40 max-w-[calc(100vw-6rem)] sm:max-w-xs"
        >
          <button
            type="button"
            onClick={onOpenCart}
            className="w-full bg-white/95 backdrop-blur-md border-2 border-[#E85D75]/40 hover:border-[#E85D75] text-[#3D231D] p-3 sm:px-4.5 sm:py-3.5 rounded-2xl sm:rounded-full shadow-2xl hover:shadow-pink-200/50 transition-all duration-300 hover:scale-[1.03] active:scale-95 flex items-center justify-between gap-3 cursor-pointer group text-left"
            aria-label={`Ver carrinho com ${totalItems} itens, total de R$ ${totalPrice.toFixed(2).replace('.', ',')}`}
          >
            {/* Left side: Cart Icon with Badge */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-full bg-gradient-to-br from-[#E85D75] to-[#D84B65] text-white flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform">
                <ShoppingBag className="w-5 h-5 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-[#3D231D] text-[#FFE5EC] font-bold text-xs rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {totalItems}
              </span>
            </div>

            {/* Center: Total Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-2xs sm:text-xs text-[#E85D75] font-semibold tracking-wide uppercase">
                <Sparkles className="w-3 h-3" />
                <span className="truncate">Resumo do Pedido</span>
              </div>
              <div className="text-sm sm:text-base font-extrabold text-[#3D231D] leading-tight">
                R$ {totalPrice.toFixed(2).replace('.', ',')}
              </div>
            </div>

            {/* Right side: Action Arrow */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#FFE5EC] group-hover:bg-[#E85D75] text-[#E85D75] group-hover:text-white transition-colors flex-shrink-0 font-bold text-xs">
              <span className="hidden xs:inline sm:inline">Ver</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
