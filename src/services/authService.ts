import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { rateLimiter, RATE_LIMIT_PRESETS } from '../lib/rateLimiter';

export interface AuthStateResponse {
  user: User | null;
  session: Session | null;
  error?: string;
}

function translateAuthError(errorMsg?: string): string {
  if (!errorMsg) return 'Ocorreu um erro ao processar a autenticação.';
  const lower = errorMsg.toLowerCase();
  
  if (lower.includes('email not confirmed')) {
    return 'E-mail não confirmado! Por favor, verifique sua caixa de entrada e spam para clicar no link de confirmação enviado pelo Supabase, ou desative a opção "Confirm email" no painel do Supabase (Authentication > Settings > Email).';
  }
  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
    return 'E-mail ou senha incorretos. Por favor, verifique seus dados.';
  }
  if (lower.includes('user already registered') || lower.includes('user_already_exists')) {
    return 'Este e-mail já está cadastrado no sistema. Tente realizar o login ou recupere sua senha.';
  }
  if (lower.includes('email rate limit exceeded') || lower.includes('rate limit')) {
    return 'Muitas solicitações recentes. Por favor, aguarde alguns minutos e tente novamente.';
  }
  if (lower.includes('password should be at least')) {
    return 'A senha deve conter no mínimo 6 caracteres.';
  }
  return errorMsg;
}

export const authService = {
  /**
   * Verifica se já existe ao menos um usuário administrador cadastrado no Supabase
   */
  async hasAdminUser(): Promise<boolean> {
    // 1. Verificação rápida em localStorage
    if (localStorage.getItem('docemundo_has_admin') === 'true') {
      return true;
    }

    if (!isSupabaseConfigured || !supabase) {
      return localStorage.getItem('docemundo_has_admin') === 'true';
    }

    try {
      // 2. Se houver uma sessão ativa de usuário no Supabase Auth, o admin existe
      const session = await this.getSession();
      if (session?.user) {
        localStorage.setItem('docemundo_has_admin', 'true');
        return true;
      }

      // 3. Consulta se existe algum registro na tabela 'usuarios'
      const { count, error } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact' });

      if (!error && count !== null && count > 0) {
        localStorage.setItem('docemundo_has_admin', 'true');
        return true;
      }

      // 4. Se a consulta em 'usuarios' não retornou registros ou houve restrição de RLS,
      // verifica se a tabela 'configuracoes' já foi criada e populada
      const { data: configData, error: configError } = await supabase
        .from('configuracoes')
        .select('id')
        .limit(1);

      if (!configError && configData && configData.length > 0) {
        localStorage.setItem('docemundo_has_admin', 'true');
        return true;
      }

      // 5. Se houve erro ao consultar a tabela 'usuarios' e 'configuracoes',
      // assumimos que o sistema já está em produção com admin por segurança (exibe tela de Login)
      if (error && configError) {
        console.warn('Erro ao consultar Supabase Auth/Tabelas:', error.message || configError.message);
        return true;
      }

      // Se todas as checagens retornarem confirmadamente vazio:
      return false;
    } catch (err) {
      console.warn('Exceção ao verificar admin no Supabase:', err);
      // Em caso de falha de conexão, prioriza a tela de login para segurança do sistema
      return true;
    }
  },

  /**
   * Registra o primeiro usuário Administrador no Supabase Auth e na tabela 'usuarios'
   */
  async signUpInitialAdmin(
    fullName: string,
    email: string,
    password: string
  ): Promise<AuthStateResponse> {
    const rateCheck = rateLimiter.recordAttempt('signup_admin', RATE_LIMIT_PRESETS.signUp);
    if (!rateCheck.allowed) {
      return { user: null, session: null, error: rateCheck.errorMessage };
    }

    if (!isSupabaseConfigured || !supabase) {
      localStorage.setItem('docemundo_has_admin', 'true');
      const localUser = {
        id: 'local-admin-id',
        email,
        user_metadata: { full_name: fullName, role: 'admin' },
      } as unknown as User;
      return { user: localUser, session: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'admin',
          },
        },
      });

      if (error) {
        return { user: null, session: null, error: translateAuthError(error.message) };
      }

      if (data.user) {
        // Tenta salvar na tabela 'usuarios'
        await (supabase.from('usuarios') as any).upsert({
          id: data.user.id,
          email: data.user.email || email,
          full_name: fullName,
          role: 'admin',
          updated_at: new Date().toISOString(),
        });

        localStorage.setItem('docemundo_has_admin', 'true');
      }

      return { user: data.user, session: data.session };
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? translateAuthError(err.message) : 'Erro ao cadastrar administrador no Supabase';
      return { user: null, session: null, error: errorMsg };
    }
  },

  /**
   * Realiza login por E-mail e Senha no Supabase Auth com proteção de Rate Limit
   */
  async loginWithEmail(email: string, password: string): Promise<AuthStateResponse> {
    const rateKey = `login_${email.toLowerCase().trim() || 'ip'}`;
    const rateCheck = rateLimiter.check(rateKey, RATE_LIMIT_PRESETS.login);
    
    if (!rateCheck.allowed) {
      return { user: null, session: null, error: rateCheck.errorMessage };
    }

    // Registra a tentativa antes de chamar o Supabase
    rateLimiter.recordAttempt(rateKey, RATE_LIMIT_PRESETS.login);

    if (!isSupabaseConfigured || !supabase) {
      return { user: null, session: null, error: 'O cliente do Supabase não está configurado.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, session: null, error: translateAuthError(error.message) };
      }

      // Se o login for bem-sucedido, limpamos o contador de falhas desse e-mail
      rateLimiter.reset(rateKey);

      return { user: data.user, session: data.session };
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? translateAuthError(err.message) : 'Erro ao realizar login no Supabase';
      return { user: null, session: null, error: errorMsg };
    }
  },

  /**
   * Reenvia e-mail de confirmação de cadastro
   */
  async resendConfirmationEmail(email: string): Promise<{ success: boolean; message: string }> {
    const rateKey = `resend_${email.toLowerCase().trim()}`;
    const rateCheck = rateLimiter.recordAttempt(rateKey, RATE_LIMIT_PRESETS.resendEmail);
    if (!rateCheck.allowed) {
      return { success: false, message: rateCheck.errorMessage || 'Muitas solicitações recentes.' };
    }

    if (!isSupabaseConfigured || !supabase) {
      return { success: false, message: 'Supabase não está configurado.' };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        return { success: false, message: translateAuthError(error.message) };
      }

      return {
        success: true,
        message: 'E-mail de confirmação reenviado com sucesso! Por favor, verifique sua caixa de entrada e spam.',
      };
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? translateAuthError(err.message) : 'Erro ao reenviar e-mail de confirmação.',
      };
    }
  },

  /**
   * Encerra a sessão do usuário
   */
  async logout(): Promise<{ error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return {};
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) return { error: error.message };
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Erro ao fazer logout' };
    }
  },

  /**
   * Obtém a sessão atual ativa
   */
  async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch {
      return null;
    }
  },

  /**
   * Obtém os dados do usuário atualmente autenticado
   */
  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch {
      return null;
    }
  },

  /**
   * Envia e-mail de recuperação de senha com proteção de Rate Limit
   */
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    const rateKey = `pwd_reset_${email.toLowerCase().trim()}`;
    const rateCheck = rateLimiter.recordAttempt(rateKey, RATE_LIMIT_PRESETS.passwordReset);
    if (!rateCheck.allowed) {
      return { success: false, message: rateCheck.errorMessage || 'Muitas tentativas de recuperação de senha.' };
    }

    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: 'Cliente do Supabase não configurado.',
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return {
        success: true,
        message: 'E-mail de recuperação de senha enviado com sucesso!',
      };
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Erro ao solicitar redefinição de senha',
      };
    }
  },

  /**
   * Atualiza a senha do usuário
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: 'Cliente do Supabase não configurado.',
      };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Senha redefinida com sucesso no Supabase!' };
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Erro ao atualizar senha',
      };
    }
  },

  /**
   * Registra listener para mudanças na autenticação
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    if (!isSupabaseConfigured || !supabase) {
      return { unsubscribe: () => {} };
    }

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return { unsubscribe: () => data.subscription.unsubscribe() };
  },
};

