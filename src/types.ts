export type ProductCategory = 'todos' | 'caseirinhos' | 'vulcao' | 'fofinhos' | 'mini_caseiros' | 'bolos' | 'cupcakes' | 'docinhos' | 'copos' | 'kits';

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
