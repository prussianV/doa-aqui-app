// Tradução dos erros do Supabase (Auth, PostgREST e PostgreSQL) para mensagens compreensíveis (RNF-005).

type ErroBruto = { message?: string; code?: string; status?: number; name?: string } | null | undefined;

export class ErroApp extends Error {
  constructor(mensagem: string, readonly codigo?: string) {
    super(mensagem);
    this.name = 'ErroApp';
  }
}

export function traduzirErro(e: ErroBruto, contexto?: 'interesse' | 'anuncio' | 'auth'): ErroApp {
  if (e instanceof ErroApp) return e;
  const msg = e?.message ?? '';
  const codigo = e?.code;

  // Rede indisponível ou servidor fora do ar
  if (/network|fetch|Failed to fetch|NetworkError|timeout/i.test(msg)) {
    return new ErroApp('Sem conexão com o servidor. Verifique sua internet e tente de novo.', 'rede');
  }

  // Supabase Auth
  if (/invalid login credentials/i.test(msg)) return new ErroApp('E-mail ou senha incorretos.', codigo);
  if (/email not confirmed/i.test(msg)) return new ErroApp('Confirme seu e-mail pelo link que enviamos antes de entrar.', codigo);
  if (/already registered|already been registered|user_already_exists/i.test(msg) || codigo === 'user_already_exists') {
    return new ErroApp('Este e-mail já tem cadastro. Entre com sua senha.', codigo); // RN-01
  }
  if (/password should be at least|weak_password/i.test(msg)) return new ErroApp('Escolha uma senha mais forte, com pelo menos 8 caracteres.', codigo);
  if (/email address .* is invalid|invalid email/i.test(msg)) return new ErroApp('Este e-mail não é válido.', codigo);
  if (/not authorized/i.test(msg) && contexto === 'auth') {
    return new ErroApp('O servidor não conseguiu enviar o e-mail. Avise a equipe do Doa Aqui.', codigo);
  }
  if (/should be different|same_password/i.test(msg) || codigo === 'same_password') return new ErroApp('A nova senha precisa ser diferente da atual.', codigo);
  if (/reauthentication/i.test(msg)) return new ErroApp('Por segurança, saia e entre de novo antes de trocar a senha.', codigo);
  if (/auth session missing|session_not_found|refresh token/i.test(msg)) return new ErroApp('Sua sessão expirou. Entre de novo ou peça um novo link.', codigo);
  if (/email rate limit/i.test(msg)) return new ErroApp('O limite de envio de e-mails foi atingido. Tente de novo mais tarde.', codigo);
  if (/rate limit|too many requests/i.test(msg)) return new ErroApp('Muitas tentativas seguidas. Aguarde um minuto e tente de novo.', codigo);

  // PostgreSQL
  if (codigo === '23505') {
    return new ErroApp(contexto === 'interesse' ? 'Você já demonstrou interesse neste item.' : 'Este registro já existe.', codigo); // RN-04
  }
  if (codigo === '42501') {
    if (contexto === 'interesse') return new ErroApp('Este anúncio não aceita mais interesse.', codigo); // RN-03
    return new ErroApp(msg && !/row-level security|permission denied/i.test(msg) ? msg : 'Você não tem permissão para fazer isso.', codigo);
  }
  if (codigo === '23514') return new ErroApp('Algum campo está fora do formato esperado. Revise e tente de novo.', codigo);
  if (codigo === 'P0001' || codigo === 'P0002' || codigo === '22023') return new ErroApp(msg, codigo);
  if (codigo === 'PGRST116') return new ErroApp('Não encontramos este registro.', codigo);

  return new ErroApp('Algo deu errado. Tente de novo em instantes.', codigo);
}
