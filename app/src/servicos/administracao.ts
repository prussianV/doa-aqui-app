// Serviço de administração (RF-010 moderação de anúncios, RF-011 gerenciamento de usuários).
// As funções do banco conferem se quem chama é administrador com conta ativa.
import { supabase } from '@/lib/supabase';
import type { Anuncio, SituacaoConta, StatusAnuncio, UsuarioAdmin } from '@/negocio/tipos';
import { COLUNAS_ANUNCIO, comContagem } from './anuncios';
import { traduzirErro } from './erros';

/** UC-11: todos os anúncios, em qualquer situação (a política RLS libera para o administrador). */
export async function listarAnuncios(status: StatusAnuncio | null): Promise<Anuncio[]> {
  let q = supabase
    .from('anuncio')
    .select(`${COLUNAS_ANUNCIO}, interesse(count)`)
    .order('criado_em', { ascending: false })
    .limit(200);
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw traduzirErro(error);
  return (data as Parameters<typeof comContagem>[0][]).map(comContagem);
}

/** UC-11: desativa um anúncio que viola as regras. */
export async function desativarAnuncio(id: number) {
  const { error } = await supabase.rpc('admin_desativar_anuncio', { p_anuncio_id: id });
  if (error) throw traduzirErro(error);
}

/** UC-12: usuários cadastrados e a situação de suas contas. */
export async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  const { data, error } = await supabase.rpc('admin_listar_usuarios');
  if (error) throw traduzirErro(error);
  return data as UsuarioAdmin[];
}

/** UC-12: bloqueia ou desbloqueia um usuário. */
export async function definirSituacao(usuarioId: string, situacao: SituacaoConta) {
  const { error } = await supabase.rpc('admin_definir_situacao', { p_usuario_id: usuarioId, p_situacao: situacao });
  if (error) throw traduzirErro(error);
}
