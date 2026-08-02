import React, { useState } from 'react';
import { Star, MessageSquare, Send, CheckCircle2, MessageCircle, Sparkles, Heart, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface RealTestimonial {
  id: string;
  name: string;
  rating: number;
  productOrdered?: string;
  comment: string;
  createdAt: string;
  likes?: number;
}

export const Testimonials: React.FC = () => {
  const { siteConfig, products } = useAdmin();
  const [testimonials, setTestimonials] = useLocalStorage<RealTestimonial[]>(
    'docemundo_real_testimonials_v1',
    []
  );

  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [productOrdered, setProductOrdered] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [likedMap, setLikedMap] = useLocalStorage<Record<string, boolean>>(
    'docemundo_testimonial_likes_v1',
    {}
  );

  const founderFirstName = siteConfig.founderName?.split(' ')[0] || 'Lavínia';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    const newTestimonial: RealTestimonial = {
      id: Date.now().toString(),
      name: name.trim(),
      rating,
      productOrdered: productOrdered.trim() || undefined,
      comment: comment.trim(),
      createdAt: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      likes: 0,
    };

    setTestimonials([newTestimonial, ...testimonials]);
    setIsSubmitted(true);
    setName('');
    setComment('');
    setProductOrdered('');
    setRating(5);

    setTimeout(() => {
      setIsSubmitted(false);
      setActiveTab('view');
    }, 2500);
  };

  const handleLike = (id: string) => {
    if (likedMap[id]) return;

    setLikedMap({ ...likedMap, [id]: true });
    setTestimonials(
      testimonials.map((item) =>
        item.id === id ? { ...item, likes: (item.likes || 0) + 1 } : item
      )
    );
  };

  const averageRating =
    testimonials.length > 0
      ? (
          testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length
        ).toFixed(1)
      : '5.0';

  return (
    <section id="depoimentos" className="py-20 bg-gradient-to-b from-[#FFF5F7] via-[#FFE5EC]/30 to-[#FFF5F7] relative overflow-hidden">
      {/* Elementos Decorativos */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#E85D75]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#F4ACB7]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-[#FFE5EC] border border-[#E85D75]/30 px-4 py-1.5 rounded-full text-[#E85D75] text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Espaço dos Clientes</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#3D231D] tracking-tight mb-4"
          >
            Depoimentos <span className="text-[#E85D75] font-serif italic">Reais</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-[#3D231D]/80 leading-relaxed"
          >
            Aba exclusiva para os clientes falarem! Deixe sua avaliação real sobre nossos bolos artesanais e ajude a confeiteira {founderFirstName} a crescer cada vez mais.
          </motion.p>

          {/* Banner de Média de Avaliações */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-[#FFE5EC] shadow-sm"
          >
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-extrabold text-[#3D231D] text-base">{averageRating} / 5.0</span>
            <span className="text-xs sm:text-sm text-[#3D231D]/70 border-l border-[#FFE5EC] pl-3">
              <strong className="text-[#E85D75]">{testimonials.length}</strong> {testimonials.length === 1 ? 'avaliação publicada' : 'avaliações publicadas'}
            </span>
          </motion.div>
        </div>

        {/* Abas para alternar entre ver depoimentos e publicar novo */}
        <div className="flex justify-center mb-10">
          <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-[#FFE5EC] shadow-sm flex items-center gap-1">
            <button
              onClick={() => setActiveTab('view')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'view'
                  ? 'bg-[#E85D75] text-white shadow-md'
                  : 'text-[#3D231D]/70 hover:text-[#E85D75] hover:bg-[#FFF5F7]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Avaliações dos Clientes ({testimonials.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-[#E85D75] text-white shadow-md'
                  : 'text-[#3D231D]/70 hover:text-[#E85D75] hover:bg-[#FFF5F7]'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Deixar meu Depoimento</span>
            </button>
          </div>
        </div>

        {/* Conteúdo da Aba */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'add' ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[#FFE5EC]"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-extrabold text-[#3D231D] mb-2">
                    Sua Opinião é Muito Importante! 💖
                  </h3>
                  <p className="text-sm text-[#3D231D]/70">
                    Escreva como foi sua experiência com nossos bolos. Sua mensagem será publicada em tempo real para todos no site.
                  </p>
                </div>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 bg-[#EBFEEB] border border-[#A2F0A2] rounded-2xl text-center space-y-3"
                  >
                    <div className="w-16 h-16 bg-[#22C55E] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-[#166534]">
                      Depoimento Publicado com Sucesso!
                    </h4>
                    <p className="text-sm text-[#15803D]">
                      Muito obrigado por compartilhar seu carinho! Sua avaliação já está visível para todos os clientes no site.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nota (Estrelas) */}
                    <div>
                      <label className="block text-sm font-bold text-[#3D231D] mb-2">
                        Sua Nota do Bolo:
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                (hoverRating || rating) >= star
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 font-bold text-[#E85D75] text-sm">
                          {rating} de 5 estrelas
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Nome do Cliente */}
                      <div>
                        <label className="block text-sm font-bold text-[#3D231D] mb-2">
                          Seu Nome ou Apelido *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: Maria Clara, João Pedro..."
                          className="w-full px-4 py-3 rounded-xl border border-[#FFE5EC] focus:border-[#E85D75] focus:ring-2 focus:ring-[#E85D75]/20 text-sm outline-none transition-all"
                        />
                      </div>

                      {/* Bolo Comprado */}
                      <div>
                        <label className="block text-sm font-bold text-[#3D231D] mb-2">
                          Qual bolo você pediu? (Opcional)
                        </label>
                        <select
                          value={productOrdered}
                          onChange={(e) => setProductOrdered(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-[#FFE5EC] focus:border-[#E85D75] focus:ring-2 focus:ring-[#E85D75]/20 text-sm outline-none transition-all bg-white"
                        >
                          <option value="">Selecione o bolo...</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                          <option value="Outro Sabores">Outros Sabores / Encomenda Especial</option>
                        </select>
                      </div>
                    </div>

                    {/* Comentário */}
                    <div>
                      <label className="block text-sm font-bold text-[#3D231D] mb-2">
                        Seu Comentário / Avaliação *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Conte como estava o sabor, a entrega, a embalagem..."
                        className="w-full px-4 py-3 rounded-xl border border-[#FFE5EC] focus:border-[#E85D75] focus:ring-2 focus:ring-[#E85D75]/20 text-sm outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Botão de Envio */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-8 py-3.5 bg-[#E85D75] hover:bg-[#D84B65] text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Publicar Depoimento</span>
                      </button>

                      <a
                        href={`https://wa.me/${siteConfig.phoneRaw || '5585999999999'}?text=${encodeURIComponent('Olá Lavínia! Gostaria de enviar meu depoimento pelo WhatsApp!')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Enviar pelo WhatsApp</span>
                      </a>
                    </div>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                {testimonials.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-[#FFE5EC] shadow-md space-y-4">
                    <div className="w-20 h-20 bg-[#FFE5EC] text-[#E85D75] rounded-full flex items-center justify-center mx-auto">
                      <Heart className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-[#3D231D]">
                      Ainda não há depoimentos publicados!
                    </h3>
                    <p className="text-sm text-[#3D231D]/70 max-w-md mx-auto">
                      Seja o primeiro cliente real a compartilhar seu carinho e avaliação sobre nossos bolos artesanais.
                    </p>
                    <button
                      onClick={() => setActiveTab('add')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#E85D75] hover:bg-[#D84B65] text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Escrever a Primeira Avaliação</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {testimonials.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 border border-[#FFE5EC] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Cabeçalho do Card */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#FFE5EC] text-[#E85D75] flex items-center justify-center font-bold text-base shadow-xs">
                                {item.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-bold text-[#3D231D] text-sm sm:text-base leading-tight">
                                  {item.name}
                                </h4>
                                <span className="text-2xs text-[#3D231D]/50">
                                  {item.createdAt}
                                </span>
                              </div>
                            </div>

                            {/* Estrelas */}
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[...Array(item.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>

                          {/* Bolo pedido */}
                          {item.productOrdered && (
                            <span className="inline-block bg-[#FFF5F7] text-[#E85D75] border border-[#FFE5EC] font-bold text-2xs px-2.5 py-0.5 rounded-md mb-3">
                              🍰 {item.productOrdered}
                            </span>
                          )}

                          {/* Mensagem */}
                          <p className="text-xs sm:text-sm text-[#3D231D]/85 leading-relaxed italic mb-4">
                            "{item.comment}"
                          </p>
                        </div>

                        {/* Rodapé com botão de curtir */}
                        <div className="pt-3 border-t border-[#FFF5F7] flex items-center justify-between text-xs">
                          <span className="text-2xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-100">
                            ✓ Avaliação Real de Cliente
                          </span>

                          <button
                            onClick={() => handleLike(item.id)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold transition-all cursor-pointer ${
                              likedMap[item.id]
                                ? 'bg-[#FFE5EC] text-[#E85D75]'
                                : 'bg-gray-50 hover:bg-[#FFE5EC] text-gray-600 hover:text-[#E85D75]'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{item.likes || 0}</span>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};
