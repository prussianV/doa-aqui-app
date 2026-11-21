// UC-11 · Moderar anúncios (RF-010) e UC-12 · Gerenciar usuários (RF-011). Só para administradores.
// A aba só aparece para quem tem papel ADMINISTRADOR; o banco confere de novo em cada operação.
import { ShieldCheck, ShieldOff, Users } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LinhaAnuncio, Local, SeloStatus } from '@/componentes/anuncio';
import { Avatar, Botao, Chip, Segmentado, Selo, Texto } from '@/componentes/base';
import { Carregando, FalhaCarga, Vazio } from '@/componentes/estrutura';
import { FolhaConfirmar } from '@/componentes/folhas';
import { useConsulta } from '@/estado/useConsulta';
import { useSessao } from '@/estado/SessaoContexto';
import { ROTULO_STATUS, ROTULO_TIPO_CONTA } from '@/negocio/catalogo';
import { iniciais, tempoRelativo, textoInteressados } from '@/negocio/regras';
import type { Anuncio, StatusAnuncio, UsuarioAdmin } from '@/negocio/tipos';
import { definirSituacao, desativarAnuncio, listarAnuncios, listarUsuarios } from '@/servicos/administracao';
import { cores, fontes, margem, raio } from '@/tema';

export default function Admin() {
  const insets = useSafeAreaInsets();
  const { ehAdmin } = useSessao();
  const [aba, setAba] = useState<'anuncios' | 'usuarios'>('anuncios');

  if (!ehAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: cores.creme, paddingTop: insets.top + 40 }}>
        <Vazio i={ShieldOff} titulo="Área restrita" texto="Esta área é só para administradores do Doa Aqui." />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: cores.creme }}>
      <View style={[s.topo, { paddingTop: insets.top + 10 }]}>
        <Text style={s.sobretitulo}>Painel do administrador</Text>
        <Text style={s.titulo}>Moderação</Text>
        <View style={{ marginTop: 12 }}>
          <Segmentado valor={aba} onChange={setAba} opcoes={[{ id: 'anuncios', nome: 'Anúncios' }, { id: 'usuarios', nome: 'Usuários' }]} />
        </View>
      </View>
      {aba === 'anuncios' ? <ModerarAnuncios /> : <GerenciarUsuarios />}
    </View>
  );
}

/* ---------- UC-11 ---------- */
function ModerarAnuncios() {
  const { mostrarAviso } = useSessao();
  const [filtro, setFiltro] = useState<StatusAnuncio | null>(null);
  const [alvo, setAlvo] = useState<Anuncio | null>(null);
  const { dados, carregando, erro, recarregar } = useConsulta(() => listarAnuncios(filtro), [filtro], { aoFocar: true });

  return (
    <>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: margem, paddingVertical: 12 }}>
          <Chip rotulo="Todos" ativo={!filtro} onPress={() => setFiltro(null)} />
          {(['DISPONIVEL', 'DOADO', 'INATIVO'] as const).map((st) => (
            <Chip key={st} rotulo={ROTULO_STATUS[st]} ativo={filtro === st} onPress={() => setFiltro(st)} />
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={erro ? [] : dados ?? []}
        keyExtractor={(a) => String(a.id)}
        contentContainerStyle={{ paddingHorizontal: margem, paddingBottom: 24, gap: 10, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={carregando && !!dados} onRefresh={recarregar} tintColor={cores.coral500} />}
        ListEmptyComponent={erro ? <FalhaCarga mensagem={erro} aoTentar={recarregar} /> : carregando ? <Carregando /> : <Vazio i={ShieldCheck} titulo="Nenhum anúncio" texto="Não há anúncios com esse filtro." />}
        renderItem={({ item }) => (
          <View style={s.cartao}>
            <LinhaAnuncio
              anuncio={item}
              topo={<SeloStatus status={item.status} />}
              sub={
                <View style={{ gap: 2 }}>
                  <Local a={item} />
                  <Texto v="legenda" style={{ fontSize: 11.5 }} numberOfLines={1}>
                    Por {item.usuario?.nome ?? '—'} · {tempoRelativo(item.criado_em)} · {textoInteressados(item.total_interesses ?? 0).toLowerCase()}
                  </Texto>
                </View>
              }
            />
            <Texto v="corpo" style={{ fontSize: 13, color: cores.tintaSuave }} numberOfLines={3}>{item.descricao}</Texto>
            {item.status !== 'INATIVO' ? (
              <Botao pequeno v="perigo" titulo="Desativar anúncio" onPress={() => setAlvo(item)} />
            ) : (
              <Texto v="legenda">Desativado {item.inativado_por === 'ADMINISTRADOR' ? 'pela moderação' : 'pelo proprietário'}.</Texto>
            )}
          </View>
        )}
      />
      <FolhaConfirmar
        visivel={!!alvo}
        titulo="Desativar este anúncio?"
        texto={`“${alvo?.titulo ?? ''}” sai da pesquisa e passa para Inativos na conta de quem anunciou. Use quando o anúncio violar as regras da plataforma.`}
        rotuloConfirmar="Desativar"
        perigo
        aoFechar={() => setAlvo(null)}
        aoConfirmar={async () => {
          if (!alvo) return;
          await desativarAnuncio(alvo.id);
          mostrarAviso('Anúncio desativado pela moderação');
          await recarregar();
        }}
      />
    </>
  );
}

/* ---------- UC-12 ---------- */
function GerenciarUsuarios() {
  const { perfil, mostrarAviso } = useSessao();
  const [alvo, setAlvo] = useState<UsuarioAdmin | null>(null);
  const { dados, carregando, erro, recarregar } = useConsulta(listarUsuarios, [], { aoFocar: true });
  const bloquear = alvo?.situacao === 'ATIVA';

  return (
    <>
      <FlatList
        data={erro ? [] : dados ?? []}
        keyExtractor={(u) => u.id}
        contentContainerStyle={{ padding: margem, paddingTop: 12, paddingBottom: 24, gap: 10, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={carregando && !!dados} onRefresh={recarregar} tintColor={cores.coral500} />}
        ListEmptyComponent={erro ? <FalhaCarga mensagem={erro} aoTentar={recarregar} /> : carregando ? <Carregando /> : <Vazio i={Users} titulo="Nenhum usuário" texto="Ainda não há contas cadastradas." />}
        renderItem={({ item }) => {
          const voce = item.id === perfil?.id;
          return (
            <View style={s.cartao}>
              <View style={[s.linha, { gap: 12 }]}>
                <Avatar iniciais={iniciais(item.nome)} tom={item.tipo === 'ONG' ? 'verde' : 'coral'} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={s.nome} numberOfLines={1}>{item.nome}{voce ? ' (você)' : ''}</Text>
                  <Texto v="legenda" numberOfLines={1} selectable>{item.email}</Texto>
                  <Texto v="legenda" style={{ fontSize: 11.5 }}>
                    {ROTULO_TIPO_CONTA[item.tipo]} · {item.total_anuncios} {item.total_anuncios === 1 ? 'anúncio' : 'anúncios'} · desde {tempoRelativo(item.criado_em).replace('há ', '')}
                  </Texto>
                </View>
              </View>
              <View style={[s.linha, { gap: 6, justifyContent: 'space-between' }]}>
                <View style={[s.linha, { gap: 6 }]}>
                  <Selo texto={item.situacao === 'ATIVA' ? 'Ativa' : 'Bloqueada'} tom={item.situacao === 'ATIVA' ? 'ok' : 'aviso'} />
                  {item.papel === 'ADMINISTRADOR' && <Selo texto="Administrador" ponto={false} />}
                </View>
                {!voce && (
                  <Botao
                    pequeno
                    v={item.situacao === 'ATIVA' ? 'secundario' : 'suave'}
                    titulo={item.situacao === 'ATIVA' ? 'Bloquear' : 'Desbloquear'}
                    onPress={() => setAlvo(item)}
                  />
                )}
              </View>
            </View>
          );
        }}
      />
      <FolhaConfirmar
        visivel={!!alvo}
        titulo={bloquear ? `Bloquear ${alvo?.nome ?? ''}?` : `Desbloquear ${alvo?.nome ?? ''}?`}
        texto={
          bloquear
            ? 'A pessoa não poderá mais publicar, editar anúncios nem demonstrar interesse até ser desbloqueada.'
            : 'A pessoa volta a usar todas as funções da conta.'
        }
        rotuloConfirmar={bloquear ? 'Bloquear' : 'Desbloquear'}
        perigo={bloquear}
        aoFechar={() => setAlvo(null)}
        aoConfirmar={async () => {
          if (!alvo) return;
          await definirSituacao(alvo.id, bloquear ? 'BLOQUEADA' : 'ATIVA');
          mostrarAviso(bloquear ? 'Usuário bloqueado' : 'Usuário desbloqueado');
          await recarregar();
        }}
      />
    </>
  );
}

const s = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center' },
  topo: { backgroundColor: cores.tinta, paddingHorizontal: margem, paddingBottom: 14 },
  sobretitulo: { fontFamily: fontes.medio, fontSize: 12, color: 'rgba(251,246,239,0.7)' },
  titulo: { fontFamily: fontes.display, fontSize: 22, color: cores.creme },
  cartao: { backgroundColor: cores.branco, borderRadius: raio.lg, borderWidth: 1, borderColor: cores.linha, padding: 10, gap: 10 },
  nome: { fontFamily: fontes.negrito, fontSize: 14.5, color: cores.tinta },
});
