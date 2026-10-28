import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://cijoho-waterboom.supabase.co');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'cijoho-anon-key';

const SUPABASE_ADMIN_KEY = import.meta.env.VITE_SUPABASE_ADMIN_KEY || '';

const fallbackClient = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null, count: 0 }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null })
  })
};

const clientCache = new Map();

function getActiveClient() {
  let token = SUPABASE_ANON_KEY;
  if (typeof window !== 'undefined') {
    try {
      const session = JSON.parse(localStorage.getItem('staffSession') || '{}');
      if (session && session.role === 'admin') {
        token = session.token || SUPABASE_ADMIN_KEY || SUPABASE_ANON_KEY;
      }
    } catch (e) {
      // ignore parse error
    }
  }

  if (!clientCache.has(token)) {
    try {
      if (SUPABASE_URL && token) {
        const client = createClient(SUPABASE_URL, token);
        clientCache.set(token, client);
      }
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
    }
  }

  return clientCache.get(token) || fallbackClient;
}

export const supabase = new Proxy({}, {
  get(target, prop) {
    const client = getActiveClient();
    const val = client[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  }
});

// Fungsi keepAlive untuk mencegah idle connection
export const keepAlive = async () => {
  try {
    if (supabase && typeof supabase.from === 'function') {
      const { count, error } = await supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true });

      if (error) {
        console.warn('Keep-alive warning:', error.message);
      } else {
        console.log('Keep-alive ping sukses, count:', count);
      }
    }
  } catch (e) {
    console.warn('Keep-alive failed:', e.message);
  }
};
