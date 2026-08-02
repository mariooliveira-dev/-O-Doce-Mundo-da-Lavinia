import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Star, Plus, Check, Sparkles, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';

interface ImageLightboxModalProps {
  product: Product | null;
  productList?: Product[];
  onClose: () => void;
  onAddToCartDirect?: (product: Product) => void;
  onSelectProductForCustomization?: (product: Product) => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  product,
  productList = [],
  onClose,
  onAddToCartDirect,
  onSelectProductForCustomization,
}) => {
  const [currentProduct, setCurrentProduct] = useState<Product | null>(product);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    setCurrentProduct(product);
    setIsZoomed(false);
  }, [product]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentProduct) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && productList.length > 1) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && productList.length > 1) {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProduct, productList]);

  if (!currentProduct) return null;

  const currentIndex = productList.findIndex((p) => p.id === currentProduct.id);

  const handleNext = () => {
    if (productList.length === 0) return;
    const nextIndex = (currentIndex + 1) % productList.length;
    setCurrentProduct(productList[nextIndex]);
    setIsZoomed(false);
  };

  const handlePrev = () => {
    if (productList.length === 0) return;
    const prevIndex = (currentIndex - 1 + productList.length) % productList.length;
    setCurrentProduct(productList[prevIndex]);
    setIsZoomed(false);
  };

  const handleAddAction = () => {
    if (currentProduct.customizable && onSelectProductForCustomization) {
      onSelectProductForCustomization(currentProduct);
      onClose();
    } else if (onAddToCartDirect) {
      onAddToCartDirect(currentProduct);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md">
        {/* Close Backdrop Click */}
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={onClose}
          aria-label="Fechar ampliação"
        />

        {/* Top Control Bar */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          {/* Zoom Toggle */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border border-white/20"
            title={isZoomed ? 'Diminuir' : 'Ampliar mais'}
          >
            {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border border-white/20"
            title="Fechar (ESC)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Arrows */}
        {productList.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border border-white/20 hover:scale-110"
              title="Anterior (Seta Esquerda)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border border-white/20 hover:scale-110"
              title="Próximo (Seta Direita)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Lightbox Main Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 max-w-5xl w-full max-h-[90vh] bg-[#3D231D]/90 rounded-3xl overflow-hidden border border-white/15 shadow-2xl flex flex-col lg:flex-row"
        >
          {/* Image Viewport */}
          <div
            className={`relative flex-1 bg-black/40 flex items-center justify-center overflow-auto min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] transition-all ${
              isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img
              src={currentProduct.image}
              alt={currentProduct.name}
              className={`max-w-full max-h-[70vh] lg:max-h-[80vh] object-contain transition-transform duration-300 ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
              referrerPolicy="no-referrer"
            />

            {/* Badge Overlay */}
            {currentProduct.badge && (
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-extrabold text-[#E85D75] shadow-md">
                {currentProduct.badge}
              </div>
            )}

            {/* Counter if gallery */}
            {productList.length > 1 && (
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-2xs font-semibold text-white/90 border border-white/10">
                {currentIndex + 1} de {productList.length} bolos
              </div>
            )}
          </div>

          {/* Product Info Sidebar / Bottom Bar */}
          <div className="w-full lg:w-80 p-6 bg-[#2B1814] text-white flex flex-col justify-between space-y-4 border-t lg:border-t-0 lg:border-l border-white/10">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xs uppercase tracking-wider font-extrabold text-[#F4ACB7] bg-[#E85D75]/20 px-2.5 py-1 rounded-md border border-[#E85D75]/30">
                  {currentProduct.category === 'vulcao'
                    ? 'Bolo Vulcão 🌋'
                    : currentProduct.category === 'com_cobertura'
                    ? 'Com Cobertura 🍰'
                    : currentProduct.category === 'piscina'
                    ? 'Bolo de Piscina 🎂'
                    : 'Bolo Tradicional 🧁'}
                </span>

                <div className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{currentProduct.rating.toFixed(1)}</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-display text-white leading-snug">
                {currentProduct.name}
              </h2>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                {currentProduct.description}
              </p>

              {/* Price */}
              <div className="pt-2">
                <span className="text-2xs text-white/60 block uppercase tracking-wider font-semibold">
                  Preço
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#F4ACB7]">
                  R$ {currentProduct.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              {currentProduct.available === false ? (
                <button
                  disabled
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-white/10 text-white/50 border border-white/10 cursor-not-allowed text-center"
                >
                  Doce Indisponível no Momento 🔴
                </button>
              ) : (
                <button
                  onClick={handleAddAction}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                    currentProduct.customizable
                      ? 'bg-[#E85D75] hover:bg-[#D84B65] text-white'
                      : isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#E85D75] hover:bg-[#D84B65] text-white hover:scale-[1.02]'
                  }`}
                >
                  {currentProduct.customizable ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Personalizar este Bolo</span>
                    </>
                  ) : isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Adicionado ao Carrinho!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Adicionar ao Pedido</span>
                    </>
                  )}
                </button>
              )}

              <p className="text-2xs text-center text-white/50">
                Aperte <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white">ESC</kbd> para fechar a visualização
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
