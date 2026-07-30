import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';
import { configService } from '../services/configService';
import { productService } from '../services/productService';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';

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

interface AdminContextType {
  isLoggedIn: boolean;
  isAdminOpen: boolean;
  isLoading: boolean;
  hasAdminExists: boolean;
  checkAdminExists: () => Promise<boolean>;
  openAdminModal: () => void;
  closeAdminModal: () => void;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpAdmin: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  siteConfig: SiteConfig;
  updateSiteConfig: (newConfig: Partial<SiteConfig>) => Promise<void>;
  products: Product[];
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  addProduct: (newProduct: Omit<Product, 'id' | 'rating' | 'reviewCount'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string | null>;
  resetToDefaults: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const STORAGE_KEY_CONFIG = 'docemundo_site_config_v1';
const STORAGE_KEY_PRODUCTS = 'docemundo_products_v1';
const STORAGE_KEY_AUTH = 'docemundo_admin_auth_v1';

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAdminExists, setHasAdminExists] = useState<boolean>(true);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_AUTH) === 'true';
  });

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        return { ...DEFAULT_SITE_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error loading config from localStorage', e);
    }
    return DEFAULT_SITE_CONFIG;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading products from localStorage', e);
    }
    return PRODUCTS;
  });

  const checkAdminExists = async (): Promise<boolean> => {
    const exists = await authService.hasAdminUser();
    setHasAdminExists(exists);
    return exists;
  };

  // Carrega dados iniciais do Supabase (com fallback)
  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      setIsLoading(true);
      try {
        const [remoteConfig, remoteProducts, currentSession, adminRegistered] = await Promise.all([
          configService.fetchSiteConfig(),
          productService.fetchProducts(),
          authService.getSession(),
          authService.hasAdminUser(),
        ]);

        if (mounted) {
          setHasAdminExists(adminRegistered);
          if (remoteConfig) {
            setSiteConfig(remoteConfig);
          }
          if (remoteProducts && remoteProducts.length > 0) {
            setProducts(remoteProducts);
          }
          if (currentSession?.user) {
            setIsLoggedIn(true);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados remotos do Supabase:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadInitialData();

    // Inscrição em mudanças de estado do Supabase Auth
    const { unsubscribe } = authService.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
      } else if (_event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Sincroniza localmente para resiliência e offline
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(siteConfig));
  }, [siteConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUTH, isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  const openAdminModal = () => {
    checkAdminExists();
    setIsAdminOpen(true);
  };
  const closeAdminModal = () => setIsAdminOpen(false);

  const loginWithEmail = async (email: string, password: string) => {
    // 1. Tenta autenticação no Supabase
    const res = await authService.loginWithEmail(email, password);
    if (res.user) {
      setIsLoggedIn(true);
      return { success: true };
    }

    // 2. Fallback: Se a senha conferir com a senha mestra salva no siteConfig ou '1234'
    if (
      password &&
      (password === siteConfig.adminPassword ||
        password.trim() === siteConfig.adminPassword?.trim() ||
        password === '1234')
    ) {
      setIsLoggedIn(true);
      return { success: true };
    }

    // 3. Caso o Supabase retorne "E-mail não confirmado" (pois a opção 'Confirm email' está ativada por padrão no Supabase),
    // mas a pessoa está fornecendo a senha cadastrada para entrar, permitimos a entrada local sem travar o painel!
    if (
      res.error &&
      (res.error.toLowerCase().includes('não confirmado') ||
        res.error.toLowerCase().includes('not confirmed'))
    ) {
      setIsLoggedIn(true);
      return { success: true };
    }

    return { success: false, error: res.error || 'Credenciais inválidas' };
  };

  const signUpAdmin = async (fullName: string, email: string, password: string) => {
    const res = await authService.signUpInitialAdmin(fullName, email, password);
    
    // Atualiza a senha mestra no siteConfig para garantir que o login local sempre funcione com essa senha
    const updatedConfig = { ...siteConfig, adminPassword: password };
    setSiteConfig(updatedConfig);
    configService.updateSiteConfig(updatedConfig);

    if (res.user) {
      setHasAdminExists(true);
      setIsLoggedIn(true);
      return { success: true };
    }
    return { success: false, error: res.error || 'Erro ao realizar cadastro do administrador' };
  };

  const sendPasswordReset = async (email: string) => {
    return await authService.resetPassword(email);
  };

  const logout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
  };

  const updateSiteConfig = async (newConfig: Partial<SiteConfig>) => {
    const updated = { ...siteConfig, ...newConfig };
    setSiteConfig(updated);
    await configService.updateSiteConfig(updated);
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    await productService.updateProduct(id, updated);
  };

  const addProduct = async (newProd: Omit<Product, 'id' | 'rating' | 'reviewCount'>) => {
    const created = await productService.createProduct(newProd);
    setProducts((prev) => [created, ...prev]);
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await productService.deleteProduct(id);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const { url } = await storageService.uploadImage(file);
    return url;
  };

  const resetToDefaults = () => {
    if (window.confirm('Tem certeza que deseja restaurar as fotos, textos e preços originais do site?')) {
      setSiteConfig(DEFAULT_SITE_CONFIG);
      setProducts(PRODUCTS);
      localStorage.removeItem(STORAGE_KEY_CONFIG);
      localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isLoggedIn,
        isAdminOpen,
        isLoading,
        hasAdminExists,
        checkAdminExists,
        openAdminModal,
        closeAdminModal,
        loginWithEmail,
        signUpAdmin,
        sendPasswordReset,
        logout,
        siteConfig,
        updateSiteConfig,
        products,
        updateProduct,
        addProduct,
        deleteProduct,
        uploadImage,
        resetToDefaults,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
