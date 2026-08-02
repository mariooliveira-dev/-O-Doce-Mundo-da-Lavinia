import React, { useState, useEffect, useCallback } from 'react';
import { Database, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Server, HardDrive, Wifi, ShieldAlert } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getSavedProductsFromStorage, getSavedConfigFromStorage } from '../utils/storage';
import { syncBackupWithSupabase } from '../utils/syncBackupUtility';

export interface DiagnosticState {
  status: 'checking' | 'connected' | 'not_configured' | 'error';
  latencyMs: number | null;
  remoteProductsCount: number | null;
  remoteConfigFound: boolean | null;
  localProductsCount: number;
  errorMessage: string | null;
  lastChecked: string | null;
}

export const SupabaseDiagnosticStatus: React.FC = () => {
  const [diag, setDiag] = useState<DiagnosticState>({
    status: 'checking',
    latencyMs: null,
    remoteProductsCount: null,
    remoteConfigFound: null,
    localProductsCount: 0,
    errorMessage: null,
    lastChecked: null,
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const runDiagnostic = useCallback(async () => {
    setDiag((prev) => ({ ...prev, status: 'checking', errorMessage: null }));
    const startTime = performance.now();
    const localProds = getSavedProductsFromStorage() || [];
    const nowTimeStr = new Date().toLocaleTimeString('pt-BR');

    if (!isSupabaseConfigured || !supabase) {
      setDiag({
        status: 'not_configured',
        latencyMs: null,
        remoteProductsCount: null,
        remoteConfigFound: null,
        localProductsCount: localProds.length,
        errorMessage: 'Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas nas variáveis de ambiente do navegador.',
        lastChecked: nowTimeStr,
      });
      return;
    }

    try {
      // Teste 1: Buscar contagem de produtos na tabela 'produtos'
      const { count: prodCount, error: prodErr } = await (supabase.from('produtos') as any)
        .select('*', { count: 'exact', head: true });

      if (prodErr) {
        throw new Error(`Erro na tabela 'produtos': ${prodErr.message} (código ${prodErr.code || 'desconhecido'})`);
      }

      // Teste 2: Buscar configuração na tabela 'configuracoes'
      const { data: configData, error: configErr } = await (supabase.from('configuracoes') as any)
        .select('id')
        .limit(1);

      if (configErr) {
        throw new Error(`Erro na tabela 'configuracoes': ${configErr.message}`);
      }

      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      setDiag({
        status: 'connected',
        latencyMs: latency,
        remoteProductsCount: prodCount ?? 0,
        remoteConfigFound: Boolean(configData && configData.length > 0),
        localProductsCount: localProds.length,
        errorMessage: null,
        lastChecked: nowTimeStr,
      });
    } catch (err: any) {
      const endTime = performance.now();
      setDiag({
        status: 'error',
        latencyMs: Math.round(endTime - startTime),
        remoteProductsCount: null,
        remoteConfigFound: null,
        localProductsCount: localProds.length,
        errorMessage: err?.message || 'Falha na resposta do servidor Supabase.',
        lastChecked: nowTimeStr,
      });
    }
  }, []);

  useEffect(() => {
    runDiagnostic();
  }, [runDiagnostic]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const result = await syncBackupWithSupabase();
    setIsSyncing(false);
    if (result.success) {
      setSyncFeedback(`✅ Sincronizado com sucesso! ${result.syncedProductsCount} produto(s) atualizados.`);
      runDiagnostic(); // Re-testa a conexão imediatamente
    } else {
      setSyncFeedback(`❌ Falha na sincronização: ${result.message}`);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-lg space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-800 text-emerald-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
               Diagnóstico de Conexão com o Supabase
              {diag.lastChecked && (
                <span className="text-3xs font-normal text-slate-400">
                  (Checado às {diag.lastChecked})
                </span>
              )}
            </h4>
            <p className="text-2xs text-slate-400 mt-0.5">
              Verifica se o navegador está conectado diretamente ao banco de dados na nuvem ou usando cache local.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runDiagnostic}
            disabled={diag.status === 'checking'}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-2xs border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Re-testar conexão com o Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${diag.status === 'checking' ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{diag.status === 'checking' ? 'Testando...' : 'Testar Conexão'}</span>
          </button>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-lg bg-[#E85D75] hover:bg-[#d44860] text-white font-bold text-2xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Forçar envio do backup local para o Supabase e sincronização"
          >
            <Wifi className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
          </button>
        </div>
      </div>

      {/* Main Diagnostic Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Status Card 1: Status da Conexão */}
        <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
          diag.status === 'connected'
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
            : diag.status === 'not_configured'
            ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
            : diag.status === 'error'
            ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            : 'bg-slate-800/50 border-slate-700 text-slate-300'
        }`}>
          {diag.status === 'connected' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {diag.status === 'not_configured' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
          {diag.status === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {diag.status === 'checking' && <RefreshCw className="w-5 h-5 text-slate-400 animate-spin shrink-0 mt-0.5" />}

          <div className="space-y-1">
            <span className="text-3xs uppercase tracking-wider font-extrabold opacity-75 block">Status de Conexão</span>
            <div className="font-bold text-xs">
              {diag.status === 'connected' && '🟢 Nuvem Ativa & Online'}
              {diag.status === 'not_configured' && '🟡 Não Configurado no Vercel'}
              {diag.status === 'error' && '🔴 Erro ao Conectar'}
              {diag.status === 'checking' && '⏳ Testando latência...'}
            </div>
            {diag.latencyMs !== null && (
              <p className="text-3xs text-slate-400 font-mono">
                Latência do ping: {diag.latencyMs}ms
              </p>
            )}
          </div>
        </div>

        {/* Status Card 2: Produtos na Nuvem (Supabase) */}
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-200 flex items-start gap-2.5">
          <Server className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-3xs uppercase tracking-wider font-extrabold text-slate-400 block">Supabase (Nuvem)</span>
            <div className="font-bold text-xs text-slate-100">
              {diag.remoteProductsCount !== null ? `${diag.remoteProductsCount} produtos salvos` : 'Nenhum dado recebido'}
            </div>
            <p className="text-3xs text-slate-400">
              {diag.remoteConfigFound ? '✓ Configurações da loja sincronizadas' : '⚠️ Usando config padrão local'}
            </p>
          </div>
        </div>

        {/* Status Card 3: Cache do Navegador Local */}
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-200 flex items-start gap-2.5">
          <HardDrive className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-3xs uppercase tracking-wider font-extrabold text-slate-400 block">Cache do Navegador</span>
            <div className="font-bold text-xs text-slate-100">
              {diag.localProductsCount} produtos em memória local
            </div>
            <p className="text-3xs text-slate-400">
              Sempre atualizado para permitir uso offline
            </p>
          </div>
        </div>
      </div>

      {/* Message / Error Details / Explanations */}
      {diag.status === 'not_configured' && (
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-200 text-2xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Como ativar a sincronização em tempo real para todos os clientes:</span>
          </div>
          <p className="leading-relaxed opacity-90">
            Adicione <code className="bg-amber-900/60 px-1 py-0.5 rounded text-amber-200">VITE_SUPABASE_URL</code> e <code className="bg-amber-900/60 px-1 py-0.5 rounded text-amber-200">VITE_SUPABASE_ANON_KEY</code> nas configurações de <strong>Environment Variables</strong> no seu projeto do Vercel e clique em <strong>Redeploy</strong>.
          </p>
        </div>
      )}

      {diag.status === 'error' && diag.errorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-2xs space-y-1">
          <span className="font-bold text-rose-300 block">Detalhes da falha de comunicação:</span>
          <code className="block p-2 rounded bg-slate-950 text-rose-400 font-mono text-3xs break-all leading-normal border border-rose-900/40">
            {diag.errorMessage}
          </code>
        </div>
      )}

      {syncFeedback && (
        <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-emerald-300 text-2xs font-bold shadow-inner">
          {syncFeedback}
        </div>
      )}
    </div>
  );
};
