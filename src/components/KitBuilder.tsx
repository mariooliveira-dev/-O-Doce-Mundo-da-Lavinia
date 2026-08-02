import React, { useState } from 'react';
import { CartItem, Product } from '../types';
import { X, Sparkles, Check, ChevronRight, ChevronLeft, ShoppingBag, Heart, MessageCircle } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface KitBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const KitBuilder: React.FC<KitBuilderProps> = ({
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const { siteConfig } = useAdmin();
  if (!isOpen) return null;

  const [step, setStep] = useState(1);

  // Selections
  const [selectedCake, setSelectedCake] = useState<{
    id: string;
    name: string;
    price: number;
    desc: string;
  }>({
    id: 'bento',
    name: 'Bentô Cake Personalizado (300g)',
    price: 45,
    desc: 'Bolo individual fofinho com frase divertida à sua escolha',
  });

  const [docinhosCount, setDocinhosCount] = useState<number>(50); // 25, 50, 100
  const [selectedDocinhosFlavors, setSelectedDocinhosFlavors] = useState<string[]>([
    'Brigadeiro Gourmet',
    'Ninho com Nutella',
  ]);

  const [cupcakesCount, setCupcakesCount] = useState<number>(4); // 0, 4, 6, 12
  const [customPhrase, setCustomPhrase] = useState('');
  const [extraNotes, setExtraNotes] = useState('');

  // Cake Options
  const cakeOptions = [
    {
      id: 'bento',
      name: 'Bentô Cake (300g)',
      price: 45,
      desc: 'Ideal para presentear ou comemorar datas especiais com frases fofas',
    },
    {
      id: 'vulcao-p',
      name: 'Bolo Vulcão (1.2kg)',
      price: 75,
      desc: 'Massa super macia com uma tempestade de calda cremosa',
    },
    {
      id: 'bolo-p',
      name: 'Bolo Decorado P (1.5kg - até 10 pessoas)',
      price: 110,
      desc: 'Bolo confeitado em Chantininho para aniversários',
    },
    {
      id: 'bolo-m',
      name: 'Bolo Decorado M (2.5kg - até 20 pessoas)',
      price: 170,
      desc: 'Tamanho perfeito para festas com família e amigos',
    },
  ];

  // Docinhos Flavors available
  const availableDocinhosFlavors = [
    'Brigadeiro Gourmet 50%',
    'Beijinho de Coco',
    'Bicho de Pé (Morango)',
    'Ninho com Nutella',
    'Surpresa de Uva',
    'Camafeu de Nozes',
  ];

  // Docinhos prices based on count
  const docinhosPrices: Record<number, number> = {
    25: 35,
    50: 68,
    100: 125,
  };

  // Cupcakes prices
  const cupcakesPrices: Record<number, number> = {
    0: 0,
    4: 38,
    6: 55,
    12: 100,
  };

  const totalPrice =
    selectedCake.price +
    (docinhosPrices[docinhosCount] || 0) +
    (cupcakesPrices[cupcakesCount] || 0);

  const toggleDocinhoFlavor = (flavor: string) => {
    if (selectedDocinhosFlavors.includes(flavor)) {
      if (selectedDocinhosFlavors.length > 1) {
        setSelectedDocinhosFlavors(selectedDocinhosFlavors.filter((f) => f !== flavor));
      }
    } else {
      if (selectedDocinhosFlavors.length < 4) {
        setSelectedDocinhosFlavors([...selectedDocinhosFlavors, flavor]);
      }
    }
  };

  const handleFinishKit = () => {
    const kitProduct: Product = {
      id: `custom-kit-${Date.now()}`,
      name: `Kit Festa Personalizado da Lavínia`,
      category: 'vulcao',
      description: `${selectedCake.name} + ${docinhosCount} Docinhos + ${cupcakesCount} Cupcakes`,
      price: totalPrice,
      image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
      badge: 'Kit Exclusivo ✨',
      rating: 5.0,
      reviewCount: 1,
    };

    const cartItem: CartItem = {
      id: `kit-item-${Date.now()}`,
      product: kitProduct,
      quantity: 1,
      selectedSize: selectedCake.name,
      selectedFlavor: `Docinhos: ${selectedDocinhosFlavors.join(', ')}`,
      customInscription: customPhrase.trim() || undefined,
      extraNotes: extraNotes.trim() || undefined,
      totalPrice: totalPrice,
    };

    onAddToCart(cartItem);
    onClose();
  };

  const handleDirectWhatsAppKit = () => {
    let msg = `Olá ${siteConfig.founderName?.split(' ')[0] || 'Lavínia'}! Montei um *Kit Festa Personalizado* no seu site e gostaria de encomendar:\n\n`;
    msg += `🎂 *Bolo Escolhido:* ${selectedCake.name}\n`;
    msg += `🍬 *Docinhos (${docinhosCount} un):* ${selectedDocinhosFlavors.join(', ')}\n`;
    if (cupcakesCount > 0) {
      msg += `🧁 *Cupcakes:* ${cupcakesCount} unidades\n`;
    }
    if (customPhrase) {
      msg += `✍️ *Frase do Bolo:* "${customPhrase}"\n`;
    }
    if (extraNotes) {
      msg += `📝 *Observações:* ${extraNotes}\n`;
    }
    msg += `\n✨ *VALOR TOTAL DO KIT:* R$ ${totalPrice.toFixed(2).replace('.', ',')}\n`;
    msg += `\nComo podemos combinar a data e a entrega?`;

    const encoded = encodeURIComponent(msg);
    const phone = siteConfig.phoneRaw || '557399527100';
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-[#F4ACB7] shadow-2xl relative flex flex-col justify-between">
        
        {/* Header */}
        <div className="p-6 bg-[#FFE5EC] border-b border-[#F4ACB7]/40 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl text-[#E85D75] shadow-xs">
              🎈
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-[#3D231D]">
                Monte seu Kit Festa
              </h3>
              <p className="text-2xs text-[#E85D75] font-semibold">
                Etapa {step} de 4 • {step === 1 ? 'Escolha o Bolo' : step === 2 ? 'Docinhos de Festa' : step === 3 ? 'Cupcakes' : 'Personalização'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-[#FFF0F3] text-[#3D231D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Bar */}
        <div className="px-6 py-3 bg-[#FFF0F3] border-b border-[#FFE5EC] flex items-center justify-between gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${
                s <= step ? 'bg-[#E85D75]' : 'bg-[#FFE5EC]'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* Step 1: Cake Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-display font-bold text-lg text-[#3D231D] flex items-center gap-2">
                <span>🎂</span> 1. Escolha o Bolo Principal:
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {cakeOptions.map((cake) => (
                  <button
                    key={cake.id}
                    type="button"
                    onClick={() => setSelectedCake(cake)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-4 ${
                      selectedCake.id === cake.id
                        ? 'bg-[#FFE5EC] border-[#E85D75] shadow-md ring-2 ring-[#E85D75]/20'
                        : 'bg-white border-[#FFE5EC] hover:bg-[#FFF0F3]'
                    }`}
                  >
                    <div>
                      <h5 className="font-bold text-sm text-[#3D231D]">{cake.name}</h5>
                      <p className="text-xs text-[#5C3A21] mt-0.5">{cake.desc}</p>
                    </div>
                    <span className="font-bold text-sm text-[#E85D75] whitespace-nowrap bg-white px-3 py-1 rounded-full border border-[#F4ACB7]/40">
                      R$ {cake.price.toFixed(2).replace('.', ',')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Docinhos */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="font-display font-bold text-lg text-[#3D231D] flex items-center gap-2">
                  <span>🍬</span> 2. Quantidade de Docinhos:
                </h4>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {[25, 50, 100].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setDocinhosCount(count)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        docinhosCount === count
                          ? 'bg-[#E85D75] text-white font-bold border-[#E85D75] shadow-md'
                          : 'bg-white text-[#3D231D] border-[#FFE5EC] hover:bg-[#FFF0F3]'
                      }`}
                    >
                      <span className="block text-base">{count} Unidades</span>
                      <span className="text-xs opacity-90 font-medium">
                        + R$ {docinhosPrices[count]},00
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3D231D] uppercase tracking-wider mb-2">
                  Escolha os Sabores (Até 4):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableDocinhosFlavors.map((flavor) => {
                    const isSelected = selectedDocinhosFlavors.includes(flavor);
                    return (
                      <button
                        key={flavor}
                        type="button"
                        onClick={() => toggleDocinhoFlavor(flavor)}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-[#FFE5EC] border-[#E85D75] text-[#E85D75]'
                            : 'bg-white border-[#FFE5EC] text-[#5C3A21] hover:bg-[#FFF0F3]'
                        }`}
                      >
                        <span>{flavor}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#E85D75]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Cupcakes */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-display font-bold text-lg text-[#3D231D] flex items-center gap-2">
                <span>🧁</span> 3. Adicionar Cupcakes Gourmet:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[0, 4, 6, 12].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setCupcakesCount(count)}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      cupcakesCount === count
                        ? 'bg-[#E85D75] text-white font-bold border-[#E85D75] shadow-md'
                        : 'bg-white text-[#3D231D] border-[#FFE5EC] hover:bg-[#FFF0F3]'
                    }`}
                  >
                    <span className="block text-sm">
                      {count === 0 ? 'Sem Cupcakes' : `${count} Cupcakes`}
                    </span>
                    <span className="text-xs opacity-90">
                      {count === 0 ? 'R$ 0,00' : `+ R$ ${cupcakesPrices[count]},00`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Personalization & Summary */}
          {step === 4 && (
            <div className="space-y-4">
              <h4 className="font-display font-bold text-lg text-[#3D231D] flex items-center gap-2">
                <span>✨</span> 4. Personalização do seu Kit:
              </h4>

              {selectedCake.id === 'bento' && (
                <div>
                  <label className="block text-xs font-bold text-[#3D231D] uppercase tracking-wider mb-1">
                    Frase para o Bentô Cake:
                  </label>
                  <input
                    type="text"
                    value={customPhrase}
                    onChange={(e) => setCustomPhrase(e.target.value)}
                    placeholder="Ex: 'Com amor da mamãe e do papai ❤️'"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#F4ACB7] text-sm text-[#3D231D] focus:ring-2 focus:ring-[#E85D75]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#3D231D] uppercase tracking-wider mb-1">
                  Detalhes adicionais do tema ou cores:
                </label>
                <textarea
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                  placeholder="Ex: 'Tema rosa pastel', 'Com laço rosa no topo'..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#FFE5EC] bg-[#FFF0F3] text-xs text-[#3D231D]"
                />
              </div>

              {/* Kit Summary Box */}
              <div className="p-4 rounded-2xl bg-[#FFE5EC] border border-[#F4ACB7]/50 space-y-2">
                <h5 className="font-bold text-xs uppercase text-[#E85D75] tracking-wider">
                  Resumo do seu Combo
                </h5>
                <ul className="text-xs text-[#3D231D] space-y-1">
                  <li>• {selectedCake.name}</li>
                  <li>• {docinhosCount} Docinhos ({selectedDocinhosFlavors.join(', ')})</li>
                  {cupcakesCount > 0 && <li>• {cupcakesCount} Cupcakes Gourmet</li>}
                  {customPhrase && <li>• Frase: "{customPhrase}"</li>}
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions & Price Bar */}
        <div className="p-6 bg-[#FFF0F3] border-t border-[#FFE5EC] sticky bottom-0 z-10 flex items-center justify-between gap-4">
          <div>
            <span className="text-2xs text-[#5C3A21] block">Total do Kit</span>
            <span className="font-display font-bold text-2xl text-[#3D231D]">
              R$ {totalPrice.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-3 rounded-full bg-white hover:bg-[#FFE5EC] text-[#3D231D] font-bold text-xs border border-[#F4ACB7]/40"
              >
                Voltar
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-3 rounded-full bg-[#E85D75] hover:bg-[#D84B65] text-white font-bold text-xs shadow-md flex items-center gap-1"
              >
                <span>Próximo Passo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleFinishKit}
                  className="px-6 py-3.5 rounded-full bg-[#E85D75] hover:bg-[#D84B65] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Adicionar Kit ao Carrinho</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
