import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCategory, Product, CartItem } from '../types';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';
import { Search, Cake, X } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface MenuSectionProps {
  onAddToCart: (item: CartItem) => void;
  onOpenKitBuilder?: () => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  onAddToCart,
}) => {
  const { products } = useAdmin();
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  const categories: { id: ProductCategory; label: string; icon: string }[] = [
    { id: 'todos', label: 'Todos os Bolos', icon: '🥮' },
    { id: 'caseirinhos', label: 'Caseirinhos Clássicos', icon: '🍰' },
    { id: 'vulcao', label: 'Bolos Vulcão', icon: '🌋' },
    { id: 'fofinhos', label: 'Bolos Fofinhos', icon: '✨' },
    { id: 'mini_caseiros', label: 'Mini Caseirinhos', icon: '🧁' },
  ];

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === 'todos' || product.category === activeCategory;
      if (!query) return matchesCategory;

      const nameMatch = product.name.toLowerCase().includes(query);
      const descMatch = product.description.toLowerCase().includes(query);
      const tagsMatch = product.tags?.some((t) => t.toLowerCase().includes(query));
      const toppingsMatch = product.toppings?.some((top) =>
        top.name.toLowerCase().includes(query)
      );

      return matchesCategory && (nameMatch || descMatch || tagsMatch || toppingsMatch);
    });
  }, [products, activeCategory, searchQuery]);

  const handleAddToCartDirect = (product: Product) => {
    const item: CartItem = {
      id: `${product.id}-${Date.now()}`,
      product,
      quantity: 1,
      totalPrice: product.price,
    };
    onAddToCart(item);
  };

  return (
    <section id="cardapio" className="py-20 bg-[#FFF5F7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFE5EC] text-[#E85D75] font-semibold text-xs uppercase tracking-wider">
            <Cake className="w-3.5 h-3.5" /> Bolos Caseirinhos • Sabor que Lembra Casa
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3D231D]">
            Nosso Cardápio de <span className="font-script text-4xl sm:text-5xl lg:text-6xl text-[#E85D75]">Bolos Caseiros</span>
          </h2>
          <p className="text-base text-[#5C3A21] font-medium">
            Massas fofinhas, quentinhas e coberturas super generosas preparadas artesanalmente todos os dias!
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-6 mb-12">
          
          {/* Search Bar Container */}
          <div className="max-w-lg mx-auto space-y-3">
            <div className="relative group">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#E85D75] transition-transform group-focus-within:scale-110" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar bolo ou doce (ex: Cenoura, Ninho, Vulcão, Chocolate)..."
                className="w-full pl-12 pr-12 py-3.5 rounded-full bg-white border border-[#F4ACB7]/60 text-sm font-medium text-[#3D231D] placeholder-[#5C3A21]/50 focus:outline-none focus:ring-2 focus:ring-[#E85D75] focus:border-transparent shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#FFE5EC] text-[#E85D75] hover:bg-[#E85D75] hover:text-white active:scale-95 transition-all cursor-pointer shadow-2xs"
                  title="Limpar busca"
                  aria-label="Limpar busca"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Quick Search Chips & Search Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[#5C3A21] font-semibold">Mais buscados:</span>
                {['Cenoura', 'Ninho', 'Vulcão', 'Chocolate'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSearchQuery(term)}
                    className={`px-2.5 py-1 rounded-full text-2xs font-bold transition-all ${
                      searchQuery.toLowerCase() === term.toLowerCase()
                        ? 'bg-[#E85D75] text-white shadow-2xs'
                        : 'bg-white hover:bg-[#FFE5EC] text-[#E85D75] border border-[#F4ACB7]/40'
                    }`}
                  >
                    {term}
                  </button>
                ))}
              </div>

              {searchQuery.trim() && (
                <span className="text-[#E85D75] font-bold">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'bolo encontrado' : 'bolos encontrados'}
                </span>
              )}
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none px-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-[#E85D75] text-white shadow-md scale-105'
                    : 'bg-white hover:bg-[#FFE5EC] text-[#3D231D] border border-[#F4ACB7]/40 shadow-2xs'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

        </div>

        {/* Products Grid */}
        <AnimatePresence mode="popLayout">
          {filteredProducts.length > 0 ? (
            <motion.div
              key={activeCategory + searchQuery}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  exit={{ opacity: 0, y: -15, scale: 0.95 }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min(index * 0.05, 0.35),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <ProductCard
                    product={product}
                    onSelectProduct={(p) => setSelectedProductForModal(p)}
                    onAddToCartDirect={handleAddToCartDirect}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-16 bg-white rounded-3xl border border-[#F4ACB7]/30 p-8 space-y-3"
            >
              <span className="text-4xl">🥮</span>
              <h3 className="font-display font-bold text-xl text-[#3D231D]">
                Nenhum bolo encontrado
              </h3>
              <p className="text-sm text-[#5C3A21]">
                Tente buscar com outros termos ou escolha outra categoria de bolos.
              </p>
              <button
                onClick={() => {
                  setActiveCategory('todos');
                  setSearchQuery('');
                }}
                className="mt-2 px-5 py-2 rounded-full bg-[#FFE5EC] text-[#E85D75] font-bold text-xs hover:bg-[#E85D75] hover:text-white transition-colors"
              >
                Ver todos os bolos
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Product Customization Modal */}
      <ProductModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        onAddToCart={onAddToCart}
      />
    </section>
  );
};

