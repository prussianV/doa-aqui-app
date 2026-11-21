// Cliente do Supabase: única porta de saída do app para o backend (Auth + PostgreSQL via API).
// A chave usada é a pública (publishable). O que cada pessoa pode ler ou alterar é decidido
// pelas políticas RLS do banco (supabase/migrations), não por esta chave.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL } from '@/config';

export const supabase = createClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
  auth: {
    // A sessão fica guardada no aparelho (AsyncStorage) e é renovada automaticamente.
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // O link de redefinição de senha é tratado pela tela Nova senha (servicos/autenticacao).
    detectSessionInUrl: false,
  },
});

// Renova o token só enquanto o app está em primeiro plano (recomendação do Supabase para apps nativos).
AppState.addEventListener('change', (estado) => {
  if (estado === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
