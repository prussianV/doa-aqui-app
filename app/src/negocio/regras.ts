// Regras de validação e apresentação executadas no aparelho.
// São validações de conveniência: as mesmas regras são garantidas no banco
// (restrições CHECK, UNIQUE, gatilhos e políticas RLS), que é quem decide de fato (RNF-003).
import { LIMITES, UFS } from './catalogo';
import type { Anuncio, DadosAnuncio, Perfil, TipoConta } from './tipos';

export type Erros<T extends string> = Partial<Record<T, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** DDD + número: 11 dígitos para celular (começa com 9) e 10 para fixo. Igual à restrição do banco. */
const TELEFONE = /^[1-9]{2}(9\d{8}|[2-5]\d{7})$/;

/** RF-001: nome, e-mail e senha obrigatórios e válidos. */
export function validarCadastro(d: { nome: string; email: string; senha: string }): Erros<'nome' | 'email' | 'senha'> {
  const e: Erros<'nome' | 'email' | 'senha'> = {};
  const nome = d.nome.trim();
  if (nome.length < 2) e.nome = 'Digite seu nome (pelo menos 2 letras).';
  else if (nome.length > LIMITES.nome) e.nome = `Use no máximo ${LIMITES.nome} caracteres.`;
  if (!EMAIL.test(d.email.trim())) e.email = 'Digite um e-mail válido, como nome@exemplo.com.';
  if (d.senha.length < LIMITES.senhaMin) e.senha = `A senha precisa ter pelo menos ${LIMITES.senhaMin} caracteres.`;
  return e;
}

/** Troca e redefinição de senha: nova senha com o mínimo exigido e confirmação igual. */
export function validarNovaSenha(d: { nova: string; confirmacao: string; atual?: string }): Erros<'atual' | 'nova' | 'confirmacao'> {
  const e: Erros<'atual' | 'nova' | 'confirmacao'> = {};
  if (d.atual !== undefined && !d.atual) e.atual = 'Digite sua senha atual.';
  if (d.nova.length < LIMITES.senhaMin) e.nova = `A nova senha precisa ter pelo menos ${LIMITES.senhaMin} caracteres.`;
  else if (d.atual && d.nova === d.atual) e.nova = 'A nova senha precisa ser diferente da atual.';
  if (d.confirmacao !== d.nova) e.confirmacao = 'As duas senhas precisam ser iguais.';
  return e;
}

export function validarLogin(d: { email: string; senha: string }): Erros<'email' | 'senha'> {
  const e: Erros<'email' | 'senha'> = {};
  if (!EMAIL.test(d.email.trim())) e.email = 'Digite o e-mail da sua conta.';
  if (!d.senha) e.senha = 'Digite sua senha.';
  return e;
}

/** RF-003: título, descrição, categoria e cidade/UF. */
export function validarDetalhes(d: DadosAnuncio): Erros<'titulo' | 'descricao' | 'categoria'> {
  const e: Erros<'titulo' | 'descricao' | 'categoria'> = {};
  const titulo = d.titulo.trim();
  if (titulo.length < 3) e.titulo = 'Dê um título com pelo menos 3 letras.';
  else if (titulo.length > LIMITES.titulo) e.titulo = `Use no máximo ${LIMITES.titulo} caracteres.`;
  if (!d.categoriaId) e.categoria = 'Escolha uma categoria.';
  const desc = d.descricao.trim();
  if (desc.length < 10) e.descricao = 'Conte um pouco mais sobre o item (mínimo 10 letras).';
  else if (desc.length > LIMITES.descricao) e.descricao = `Use no máximo ${LIMITES.descricao} caracteres.`;
  return e;
}

export function validarLocal(d: DadosAnuncio): Erros<'cidade' | 'uf' | 'telefone'> {
  const e: Erros<'cidade' | 'uf' | 'telefone'> = {};
  const cidade = d.cidade.trim();
  if (cidade.length < 2) e.cidade = 'Informe a cidade onde o item será retirado.';
  else if (cidade.length > LIMITES.cidade) e.cidade = `Use no máximo ${LIMITES.cidade} caracteres.`;
  if (!d.uf || !(UFS as readonly string[]).includes(d.uf)) e.uf = 'Escolha o estado (UF).';
  if (d.telefone.trim() && !TELEFONE.test(digitosTelefone(d.telefone))) e.telefone = 'Digite DDD + número, como (11) 98765-4321.';
  return e;
}

/** Só os dígitos do telefone, sem +55 e sem zero na frente do DDD. */
export function digitosTelefone(s: string) {
  let d = s.replace(/\D/g, '');
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2);
  return d.replace(/^0+/, '');
}

/** Formata enquanto a pessoa digita: (11) 98765-4321 ou (11) 3456-7890. Termina sempre num dígito. */
export function formatarTelefone(s: string) {
  const d = digitosTelefone(s).slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  const ddd = d.slice(0, 2);
  const resto = d.slice(2);
  if (resto.length <= 4) return `(${ddd}) ${resto}`;
  const corte = resto.length === 9 ? 5 : 4;
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`;
}

export const linkLigar = (telefone: string) => `tel:+55${digitosTelefone(telefone)}`;
export const linkWhatsApp = (telefone: string, mensagem: string) =>
  `https://wa.me/55${digitosTelefone(telefone)}?text=${encodeURIComponent(mensagem)}`;

export const temErros = (e: object) => Object.keys(e).length > 0;

export type SituacaoInteresse =
  | 'pode'
  | 'visitante'
  | 'proprio'
  | 'indisponivel'
  | 'ja_manifestou'
  | 'bloqueado';

/** RN-02, RN-03 e RN-04, vistas pelo lado da interface. */
export function situacaoInteresse(anuncio: Anuncio, perfil: Perfil | null, jaManifestou: boolean): SituacaoInteresse {
  if (!perfil) return 'visitante';
  if (perfil.situacao === 'BLOQUEADA') return 'bloqueado';
  if (anuncio.usuario_id === perfil.id) return 'proprio';
  if (anuncio.status !== 'DISPONIVEL') return 'indisponivel';
  if (jaManifestou) return 'ja_manifestou';
  return 'pode';
}

export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return '?';
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}

export const tipoCurto = (t: TipoConta) => (t === 'ONG' ? 'ONG' : 'Pessoa física');

/** "há 2 h", "ontem", "há 3 dias"... */
export function tempoRelativo(iso: string, agora = new Date()) {
  const min = Math.max(0, Math.round((agora.getTime() - new Date(iso).getTime()) / 60000));
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return 'ontem';
  if (d < 30) return `há ${d} dias`;
  const m = Math.round(d / 30);
  return m === 1 ? 'há 1 mês' : `há ${m} meses`;
}

export const textoInteressados = (n: number) =>
  n === 0 ? 'Ninguém ainda' : n === 1 ? '1 interessado' : `${n} interessados`;

/** Remove caracteres que têm significado nos filtros da API (vírgula, parênteses, curingas). */
export const limparTermo = (s: string) => s.replace(/[,()%*\\]/g, ' ').trim();
