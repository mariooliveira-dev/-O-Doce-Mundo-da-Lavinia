import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Rate limiting para mitigar ataques DoS / Brute-Force
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Muitas requisições originadas deste IP. Tente novamente mais tarde.' },
});

const authUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 15, // limite restrito de 15 chamadas sensíveis
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Muitas tentativas em rotas sensíveis. Aguarde 15 minutos.' },
});

app.use('/api', apiLimiter);
app.use('/api/admin/login', authUploadLimiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Set up persistent data file path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial default site configuration
const DEFAULT_SITE_CONFIG = {
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

// Initial default products
const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Vulcão Ninho com Nutella',
    category: 'vulcao',
    description: 'Massa fofinha de baunilha recheada e coberta com bastante creme de Leite Ninho e um vulcão generoso de Nutella pura.',
    price: 65.00,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    badge: 'Mais Pedido 🔥',
    rating: 5.0,
    reviewCount: 48,
    customizable: true,
    available: true,
    options: {
      flavors: ['Massa de Baunilha', 'Massa de Chocolate', 'Massa Mesclada'],
      fillings: ['Ninho com Nutella', 'Brigadeiro Gourmet', 'Doce de Leite com Nozes'],
      toppings: ['Morangos Frescos', 'Granulado Belga', 'Raspas de Chocolate', 'Sem Topping Extra']
    }
  },
  {
    id: 'prod-2',
    name: 'Vulcão de Brigadeiro Belga',
    category: 'vulcao',
    description: 'Para os chocólatras! Massa de cacau 50% coberta com vulcão de brigadeiro cremoso gourmet e finalizada com granulado nobre.',
    price: 60.00,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    badge: 'Chocolatudo 🍫',
    rating: 4.9,
    reviewCount: 36,
    customizable: true,
    available: true,
    options: {
      flavors: ['Massa de Cacau 50%', 'Massa de Cacau 100% Intenso'],
      fillings: ['Brigadeiro Gourmet', 'Brigadeiro Amargo', 'Preto e Branco'],
      toppings: ['Granulado Belga', 'Morangos', 'Confetes', 'KitKat']
    }
  },
  {
    id: 'prod-3',
    name: 'Bolo de Cenoura com Cobertura de Brigadeiro',
    category: 'com_cobertura',
    description: 'O clássico irresistível! Bolo de cenoura fofinho com aquela casquinha/cobertura cremosa e generosa de brigadeiro quentinho.',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
    badge: 'Clássico Caseiro 🥕',
    rating: 5.0,
    reviewCount: 52,
    customizable: true,
    available: true,
    options: {
      flavors: ['Massa Tradicional de Cenoura'],
      fillings: ['Brigadeiro de Colher', 'Nutella Extra'],
      toppings: ['Granulado Nobre', 'Sem Granulado']
    }
  },
  {
    id: 'prod-4',
    name: 'Bolo de Piscina (Ballerine) de Red Velvet',
    category: 'piscina',
    description: 'Massa veludo vermelho aveludada no formato piscina, repleta de mousse suave de cream cheese e geleia artesanal de frutas vermelhas.',
    price: 58.00,
    image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=800&q=80',
    badge: 'Sofisticado 🍓',
    rating: 4.8,
    reviewCount: 29,
    customizable: true,
    available: true,
    options: {
      flavors: ['Massa Red Velvet'],
      fillings: ['Cream Cheese com Frutas Vermelhas', 'Ninho Cremoso'],
      toppings: ['Frutas Vermelhas Frescas', 'Morango e Mirtilo']
    }
  },
  {
    id: 'prod-5',
    name: 'Bolo de Limão Siciliano com Merengue',
    category: 'com_cobertura',
    description: 'Massa leve aromática com raspas de limão siciliano, recheio cítrico cremoso e cobertura de merengue suíço maçaricado.',
    price: 52.00,
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
    badge: 'Refrescante 🍋',
    rating: 4.9,
    reviewCount: 21,
    customizable: false,
    available: true
  },
  {
    id: 'prod-6',
    name: 'Bolo Tradicional de Fubá com Goiabada',
    category: 'tradicionais',
    description: 'Aquele bolo com gosto de casa da vovó. Fubá mimoso com pedaços macios e generosos de goiabada derretida na massa.',
    price: 35.00,
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
    badge: 'Afeto de Vovó 👵',
    rating: 5.0,
    reviewCount: 40,
    customizable: false,
    available: true
  }
];

// Helper to read database
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialDb = {
        config: DEFAULT_SITE_CONFIG,
        products: DEFAULT_PRODUCTS,
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const db = JSON.parse(raw);
    if (!db.config) db.config = DEFAULT_SITE_CONFIG;
    if (!db.products || !Array.isArray(db.products)) db.products = DEFAULT_PRODUCTS;
    return db;
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { config: DEFAULT_SITE_CONFIG, products: DEFAULT_PRODUCTS };
  }
}

// Helper to write database
function writeDb(data: { config?: any; products?: any }) {
  try {
    const current = readDb();
    const updated = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('Error writing db.json:', err);
    throw err;
  }
}

// Ensure initial database exists on startup
readDb();

// --- API ROUTES ---

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// GET Site Config
app.get('/api/config', (_req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.config });
});

// POST / UPDATE Site Config
app.post('/api/config', (req, res) => {
  try {
    const newConfig = req.body;
    if (!newConfig || typeof newConfig !== 'object') {
      res.status(400).json({ success: false, error: 'Configuração inválida' });
      return;
    }
    const db = readDb();
    const mergedConfig = { ...db.config, ...newConfig };
    writeDb({ config: mergedConfig });
    res.json({ success: true, data: mergedConfig });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Erro ao salvar configuração' });
  }
});

// GET Products
app.get('/api/products', (_req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.products });
});

// POST Batch/Replace or Create Product
app.post('/api/products', (req, res) => {
  try {
    const body = req.body;
    
    // If array passed, replace all products (batch update/reorder)
    if (Array.isArray(body)) {
      writeDb({ products: body });
      res.json({ success: true, data: body });
      return;
    }

    // Otherwise single product insert/update
    if (!body || !body.name) {
      res.status(400).json({ success: false, error: 'Dados do produto inválidos' });
      return;
    }

    const db = readDb();
    const existingIndex = db.products.findIndex((p: any) => p.id === body.id);
    let updatedProducts = [...db.products];

    if (existingIndex >= 0) {
      updatedProducts[existingIndex] = { ...updatedProducts[existingIndex], ...body };
    } else {
      const newProduct = {
        ...body,
        id: body.id || `prod-${Date.now()}`,
        rating: body.rating || 5.0,
        reviewCount: body.reviewCount || 1,
        available: body.available !== false,
      };
      updatedProducts.push(newProduct);
    }

    writeDb({ products: updatedProducts });
    res.json({ success: true, data: updatedProducts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Erro ao salvar produto' });
  }
});

// PUT or POST Single Product Update
const handleProductUpdate = (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = readDb();

    const existingIndex = db.products.findIndex((p: any) => String(p.id) === String(id));
    if (existingIndex === -1) {
      // If product doesn't exist yet, insert it
      const newProduct = { ...updates, id };
      db.products.push(newProduct);
      writeDb({ products: db.products });
      res.json({ success: true, data: newProduct });
      return;
    }

    const updatedProducts = [...db.products];
    updatedProducts[existingIndex] = { ...updatedProducts[existingIndex], ...updates };

    writeDb({ products: updatedProducts });
    res.json({ success: true, data: updatedProducts[existingIndex] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Erro ao atualizar produto' });
  }
};

app.put('/api/products/:id', handleProductUpdate);
app.post('/api/products/:id', handleProductUpdate);

// DELETE Single Product
app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDb();
    const updatedProducts = db.products.filter((p: any) => String(p.id) !== String(id));
    writeDb({ products: updatedProducts });
    res.json({ success: true, data: updatedProducts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Erro ao deletar produto' });
  }
});

// POST Reset Products to Defaults
app.post('/api/products/reset', (_req, res) => {
  try {
    writeDb({ products: DEFAULT_PRODUCTS });
    res.json({ success: true, data: DEFAULT_PRODUCTS });
  } catch (err: any) {
    console.error('Erro ao restaurar produtos:', err);
    res.status(500).json({ success: false, error: 'Ocorreu um erro interno ao processar a requisição.' });
  }
});

// POST Upload Image (Base64 or file endpoint)
app.post('/api/upload', (req, res) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      res.status(400).json({ success: false, error: 'Imagem em base64 não fornecida' });
      return;
    }

    // Match base64 regex
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // If it's already a URL, return as is
      if (typeof imageBase64 === 'string' && imageBase64.startsWith('http')) {
        res.json({ success: true, url: imageBase64 });
        return;
      }
      res.status(400).json({ success: false, error: 'Formato de base64 inválido' });
      return;
    }

    const extMatch = matches[1].split('/')[1] || 'png';
    const cleanExt = extMatch.replace('jpeg', 'jpg');
    const buffer = Buffer.from(matches[2], 'base64');
    const safeFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${cleanExt}`;
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeFilename}`;
    res.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('Erro ao salvar imagem no servidor:', err);
    res.status(500).json({ success: false, error: 'Erro interno ao processar o upload da imagem.' });
  }
});

// Serve static uploaded files
app.use('/uploads', express.static(UPLOADS_DIR));

// --- VITE MIDDLEWARE / SPA FALLBACK ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const isDisableHmr = process.env.DISABLE_HMR === 'true' || true;
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isDisableHmr ? false : undefined,
        ws: isDisableHmr ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
