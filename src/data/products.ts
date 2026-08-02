import { Product, Review } from '../types';

export const PRODUCTS: Product[] = [
  // --- CATEGORIA 1: BOLO VULCÃO (vulcao) ---
  {
    id: 'bolo-vulcao-ninho-nutella',
    name: 'Bolo Vulcão Ninho com Nutella',
    category: 'vulcao',
    description: 'Massa leve e fofinha com uma avalanche cremosa e inesquecível de brigadeiro de Leite Ninho e Nutella pura no centro e topo.',
    price: 58.00,
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
    badge: 'Mais Pedido 🏆',
    rating: 5.0,
    reviewCount: 54,
    customizable: true,
    options: {
      sizes: [
        { name: 'Tamanho Padrão (1.2kg)', extraPrice: 0 },
        { name: 'Tamanho Família (2.0kg)', extraPrice: 30 }
      ]
    }
  },
  {
    id: 'bolo-vulcao-chocolatudo-brigadeiro',
    name: 'Bolo Vulcão Chocolatudo',
    category: 'vulcao',
    description: 'Para os amantes de chocolate! Massa molhadinha de cacau 50% recheada com erupção abundante de brigadeiro de colher.',
    price: 52.00,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    badge: 'Favorito ❤️',
    rating: 4.9,
    reviewCount: 46
  },
  {
    id: 'bolo-vulcao-cenoura-brigadeiro',
    name: 'Bolo Vulcão de Cenoura',
    category: 'vulcao',
    description: 'O clássico com calda vulcão! Massa de cenoura super macia e quentinha com avalanche generosa de brigadeiro gourmet.',
    price: 48.00,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    badge: 'Clássico 🥕',
    rating: 5.0,
    reviewCount: 62
  },
  {
    id: 'bolo-vulcao-churros-doce-de-leite',
    name: 'Bolo Vulcão de Churros',
    category: 'vulcao',
    description: 'Massa aromatizada com canela artesanal e vulcão cremoso de doce de leite salpicado com açúcar e canela.',
    price: 50.00,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    badge: 'Sabor Especial ✨',
    rating: 4.8,
    reviewCount: 33
  },

  // --- CATEGORIA 2: BOLO COM COBERTURA (com_cobertura) ---
  {
    id: 'bolo-cobertura-cenoura-brigadeiro',
    name: 'Bolo com Cobertura de Cenoura e Brigadeiro',
    category: 'com_cobertura',
    description: 'Massa fofinha de cenoura artesanal coberta com uma camada espessa e aveludada de brigadeiro gourmet 50% cacau.',
    price: 38.00,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    badge: 'Sabor Caseirinho 🏠',
    rating: 5.0,
    reviewCount: 41
  },
  {
    id: 'bolo-cobertura-fuba-goiabada',
    name: 'Bolo com Cobertura de Fubá com Goiabada',
    category: 'com_cobertura',
    description: 'Sabor afetivo de casa de vó! Massa fofinha de fubá artesanal coberta com goiabada cremosa quente derretida.',
    price: 35.00,
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
    badge: 'Perfeito para o Café ☕',
    rating: 5.0,
    reviewCount: 38
  },
  {
    id: 'bolo-cobertura-formigueiro-brigadeiro',
    name: 'Bolo com Cobertura Formigueiro',
    category: 'com_cobertura',
    description: 'Massa baunilhada repleta de granulados de chocolate que derretem na boca, coberta com brigadeiro de colher.',
    price: 36.00,
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
    badge: 'Delícia Caseira 💛',
    rating: 4.9,
    reviewCount: 29
  },
  {
    id: 'bolo-cobertura-laranja-natural',
    name: 'Bolo com Cobertura de Laranja Natural',
    category: 'com_cobertura',
    description: 'Preparado com suco 100% natural da fruta, massa leve e calda aveludada cítrica super refrescante.',
    price: 32.00,
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
    badge: '100% Natural 🍊',
    rating: 4.8,
    reviewCount: 27
  },

  // --- CATEGORIA 3: O BOLO PISCINA (piscina) ---
  {
    id: 'bolo-piscina-ninho-morangos',
    name: 'Bolo Piscina Ninho com Morangos',
    category: 'piscina',
    description: 'Modelo Ballerine com cavidade profunda e farta piscina de brigadeiro de Ninho artesanal decorada com morangos frescos.',
    price: 55.00,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
    badge: 'Destaque Ballerine 🍓',
    rating: 5.0,
    reviewCount: 49
  },
  {
    id: 'bolo-piscina-duo-ninho-brigadeiro',
    name: 'Bolo Piscina Duo Ninho & Brigadeiro',
    category: 'piscina',
    description: 'O melhor dos dois mundos! Cavidade piscina dividida entre meio Ninho cremoso e meio brigadeiro artesanal 50%.',
    price: 52.00,
    image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=800&q=80',
    badge: 'Mais Pedido 🌟',
    rating: 4.9,
    reviewCount: 45
  },
  {
    id: 'bolo-piscina-red-velvet-ninho-nutella',
    name: 'Bolo Piscina Red Velvet com Nutella',
    category: 'piscina',
    description: 'Massa aveludada Red Velvet de tom vermelho vibrante com piscina recheada de creme de Ninho e fios generosos de Nutella.',
    price: 58.00,
    image: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80',
    badge: 'Especial Red Velvet 👑',
    rating: 5.0,
    reviewCount: 39
  },
  {
    id: 'bolo-piscina-prestigio-coco',
    name: 'Bolo Piscina Prestígio',
    category: 'piscina',
    description: 'Massa molhadinha de chocolate com piscina recheada de beijinho cremoso de coco e fios de brigadeiro por cima.',
    price: 48.00,
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80',
    badge: 'Puro Coco 🥥',
    rating: 4.9,
    reviewCount: 31
  },

  // --- CATEGORIA 4: BOLOS TRADICIONAIS (tradicionais) ---
  {
    id: 'bolo-tradicional-fuba-simples',
    name: 'Bolo Tradicional de Fubá',
    category: 'tradicionais',
    description: 'Massa tradicional fofinha e dourada de fubá artesanal, crocante por fora e macia por dentro. Perfeita com café fresquinho!',
    price: 28.00,
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
    badge: 'Receita da Vó ☕',
    rating: 5.0,
    reviewCount: 35
  },
  {
    id: 'bolo-tradicional-mesclado',
    name: 'Bolo Tradicional Mesclado',
    category: 'tradicionais',
    description: 'A combinação clássica de baunilha suave e cacau puro mesclados em uma massa leve, fofinha e muito saborosa.',
    price: 30.00,
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
    badge: 'Fofinho & Leve ✨',
    rating: 4.9,
    reviewCount: 28
  },
  {
    id: 'bolo-tradicional-milho-verde',
    name: 'Bolo Tradicional de Milho Verde',
    category: 'tradicionais',
    description: 'Feito com milho selecionado e leite de coco, com textura cremosa incomparável e aroma irresistível.',
    price: 32.00,
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
    badge: 'Milho Selecionado 🌽',
    rating: 5.0,
    reviewCount: 42
  },
  {
    id: 'bolo-tradicional-chocolate-simples',
    name: 'Bolo Tradicional de Chocolate Caseiro',
    category: 'tradicionais',
    description: 'Bolo fofinho de chocolate com massa caseira super macia. O preferido das crianças e de toda a família!',
    price: 30.00,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    badge: 'Super Fofinho 🍫',
    rating: 4.8,
    reviewCount: 31
  }
];

export const REVIEWS: Review[] = [
  {
    id: '1',
    author: 'Mariana S.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: 'Ontem',
    comment: 'Os bolos da Lavínia são espetaculares! O Bolo Vulcão de Ninho com Nutella é surreal de gostoso e super recheado!',
    productName: 'Bolo Vulcão Ninho com Nutella'
  },
  {
    id: '2',
    author: 'Felipe Santos',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: 'Há 3 dias',
    comment: 'Pedi o Bolo Piscina Ninho com Morangos pro aniversário em família aqui em Teixeira. Chegou impecável e lindo demais!',
    productName: 'Bolo Piscina Ninho com Morangos'
  },
  {
    id: '3',
    author: 'Camila Aguiar',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: 'Há 1 semana',
    comment: 'O bolo com cobertura de fubá com goiabada é pura nostalgia! Lembra os finais de tarde na casa da vovó.',
    productName: 'Bolo com Cobertura de Fubá com Goiabada'
  }
];
