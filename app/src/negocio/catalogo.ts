// Listas fixas e rótulos usados na interface.
import type { Ilustracao } from '@/componentes/Ilustracoes';
import type { SlugCategoria, StatusAnuncio, TipoConta } from './tipos';

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export const LIMITES = { titulo: 60, descricao: 500, cidade: 80, nome: 100, senhaMin: 8 } as const;

export const ROTULO_STATUS: Record<StatusAnuncio, string> = {
  DISPONIVEL: 'Disponível',
  DOADO: 'Doado',
  INATIVO: 'Inativo',
};

export const ROTULO_TIPO_CONTA: Record<TipoConta, string> = {
  PESSOA_FISICA: 'Pessoa física',
  ONG: 'ONG ou instituição',
};

/** Ilustração de cada categoria: o MVP não tem fotos (RF-003 da Visão). */
export const ILUSTRACAO_CATEGORIA: Record<SlugCategoria, Ilustracao> = {
  roupa: { tipo: 'casaco', fundo: 'coral' },
  livro: { tipo: 'livros', fundo: 'mel' },
  movel: { tipo: 'cadeira', fundo: 'areia' },
  racao: { tipo: 'racao', fundo: 'verde' },
  brinquedo: { tipo: 'blocos', fundo: 'coral' },
};

export const ilustracaoDe = (slug: string | undefined): Ilustracao =>
  ILUSTRACAO_CATEGORIA[(slug ?? 'roupa') as SlugCategoria] ?? ILUSTRACAO_CATEGORIA.roupa;
