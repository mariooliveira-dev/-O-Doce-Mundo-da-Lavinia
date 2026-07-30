import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Clock, Truck, CreditCard, Sparkles } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Com quanto tempo de antecedência devo fazer meu pedido?',
      a: 'Para Bentô Cakes, Cupcakes e caixinhas de docinhos recomendamos pedir com pelo menos 24 horas de antecedência. Para Bolos de Aniversário grandes e Kits Festa completos, recomendamos antecedência de 2 a 5 dias para garantir a vaga na agenda da Lavínia.'
    },
    {
      q: 'Como funciona a entrega das encomendas?',
      a: 'Você pode escolher entre retirar diretamente no nosso ateliê sem custo adicional ou optar pela nossa entrega programada na data e horário combinados. A taxa de entrega é calculada de acordo com o seu bairro.'
    },
    {
      q: 'Posso personalizar a frase e os desenhos do Bentô Cake?',
      a: 'Sim! Essa é a nossa especialidade. Na hora de fazer seu pedido aqui no site você digita exatamente a frase e cores que deseja no topo do bolo.'
    },
    {
      q: 'Quais são as formas de pagamento aceitas?',
      a: 'Aceitamos Pix (com 5% de desconto especial!), Cartão de Crédito/Débito e Dinheiro na entrega ou retirada.'
    },
    {
      q: 'Como devo conservar meu bolo ou docinhos até o momento da festa?',
      a: 'Recomendamos manter o bolo e cupcakes sob refrigeração na geladeira e retirar cerca de 20 a 30 minutos antes de servir para que a massa e o recheio fiquem com a consistência aveludada perfeita!'
    }
  ];

  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE5EC] text-[#E85D75] font-semibold text-xs uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" /> Dúvidas Frequentes
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#3D231D]">
            Perguntas & <span className="font-script text-4xl sm:text-5xl text-[#E85D75]">Respostas</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-[#FFF0F3] border border-[#F4ACB7]/40 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-[#3D231D] flex items-center justify-between gap-4 hover:text-[#E85D75] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#E85D75] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#5C3A21] leading-relaxed border-t border-[#FFE5EC]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
