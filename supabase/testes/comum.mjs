// Utilitários dos testes de autorização: cria clientes do Supabase com o mesmo endereço e a mesma
// chave pública do app (app/src/config.ts) e lê as contas de teste de supabase/testes/.env.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const aqui = fileURLToPath(new URL('.', import.meta.url));
// Usa o @supabase/supabase-js já instalado no app (app/node_modules).
const require = createRequire(new URL('../../app/package.json', import.meta.url));
const { createClient } = require('@supabase/supabase-js');

/** Lê SUPABASE_URL e SUPABASE_CHAVE_PUBLICA do arquivo de configuração do app. */
function lerConfigDoApp() {
  const texto = readFileSync(`${aqui}../../app/src/config.ts`, 'utf8');
  const valor = (nome) => texto.match(new RegExp(`export const ${nome} = '([^']+)'`))?.[1];
  return { SUPABASE_URL: valor('SUPABASE_URL'), SUPABASE_CHAVE_PUBLICA: valor('SUPABASE_CHAVE_PUBLICA') };
}

export function lerEnv() {
  const env = lerConfigDoApp();
  try {
    for (const linha of readFileSync(`${aqui}.env`, 'utf8').split('\n')) {
      const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2];
    }
  } catch {
    // sem .env: só os testes que não precisam de login funcionam
  }
  return { ...env, ...process.env };
}

export const env = lerEnv();

export function cliente() {
  return createClient(env.SUPABASE_URL, env.SUPABASE_CHAVE_PUBLICA, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function logado(email, senha) {
  const sb = cliente();
  const { error } = await sb.auth.signInWithPassword({ email, password: senha });
  if (error) throw new Error(`Login de ${email} falhou: ${error.message}`);
  return sb;
}
