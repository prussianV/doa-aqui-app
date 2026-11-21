// Tipos do domínio, espelhando as tabelas do PostgreSQL (supabase/migrations).

export type StatusAnuncio = 'DISPONIVEL' | 'DOADO' | 'INATIVO';
export type TipoConta = 'PESSOA_FISICA' | 'ONG';
export type Papel = 'USUARIO' | 'ADMINISTRADOR';
export type SituacaoConta = 'ATIVA' | 'BLOQUEADA';
export type SlugCategoria = 'roupa' | 'livro' | 'movel' | 'racao' | 'brinquedo';

export type Categoria = {
  id: number;
  nome: string;
  slug: SlugCategoria;
};

/** Anúncio como o app recebe da API (com categoria e responsável embutidos). */
export type Anuncio = {
  id: number;
  usuario_id: string;
  categoria_id: number;
  titulo: string;
  descricao: string;
  cidade: string;
  uf: string;
  status: StatusAnuncio;
  inativado_por: 'PROPRIETARIO' | 'ADMINISTRADOR' | null;
  criado_em: string;
  atualizado_em: string;
  concluido_em: string | null;
  categoria: Pick<Categoria, 'nome' | 'slug'> | null;
  usuario: { nome: string; tipo: TipoConta } | null;
  /** Quantidade de interesses, só preenchida para o proprietário e o administrador. */
  total_interesses?: number;
};

/** Perfil do usuário logado (função meu_perfil). */
export type Perfil = {
  id: string;
  nome: string;
  email: string;
  tipo: TipoConta;
  papel: Papel;
  situacao: SituacaoConta;
  criado_em: string;
};

/** Linha da lista de interessados (função listar_interessados). */
export type Interessado = {
  interesse_id: number;
  nome: string;
  tipo: TipoConta;
  email: string | null;
  autoriza_email: boolean;
  criado_em: string;
};

/** Linha da lista de usuários do administrador (função admin_listar_usuarios). */
export type UsuarioAdmin = {
  id: string;
  nome: string;
  email: string;
  tipo: TipoConta;
  papel: Papel;
  situacao: SituacaoConta;
  criado_em: string;
  total_anuncios: number;
};

export type Filtros = {
  texto: string;
  categoriaId: number | null;
  uf: string | null;
  cidade: string;
};

export const FILTROS_VAZIOS: Filtros = { texto: '', categoriaId: null, uf: null, cidade: '' };

/** Dados digitados no formulário de anúncio (RF-003). */
export type DadosAnuncio = {
  titulo: string;
  descricao: string;
  categoriaId: number | null;
  cidade: string;
  uf: string | null;
  /** Telefone ou WhatsApp opcional, como digitado (gravado só com dígitos em anuncio_contato). */
  telefone: string;
};
