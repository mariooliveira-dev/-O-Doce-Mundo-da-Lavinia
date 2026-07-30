import React from 'react';
import { Instagram, Heart, MessageCircle, Share2, Sparkles, Bookmark } from 'lucide-react';

export const InstagramFeed: React.FC = () => {
  const posts = [
    {
      id: '1',
      username: 'odocemundodalavinia',
      collab: 'a_lavss',
      likes: '10',
      comments: '2',
      image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
      caption: 'Oi, me chamo Lavínia Aguiar, tenho 22 anos, faço vários bolinhos para a minha família e para seus momentos especiais com muito amor! 🧁💖',
      date: 'Há 2 dias',
      isHeroPost: true
    },
    {
      id: '2',
      username: 'odocemundodalavinia',
      likes: '28',
      comments: '5',
      image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=800&q=80',
      caption: 'Nossa caixinha especial com cupcakes recheados para encantar o final de semana! 🍓✨ Quem mais ama morango com chantilly?',
      date: 'Há 4 dias'
    },
    {
      id: '3',
      username: 'odocemundodalavinia',
      likes: '42',
      comments: '8',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
      caption: 'Brigadeiros gourmet enrolados com muito carinho. O de Ninho com Nutella é sem dúvidas o favorito de vocês! 🍫✨',
      date: 'Há 1 semana'
    }
  ];

  return (
    <section id="instagram" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE5EC] text-[#E85D75] font-semibold text-xs uppercase tracking-wider">
            <Instagram className="w-3.5 h-3.5" /> Direct do Instagram
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#3D231D]">
            Acompanhe no <span className="font-script text-4xl sm:text-5xl text-[#E85D75]">@odocemundodalavinia</span>
          </h2>
          <p className="text-sm text-[#5C3A21]">
            Confira as últimas novidades, fotos reais dos bolos e bastidores das nossas encomendas!
          </p>
        </div>

        {/* Instagram Post Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`bg-white rounded-3xl overflow-hidden border shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                post.isHeroPost ? 'border-[#E85D75] ring-2 ring-[#E85D75]/20' : 'border-[#F4ACB7]/40'
              }`}
            >
              
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between border-b border-[#FFF0F3]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFE5EC] p-0.5 border border-[#F4ACB7] flex items-center justify-center font-bold text-xs text-[#E85D75]">
                    🧁
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-[#3D231D]">{post.username}</span>
                      {post.collab && (
                        <span className="text-2xs text-[#5C3A21]">e {post.collab}</span>
                      )}
                    </div>
                    <span className="text-2xs text-[#5C3A21]">Informação de IA • Confeitaria</span>
                  </div>
                </div>
                <Instagram className="w-4 h-4 text-[#E85D75]" />
              </div>

              {/* Post Image */}
              <div className="relative aspect-square bg-[#FFF0F3]">
                <img
                  src={post.image}
                  alt={post.caption}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {post.isHeroPost && (
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full border border-[#F4ACB7] text-2xs font-bold text-[#E85D75] shadow">
                    Post do Perfil Oficial ✨
                  </div>
                )}
              </div>

              {/* Post Actions & Interactions Bar */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-[#3D231D]">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-[#E85D75] hover:scale-110 transition-transform">
                      <Heart className="w-5 h-5 fill-[#E85D75]" />
                      <span className="font-bold text-xs">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-[#5C3A21]">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-bold text-xs">{post.comments}</span>
                    </button>
                    <Share2 className="w-4 h-4 text-[#5C3A21]" />
                  </div>
                  <Bookmark className="w-4 h-4 text-[#5C3A21]" />
                </div>

                {/* Caption Text */}
                <p className="text-xs text-[#3D231D] leading-relaxed">
                  <span className="font-bold mr-1.5">{post.username}</span>
                  {post.caption}
                </p>

                <span className="text-2xs text-[#5C3A21]/70 block">{post.date}</span>
              </div>

            </div>
          ))}
        </div>

        {/* Follow CTA Button */}
        <div className="mt-12 text-center">
          <a
            href="https://instagram.com/odocemundodalavinia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <Instagram className="w-5 h-5" />
            <span>Siga @odocemundodalavinia no Instagram</span>
          </a>
        </div>

      </div>
    </section>
  );
};
