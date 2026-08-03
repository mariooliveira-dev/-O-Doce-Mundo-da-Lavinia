-- ==============================================================================
-- SCHEMA SUPABASE PARA O DOCE MUNDO DA LAVÍNIA
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

-- Garantir adição da coluna available caso a tabela já tenha sido criada anteriormente
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
-- ROW LEVEL SECURITY (RLS) & POLÍTICAS DE SEGURANÇA
-- ==============================================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: Acesso total (Leitura e Escrita públicas / anon / autenticados)
DROP POLICY IF EXISTS "Leitura pública de categorias" ON public.categorias;
DROP POLICY IF EXISTS "Escrita de categorias apenas autenticados" ON public.categorias;
DROP POLICY IF EXISTS "Acesso total categorias" ON public.categorias;
CREATE POLICY "Acesso total categorias" ON public.categorias FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Leitura pública de produtos" ON public.produtos;
DROP POLICY IF EXISTS "Escrita de produtos apenas autenticados" ON public.produtos;
DROP POLICY IF EXISTS "Acesso total produtos" ON public.produtos;
CREATE POLICY "Acesso total produtos" ON public.produtos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Leitura pública de configuracoes" ON public.configuracoes;
DROP POLICY IF EXISTS "Escrita de configuracoes apenas autenticados" ON public.configuracoes;
DROP POLICY IF EXISTS "Acesso total configuracoes" ON public.configuracoes;
CREATE POLICY "Acesso total configuracoes" ON public.configuracoes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Leitura pública de banners" ON public.banners;
DROP POLICY IF EXISTS "Escrita de banners apenas autenticados" ON public.banners;
DROP POLICY IF EXISTS "Acesso total banners" ON public.banners;
CREATE POLICY "Acesso total banners" ON public.banners FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Inserção pública de contatos" ON public.contatos;
DROP POLICY IF EXISTS "Leitura/Escrita de contatos apenas autenticados" ON public.contatos;
DROP POLICY IF EXISTS "Acesso total contatos" ON public.contatos;
CREATE POLICY "Acesso total contatos" ON public.contatos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso de usuários apenas autenticados" ON public.usuarios;
DROP POLICY IF EXISTS "Acesso total usuarios" ON public.usuarios;
CREATE POLICY "Acesso total usuarios" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);


-- ==============================================================================
-- STORAGE BUCKETS & RLS POLICIES (IMAGENS)
-- ==============================================================================

-- Criar buckets se não existirem
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true),
       ('produtos', 'produtos', true),
       ('banners', 'banners', true),
       ('logo', 'logo', true),
       ('empresa', 'empresa', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Limpar políticas antigas de storage
DROP POLICY IF EXISTS "Acesso Público às Imagens" ON storage.objects;
DROP POLICY IF EXISTS "Upload Autenticado de Imagens" ON storage.objects;
DROP POLICY IF EXISTS "Atualização/Exclusão Autenticada de Imagens" ON storage.objects;
DROP POLICY IF EXISTS "Acesso Total Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Select Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Storage" ON storage.objects;

-- Criar políticas públicas completas para os buckets da aplicação
CREATE POLICY "Public Select Storage" ON storage.objects FOR SELECT USING (bucket_id IN ('images', 'produtos', 'banners', 'logo', 'empresa'));
CREATE POLICY "Public Insert Storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('images', 'produtos', 'banners', 'logo', 'empresa'));
CREATE POLICY "Public Update Storage" ON storage.objects FOR UPDATE USING (bucket_id IN ('images', 'produtos', 'banners', 'logo', 'empresa')) WITH CHECK (bucket_id IN ('images', 'produtos', 'banners', 'logo', 'empresa'));
CREATE POLICY "Public Delete Storage" ON storage.objects FOR DELETE USING (bucket_id IN ('images', 'produtos', 'banners', 'logo', 'empresa'));


-- ==============================================================================
-- DADOS INICIAIS (SEED DATA)
-- ==============================================================================

-- 1. Categorias Iniciais
INSERT INTO public.categorias (name, slug, description, display_order) VALUES
('Todos os Doces', 'todos', 'Ver cardápio completo', 1),
('Bolos & Bentô Cakes', 'bolos', 'Bolos artesanais, bentô cakes e vulcões', 2),
('Cupcakes Gourmet', 'cupcakes', 'Cupcakes fofinhos e recheados', 3),
('Docinhos de Festa', 'docinhos', 'Brigadeiros e doces para festas', 4),
('Copos da Felicidade', 'copos', 'Sobremesas geladas em camadas', 5),
('Kits Festa Mágicos', 'kits', 'Combos completos para comemorações', 6)
ON CONFLICT (slug) DO NOTHING;

-- 2. Configurações Padrão do Site
INSERT INTO public.configuracoes (
    id, phone_display, phone_raw, profile_image, profile_bio_1, profile_bio_2, profile_bio_3, founder_name, founder_title, logo_url, logo_slogan
) VALUES (
    'main_config',
    '+55 73 9952-7100',
    '557399527100',
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    'Oi, me chamo Lavínia Aguiar, faço vários bolinhos para a minha família e de um tempo pra cá nasceu uma vontade no meu coração de começar a fazer meus bolos para vocês também. Este espaço nasceu de um sonho que Deus colocou no meu coração.',
    'Cada bolo é preparado como se fosse para a minha própria família: com ingredientes de qualidade, muito capricho e aquele gostinho de casa que aquece o coração. 🥰',
    'Estou muito feliz por ter você aqui! Espero fazer parte dos seus momentos especiais e levar um pedacinho de felicidade até a sua mesa.',
    'Lavínia Aguiar',
    'Fundadora & Confeiteira',
    '',
    'Feito com amor, assado com carinho e servido com gratidão'
) ON CONFLICT (id) DO NOTHING;

-- 3. Produtos Iniciais do Cardápio
INSERT INTO public.produtos (id, category, name, description, price, image, badge, rating, review_count, customizable, options) VALUES
('bento-cake-frases', 'bolos', 'Bentô Cake Personalizado', 'Bolo de aproximadamente 300g com massa fofinha, recheio cremoso e desenho / frase divertida personalizada no topo.', 45.00, 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80', 'Mais Pedido 🏆', 5.0, 48, true, '{"flavors": ["Chocolatudo", "Ninho com Morango", "Doce de Leite", "Red Velvet"], "fillings": ["Brigadeiro Gourmet", "Ninho com Nutella", "Beijinho Cremoso"]}'),
('bolo-vulcão-ninho-nutella', 'bolos', 'Bolo Vulcão Ninho com Nutella', 'Massa super macia com uma avalanche generosa de calda cremosa de Leite Ninho e Nutella pura.', 75.00, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', 'Favorito ❤️', 4.9, 36, true, '{"sizes": [{"name": "Padrão (1.2kg)", "extraPrice": 0}, {"name": "Giga (2.0kg)", "extraPrice": 35}]}'),
('cupcake-kit-4', 'cupcakes', 'Box Cupcakes Gourmet (4 Unidades)', 'Caixinha especial para presente com 4 cupcakes recheados e decorados artesanalmente com cereja e confeitos.', 38.00, 'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=800&q=80', 'Super Fofo 🍓', 5.0, 52, true, '{"flavors": ["Morango com Chantilly", "Choco-Nutella", "Red Velvet", "Doce de Leite com Nozes"]}'),
('cupcake-red-velvet', 'cupcakes', 'Cupcake Red Velvet Especial', 'Massa aveludada vermelha com um suave recheio de Cream Cheese e decorado com confeitos fofos.', 11.50, 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=800&q=80', NULL, 4.8, 29, false, NULL),
('box-brigadeiros-gourmet', 'docinhos', 'Caixa Degustação Docinhos Gourmet (12un)', 'Seleção dos nossos docinhos de festa artesanais: Brigadeiro 50%, Beijinho, Bicho de Pé e Ninho com Nutella.', 32.00, 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80', 'Docinhos da Lavínia ✨', 5.0, 64, false, NULL),
('cento-docinhos-festa', 'docinhos', 'Cento de Docinhos Tradicionais (100un)', 'Perfeito para festas e aniversários! Escolha até 4 sabores feitos artesanalmente com ingredientes selecionados.', 130.00, 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=800&q=80', 'Para Festas 🎉', 4.9, 41, true, NULL),
('copo-felicidade-morango', 'copos', 'Copo da Felicidade Ninho com Morango', 'Camadas generosas de brigadeiro gourmet de Ninho, morangos frescos picados, pedaços de brownie e ganache.', 24.00, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80', 'Delícia do Dia 🍧', 4.9, 38, false, NULL),
('copo-felicidade-brownie', 'copos', 'Copo da Felicidade Choco-Brownie', 'Copo recheado com cubos de brownie molhadinho, brigadeiro belga cremoso e confeitos crocantes.', 24.00, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', NULL, 5.0, 22, false, NULL),
('kit-festa-mesversario', 'kits', 'Kit Mesversário / Aniversário Mágico', 'Inclui 1 Bento Cake personalizado + 4 Cupcakes decorados + 25 Docinhos artesanais sortidos.', 145.00, 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80', 'Kit Completo 🎈', 5.0, 77, true, NULL),
('kit-festa-piscina', 'kits', 'Kit Festa Galera (Até 10 pessoas)', 'Inclui 1 Bolo Vulcão de 1.5kg + 50 Docinhos sortidos + 6 Cupcakes recheados.', 195.00, 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80', NULL, 4.9, 19, true, NULL)
ON CONFLICT (id) DO NOTHING;
