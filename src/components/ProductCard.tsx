import React from 'react';
import { Product } from '../types';
import { Star, Plus, Heart, Sparkles, MessageSquare } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCartDirect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCartDirect,
}) => {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#F4ACB7]/30 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between transform hover:scale-[1.03] hover:-translate-y-1">
      
      {/* Image container */}
      <div className="relative aspect-4/3 overflow-hidden bg-[#FFF0F3]">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Badge Overlay */}
        {product.badge && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full border border-[#F4ACB7]/40 text-xs font-bold text-[#E85D75] shadow-xs">
            {product.badge}
          </div>
        )}

        {/* Customization Icon */}
        {product.customizable && (
          <div className="absolute top-3 right-3 bg-[#E85D75] text-white p-1.5 rounded-full shadow-md" title="Personalizável">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold text-[#E85D75] uppercase tracking-wider bg-[#FFE5EC] px-2 py-0.5 rounded-md">
              {product.category === 'bolos'
                ? 'Bolo'
                : product.category === 'cupcakes'
                ? 'Cupcake'
                : product.category === 'docinhos'
                ? 'Docinho'
                : product.category === 'copos'
                ? 'Sobremesa'
                : 'Kit Festa'}
            </span>
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
            {product.customizable ? (
              <button
                onClick={() => onSelectProduct(product)}
                className="px-4 py-2 rounded-full bg-[#FFE5EC] hover:bg-[#E85D75] text-[#E85D75] hover:text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs"
              >
                <span>Personalizar</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onAddToCartDirect(product)}
                className="p-2.5 rounded-full bg-[#E85D75] hover:bg-[#D84B65] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                aria-label="Adicionar ao Pedido"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
