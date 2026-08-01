import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { siteConfig } = useAdmin();

  const faqs = [
    {
      q: 'Como faço meu pedido?',
      a: 'É super prático! Escolha os bolos e doces desejados em nosso cardápio digital, selecione os sabores, recheios ou frases de personalização, e adicione ao carrinho. Ao finalizar, seu pedido será montado e enviado em mensagem direta para o nosso WhatsApp oficial para confirmação do pagamento e agendamento.'
    },
    {
      q: 'Qual o prazo para produção dos bolos?',
      a: 'Para Bentô Cakes, Cupcakes e caixinhas de docinhos recomendamos fazer a encomenda com pelo menos 24 horas de antecedência. Para Bolos Vulcão e Bolos de Aniversário mais elaborados, o prazo recomendado é de 2 a 4 dias úteis para garantir sua vaga em nossa agenda.'
    },
    {
      q: 'Vocês fazem bolos personalizados?',
      a: 'Sim! Os Bentô Cakes são nossa especialidade para personalização com frases engraçadas, memes ou mensagens carinhosas. Além disso, produzimos bolos temáticos com toppers personalizados e cores exclusivas de cobertura.'
    },
    {
      q: 'Quais formas de pagamento são aceitas?',
      a: 'Aceitamos Pix (com confirmação rápida), Cartões de Crédito e Débito, além de Dinheiro em espécie na entrega ou retirada no ateliê.'
    },
    {
      q: 'Vocês fazem entregas?',
      a: 'Sim! Oferecemos entrega agendada e segura em diversos bairros de Teixeira de Freitas. A taxa de entrega é informada e calculada conforme o seu endereço no momento do pedido.'
    },
    {
      q: 'Posso retirar no local?',
      a: 'Com certeza! Você pode optar por retirar sua encomenda gratuitamente direto em nosso ateliê, com dia e horário previamente agendados.'
    },
    {
      q: 'Como conservar os bolos?',
      a: 'Orientamos manter os bolos e doces sob refrigeração em geladeira. Para aproveitar a máxima cremosidade da massa e do recheio artesanal, retire do refrigerador cerca de 20 a 30 minutos antes de cortar e servir.'
    },
    {
      q: 'Vocês produzem bolos para aniversários e eventos?',
      a: 'Sim! Preparamos bolos especiais para aniversários, mesversários, chás de bebê, formaturas e kits festa completos com cupcakes e docinhos gourmet selecionados.'
    },
    {
      q: 'É possível encomendar com antecedência?',
      a: 'Sim, e é altamente recomendado! Encomendar com antecedência garante o seu horário reservado e evita o risco de ficarmos sem vagas na data do seu evento.'
    },
    {
      q: 'Como entro em contato pelo WhatsApp?',
      a: `Você pode clicar no botão flutuante de WhatsApp do site ou enviar uma mensagem direta para o número oficial ${siteConfig.phoneDisplay || '(73) 99952-7100'}. Estamos prontos para responder suas dúvidas e orçamentos!`
    }
  ];

  return (
    <section id="faq" className="py-20 bg-[#FFF5F7] relative border-t border-[#F4ACB7]/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center space-y-3 mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE5EC] text-[#E85D75] font-semibold text-xs uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" /> Dúvidas Frequentes
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#3D231D]">
            Perguntas & <span className="font-script text-4xl sm:text-5xl text-[#E85D75]">Respostas</span>
          </h2>
          <p className="text-sm text-[#5C3A21] max-w-xl mx-auto">
            Tudo o que você precisa saber para fazer sua encomenda de bolo ou doce artesanal na Lavínia!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="space-y-3.5"
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white border border-[#F4ACB7]/30 rounded-2xl overflow-hidden shadow-xs hover:border-[#F4ACB7] transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-[#3D231D] flex items-center justify-between gap-4 hover:text-[#E85D75] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#FFE5EC] text-[#E85D75] text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    {faq.q}
                  </span>
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
        </motion.div>

        {/* Call to WhatsApp support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
          className="mt-10 p-6 rounded-3xl bg-white border border-[#F4ACB7]/40 shadow-sm text-center flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="text-left space-y-1">
            <h4 className="font-bold text-sm text-[#3D231D]">Ainda tem alguma dúvida específica?</h4>
            <p className="text-xs text-[#5C3A21]">Fale diretamente com a Lavínia Aguiar pelo WhatsApp para orçamentos sob medida.</p>
          </div>
          <a
            href={`https://wa.me/${siteConfig.phoneRaw || '557399527100'}?text=Olá%20Lavínia!%20Tenho%20uma%20dúvida%20sobre%20as%20encomendas!`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-sm"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Falar no WhatsApp</span>
          </a>
        </motion.div>

      </div>
    </section>
  );
};
