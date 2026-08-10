import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Lock,
  LogOut,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Camera,
  DollarSign,
  Phone,
  User,
  Image as ImageIcon,
  Sparkles,
  HelpCircle,
  Eye,
  Settings,
  Mail,
  ArrowLeft,
  AlertCircle,
  Database,
  Cloud,
  CloudOff,
  Download,
  UploadCloud,
  Info,
  RefreshCw,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { ProductCategory, Product } from '../types';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../lib/supabase';
import { productService } from '../services/productService';
import { syncBackupWithSupabase } from '../utils/syncBackupUtility';
import { SupabaseDiagnosticStatus } from './SupabaseDiagnosticStatus';

export const AdminPanelModal: React.FC = () => {
  const {
    isLoggedIn,
    isAdminOpen,
    closeAdminModal,
    loginWithEmail,
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
    importBackup,
  } = useAdmin();

  // Auth Screen Mode ('login', 'forgot')
  const [authMode, setAuthMode] = useState<'login' | 'forgot'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Recovery form state
  const [recoveryEmail, setRecoveryEmail] = useState('');

  // Auth feedback
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings: Change Password
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [passwordUpdateMsg, setPasswordUpdateMsg] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'products' | 'profile' | 'logo' | 'contact'>('products');

  // New product modal state inside admin panel
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('vulcao');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdBadge, setNewProdBadge] = useState('');
  const [newProdAvailable, setNewProdAvailable] = useState<boolean>(true);

  // Editing existing product state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [adminToast, setAdminToast] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editName, setEditName] = useState<string>('');
  const [editImage, setEditImage] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editBadge, setEditBadge] = useState<string>('');
  const [editAvailable, setEditAvailable] = useState<boolean>(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Cloud Sync & Vercel Tutorial State
  const [showVercelTutorial, setShowVercelTutorial] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    const result = await syncBackupWithSupabase();
    setIsSyncing(false);
    if (result.success) {
      setSyncStatusMsg(`Sincronizado com sucesso! (${result.syncedProductsCount} produto(s) atualizados)`);
      setTimeout(() => setSyncStatusMsg(null), 5000);
    } else {
      setSyncStatusMsg(`Falha na sincronização: ${result.message}`);
      setTimeout(() => setSyncStatusMsg(null), 6000);
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      siteConfig,
      products,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `odocemundo_cardapio_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = await importBackup(json);
        if (res.success) {
          alert('🎉 Backup importado com sucesso! Seus produtos e configurações foram salvos no site.');
        } else {
          alert(res.error || 'Erro ao importar backup.');
        }
      } catch {
        alert('Formato de arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  if (!isAdminOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      setAuthError('Por favor, digite um e-mail válido.');
      return;
    }
    if (!loginPassword) {
      setAuthError('Por favor, digite sua senha.');
      return;
    }

    setIsSubmitting(true);
    const res = await loginWithEmail(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (!res.success) {
      setAuthError(res.error || 'E-mail ou senha incorretos.');
    }
  };

  const handleResendConfirmation = async () => {
    const targetEmail = loginEmail.trim() || recoveryEmail.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setAuthError('Por favor, informe seu e-mail de acesso no campo de e-mail para solicitar o reenvio.');
      return;
    }

    setIsSubmitting(true);
    setAuthError('');
    setAuthSuccessMsg('');
    const res = await authService.resendConfirmationEmail(targetEmail);
    setIsSubmitting(false);

    if (res.success) {
      setAuthSuccessMsg(res.message);
    } else {
      setAuthError(res.message);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (!recoveryEmail.trim() || !recoveryEmail.includes('@')) {
      setAuthError('Por favor, informe seu e-mail cadastrado.');
      return;
    }

    setIsSubmitting(true);
    const res = await sendPasswordReset(recoveryEmail);
    setIsSubmitting(false);

    if (res.success) {
      setAuthSuccessMsg(res.message);
    } else {
      setAuthError(res.message);
    }
  };

  const parsePrice = (raw: string, fallback = 0): number => {
    if (!raw) return fallback;
    // Cleans currency symbol "R$", spaces, and replaces comma with dot
    const clean = raw.replace(/[^\d.,]/g, '').replace(',', '.');
    const parsed = parseFloat(clean);
    return !isNaN(parsed) && parsed >= 0 ? parsed : fallback;
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setAdminToast('A imagem é muito grande. Escolha uma foto de até 10MB.');
        return;
      }
      setIsUploadingPhoto(true);
      try {
        const url = await uploadImage(file);
        if (url) {
          onSuccess(url);
        } else {
          setAdminToast('Não foi possível processar a imagem. Tente uma foto menor ou insira um link direto.');
        }
      } catch (err) {
        console.error('Erro no upload de foto:', err);
        setAdminToast('Ocorreu um erro ao enviar a foto.');
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  const startEditingProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setEditPrice(prod.price.toString());
    setEditName(prod.name);
    setEditImage(prod.image);
    setEditDescription(prod.description);
    setEditBadge(prod.badge || '');
    setEditAvailable(prod.available !== false);
  };

  const saveEditedProduct = async (id: string) => {
    const existingProd = products.find((p) => p.id === id);
    const finalPrice = parsePrice(editPrice, existingProd?.price || 0);
    const finalImage = editImage.trim() || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80';

    setIsSavingProduct(true);
    try {
      await updateProduct(id, {
        name: editName.trim() || existingProd?.name || 'Doce sem nome',
        price: finalPrice,
        image: finalImage,
        description: editDescription.trim() || existingProd?.description || '',
        badge: editBadge.trim() || undefined,
        available: editAvailable,
      });
    } catch (err) {
      console.error('Erro ao salvar edições do produto:', err);
    } finally {
      setIsSavingProduct(false);
      setEditingProductId(null);
    }
  };

  const handleSaveNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice.trim()) {
      setAdminToast('Por favor, informe o nome e o preço do produto.');
      return;
    }

    const finalPrice = parsePrice(newProdPrice, 0);

    setIsSavingProduct(true);
    try {
      await addProduct({
        name: newProdName.trim(),
        category: newProdCategory,
        price: finalPrice,
        description: newProdDescription.trim() || 'Doce artesanal feito com carinho pela Lavínia.',
        image: newProdImage.trim() || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
        badge: newProdBadge.trim() || undefined,
        available: newProdAvailable,
      });

      // Reset new product form
      setNewProdName('');
      setNewProdPrice('');
      setNewProdDescription('');
      setNewProdImage('');
      setNewProdBadge('');
      setNewProdAvailable(true);
      setIsAddingProduct(false);
    } catch (err) {
      console.error('Erro ao cadastrar novo doce:', err);
    } finally {
      setIsSavingProduct(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#F4ACB7]/40 overflow-hidden my-8"
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-[#3D231D] via-[#5C3A21] to-[#3D231D] p-6 text-white relative">
            <button
              onClick={closeAdminModal}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#E85D75] text-white shadow-lg">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xs uppercase tracking-widest text-[#FFCAD4] font-bold">
                  Acesso Restrito da Confeiteira
                </span>
                <h2 className="font-display text-2xl font-bold">Painel de Controle — Lavínia</h2>
              </div>
            </div>
          </div>

          {/* Body Content */}
          {!isLoggedIn ? (
            <div className="p-6 sm:p-10 max-w-md mx-auto space-y-5">
              {authMode === 'login' && (
                /* LOGIN TRADICIONAL SUPABASE */
                <div className="space-y-4">
                  <div className="text-center space-y-1.5">
                    <div className="w-16 h-16 rounded-full bg-white border-2 border-[#F4ACB7] mx-auto flex items-center justify-center shadow-md overflow-hidden p-1">
                      {siteConfig.logoUrl ? (
                        <img src={siteConfig.logoUrl} alt="Logo Doce Mundo da Lavínia" className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-[#FFE5EC] text-[#E85D75] flex items-center justify-center text-2xl">
                          🧁
                        </div>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-xl text-[#3D231D]">
                      Acesso ao Painel
                    </h3>
                    <p className="text-xs text-[#5C3A21]">
                      Digite seu e-mail e senha para gerenciar o site (produtos, preços, fotos e contatos).
                    </p>
                  </div>

                  {authError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                        <span>{authError}</span>
                      </div>
                      {(authError.toLowerCase().includes('não confirmado') || authError.toLowerCase().includes('not confirmed')) && (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={handleResendConfirmation}
                          className="w-full py-2 px-3 rounded-lg bg-[#E85D75] hover:bg-[#d44860] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 mt-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{isSubmitting ? 'Reenviando...' : 'Reenviar E-mail de Confirmação'}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {authSuccessMsg && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{authSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-left text-xs">
                    <div>
                      <label className="block font-bold text-[#3D231D] mb-1">E-mail de Acesso:</label>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="seu@email.com"
                        autoFocus
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#F4ACB7] bg-white focus:ring-2 focus:ring-[#E85D75] outline-none text-sm"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-[#3D231D]">Senha:</label>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthError('');
                            setAuthSuccessMsg('');
                            setAuthMode('forgot');
                          }}
                          className="text-2xs font-bold text-[#E85D75] hover:underline"
                        >
                          Esqueci minha senha
                        </button>
                      </div>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Digite sua senha..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#F4ACB7] bg-white focus:ring-2 focus:ring-[#E85D75] outline-none text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-xl bg-[#E85D75] hover:bg-[#d44860] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'Entrando...' : 'Entrar no Painel'}</span>
                    </button>
                  </form>
                </div>
              )}

              {authMode === 'forgot' && (
                /* RECUPERAR SENHA */
                <div className="space-y-4">
                  <div className="text-center space-y-1.5">
                    <div className="w-14 h-14 rounded-full bg-[#FFE5EC] text-[#E85D75] mx-auto flex items-center justify-center shadow-inner">
                      <Mail className="w-7 h-7" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-[#3D231D]">
                      Recuperar Senha
                    </h3>
                    <p className="text-xs text-[#5C3A21]">
                      Informe seu e-mail cadastrado para receber o link de redefinição.
                    </p>
                  </div>

                  {authError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {authSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{authSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleRecoverySubmit} className="space-y-3.5 text-left text-xs">
                    <div>
                      <label className="block font-bold text-[#3D231D] mb-1">E-mail Cadastrado:</label>
                      <input
                        type="email"
                        required
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="seu@email.com"
                        autoFocus
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#F4ACB7] bg-white focus:ring-2 focus:ring-[#E85D75] outline-none text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-xl bg-[#E85D75] hover:bg-[#d44860] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'Enviando...' : 'Enviar E-mail de Recuperação'}</span>
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError('');
                          setAuthSuccessMsg('');
                          setAuthMode('login');
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#5C3A21] hover:text-[#E85D75]"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Voltar ao Login</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* Logged In Dashboard Interface */
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {adminToast && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center justify-between">
                  <span>{adminToast}</span>
                  <button
                    type="button"
                    onClick={() => setAdminToast(null)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {/* Top Navigation Tabs & Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F4ACB7]/30">
                
                {/* Tabs */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                      activeTab === 'products'
                        ? 'bg-[#E85D75] text-white shadow-md'
                        : 'bg-[#FFF0F3] text-[#5C3A21] hover:bg-[#FFE5EC]'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Cardápio & Preços</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                      activeTab === 'profile'
                        ? 'bg-[#E85D75] text-white shadow-md'
                        : 'bg-[#FFF0F3] text-[#5C3A21] hover:bg-[#FFE5EC]'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Foto de Perfil & Bio</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('logo')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                      activeTab === 'logo'
                        ? 'bg-[#E85D75] text-white shadow-md'
                        : 'bg-[#FFF0F3] text-[#5C3A21] hover:bg-[#FFE5EC]'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Logo & Favicon</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('contact')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                      activeTab === 'contact'
                        ? 'bg-[#E85D75] text-white shadow-md'
                        : 'bg-[#FFF0F3] text-[#5C3A21] hover:bg-[#FFE5EC]'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    <span>WhatsApp & Senha</span>
                  </button>
                </div>

                {/* Logout & Reset Buttons */}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={resetToDefaults}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-2xs font-semibold flex items-center gap-1 transition-colors"
                    title="Restaurar valores padrão"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Originais</span>
                  </button>

                  <button
                    onClick={logout}
                    className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-2xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair</span>
                  </button>
                </div>

              </div>

              {/* Componente de Diagnóstico em Tempo Real do Supabase */}
              <SupabaseDiagnosticStatus />

              {/* Status Banner: Multi-device & Cloud Sync Status */}
              <div className={`p-4 rounded-2xl border text-xs space-y-2.5 transition-all ${
                isSupabaseConfigured
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/90 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl shrink-0 ${isSupabaseConfigured ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                      {isSupabaseConfigured ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm">
                          {isSupabaseConfigured
                            ? '🟢 Sincronização na Nuvem Ativa (Supabase)'
                            : '⚠️ Salvo no Navegador Local (Sem Nuvem Configurada no Vercel)'}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-wider ${
                          isSupabaseConfigured ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                        }`}>
                          {isSupabaseConfigured ? 'Visível p/ Todos' : 'Local'}
                        </span>
                      </div>
                      <p className="text-2xs opacity-90 mt-0.5 leading-normal">
                        {isSupabaseConfigured
                          ? 'Suas edições são salvas automaticamente na nuvem e aparecem instantaneamente para qualquer cliente em qualquer computador ou celular!'
                          : 'As alterações feitas neste computador são salvas no seu navegador. Para que os clientes no Vercel (odocemundo.vercel.app) vejam em tempo real, conecte o Supabase no Vercel ou use a exportação abaixo.'}
                      </p>
                    </div>
                  </div>

                  {/* Export / Import, Sync & Tutorial Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 ml-auto">
                    <button
                      onClick={handleSyncNow}
                      disabled={isSyncing}
                      className="px-3.5 py-1.5 rounded-lg bg-[#E85D75] hover:bg-[#d44860] text-white font-bold text-2xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Forçar verificação de versão e sincronização imediata com o Supabase"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
                    </button>

                    <button
                      onClick={handleExportBackup}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 text-gray-800 font-bold text-2xs border border-gray-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Baixar arquivo JSON com todos os produtos e fotos"
                    >
                      <Download className="w-3.5 h-3.5 text-[#E85D75]" />
                      <span>Exportar Backup</span>
                    </button>

                    <label className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 text-gray-800 font-bold text-2xs border border-gray-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer">
                      <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Importar Backup</span>
                      <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                    </label>

                    {!isSupabaseConfigured && (
                      <button
                        onClick={() => setShowVercelTutorial(!showVercelTutorial)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-2xs shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>{showVercelTutorial ? 'Ocultar Ajuda' : 'Sincronizar no Vercel'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {syncStatusMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2.5 rounded-xl bg-white/90 border border-emerald-300 text-emerald-950 text-2xs font-bold shadow-2xs flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{syncStatusMsg}</span>
                  </motion.div>
                )}

                {/* Vercel Tutorial Expandable Block */}
                {showVercelTutorial && !isSupabaseConfigured && (
                  <div className="mt-3 p-4 bg-white rounded-xl border border-amber-300 text-gray-800 text-2xs space-y-3 shadow-inner">
                    <h5 className="font-bold text-xs text-[#3D231D] flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-[#E85D75]" />
                      <span>Por que as alterações feitas aqui não aparecem no computador do cliente?</span>
                    </h5>
                    <p className="text-gray-600 leading-relaxed">
                      Como o site está hospedado no Vercel (<code>odocemundo.vercel.app</code>), sem um banco de dados em nuvem configurado nas variáveis de ambiente do Vercel, o site usa o <strong>armazenamento do seu próprio navegador (localStorage)</strong>. Por isso, as alterações ficam salvas no seu PC, mas outros computadores abrem a versão original.
                    </p>
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-3xs font-mono space-y-1">
                      <div className="font-bold text-amber-900 mb-1">🔑 Adicione estas 2 variáveis no painel do Vercel:</div>
                      <div><strong className="text-[#E85D75]">VITE_SUPABASE_URL</strong> = https://seu-projeto.supabase.co</div>
                      <div><strong className="text-[#E85D75]">VITE_SUPABASE_ANON_KEY</strong> = sua-chave-anon-publica-do-supabase</div>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-gray-700">
                      <li>Acesse seu projeto em <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold">Vercel.com</a> &gt; <strong>Settings</strong> &gt; <strong>Environment Variables</strong>.</li>
                      <li>Cole as chaves <code className="bg-gray-100 px-1 rounded text-[#E85D75]">VITE_SUPABASE_URL</code> e <code className="bg-gray-100 px-1 rounded text-[#E85D75]">VITE_SUPABASE_ANON_KEY</code>.</li>
                      <li>Clique em <strong>Redeploy</strong> no Vercel. Pronto! Todas as edições sincronizam para todos os clientes em tempo real.</li>
                    </ol>
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800 text-2xs font-bold border border-emerald-200">
                      💡 Enquanto isso, você pode usar o botão "Exportar Backup" acima para salvar seu cardápio em um arquivo JSON e clicar em "Importar Backup" em qualquer outro navegador!
                    </div>
                  </div>
                )}
              </div>

              {/* TAB 1: CARDÁPIO, PREÇOS E FOTOS DE PRODUTOS */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-lg text-[#3D231D]">
                        Gerenciador do Cardápio ({products.length} itens)
                      </h3>
                      <p className="text-xs text-[#5C3A21]">
                        Clique no preço ou foto para editar em tempo real no seu site.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAddingProduct(true)}
                      className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center gap-2 shadow transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Novo Doce</span>
                    </button>
                  </div>

                  {/* Add Product Inline Modal / Form */}
                  {isAddingProduct && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      onSubmit={handleSaveNewProduct}
                      className="p-5 bg-[#FFF0F3] rounded-2xl border border-[#F4ACB7] space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-[#F4ACB7]/40 pb-2">
                        <h4 className="font-bold text-sm text-[#3D231D] flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#E85D75]" /> Adicionar Novo Doce ao Cardápio
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsAddingProduct(false)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-semibold text-[#3D231D] mb-1">Nome do Doce:</label>
                          <input
                            type="text"
                            required
                            value={newProdName}
                            onChange={(e) => setNewProdName(e.target.value)}
                            placeholder="Ex: Bolo Red Velvet Gourmet"
                            className="w-full px-3 py-2 rounded-lg bg-white border border-[#F4ACB7]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-[#3D231D] mb-1">Categoria:</label>
                          <select
                            value={newProdCategory}
                            onChange={(e) => setNewProdCategory(e.target.value as ProductCategory)}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-[#F4ACB7]"
                          >
                            <option value="vulcao">Bolo Vulcão 🌋</option>
                            <option value="com_cobertura">Bolo com Cobertura 🍰</option>
                            <option value="piscina">Bolo de Piscina 🎂</option>
                            <option value="tradicionais">Bolos Tradicionais 🧁</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-[#3D231D] mb-1">Preço (R$):</label>
                          <input
                            type="text"
                            required
                            value={newProdPrice}
                            onChange={(e) => setNewProdPrice(e.target.value)}
                            placeholder="Ex: 45.00"
                            className="w-full px-3 py-2 rounded-lg bg-white border border-[#F4ACB7]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-[#3D231D] mb-1">Destaque / Selo (opcional):</label>
                          <input
                            type="text"
                            value={newProdBadge}
                            onChange={(e) => setNewProdBadge(e.target.value)}
                            placeholder="Ex: Novo! 🍓"
                            className="w-full px-3 py-2 rounded-lg bg-white border border-[#F4ACB7]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-[#3D231D] mb-1">Status no Cardápio:</label>
                          <select
                            value={newProdAvailable ? 'disponivel' : 'indisponivel'}
                            onChange={(e) => setNewProdAvailable(e.target.value === 'disponivel')}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-[#F4ACB7] font-semibold text-[#3D231D]"
                          >
                            <option value="disponivel">🟢 Disponível para Pedidos</option>
                            <option value="indisponivel">🔴 Indisponível / Esgotado</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-[#3D231D] mb-1">Descrição:</label>
                          <textarea
                            rows={2}
                            value={newProdDescription}
                            onChange={(e) => setNewProdDescription(e.target.value)}
                            placeholder="Descreva os recheios, sabores e detalhes..."
                            className="w-full px-3 py-2 rounded-lg bg-white border border-[#F4ACB7]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-[#3D231D] mb-1">Foto do Doce:</label>
                          <div className="flex flex-col sm:flex-row items-center gap-3">
                            <input
                              type="text"
                              value={newProdImage}
                              onChange={(e) => setNewProdImage(e.target.value)}
                              placeholder="Cole o link da foto (URL) ou envie um arquivo do seu celular ->"
                              className="w-full px-3 py-2 rounded-lg bg-white border border-[#F4ACB7]"
                            />
                            <label className="cursor-pointer shrink-0 px-3 py-2 bg-white border border-[#E85D75] text-[#E85D75] rounded-lg font-bold flex items-center gap-1.5 hover:bg-[#FFE5EC]">
                              <Upload className="w-4 h-4" />
                              <span>Enviar do dispositivo</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, (url) => setNewProdImage(url))}
                              />
                            </label>
                          </div>
                          {newProdImage && (
                            <img
                              src={newProdImage}
                              alt="Prévia"
                              className="mt-2 w-20 h-20 object-cover rounded-xl border border-pink-300"
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#E85D75] text-white font-bold rounded-xl text-xs hover:bg-[#d44860]"
                        >
                          Salvar Doce no Cardápio
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* Product Cards Table / List */}
                  <div className="grid grid-cols-1 gap-3">
                    {products.map((prod) => {
                      const isEditing = editingProductId === prod.id;

                      return (
                        <div
                          key={prod.id}
                          className="p-4 bg-white rounded-2xl border border-[#F4ACB7]/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between"
                        >
                          {/* Image & Main Info */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="relative group shrink-0">
                              <img
                                src={isEditing ? editImage : prod.image}
                                alt={prod.name}
                                onClick={() => {
                                  if (!isEditing) startEditingProduct(prod);
                                }}
                                className={`w-16 h-16 rounded-xl object-cover border border-pink-200 cursor-pointer ${
                                  !isEditing ? 'hover:opacity-80 transition-opacity' : ''
                                }`}
                                title={!isEditing ? 'Clique para editar este produto' : 'Foto do produto'}
                              />
                              {isEditing && (
                                <label className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center text-white cursor-pointer opacity-90 hover:opacity-100">
                                  {isUploadingPhoto ? (
                                    <RefreshCw className="w-5 h-5 animate-spin text-pink-300" />
                                  ) : (
                                    <Camera className="w-5 h-5" />
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e, (url) => setEditImage(url))}
                                  />
                                </label>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              {isEditing ? (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Nome do doce"
                                    className="w-full px-2.5 py-1 border border-pink-300 rounded-lg text-xs font-bold text-[#3D231D]"
                                  />
                                  <input
                                    type="text"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Descrição curta"
                                    className="w-full px-2.5 py-1 border border-pink-200 rounded-lg text-2xs text-[#5C3A21]"
                                  />
                                  
                                  {/* Photo Controls */}
                                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-pink-50/50 rounded-xl border border-pink-100">
                                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                      <span className="text-3xs font-bold text-gray-500 shrink-0">Foto:</span>
                                      <input
                                        type="text"
                                        value={editImage}
                                        onChange={(e) => setEditImage(e.target.value)}
                                        placeholder="Cole a URL ou envie foto"
                                        className="w-full px-2 py-0.5 border border-pink-200 rounded text-3xs bg-white"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <label className="px-2 py-1 rounded-lg bg-[#E85D75] text-white text-3xs font-bold flex items-center gap-1 cursor-pointer hover:bg-[#d44c63] transition-colors">
                                        <Upload className="w-3 h-3" />
                                        <span>Trocar Foto</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => handleFileUpload(e, (url) => setEditImage(url))}
                                        />
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => setEditImage('https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80')}
                                        className="px-2 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-3xs font-bold transition-colors"
                                        title="Usar imagem padrão"
                                      >
                                        Limpar
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 pt-0.5">
                                    <label className="flex items-center gap-1.5 cursor-pointer text-2xs font-bold text-[#3D231D]">
                                      <input
                                        type="checkbox"
                                        checked={editAvailable}
                                        onChange={(e) => setEditAvailable(e.target.checked)}
                                        className="rounded text-[#E85D75] focus:ring-[#E85D75] w-4 h-4 cursor-pointer"
                                      />
                                      <span>{editAvailable ? '🟢 Disponível no Cardápio' : '🔴 Indisponível / Esgotado'}</span>
                                    </label>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-sm text-[#3D231D] truncate">
                                      {prod.name}
                                    </h4>
                                    {prod.badge && (
                                      <span className="px-2 py-0.5 rounded-full bg-[#FFE5EC] text-[#E85D75] text-3xs font-bold shrink-0">
                                        {prod.badge}
                                      </span>
                                    )}
                                    {/* Quick Availability Switch Button */}
                                    <button
                                      type="button"
                                      onClick={() => updateProduct(prod.id, { available: prod.available === false ? true : false })}
                                      className={`px-2 py-0.5 rounded-full text-3xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                                        prod.available !== false
                                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                          : 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-300'
                                      }`}
                                      title="Clique para alternar disponibilidade rapidamente"
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full ${prod.available !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                      <span>{prod.available !== false ? 'Disponível' : 'Indisponível'}</span>
                                    </button>
                                  </div>
                                  <p className="text-2xs text-[#5C3A21] line-clamp-1 mt-0.5">
                                    {prod.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Price & Actions */}
                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                            <div className="text-right">
                              <span className="block text-3xs text-gray-400 uppercase font-bold">Preço</span>
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-bold text-[#3D231D]">R$</span>
                                  <input
                                    type="text"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    className="w-20 px-2 py-1 border border-emerald-400 rounded text-sm font-bold text-emerald-600 bg-emerald-50"
                                  />
                                </div>
                              ) : (
                                <span className="font-display font-bold text-base text-[#E85D75]">
                                  R$ {prod.price.toFixed(2).replace('.', ',')}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => saveEditedProduct(prod.id)}
                                    className="p-2 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 hover:bg-emerald-600 shadow"
                                    title="Salvar alterações"
                                  >
                                    <Check className="w-4 h-4" />
                                    <span>Salvar</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingProductId(null)}
                                    className="p-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => startEditingProduct(prod)}
                                    className="p-2 rounded-xl bg-[#FFF0F3] hover:bg-[#FFE5EC] text-[#E85D75] transition-colors"
                                    title="Editar preço e informações"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  {deletingProductId === prod.id ? (
                                    <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-200">
                                      <span className="text-3xs font-bold text-red-700 px-1">Excluir?</span>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          await deleteProduct(prod.id);
                                          setDeletingProductId(null);
                                        }}
                                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-3xs font-bold rounded-lg transition-colors cursor-pointer"
                                      >
                                        Sim
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeletingProductId(null)}
                                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-3xs font-bold rounded-lg transition-colors cursor-pointer"
                                      >
                                        Não
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setDeletingProductId(prod.id)}
                                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                                      title="Excluir do cardápio"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* TAB 2: FOTO DE PERFIL & BIO DA LAVÍNIA */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#3D231D]">
                      Perfil da Confeiteira (Sessão "Sobre a Lavínia")
                    </h3>
                    <p className="text-xs text-[#5C3A21]">
                      Altere a foto da Lavínia, seu nome de exibição e os textos de apresentação do site.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-[#FFF0F3] p-6 rounded-2xl border border-[#F4ACB7]/40">
                    
                    {/* Photo Picker */}
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="relative group">
                        <img
                          src={siteConfig.profileImage}
                          alt="Foto da Lavínia"
                          className="w-36 h-36 rounded-2xl object-cover border-4 border-white shadow-md"
                        />
                        <label className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-6 h-6 mb-1" />
                          <span className="text-3xs font-bold">Trocar Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(e, (url) => updateSiteConfig({ profileImage: url }))
                            }
                          />
                        </label>
                      </div>

                      <div className="w-full space-y-2">
                        <label className="block text-3xs font-bold text-[#5C3A21]">Ou cole a URL da Imagem:</label>
                        <input
                          type="text"
                          value={siteConfig.profileImage}
                          onChange={(e) => updateSiteConfig({ profileImage: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#F4ACB7] text-2xs"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    {/* Text Inputs */}
                    <div className="sm:col-span-2 space-y-4 text-xs">
                      <div>
                        <label className="block font-bold text-[#3D231D] mb-1">Seu Nome:</label>
                        <input
                          type="text"
                          value={siteConfig.founderName}
                          onChange={(e) => updateSiteConfig({ founderName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#F4ACB7] font-bold text-[#3D231D]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#3D231D] mb-1">Título / Subtítulo:</label>
                        <input
                          type="text"
                          value={siteConfig.founderTitle}
                          onChange={(e) => updateSiteConfig({ founderTitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#F4ACB7]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#3D231D] mb-1">Primeiro Parágrafo da História:</label>
                        <textarea
                          rows={3}
                          value={siteConfig.profileBio1}
                          onChange={(e) => updateSiteConfig({ profileBio1: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#F4ACB7]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#3D231D] mb-1">Segundo Parágrafo da História:</label>
                        <textarea
                          rows={2}
                          value={siteConfig.profileBio2}
                          onChange={(e) => updateSiteConfig({ profileBio2: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#F4ACB7]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#3D231D] mb-1">Terceiro Parágrafo / Mensagem Final:</label>
                        <textarea
                          rows={2}
                          value={siteConfig.profileBio3}
                          onChange={(e) => updateSiteConfig({ profileBio3: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#F4ACB7]"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 3: LOGO & FAVICON (IDENTIDADE VISUAL) */}
              {activeTab === 'logo' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#3D231D]">
                      Identidade Visual: Logo & Favicon
                    </h3>
                    <p className="text-xs text-[#5C3A21]">
                      Gerencie a imagem da Logo oficial (utilizada no cabeçalho, hero e rodapé) e o Favicon exclusivo da aba do navegador de forma 100% independente.
                    </p>
                  </div>

                  {/* SEÇÃO 1: LOGO DO SITE */}
                  <div className="p-6 bg-[#FFF0F3] rounded-2xl border border-[#F4ACB7]/40 space-y-4">
                    <div className="flex items-center gap-2 border-b border-[#F4ACB7]/30 pb-2">
                      <ImageIcon className="w-5 h-5 text-[#E85D75]" />
                      <h4 className="font-bold text-sm text-[#3D231D]">1. Logo Principal do Site</h4>
                      <span className="text-3xs text-gray-500">(Cabeçalho, Hero, Rodapé e Login)</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* Logo Preview */}
                      <div className="text-center shrink-0">
                        <span className="block text-2xs font-bold text-[#5C3A21] mb-1.5">Prévia da Logo:</span>
                        {siteConfig.logoUrl ? (
                          <img
                            src={siteConfig.logoUrl}
                            alt="Logo Personalizada"
                            className="w-28 h-28 object-contain rounded-2xl bg-white p-2 border border-pink-300 shadow-md mx-auto"
                          />
                        ) : (
                          <div className="w-28 h-28 rounded-2xl bg-white p-3 border border-pink-300 shadow-md flex flex-col items-center justify-center mx-auto text-center">
                            <span className="font-display font-bold text-xs text-[#3D231D]">O Doce Mundo</span>
                            <span className="font-script text-lg text-[#E85D75]">Mundo</span>
                            <span className="text-3xs text-gray-500 font-semibold">(Selo SVG Padrão)</span>
                          </div>
                        )}
                      </div>

                      {/* Logo Controls */}
                      <div className="flex-1 space-y-3 text-xs w-full">
                        <div>
                          <label className="block font-bold text-[#3D231D] mb-1">
                            Imagem da Logo (PNG / JPG / SVG / WebP):
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={siteConfig.logoUrl}
                              onChange={(e) => updateSiteConfig({ logoUrl: e.target.value })}
                              placeholder="Cole o link da logo ou envie uma imagem ->"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#F4ACB7]"
                            />
                            <label className="cursor-pointer px-3 py-2 bg-white border border-[#E85D75] text-[#E85D75] rounded-xl font-bold flex items-center gap-1.5 hover:bg-[#FFE5EC] shrink-0">
                              <Upload className="w-4 h-4" />
                              <span>Enviar Logo</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileUpload(e, (url) => updateSiteConfig({ logoUrl: url }))
                                }
                              />
                            </label>
                          </div>
                          {siteConfig.logoUrl && (
                            <button
                              type="button"
                              onClick={() => updateSiteConfig({ logoUrl: '' })}
                              className="text-3xs font-bold text-red-500 hover:underline mt-1 block"
                            >
                              Remover logo personalizada e voltar para o selo artesanal padrão
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block font-bold text-[#3D231D] mb-1">Frase / Slogan do Selo:</label>
                          <input
                            type="text"
                            value={siteConfig.logoSlogan}
                            onChange={(e) => updateSiteConfig({ logoSlogan: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#F4ACB7]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO 2: FAVICON OFICIAL PERMANENTE DA MARCA */}
                  <div className="p-6 bg-white rounded-2xl border border-[#F4ACB7] shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F4ACB7]/30 pb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#E85D75]" />
                        <h4 className="font-bold text-sm text-[#3D231D]">2. Favicon Oficial Permanente do Projeto</h4>
                      </div>
                      <span className="text-3xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> Ativo em /public/ com Versionamento ?v=1
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* Favicon Simulated Browser Tab Preview */}
                      <div className="text-center shrink-0 w-full sm:w-auto">
                        <span className="block text-2xs font-bold text-[#5C3A21] mb-1.5">Visualização na Aba do Navegador:</span>
                        <div className="bg-gray-200 p-2 rounded-t-xl max-w-[240px] mx-auto shadow-inner">
                          <div className="bg-white rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm border border-gray-300">
                            <img
                              src="/favicon-32x32.png?v=1"
                              alt="Favicon Oficial"
                              className="w-4 h-4 object-contain rounded-sm"
                            />
                            <span className="text-3xs font-semibold text-gray-700 truncate max-w-[140px]">
                              O Doce Mundo da Lavínia
                            </span>
                            <X className="w-3 h-3 text-gray-400 ml-auto shrink-0" />
                          </div>
                        </div>
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-b-xl max-w-[240px] mx-auto text-center">
                          <span className="text-3xs font-bold text-emerald-700">
                            ✨ Favicon Oficial Ativo & Totalmente Protegido
                          </span>
                        </div>
                      </div>

                      {/* Info Details */}
                      <div className="flex-1 space-y-2 text-xs text-[#5C3A21]">
                        <p className="font-bold text-[#3D231D]">
                          🔒 Gestão Permanente & Independente da Logo:
                        </p>
                        <p className="text-3xs text-gray-600 leading-relaxed">
                          O favicon oficial da marca está salvo permanentemente no diretório de arquivos públicos do projeto (<code className="bg-pink-50 px-1 py-0.5 rounded text-[#E85D75]">/public/</code>) e configurado com cache-busting (<code className="bg-pink-50 px-1 py-0.5 rounded text-[#E85D75]">?v=1</code>) no <code className="bg-pink-50 px-1 py-0.5 rounded text-[#E85D75]">index.html</code>.
                        </p>
                        <ul className="text-3xs text-gray-600 list-disc pl-4 space-y-1 font-medium">
                          <li>Funciona em abas do navegador, favoritos, histórico e atalhos em celulares iOS / Android.</li>
                          <li>100% independente da imagem da logo principal (alterações na logo no painel jamais afetam o favicon).</li>
                          <li>Persistência garantida em todos os deploys futuros (Vercel, GitHub, etc.).</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: WHATSAPP & CONTATO */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#3D231D]">
                      WhatsApp de Atendimento & Segurança
                    </h3>
                    <p className="text-xs text-[#5C3A21]">
                      Atualize o número para onde os pedidos do carrinho serão enviados no WhatsApp.
                    </p>
                  </div>

                  <div className="p-6 bg-[#FFF0F3] rounded-2xl border border-[#F4ACB7]/40 space-y-4 text-xs">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-[#3D231D] mb-1">
                          Número Formatado para Exibição:
                        </label>
                        <input
                          type="text"
                          value={siteConfig.phoneDisplay}
                          onChange={(e) => updateSiteConfig({ phoneDisplay: e.target.value })}
                          placeholder="Ex: +55 73 9952-7100"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#F4ACB7] font-bold text-[#3D231D]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#3D231D] mb-1">
                          Número numérico do WhatsApp (apenas números com DDD):
                        </label>
                        <input
                          type="text"
                          value={siteConfig.phoneRaw}
                          onChange={(e) =>
                            updateSiteConfig({ phoneRaw: e.target.value.replace(/\D/g, '') })
                          }
                          placeholder="Ex: 557399527100"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#F4ACB7] font-bold text-[#25D366]"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F4ACB7]/40 space-y-2">
                      <label className="block font-bold text-[#3D231D] mb-1">
                        Alterar Senha de Administrador (Supabase Auth):
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <input
                          type="password"
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          placeholder="Digite a nova senha (mínimo 8 caracteres)..."
                          className="w-full sm:w-72 px-3 py-2 rounded-xl bg-white border border-[#F4ACB7] text-xs font-bold"
                        />
                        <button
                          type="button"
                          disabled={isUpdatingPassword}
                          onClick={async () => {
                            if (newAdminPassword.length < 8) {
                              setPasswordUpdateMsg('A senha deve ter pelo menos 8 caracteres.');
                              return;
                            }
                            setIsUpdatingPassword(true);
                            const res = await authService.updatePassword(newAdminPassword);
                            setIsUpdatingPassword(false);
                            setPasswordUpdateMsg(res.message);
                            if (res.success) setNewAdminPassword('');
                          }}
                          className="px-4 py-2 bg-[#E85D75] hover:bg-[#d44860] text-white font-bold rounded-xl text-xs shrink-0 disabled:opacity-50 transition-colors"
                        >
                          {isUpdatingPassword ? 'Atualizando...' : 'Atualizar Senha'}
                        </button>
                      </div>
                      {passwordUpdateMsg && (
                        <p className="text-xs font-semibold text-[#E85D75] mt-1">{passwordUpdateMsg}</p>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* Bottom Save confirmation banner */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 font-semibold">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Todas as suas alterações são salvas e aplicadas em tempo real!</span>
                </div>

                <button
                  onClick={closeAdminModal}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
                >
                  Concluir & Ver Site
                </button>
              </div>

            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
