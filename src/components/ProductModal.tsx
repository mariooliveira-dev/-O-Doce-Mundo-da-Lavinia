import React, { useState } from 'react';
import { Product, CartItem } from '../types';
import { X, Sparkles, Plus, Minus, ShoppingBag, Heart, MessageCircle } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const { siteConfig } = useAdmin();
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedFlavor, setSelectedFlavor] = useState<string>(
    product.options?.flavors?.[0] || ''
  );
  const [selectedFilling, setSelectedFilling] = useState<string>(
    product.options?.fillings?.[0] || ''
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.options?.sizes?.[0]?.name || ''
  );
  const [customInscription, setCustomInscription] = useState('');
  const [extraNotes, setExtraNotes] = useState('');

  // Calculate price extra from size
  const extraSizePrice =
    product.options?.sizes?.find((s) => s.name === selectedSize)?.extraPrice || 0;
  const unitPrice = product.price + extraSizePrice;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    const item: CartItem = {
      id: `${product.id}-${Date.now()}`,
      product,
      quantity,
      selectedFlavor: selectedFlavor || undefined,
      selectedFilling: selectedFilling || undefined,
      selectedSize: selectedSize || undefined,
      customInscription: customInscription.trim() || undefined,
      extraNotes: extraNotes.trim() || undefined,
      totalPrice,
    };
    onAddToCart(item);
    onClose();
  };

  const handleDirectWhatsApp = () => {
    let msg = `Olá ${siteConfig.founderName?.split(' ')[0] || 'Lavínia'}! Entrei no site e cliquei no *${product.name}* (Qtd: ${quantity}) por R$ ${totalPrice.toFixed(2).replace('.', ',')}.\n`;
    if (selectedSize) msg += `• Tamanho: ${selectedSize}\n`;
    if (selectedFlavor) msg += `• Sabor da massa: ${selectedFlavor}\n`;
    if (selectedFilling) msg += `• Recheio: ${selectedFilling}\n`;
    if (customInscription) msg += `• Escrita/Desenho: "${customInscription}"\n`;
    if (extraNotes) msg += `• Observações: ${extraNotes}\n`;
    msg += `\nGostaria de encomendar com você! Como podemos combinar os detalhes?`;

    const encoded = encodeURIComponent(msg);
    const phone = siteConfig.phoneRaw || '557399527100';
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-[#F4ACB7] shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-[#FFE5EC] text-[#3D231D] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Header */}
        <div className="relative h-56 sm:h-64 bg-[#FFF0F3] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <span className="text-2xs uppercase tracking-wider font-bold bg-[#E85D75] px-2.5 py-1 rounded-full">
              {product.category}
            </span>
            <h3 className="font-display font-bold text-2xl sm:text-3xl mt-1 drop-shadow">
              {product.name}
            </h3>
          </div>
        </div>

        {/* Modal Form Content */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-[#5C3A21] leading-relaxed">
            {product.description}
          </p>

          {/* Flavors selection if available */}
          {product.options?.flavors && product.options.flavors.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-[#3D231D] uppercase tracking-wider mb-2">
                Escolha o Sabor da Massa:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.options.flavors.map((flavor) => (
                  <button
                    key={flavor}
                    type="button"
                    onClick={() => setSelectedFlavor(flavor)}
                    className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all ${
                      selectedFlavor === flavor
                        ? 'bg-[#FFE5EC] border-[#E85D75] text-[#E85D75] shadow-xs'
                        : 'bg-white border-[#FFE5EC] text-[#5C3A21] hover:bg-[#FFF0F3]'
                    }`}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fillings selection if available */}
          {product.options?.fillings && product.options.fillings.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-[#3D231D] uppercase tracking-wider mb-2">
                Escolha o Recheio Especial:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.options.fillings.map((filling) => (
                  <button
                    key={filling}
                    type="button"
                    onClick={() => setSelectedFilling(filling)}
                    className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all ${
                      selectedFilling === filling
                        ? 'bg-[#FFE5EC] border-[#E85D75] text-[#E85D75] shadow-xs'
                        : 'bg-white border-[#FFE5EC] text-[#5C3A21] hover:bg-[#FFF0F3]'
                    }`}
                  >
                    {filling}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bentô Cake Custom Phrase Inscription */}
          {product.id.includes('bento') && (
            <div className="p-4 rounded-2xl bg-[#FFF0F3] border border-[#F4ACB7]/50 space-y-2">
              <div className="flex items-center gap-2 text-[#E85D75]">
                <Sparkles className="w-4 h-4" />
                <label className="text-xs font-bold uppercase tracking-wider">
                  Frase ou Desenho no Bentô Cake:
                </label>
              </div>
              <input
                type="text"
                value={customInscription}
                onChange={(e) => setCustomInscription(e.target.value)}
                placeholder="Ex: 'Parabéns Flávia! 🎂 22 aninhos'"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#F4ACB7] text-sm text-[#3D231D] focus:outline-none focus:ring-2 focus:ring-[#E85D75]"
              />
              <p className="text-2xs text-[#5C3A21]">
                A Lavínia escreve e desenha artesanalmente com glacê no seu mini bolo!
              </p>
            </div>
          )}

          {/* Extra Notes */}
          <div>
            <label className="block text-xs font-bold text-[#3D231D] uppercase tracking-wider mb-2">
              Observações Especiais ou Restrições:
            </label>
            <textarea
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              placeholder="Ex: 'Vou retirar às 15h', 'Por favor caprichar no lacinho rosa'..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FFF0F3] border border-[#FFE5EC] text-xs text-[#3D231D] focus:outline-none focus:ring-2 focus:ring-[#E85D75]"
            />
          </div>

          {/* Quantity Selector & Add Button */}
          <div className="pt-4 border-t border-[#FFF0F3] flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Quantity Controls */}
            <div className="flex items-center gap-3 bg-[#FFF0F3] p-1.5 rounded-full border border-[#F4ACB7]/40">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full bg-white text-[#3D231D] font-bold flex items-center justify-center hover:bg-[#FFE5EC]"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-sm text-[#3D231D] px-2">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full bg-white text-[#3D231D] font-bold flex items-center justify-center hover:bg-[#FFE5EC]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Total Price & Confirm Button */}
            <div className="flex-1 w-full">
              <button
                type="button"
                onClick={handleAdd}
                className="w-full py-3.5 px-6 rounded-full bg-[#E85D75] hover:bg-[#D84B65] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Adicionar ao Carrinho • R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
