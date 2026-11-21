// UC-04 · Início: anúncios disponíveis, com busca e atalhos de categoria (RF-004).
import { LayoutGrid, Search, SlidersHorizontal } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardAnuncio } from '@/componentes/anuncio';
import { BotaoIcone, Botao, Chip, Icone, Texto } from '@/componentes/base';
import { Carregando, FalhaCarga, Vazio } from '@/componentes/estrutura';
import { ICONE_CATEGORIA } from '@/componentes/icones';
import { Marca } from '@/componentes/Ilustracoes';
import { useConsulta } from '@/estado/useConsulta';
import { useSessao } from '@/estado/SessaoContexto';
import { useNavegacao } from '@/navegacao/acoes';
import { FILTROS_VAZIOS } from '@/negocio/tipos';
import { pesquisar } from '@/servicos/anuncios';
import { cores, fontes, margem, raio } from '@/tema';

const Separador = () => <View style={{ height: 10 }} />;

export default function Inicio() {
  const { navigation } = useNavegacao();
  const insets = useSafeAreaInsets();
  const { perfil, categorias } = useSessao();
  const [categoriaId, setCategoriaId] = useState<number | null>(null);

  const { dados, carregando, erro, recarregar } = useConsulta(
    () => pesquisar({ ...FILTROS_VAZIOS, categoriaId }),
    [categoriaId],
    { aoFocar: true },
  );
  const lista = dados ?? [];
  const nomeCategoria = categorias.find((c) => c.id === categoriaId)?.nome;

  const cabecalho = (
    <View style={{ gap: 14, paddingBottom: 12 }}>
      <View style={[s.linha, { paddingHorizontal: margem, justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          <Texto v="legenda">{perfil ? `Olá, ${perfil.nome.split(' ')[0]}` : 'Boas-vindas ao'}</Texto>
          <View style={[s.linha, { gap: 6, marginTop: 2 }]}>
            {!perfil && <Marca tamanho={22} />}
            <Text style={s.titulo}>{perfil ? 'O que você procura?' : 'doa aqui'}</Text>
          </View>
        </View>
        {!perfil && <Botao pequeno v="suave" titulo="Entrar" onPress={() => navigation.navigate('Entrar')} />}
      </View>

      <View style={[s.linha, { gap: 8, paddingHorizontal: margem }]}>
        <Pressable style={s.busca} onPress={() => navigation.navigate('Busca')} accessibilityRole="search" accessibilityLabel="Buscar anúncios">
          <Icone i={Search} tam={18} cor={cores.tintaSuave} />
          <Text style={s.buscaTexto} numberOfLines={1}>Buscar roupas, livros, móveis…</Text>
        </Pressable>
        <BotaoIcone i={SlidersHorizontal} v="suave" tam={48} rotulo="Filtros" onPress={() => navigation.navigate('Busca', { filtros: true })} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: margem }}>
        <Chip rotulo="Tudo" icone={LayoutGrid} ativo={!categoriaId} onPress={() => setCategoriaId(null)} />
        {categorias.map((c) => (
          <Chip key={c.id} rotulo={c.nome} icone={ICONE_CATEGORIA[c.slug]} ativo={categoriaId === c.id} onPress={() => setCategoriaId(categoriaId === c.id ? null : c.id)} />
        ))}
      </ScrollView>

      <View style={[s.linha, { justifyContent: 'space-between', paddingHorizontal: margem, marginTop: 4 }]}>
        <Texto v="subtitulo">{nomeCategoria ?? 'Doações recentes'}</Texto>
        <Pressable onPress={() => navigation.navigate('Busca', categoriaId ? { categoria: categoriaId } : undefined)} hitSlop={8}>
          <Text style={s.verTudo}>Filtrar por cidade</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <FlatList
      data={erro ? [] : lista}
      keyExtractor={(a) => String(a.id)}
      numColumns={2}
      style={{ flex: 1, backgroundColor: cores.creme }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 24 }}
      columnWrapperStyle={{ gap: 10, paddingHorizontal: margem }}
      ItemSeparatorComponent={Separador}
      ListHeaderComponent={cabecalho}
      refreshControl={<RefreshControl refreshing={carregando && !!dados} onRefresh={recarregar} tintColor={cores.coral500} />}
      ListEmptyComponent={
        erro ? (
          <FalhaCarga mensagem={erro} aoTentar={recarregar} />
        ) : carregando ? (
          <Carregando texto="Buscando doações…" />
        ) : (
          <Vazio
            i={LayoutGrid}
            titulo="Nenhum item por aqui ainda"
            texto="Que tal ser a primeira pessoa a doar nessa categoria?"
            acao={<Botao titulo="Anunciar um item" onPress={() => (perfil ? navigation.navigate('Anunciar') : navigation.navigate('Entrar'))} style={{ marginTop: 8 }} />}
          />
        )
      }
      renderItem={({ item, index }) => {
        const ultimoSozinho = lista.length % 2 === 1 && index === lista.length - 1;
        return (
          <View style={{ flex: 1, maxWidth: ultimoSozinho ? '50%' : undefined, paddingRight: ultimoSozinho ? 5 : 0 }}>
            <CardAnuncio anuncio={item} onPress={() => navigation.navigate('Anuncio', { id: item.id })} />
          </View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center' },
  titulo: { fontFamily: fontes.extra, fontSize: 18, color: cores.tinta },
  busca: {
    flex: 1, height: 48, borderRadius: raio.md, borderWidth: 1.5, borderColor: cores.linha, backgroundColor: cores.branco,
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12,
  },
  buscaTexto: { flex: 1, fontFamily: fontes.corpo, fontSize: 14, color: cores.tintaSuave },
  verTudo: { fontFamily: fontes.negrito, fontSize: 12.5, color: cores.coral600 },
});
