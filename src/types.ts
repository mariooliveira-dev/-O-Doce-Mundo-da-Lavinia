export type ProductCategory = 'todos' | 'vulcao' | 'com_cobertura' | 'piscina' | 'tradicionais';

export interface SiteConfig {
  phoneDisplay: string;
  phoneRaw: string;
  profileImage: string;
  profileBio1: string;
  profileBio2: string;
  profileBio3: string;
  founderName: string;
  founderTitle: string;
  logoUrl: string; // Empty string means use default SVG badge
  logoSlogan: string;
  adminPassword: string;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  phoneDisplay: '+55 73 9952-7100',
  phoneRaw: '557399527100',
  profileImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
  profileBio1: 'Oi, me chamo Lavínia Aguiar, faço vários bolinhos para a minha família e de um tempo pra cá nasceu uma vontade no meu coração de começar a fazer meus bolos para vocês também. Este espaço nasceu de um sonho que Deus colocou no meu coração. O início não é fácil, mas sei que o meu Deus de obras completas faz tudo na hora certa. Sempre acreditei que um bolo caseirinho tem o poder de reunir pessoas, adoçar momentos e criar lembranças especiais. Foi com muito carinho, dedicação e amor que decidi transformar esse sonho em realidade.',
  profileBio2: 'Cada bolo é preparado como se fosse para a minha própria família: com ingredientes de qualidade, muito capricho e aquele gostinho de casa que aquece o coração. 🥰',
  profileBio3: 'Estou muito feliz por ter você aqui! Espero fazer parte dos seus momentos especiais e levar um pedacinho de felicidade até a sua mesa.\nQue Deus abençoe essa nova jornada e cada cliente que passar por aqui.',
  founderName: 'Lavínia Aguiar',
  founderTitle: 'Fundadora & Confeiteira',
  logoUrl: '',
  logoSlogan: 'Feito com amor, assado com carinho e servido com gratidão',
  adminPassword: '1234',
};

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  image: string;
  badge?: string;
  rating: number;
  reviewCount: number;
  customizable?: boolean;
  available?: boolean;
  options?: {
    flavors?: string[];
    fillings?: string[];
    sizes?: { name: string; extraPrice: number }[];
  };
}

export interface CartItem {
  id: string; // unique item instance id
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedFlavor?: string;
  selectedFilling?: string;
  customInscription?: string; // e.g. text on Bentô cake
  extraNotes?: string;
  totalPrice: number;
}

export interface KitSelection {
  cakeSize: 'pequeno' | 'medio' | 'grande' | 'bento';
  cakeFlavor: string;
  docinhosCount: number; // 25, 50, 100
  docinhosFlavors: string[];
  cupcakesCount: number; // 0, 4, 6, 12
  cupcakeFlavors: string[];
  customText?: string;
  deliveryDate?: string;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  deliveryType: 'retirada' | 'entrega';
  address?: string;
  neighborhood?: string;
  deliveryDate: string;
  deliveryTime: string;
  paymentMethod: 'pix' | 'cartao' | 'dinheiro';
  notes?: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  productName?: string;
}
