import React, { useState } from 'react';
import { Product } from '../types';
import { Star, Plus, Check, Sparkles, ZoomIn } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCartDirect: (product: Product) => void;
  onOpenLightbox?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCartDirect,
  onOpenLightbox,
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const isAvailable = product.available !== false;

  const handleDirectAdd = () => {
    if (!isAvailable) return;
    onAddToCartDirect(product);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };
  return (
    <div className={`group bg-white rounded-2xl overflow-hidden border border-[#F4ACB7]/30 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between transform hover:scale-[1.03] hover:-translate-y-1 ${
      !isAvailable ? 'opacity-85 grayscale-[20%]' : ''
    }`}>
      
      {/* Image container with Lightbox Trigger */}
      <div
        onClick={() => onOpenLightbox && onOpenLightbox(product)}
        className="relative aspect-4/3 overflow-hidden bg-[#FFF0F3] cursor-pointer group/img"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover group-hover:scale-105 group-hover/img:scale-110 transition-transform duration-500 ${
            !isAvailable ? 'brightness-90' : ''
          }`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.dataset.fallback) {
              target.dataset.fallback = 'true';
              target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80';
            }
          }}
        />

        {/* Hover Lightbox Overlay */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/90 text-[#3D231D] px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover/img:translate-y-0 transition-transform duration-300">
            <ZoomIn className="w-4 h-4 text-[#E85D75]" />
            <span>Ampliar Imagem</span>
          </div>
        </div>

        {/* Badge Overlay */}
        {product.badge && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full border border-[#F4ACB7]/40 text-xs font-bold text-[#E85D75] shadow-xs">
            {product.badge}
          </div>
        )}

        {/* Unavailable Banner Badge */}
        {!isAvailable && (
          <div className="absolute inset-x-0 bottom-0 bg-red-600/90 text-white text-center py-1.5 text-xs font-extrabold tracking-wider uppercase backdrop-blur-xs shadow-md">
            Indisponível no Momento
          </div>
        )}

        {/* Customization Icon */}
        {product.customizable && isAvailable && (
          <div className="absolute top-3 right-3 bg-[#E85D75] text-white p-1.5 rounded-full shadow-md" title="Personalizável">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            {!isAvailable ? (
              <span className="text-2xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                Esgotado
              </span>
            ) : <div />}
            <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-[#5C3A21]/60 font-normal">({product.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-display font-bold text-lg text-[#3D231D] group-hover:text-[#E85D75] transition-colors leading-snug">
            {product.name}
          </h3>

          <p className="text-xs text-[#5C3A21] line-clamp-2 mt-1.5 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="pt-3 border-t border-[#FFF0F3] flex items-center justify-between gap-3">
          <div>
            <span className="text-2xs text-[#5C3A21] block">A partir de</span>
            <span className="font-display font-bold text-xl text-[#3D231D]">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {!isAvailable ? (
              <button
                disabled
                className="px-3.5 py-2 rounded-full bg-gray-100 text-gray-400 font-bold text-xs cursor-not-allowed border border-gray-200"
              >
                Indisponível
              </button>
            ) : product.customizable ? (
              <button
                onClick={() => onSelectProduct(product)}
                className="px-4 py-2 rounded-full bg-[#FFE5EC] hover:bg-[#E85D75] text-[#E85D75] hover:text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <span>Personalizar</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleDirectAdd}
                className={`transition-all duration-300 flex items-center justify-center font-bold text-xs shadow-md cursor-pointer ${
                  isAdded
                    ? 'px-3 py-2 rounded-full bg-emerald-600 text-white scale-105'
                    : 'p-2.5 rounded-full bg-[#E85D75] hover:bg-[#D84B65] text-white hover:scale-105'
                }`}
                aria-label="Adicionar ao Pedido"
              >
                {isAdded ? (
                  <div className="flex items-center gap-1 animate-in zoom-in-75 duration-200">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span className="text-2xs font-bold whitespace-nowrap">Adicionado!</span>
                  </div>
                ) : (
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                )}
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
