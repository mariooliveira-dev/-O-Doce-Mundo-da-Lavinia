import React, { useState } from 'react';
import { CartItem, CustomerDetails } from '../types';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageCircle, Calendar, MapPin, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const { siteConfig } = useAdmin();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details'>('cart');
  
  // Customer Checkout Details
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: '',
    phone: '',
    deliveryType: 'retirada',
    address: '',
    neighborhood: '',
    deliveryDate: '',
    deliveryTime: '14:00',
    paymentMethod: 'pix',
    notes: '',
  });

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const discount = customer.paymentMethod === 'pix' ? subtotal * 0.05 : 0;
  const deliveryFee = customer.deliveryType === 'entrega' ? 12.00 : 0;
  const finalTotal = subtotal - discount + deliveryFee;

  const handleSendWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || !customer.deliveryDate) {
      alert('Por favor preencha Nome, WhatsApp e Data do Evento!');
      return;
    }

    // Format WhatsApp message
    let message = `Olá ${siteConfig.founderName?.split(' ')[0] || 'Lavínia'}! Entrei no site *O Doce Mundo da Lavínia* e gostaria de encomendar os seguintes produtos:\n\n`;
    
    message += `👤 *Nome:* ${customer.name}\n`;
    message += `📱 *Meu WhatsApp:* ${customer.phone}\n`;
    message += `📅 *Data do Evento:* ${customer.deliveryDate} às ${customer.deliveryTime}\n`;
    message += `🚚 *Opção de Entrega:* ${customer.deliveryType === 'retirada' ? 'Retirada no Ateliê' : 'Entrega em Domicílio'}\n`;
    if (customer.deliveryType === 'entrega' && customer.address) {
      message += `📍 *Endereço:* ${customer.address} - ${customer.neighborhood || ''}\n`;
    }
    message += `\n📦 *ITENS QUE ESCOLHI NO SITE:*\n`;

    cartItems.forEach((item, index) => {
      message += `${index + 1}. *${item.quantity}x ${item.product.name}* - R$ ${item.totalPrice.toFixed(2).replace('.', ',')}\n`;
      if (item.selectedSize) message += `   • Tamanho: ${item.selectedSize}\n`;
      if (item.selectedFlavor) message += `   • Sabor: ${item.selectedFlavor}\n`;
      if (item.selectedFilling) message += `   • Recheio: ${item.selectedFilling}\n`;
      if (item.customInscription) message += `   • ✍️ Escrita: "${item.customInscription}"\n`;
      if (item.extraNotes) message += `   • Obs: ${item.extraNotes}\n`;
    });

    message += `\n💳 *Forma de Pagamento Pretendida:* ${customer.paymentMethod.toUpperCase()} ${customer.paymentMethod === 'pix' ? '(Com 5% OFF)' : ''}\n`;
    message += `💰 *Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    if (discount > 0) message += `🏷️ *Desconto Pix (5%):* -R$ ${discount.toFixed(2).replace('.', ',')}\n`;
    if (deliveryFee > 0) message += `🚚 *Taxa Entrega:* R$ ${deliveryFee.toFixed(2).replace('.', ',')}\n`;
    message += `✨ *VALOR ESTIMADO:* R$ ${finalTotal.toFixed(2).replace('.', ',')}\n`;

    if (customer.notes) {
      message += `\n📝 *Observações:* ${customer.notes}\n`;
    }

    message += `\n----------------------------------------\n_Estou enviando esta mensagem do site para combinar os detalhes com você!_`;

    const encoded = encodeURIComponent(message);
    const phoneRaw = siteConfig.phoneRaw || '557399527100';
    const whatsappUrl = `https://wa.me/${phoneRaw}?text=${encoded}`;
    
    window.open(whatsappUrl, '_blank');
    onClearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#F4ACB7] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 bg-[#FFE5EC] border-b border-[#F4ACB7]/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#E85D75]" />
              <h3 className="font-display font-bold text-lg text-[#3D231D]">
                {checkoutStep === 'cart' ? 'Seu Carrinho de Doces' : 'Dados da Encomenda'}
              </h3>
              <span className="text-2xs font-bold bg-[#E85D75] text-white px-2 py-0.5 rounded-full">
                {cartItems.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white text-[#3D231D]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {checkoutStep === 'cart' ? (
              cartItems.length > 0 ? (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-[#FFF0F3] border border-[#FFE5EC] flex gap-3 relative group"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 space-y-1 pr-6">
                        <h4 className="font-bold text-xs text-[#3D231D] leading-tight">
                          {item.product.name}
                        </h4>
                        
                        {item.selectedFlavor && (
                          <p className="text-2xs text-[#5C3A21]">Sabor: {item.selectedFlavor}</p>
                        )}
                        {item.customInscription && (
                          <p className="text-2xs text-[#E85D75] font-semibold">
                            ✍️ "{item.customInscription}"
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-full border border-[#F4ACB7]/30 text-xs">
                            <button
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="font-bold text-[#3D231D] hover:text-[#E85D75]"
                            >
                              -
                            </button>
                            <span className="font-bold">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="font-bold text-[#3D231D] hover:text-[#E85D75]"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-bold text-xs text-[#3D231D]">
                            R$ {item.totalPrice.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 space-y-3">
                  <span className="text-5xl">🧁</span>
                  <p className="font-display font-bold text-[#3D231D]">
                    Seu carrinho está vazio
                  </p>
                  <p className="text-xs text-[#5C3A21]">
                    Adicione deliciosos bolos, cupcakes ou docinhos ao seu pedido!
                  </p>
                </div>
              )
            ) : (
              /* Checkout Details Form */
              <form id="checkout-form" onSubmit={handleSendWhatsAppOrder} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-[#3D231D] uppercase mb-1">
                    Seu Nome Completo:
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="Ex: Mariana Silva"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#F4ACB7] text-xs focus:ring-2 focus:ring-[#E85D75]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3D231D] uppercase mb-1">
                    WhatsApp para contato:
                  </label>
                  <input
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="Ex: (73) 9952-7100"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#F4ACB7] text-xs focus:ring-2 focus:ring-[#E85D75]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#3D231D] uppercase mb-1">
                      Data do Evento:
                    </label>
                    <input
                      type="date"
                      required
                      value={customer.deliveryDate}
                      onChange={(e) => setCustomer({ ...customer, deliveryDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#F4ACB7] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#3D231D] uppercase mb-1">
                      Horário:
                    </label>
                    <input
                      type="time"
                      required
                      value={customer.deliveryTime}
                      onChange={(e) => setCustomer({ ...customer, deliveryTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#F4ACB7] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3D231D] uppercase mb-1">
                    Opção de Entrega:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomer({ ...customer, deliveryType: 'retirada' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold ${
                        customer.deliveryType === 'retirada'
                          ? 'bg-[#E85D75] text-white border-[#E85D75]'
                          : 'bg-white text-[#3D231D] border-[#FFE5EC]'
                      }`}
                    >
                      Retirada no Ateliê
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomer({ ...customer, deliveryType: 'entrega' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold ${
                        customer.deliveryType === 'entrega'
                          ? 'bg-[#E85D75] text-white border-[#E85D75]'
                          : 'bg-white text-[#3D231D] border-[#FFE5EC]'
                      }`}
                    >
                      Entrega (Taxa R$ 12)
                    </button>
                  </div>
                </div>

                {customer.deliveryType === 'entrega' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      placeholder="Endereço de Entrega (Rua, Número, Apto)"
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#F4ACB7] text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Bairro"
                      value={customer.neighborhood}
                      onChange={(e) => setCustomer({ ...customer, neighborhood: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#F4ACB7] text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#3D231D] uppercase mb-1">
                    Forma de Pagamento:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'pix', label: 'Pix 5% OFF' },
                      { id: 'cartao', label: 'Cartão' },
                      { id: 'dinheiro', label: 'Dinheiro' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() =>
                          setCustomer({
                            ...customer,
                            paymentMethod: m.id as 'pix' | 'cartao' | 'dinheiro',
                          })
                        }
                        className={`p-2 rounded-xl border text-2xs font-bold ${
                          customer.paymentMethod === m.id
                            ? 'bg-[#FFE5EC] text-[#E85D75] border-[#E85D75]'
                            : 'bg-white text-[#3D231D] border-[#FFE5EC]'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

              </form>
            )}
          </div>

          {/* Footer Subtotal & Action */}
          {cartItems.length > 0 && (
            <div className="p-5 bg-[#FFF0F3] border-t border-[#FFE5EC] space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[#5C3A21]">
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#2E7D32] font-semibold">
                    <span>Desconto Pix (5%):</span>
                    <span>-R$ {discount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-[#5C3A21]">
                    <span>Taxa de Entrega:</span>
                    <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base text-[#3D231D] pt-1 border-t border-[#FFE5EC]">
                  <span>Total Final:</span>
                  <span className="text-[#E85D75]">
                    R$ {finalTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {checkoutStep === 'cart' ? (
                <button
                  onClick={() => setCheckoutStep('details')}
                  className="w-full py-3.5 rounded-full bg-[#E85D75] hover:bg-[#D84B65] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Avançar para Dados da Encomenda</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="px-4 py-3 rounded-full bg-white text-[#3D231D] font-bold text-xs border border-[#F4ACB7]/40"
                  >
                    Voltar
                  </button>
                  <button
                    form="checkout-form"
                    type="submit"
                    className="flex-1 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Enviar Pedido para WhatsApp</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
