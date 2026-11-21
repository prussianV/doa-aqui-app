// Serviço de interesse (RF-006, RF-007).
import { supabase } from '@/lib/supabase';
import type { Interessado } from '@/negocio/tipos';
import { traduzirErro } from './erros';

/**
 * UC-06: registra o interesse do usuário logado.
 * RN-03 (anúncio disponível e de terceiro) é verificada pela política RLS;
 * RN-04 (um por anúncio) pela restrição UNIQUE; RN-07 pelo campo autoriza_email.
 */
export async function manifestar(anuncioId: number, autorizaEmail: boolean) {
  const { error } = await supabase.from('interesse').insert({ anuncio_id: anuncioId, autoriza_email: autorizaEmail });
  if (error) throw traduzirErro(error, 'interesse');
}

/** O usuário logado já demonstrou interesse neste anúncio? */
export async function jaManifestou(anuncioId: number, usuarioId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('interesse')
    .select('id', { count: 'exact', head: true })
    .eq('anuncio_id', anuncioId)
    .eq('usuario_id', usuarioId);
  if (error) throw traduzirErro(error);
  return (count ?? 0) > 0;
}

/** UC-09: interessados no anúncio, só para o proprietário (função listar_interessados). */
export async function listarInteressados(anuncioId: number): Promise<Interessado[]> {
  const { data, error } = await supabase.rpc('listar_interessados', { p_anuncio_id: anuncioId });
  if (error) throw traduzirErro(error);
  return data as Interessado[];
}
