// Serviço de autenticação (RF-001, RF-002): Supabase Auth + perfil em public.usuario.
// Também cuida da troca e da redefinição de senha (funcionalidade adicional pedida pela equipe).
import { LINK_NOVA_SENHA } from '@/config';
import { supabase } from '@/lib/supabase';
import type { Perfil, TipoConta } from '@/negocio/tipos';
import { ErroApp, traduzirErro } from './erros';

/**
 * UC-01: cria a conta no Supabase Auth com nome e tipo nos metadados.
 * Se a sessão já vier aberta (confirmação de e-mail desligada), cria o perfil na hora;
 * caso contrário, o perfil é criado no primeiro login (garantirPerfil).
 */
export async function cadastrar(d: { nome: string; email: string; senha: string; tipo: TipoConta }) {
  const { data, error } = await supabase.auth.signUp({
    email: d.email.trim().toLowerCase(),
    password: d.senha,
    options: { data: { nome: d.nome.trim(), tipo: d.tipo, app: 'doa-aqui' } },
  });
  if (error) throw traduzirErro(error, 'auth');
  // Proteção contra enumeração do Supabase: e-mail já cadastrado volta sem identidades (RN-01).
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new ErroApp('Este e-mail já tem cadastro. Entre com sua senha.', 'user_already_exists');
  }
  if (data.session) {
    await garantirPerfil(d.nome, d.tipo);
    return { precisaConfirmar: false };
  }
  return { precisaConfirmar: true };
}

/** UC-02: entra com e-mail e senha e recusa contas bloqueadas (RF-011). */
export async function entrar(email: string, senha: string): Promise<Perfil> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });
  if (error) throw traduzirErro(error, 'auth');
  const perfil = await garantirPerfil();
  if (perfil.situacao === 'BLOQUEADA') {
    await supabase.auth.signOut();
    throw new ErroApp('Sua conta está bloqueada. Fale com a equipe do Doa Aqui para saber mais.', 'bloqueada');
  }
  return perfil;
}

/** UC-03: encerra a sessão neste aparelho. */
export async function sair() {
  const { error } = await supabase.auth.signOut();
  if (error) throw traduzirErro(error, 'auth');
}

/** Perfil do usuário logado (função meu_perfil), ou null sem sessão ou sem perfil. */
export async function obterPerfil(): Promise<Perfil | null> {
  const { data, error } = await supabase.rpc('meu_perfil');
  if (error) throw traduzirErro(error);
  return (data?.[0] as Perfil | undefined) ?? null;
}

/** Devolve o perfil da conta logada, criando-o no primeiro acesso (função criar_meu_perfil). */
export async function garantirPerfil(nome?: string, tipo?: TipoConta): Promise<Perfil> {
  const existente = await obterPerfil();
  if (existente) return existente;
  const { error } = await supabase.rpc('criar_meu_perfil', { p_nome: nome ?? null, p_tipo: tipo ?? null });
  if (error) throw traduzirErro(error);
  const criado = await obterPerfil();
  if (!criado) throw new ErroApp('Não foi possível preparar seu perfil. Tente entrar de novo.');
  return criado;
}

/** Troca a senha de quem já está logado: confirma a senha atual e grava a nova no Supabase Auth. */
export async function trocarSenha(email: string, atual: string, nova: string) {
  const { error: erroAtual } = await supabase.auth.signInWithPassword({ email, password: atual });
  if (erroAtual) {
    const e = traduzirErro(erroAtual, 'auth');
    throw e.codigo === 'rede' ? e : new ErroApp('A senha atual não confere.', 'senha_atual');
  }
  const { error } = await supabase.auth.updateUser({ password: nova });
  if (error) throw traduzirErro(error, 'auth');
}

/** Endereço que o link do e-mail abre: a tela /nova-senha do próprio app. */
export function urlNovaSenha() {
  return LINK_NOVA_SENHA;
}

/** “Esqueci minha senha”: pede ao Supabase Auth um e-mail com link de redefinição. */
export async function pedirRedefinicaoSenha(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: urlNovaSenha() });
  if (error) throw traduzirErro(error, 'auth');
}

/**
 * Abre a sessão de recuperação a partir do link do e-mail.
 * O Supabase devolve os tokens no fragmento (#access_token=...&refresh_token=...&type=recovery)
 * ou, no fluxo PKCE, um código (?code=...).
 */
export async function abrirSessaoDeRecuperacao(url: string) {
  const parametros = new URLSearchParams([url.split('#')[1] ?? '', url.split('?')[1]?.split('#')[0] ?? ''].filter(Boolean).join('&'));
  const descricao = parametros.get('error_description');
  if (descricao) throw new ErroApp('O link de redefinição expirou ou já foi usado. Peça um novo.', parametros.get('error_code') ?? 'link_invalido');
  const accessToken = parametros.get('access_token');
  const refreshToken = parametros.get('refresh_token');
  const codigo = parametros.get('code');
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (error) throw new ErroApp('O link de redefinição expirou ou já foi usado. Peça um novo.', 'link_invalido');
    return;
  }
  if (codigo) {
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (error) throw new ErroApp('O link de redefinição expirou ou já foi usado. Peça um novo.', 'link_invalido');
    return;
  }
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new ErroApp('Abra esta tela pelo link enviado ao seu e-mail.', 'sem_link');
}

/** Grava a nova senha depois de abrir a sessão de recuperação. */
export async function definirNovaSenha(nova: string) {
  const { error } = await supabase.auth.updateUser({ password: nova });
  if (error) throw traduzirErro(error, 'auth');
}
