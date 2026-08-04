-- ==============================================================================
-- SCHEMA SUPABASE SEGURADO PARA O DOCE MUNDO DA LAVÍNIA
-- Execute este script no SQL Editor do seu Dashboard no Supabase
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS public.produtos (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    image TEXT NOT NULL,
    badge TEXT,
    rating NUMERIC(3,2) DEFAULT 5.0,
    review_count INT DEFAULT 1,
    customizable BOOLEAN DEFAULT false,
    available BOOLEAN DEFAULT true,
    options JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT true;

-- 4. TABELA DE CONFIGURAÇÕES DO SITE (REGISTRO ÚNICO)
CREATE TABLE IF NOT EXISTS public.configuracoes (
    id TEXT PRIMARY KEY DEFAULT 'main_config',
    phone_display TEXT NOT NULL DEFAULT '+55 73 9952-7100',
    phone_raw TEXT NOT NULL DEFAULT '557399527100',
    profile_image TEXT NOT NULL,
    profile_bio_1 TEXT NOT NULL,
    profile_bio_2 TEXT NOT NULL,
    profile_bio_3 TEXT NOT NULL,
    founder_name TEXT NOT NULL DEFAULT 'Lavínia Aguiar',
    founder_title TEXT NOT NULL DEFAULT 'Fundadora & Confeiteira',
    logo_url TEXT DEFAULT '',
    logo_slogan TEXT DEFAULT 'Feito com amor, assado com carinho e servido com gratidão',
    favicon_url TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.configuracoes ADD COLUMN IF NOT EXISTS favicon_url TEXT;

-- 5. TABELA DE BANNERS
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link TEXT,
    active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE CONTATOS / MENSAGENS
CREATE TABLE IF NOT EXISTS public.contatos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & POLÍTICAS DE SEGURANÇA RESTRITAS
-- ==============================================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Remover políticas permissivas antigas
DROP POLICY IF EXISTS "Acesso total categorias" ON public.categorias;
DROP POLICY IF EXISTS "Acesso total produtos" ON public.produtos;
DROP POLICY IF EXISTS "Acesso total configuracoes" ON public.configuracoes;
DROP POLICY IF EXISTS "Acesso total banners" ON public.banners;
DROP POLICY IF EXISTS "Acesso total contatos" ON public.contatos;
DROP POLICY IF EXISTS "Acesso total usuarios" ON public.usuarios;

-- Categorias: Leitura pública, escrita só autenticado
CREATE POLICY "Leitura publica categorias" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "Escrita categorias autenticados" ON public.categorias FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Produtos: Leitura pública, escrita só autenticado
CREATE POLICY "Leitura publica produtos" ON public.produtos FOR SELECT USING (true);
CREATE POLICY "Escrita produtos autenticados" ON public.produtos FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Configuracoes: Leitura pública, escrita só autenticado
CREATE POLICY "Leitura publica configuracoes" ON public.configuracoes FOR SELECT USING (true);
CREATE POLICY "Escrita configuracoes autenticados" ON public.configuracoes FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Banners: Leitura pública, escrita só autenticado
CREATE POLICY "Leitura publica banners" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Escrita banners autenticados" ON public.banners FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Contatos: Inserção pública (visitante envia mensagem), leitura e alteração só autenticado
CREATE POLICY "Insercao publica contatos" ON public.contatos FOR INSERT WITH CHECK (true);
CREATE POLICY "Gestao contatos autenticados" ON public.contatos FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Usuarios: Apenas autenticados
CREATE POLICY "Gestao usuarios autenticados" ON public.usuarios FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ==============================================================================
-- STORAGE BUCKETS & RLS POLICIES (IMAGENS SEGURAS)
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true),
       ('produtos', 'produtos', true),
       ('banners', 'banners', true),
       ('logo', 'logo', true),
       ('empresa', 'empresa', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Acesso Total Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Select Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Storage" ON storage.objects;

-- Leitura pública dos arquivos de imagem
CREATE POLICY "Leitura publica storage" ON storage.objects FOR SELECT USING (bucket_id IN ('images', 'produtos', 'banners', 'logo', 'empresa'));

-- Upload, atualização e deleção apenas para usuários autenticados no Supabase
CREATE POLICY "Upload storage apenas autenticados" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('images', 'produtos', 'banners', 'logo', 'empresa') AND auth.role() = 'authenticated');
CREATE POLICY "Alteracao storage apenas autenticados" ON storage.objects FOR UPDATE USING (bucket_id IN ('images', 'produtos', 'banners', 'logo', 'empresa') AND auth.role() = 'authenticated');
CREATE POLICY "Exclusao storage apenas autenticados" ON storage.objects FOR DELETE USING (bucket_id IN ('images', 'produtos', 'banners', 'logo', 'empresa') AND auth.role() = 'authenticated');
