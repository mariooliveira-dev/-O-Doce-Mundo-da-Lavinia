import React from 'react';
import { LogoBadge } from './LogoBadge';
import { Instagram, MessageCircle, Heart, MapPin, Clock, Phone, Sparkles, Lock } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const Footer: React.FC = () => {
  const { siteConfig, openAdminModal, isLoggedIn } = useAdmin();

  const whatsappUrl = `https://wa.me/${siteConfig.phoneRaw || '557399527100'}?text=Olá%20Lavínia!%20Gostaria%20de%20fazer%20um%20orçamento%20de%20bolo!`;

  return (
    <footer id="contato" className="bg-[#3D231D] text-[#FFE5EC] pt-16 pb-8 relative overflow-hidden">
      {/* Background soft dots */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              {siteConfig.logoUrl ? (
                <img
                  src={siteConfig.logoUrl}
                  alt="Logo Doce Mundo da Lavínia"
                  className="w-12 h-12 rounded-full object-contain bg-white p-1 border border-[#FFCAD4]"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#FFE5EC] flex items-center justify-center text-2xl">
                  🧁
                </div>
              )}
              <div>
                <h3 className="font-script text-3xl text-[#FFCAD4] font-bold leading-none">
                  O Doce Mundo
                </h3>
                <p className="font-display text-xs tracking-widest text-white/80 uppercase font-semibold">
                  DA {siteConfig.founderName?.split(' ')[0] || 'LAVÍNIA'}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/70 max-w-sm leading-relaxed">
              "{siteConfig.logoSlogan || 'Feito com amor, para adoçar o seu dia!'}" Confeitaria artesanal por {siteConfig.founderName || 'Lavínia Aguiar'}. Bolos gourmet, Bentô Cakes personalizados, cupcakes e docinhos para tornar seus momentos inesquecíveis.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com/odocemundodalavinia"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-white/10 hover:bg-[#E85D75] text-white transition-colors"
                title="Instagram @odocemundodalavinia"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-[#25D366] text-white hover:bg-[#20ba5a] transition-colors"
                title="WhatsApp Direct"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-display font-bold text-white text-base">
              Nossas Delícias
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li><a href="#cardapio" className="hover:text-[#FFCAD4] transition-colors">• Bentô Cakes Personalizados</a></li>
              <li><a href="#cardapio" className="hover:text-[#FFCAD4] transition-colors">• Bolos Vulcão & Aniversário</a></li>
              <li><a href="#cardapio" className="hover:text-[#FFCAD4] transition-colors">• Cupcakes Gourmet</a></li>
              <li><a href="#cardapio" className="hover:text-[#FFCAD4] transition-colors">• Docinhos de Festa Especiais</a></li>
              <li><a href="#cardapio" className="hover:text-[#FFCAD4] transition-colors">• Copos da Felicidade</a></li>
            </ul>
          </div>

          {/* Operating Hours & Address */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-display font-bold text-white text-base">
              Atendimento & Encomendas
            </h4>
            
            <div className="space-y-2 text-xs text-white/70">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#FFCAD4] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Horário de Atendimento:</p>
                  <p>Terça a Sábado: 09h às 18h</p>
                  <p>Domingo: 09h às 13h</p>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 text-[#FFCAD4] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Ateliê de Encomendas:</p>
                  <p>Retirada local com agendamento & Entrega em domicílio sob consulta de bairro.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <Phone className="w-4 h-4 text-[#FFCAD4] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">WhatsApp Oficial:</p>
                  <p className="text-[#25D366] font-bold">{siteConfig.phoneDisplay}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-2xs text-white/50">
          <p>© {new Date().getFullYear()} O Doce Mundo da Lavínia. Todos os direitos reservados.</p>
          
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1">
              Feito com <Heart className="w-3 h-3 text-[#E85D75] fill-[#E85D75]" /> para adoçar seu dia por {siteConfig.founderName || 'Lavínia Aguiar'}
            </p>

            <button
              onClick={openAdminModal}
              className="text-white/40 hover:text-[#FFCAD4] transition-colors flex items-center gap-1 font-semibold"
              title="Acesso Restrito para Lavínia"
            >
              <Lock className="w-3 h-3" />
              <span>{isLoggedIn ? 'Painel ADM (Ativo)' : 'Área do Confeiteiro'}</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

