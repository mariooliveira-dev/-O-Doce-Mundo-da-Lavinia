import { Product, Review } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'bolo-caseirinho-cenoura-brigadeiro',
    name: 'Bolo Caseirinho de Cenoura com Brigadeiro',
    category: 'caseirinhos',
    description: 'O clássico irresistível! Massa de cenoura artesanal super macia com cobertura vulcão generosa de brigadeiro 50% cacau.',
    price: 38.00,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    badge: 'Mais Pedido 🏆',
    rating: 5.0,
    reviewCount: 54,
    customizable: true,
    options: {
      flavors: ['Cenoura Tradicional'],
      fillings: ['Brigadeiro Gourmet 50%', 'Ninho Cremoso', 'Doce de Leite']
    }
  },
  {
    id: 'bolo-vulcao-ninho-nutella',
    name: 'Bolo Vulcão Ninho com Nutella',
    category: 'vulcao',
    description: 'Massa leve e fofinha com uma avalanche cremosa de brigadeiro de Leite Ninho e Nutella pura no topo.',
    price: 58.00,
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
    badge: 'Favorito ❤️',
    rating: 4.9,
    reviewCount: 42,
    customizable: true,
    options: {
      sizes: [
        { name: 'Tamanho Padrão (1.2kg)', extraPrice: 0 },
        { name: 'Tamanho Família (2.0kg)', extraPrice: 30 }
      ]
    }
  },
  {
    id: 'bolo-caseirinho-fuba-goiabada',
    name: 'Bolo Caseirinho de Fubá com Goiabada',
    category: 'caseirinhos',
    description: 'Sabor afetivo que lembra casa de vó! Massa fofinha de fubá artesanal com pedaços macios e calda cremosa de goiabada.',
    price: 32.00,
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
    badge: 'Sabor de Infância 🏠',
    rating: 5.0,
    reviewCount: 38
  },
  {
    id: 'bolo-caseirinho-formigueiro',
    name: 'Bolo Caseirinho Formigueiro',
    category: 'caseirinhos',
    description: 'Massa leve de baunilha recheada com granulados crocantes de chocolate e coberta com brigadeiro de colher.',
    price: 35.00,
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewCount: 31
  },
  {
    id: 'bolo-fofinho-laranja-natural',
    name: 'Bolo Caseirinho de Laranja Natural',
    category: 'fofinhos',
    description: 'Preparado com suco natural da fruta, massa leve, fofíssima e calda suave. Perfeito para acompanhar um bom café da tarde.',
    price: 28.00,
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
    badge: 'Perfeito para o Café ☕',
    rating: 5.0,
    reviewCount: 29
  },
  {
    id: 'bolo-caseirinho-chocolatudo',
    name: 'Bolo Caseirinho Chocolatudo',
    category: 'caseirinhos',
    description: 'Para os verdadeiros amantes de chocolate! Massa molhadinha de cacau intenso coberta com calda quente de brigadeiro gourmet.',
    price: 36.00,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    badge: 'Puro Cacau 🍫',
    rating: 4.9,
    reviewCount: 46
  },
  {
    id: 'bolo-caseirinho-churros-doce-de-leite',
    name: 'Bolo Caseirinho de Churros',
    category: 'caseirinhos',
    description: 'Massa aromatizada com canela artesanal e uma generosa cobertura de doce de leite cremoso salpicada de canela e açúcar.',
    price: 42.00,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 27
  },
  {
    id: 'mini-caseirinho-individual',
    name: 'Mini Caseirinho Individual (Diversos Sabores)',
    category: 'mini_caseiros',
    description: 'Dose individual perfeita do seu bolo caseirinho favorito! Ideal para o lanche da tarde ou para presentear alguém especial.',
    price: 16.00,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    badge: 'Dose Individual 🎁',
    rating: 5.0,
    reviewCount: 62,
    customizable: true,
    options: {
      flavors: ['Cenoura com Brigadeiro', 'Ninho com Nutella', 'Fubá com Goiabada', 'Chocolatudo']
    }
  }
];

export const REVIEWS: Review[] = [
  {
    id: '1',
    author: 'Mariana S.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: 'Ontem',
    comment: 'Os bolos caseirinhos da Lavínia são espetaculares! O de cenoura é super fofinho e a cobertura de brigadeiro vem generosa. Dá pra sentir aquele sabor que lembra casa!',
    productName: 'Bolo Caseirinho de Cenoura com Brigadeiro'
  },
  {
    id: '2',
    author: 'Felipe Santos',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: 'Há 3 dias',
    comment: 'Pedi o bolo vulcão de Ninho com Nutella pro café em família aqui em Teixeira de Freitas. Chegou quentinho, bem embalado e delicioso!',
    productName: 'Bolo Vulcão Ninho com Nutella'
  },
  {
    id: '3',
    author: 'Camila Aguiar',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: 'Há 1 semana',
    comment: 'O bolo de fubá com goiabada é pura nostalgia! Lembra os finais de tarde na casa da vovó. A Lavínia faz tudo com muito amor!',
    productName: 'Bolo Caseirinho de Fubá com Goiabada'
  }
];

