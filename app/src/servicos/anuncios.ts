// Serviço de anúncios (RF-003, RF-004, RF-005, RF-008, RF-009).
// Usa a API do Supabase (PostgREST) sobre a tabela public.anuncio; as políticas RLS
// e o gatilho privado.validar_anuncio() garantem quem pode ver e alterar cada anúncio.
import { supabase } from '@/lib/supabase';
import { digitosTelefone, limparTermo } from '@/negocio/regras';
import type { Anuncio, Categoria, DadosAnuncio, Filtros, StatusAnuncio } from '@/negocio/tipos';
import { traduzirErro } from './erros';

/** Colunas lidas em todas as consultas: o anúncio, a categoria e o responsável (só nome e tipo). */
export const COLUNAS_ANUNCIO = '*, categoria(nome, slug), usuario(nome, tipo)';
const COLUNAS_COM_INTERESSES = `${COLUNAS_ANUNCIO}, interesse(count)`;

type LinhaComContagem = Omit<Anuncio, 'total_interesses'> & { interesse?: { count: number }[] };
export const comContagem = (l: LinhaComContagem): Anuncio => {
  const { interesse, ...resto } = l;
  return { ...resto, total_interesses: interesse?.[0]?.count ?? 0 };
};

export async function listarCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase.from('categoria').select('id, nome, slug').order('id');
  if (error) throw traduzirErro(error);
  return data as Categoria[];
}

/** UC-04: anúncios disponíveis, com filtro por categoria, cidade/UF e texto. */
export async function pesquisar(f: Filtros, limite = 60): Promise<Anuncio[]> {
  let q = supabase
    .from('anuncio')
    .select(COLUNAS_ANUNCIO)
    .eq('status', 'DISPONIVEL')
    .order('criado_em', { ascending: false })
    .limit(limite);
  if (f.categoriaId) q = q.eq('categoria_id', f.categoriaId);
  if (f.uf) q = q.eq('uf', f.uf);
  const cidade = limparTermo(f.cidade);
  if (cidade) q = q.ilike('cidade', `%${cidade}%`);
  const termo = limparTermo(f.texto);
  if (termo) q = q.or(`titulo.ilike.%${termo}%,descricao.ilike.%${termo}%`);
  const { data, error } = await q;
  if (error) throw traduzirErro(error);
  return data as Anuncio[];
}

/** UC-05: um anúncio. Visitantes só recebem anúncios disponíveis (RLS). */
export async function obter(id: number): Promise<Anuncio | null> {
  const { data, error } = await supabase.from('anuncio').select(COLUNAS_ANUNCIO).eq('id', id).maybeSingle();
  if (error) throw traduzirErro(error);
  return data as Anuncio | null;
}

/** UC-08: anúncios do usuário logado em qualquer situação, com o número de interessados. */
export async function meus(usuarioId: string): Promise<Anuncio[]> {
  const { data, error } = await supabase
    .from('anuncio')
    .select(COLUNAS_COM_INTERESSES)
    .eq('usuario_id', usuarioId)
    .order('criado_em', { ascending: false });
  if (error) throw traduzirErro(error);
  return (data as LinhaComContagem[]).map(comContagem);
}

const paraBanco = (d: DadosAnuncio) => ({
  titulo: d.titulo.trim(),
  descricao: d.descricao.trim(),
  categoria_id: d.categoriaId!,
  cidade: d.cidade.trim(),
  uf: d.uf!,
});

/** UC-07: publica. O banco preenche o proprietário (auth.uid()) e a situação DISPONIVEL. */
export async function publicar(d: DadosAnuncio): Promise<Anuncio> {
  const { data, error } = await supabase.from('anuncio').insert(paraBanco(d)).select(COLUNAS_ANUNCIO).single();
  if (error) throw traduzirErro(error, 'anuncio');
  return data as Anuncio;
}

/** UC-08: edita um anúncio disponível do próprio usuário. */
export async function editar(id: number, d: DadosAnuncio): Promise<Anuncio> {
  const { data, error } = await supabase.from('anuncio').update(paraBanco(d)).eq('id', id).select(COLUNAS_ANUNCIO).single();
  if (error) throw traduzirErro(error, 'anuncio');
  return data as Anuncio;
}

async function mudarSituacao(id: number, status: StatusAnuncio) {
  const { data, error } = await supabase.from('anuncio').update({ status }).eq('id', id).select('id').maybeSingle();
  if (error) throw traduzirErro(error, 'anuncio');
  if (!data) throw traduzirErro({ code: '42501' }, 'anuncio');
}

/**
 * Telefone de contato do anúncio (funcionalidade adicional, DA-10). O RLS só devolve o número ao
 * dono do anúncio, a quem manifestou interesse e ao administrador; para os demais, volta null.
 */
export async function obterContato(anuncioId: number): Promise<string | null> {
  const { data, error } = await supabase.from('anuncio_contato').select('telefone').eq('anuncio_id', anuncioId).maybeSingle();
  if (error) throw traduzirErro(error);
  return data?.telefone ?? null;
}

/** Grava, troca ou remove (texto vazio) o telefone de contato do próprio anúncio. */
export async function salvarContato(anuncioId: number, telefone: string) {
  const digitos = digitosTelefone(telefone);
  const tabela = () => supabase.from('anuncio_contato');
  if (!digitos) {
    const { error } = await tabela().delete().eq('anuncio_id', anuncioId);
    if (error) throw traduzirErro(error, 'anuncio');
    return;
  }
  const { data, error } = await tabela().update({ telefone: digitos }).eq('anuncio_id', anuncioId).select('anuncio_id');
  if (error) throw traduzirErro(error, 'anuncio');
  if (data.length) return;
  const { error: erroInsercao } = await tabela().insert({ anuncio_id: anuncioId, telefone: digitos });
  if (erroInsercao) throw traduzirErro(erroInsercao, 'anuncio');
}

/** UC-08: desativa (sai da pesquisa; não há exclusão física). */
export const desativar = (id: number) => mudarSituacao(id, 'INATIVO');

/** UC-10: conclui a doação (declaração do anunciante, RN-08). */
export const concluir = (id: number) => mudarSituacao(id, 'DOADO');
