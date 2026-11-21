// UC-08 · Gerenciar anúncio, UC-09 · Ver interessados, UC-10 · Concluir doação.
// Lista os próprios anúncios por situação: disponíveis, doados e inativos (RN-06).
import { Ellipsis, Gift, Package, Plus, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LinhaAnuncio, Local, SeloStatus } from '@/componentes/anuncio';
import { Botao, BotaoIcone, Dica, Icone, Segmentado, Texto } from '@/componentes/base';
import { ExigeLogin } from '@/componentes/ExigeLogin';
import { Carregando, FalhaCarga, Vazio } from '@/componentes/estrutura';
import { FolhaConfirmar, FolhaGerenciar } from '@/componentes/folhas';
import { useConsulta } from '@/estado/useConsulta';
import { useSessao } from '@/estado/SessaoContexto';
import { useNavegacao } from '@/navegacao/acoes';
import { tempoRelativo, textoInteressados } from '@/negocio/regras';
import type { Anuncio, StatusAnuncio } from '@/negocio/tipos';
import { concluir, desativar, meus } from '@/servicos/anuncios';
import { cores, fontes, margem } from '@/tema';

export default function MeusAnunciosTela() {
  return (
    <ExigeLogin i={Package} titulo="Seus anúncios ficam aqui" texto="Entre na sua conta para publicar itens e acompanhar quem tem interesse.">
      <MeusAnuncios />
    </ExigeLogin>
  );
}

function MeusAnuncios() {
  const { navigation } = useNavegacao();
  const insets = useSafeAreaInsets();
  const { perfil, mostrarAviso } = useSessao();
  const [aba, setAba] = useState<StatusAnuncio>('DISPONIVEL');
  const [selecionado, setSelecionado] = useState<Anuncio | null>(null);
  const [confirmacao, setConfirmacao] = useState<{ tipo: 'concluir' | 'desativar'; anuncio: Anuncio } | null>(null);

  const { dados, carregando, erro, recarregar } = useConsulta(() => meus(perfil!.id), [perfil?.id], { aoFocar: true });
  const porStatus = useMemo(() => {
    const grupos: Record<StatusAnuncio, Anuncio[]> = { DISPONIVEL: [], DOADO: [], INATIVO: [] };
    (dados ?? []).forEach((a) => grupos[a.status].push(a));
    return grupos;
  }, [dados]);
  const lista = porStatus[aba];

  const abrirConfirmacao = (tipo: 'concluir' | 'desativar', anuncio: Anuncio) => {
    setSelecionado(null);
    setTimeout(() => setConfirmacao({ tipo, anuncio }), 350);
  };

  return (
    <View style={{ flex: 1, backgroundColor: cores.creme, paddingTop: insets.top + 8 }}>
      <View style={{ paddingHorizontal: margem, gap: 12 }}>
        <View style={[s.linha, { justifyContent: 'space-between' }]}>
          <Texto v="titulo">Meus anúncios</Texto>
          <BotaoIcone i={Plus} v="suave" rotulo="Novo anúncio" onPress={() => navigation.navigate('Anunciar')} />
        </View>
        <Segmentado
          valor={aba}
          onChange={setAba}
          opcoes={[
            { id: 'DISPONIVEL', nome: `Disponíveis (${porStatus.DISPONIVEL.length})` },
            { id: 'DOADO', nome: `Doados (${porStatus.DOADO.length})` },
            { id: 'INATIVO', nome: `Inativos (${porStatus.INATIVO.length})` },
          ]}
        />
      </View>

      <FlatList
        data={erro ? [] : lista}
        keyExtractor={(a) => String(a.id)}
        contentContainerStyle={{ padding: margem, paddingTop: 12, gap: 10, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={carregando && !!dados} onRefresh={recarregar} tintColor={cores.coral500} />}
        ListEmptyComponent={
          erro ? (
            <FalhaCarga mensagem={erro} aoTentar={recarregar} />
          ) : carregando ? (
            <Carregando />
          ) : aba === 'DISPONIVEL' ? (
            <Vazio
              i={Package}
              titulo="Nenhum anúncio disponível"
              texto="Tem algo parado em casa? Alguém pode estar precisando."
              acao={<Botao titulo="Anunciar um item" icone={Plus} onPress={() => navigation.navigate('Anunciar')} style={{ marginTop: 8 }} />}
            />
          ) : aba === 'DOADO' ? (
            <Vazio i={Gift} titulo="Nada doado ainda" texto="Quando você entregar um item, marque o anúncio como doado e ele aparece aqui." />
          ) : (
            <Vazio i={Package} titulo="Nenhum anúncio inativo" texto="Anúncios desativados por você ou pela moderação aparecem aqui." />
          )
        }
        ListFooterComponent={
          aba === 'DISPONIVEL' && lista.length > 0 ? <Dica i={Gift}>Já entregou um item? Marque como doado para ele sair da pesquisa.</Dica> : undefined
        }
        renderItem={({ item }) => (
          <LinhaAnuncio
            anuncio={item}
            onPress={() => navigation.navigate('Anuncio', { id: item.id })}
            topo={<SeloStatus status={item.status} />}
            sub={
              <View style={{ gap: 3 }}>
                <Local a={item} />
                <View style={[s.linha, { gap: 4 }]}>
                  <Icone i={Users} tam={12} cor={item.total_interesses ? cores.coral600 : cores.tintaSuave} />
                  <Text style={[s.sub, !!item.total_interesses && { color: cores.coral600, fontFamily: fontes.negrito }]}>
                    {textoInteressados(item.total_interesses ?? 0)}
                  </Text>
                  <Text style={s.sub}>· {tempoRelativo(item.criado_em)}</Text>
                </View>
              </View>
            }
            direita={
              <Pressable onPress={() => setSelecionado(item)} hitSlop={10} style={{ padding: 6 }} accessibilityRole="button" accessibilityLabel={`Ações de ${item.titulo}`}>
                <Icone i={Ellipsis} tam={22} />
              </Pressable>
            }
          />
        )}
      />

      <FolhaGerenciar
        anuncio={selecionado}
        visivel={!!selecionado}
        aoFechar={() => setSelecionado(null)}
        aoConcluir={(a) => abrirConfirmacao('concluir', a)}
        aoDesativar={(a) => abrirConfirmacao('desativar', a)}
      />
      <FolhaConfirmar
        visivel={!!confirmacao}
        titulo={confirmacao?.tipo === 'concluir' ? 'Marcar como doado?' : 'Desativar anúncio?'}
        texto={
          confirmacao?.tipo === 'concluir'
            ? `Confirme que “${confirmacao.anuncio.titulo}” já foi entregue. O anúncio sai da pesquisa e não pode mais ser editado.`
            : `“${confirmacao?.anuncio.titulo ?? ''}” sai da pesquisa e não poderá ser reativado.`
        }
        rotuloConfirmar={confirmacao?.tipo === 'concluir' ? 'Marcar como doado' : 'Desativar'}
        perigo={confirmacao?.tipo === 'desativar'}
        aoFechar={() => setConfirmacao(null)}
        aoConfirmar={async () => {
          if (!confirmacao) return;
          if (confirmacao.tipo === 'concluir') {
            await concluir(confirmacao.anuncio.id);
            mostrarAviso('Que bom! Doação concluída');
          } else {
            await desativar(confirmacao.anuncio.id);
            mostrarAviso('Anúncio desativado');
          }
          await recarregar();
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center' },
  sub: { fontFamily: fontes.medio, fontSize: 11.5, color: cores.tintaSuave, flexShrink: 1 },
});
