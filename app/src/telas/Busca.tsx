// UC-04 · Pesquisa: texto, categoria e cidade/UF, com os filtros ativos visíveis e removíveis (RF-004).
import { ChevronLeft, Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LinhaAnuncio, Local } from '@/componentes/anuncio';
import { BotaoIcone, Chip, Icone, Selo } from '@/componentes/base';
import { Carregando, FalhaCarga, Vazio } from '@/componentes/estrutura';
import { FolhaFiltros } from '@/componentes/folhas';
import { useConsulta } from '@/estado/useConsulta';
import { useSessao } from '@/estado/SessaoContexto';
import { useNavegacao } from '@/navegacao/acoes';
import type { TelaRaiz } from '@/navegacao/tipos';
import { FILTROS_VAZIOS, Filtros } from '@/negocio/tipos';
import { pesquisar } from '@/servicos/anuncios';
import { cores, fontes, margem, raio } from '@/tema';

export default function Busca({ route }: TelaRaiz<'Busca'>) {
  const { navigation, voltar } = useNavegacao();
  const insets = useSafeAreaInsets();
  const params = route.params ?? {};
  const { categorias } = useSessao();

  const [f, setF] = useState<Filtros>({ ...FILTROS_VAZIOS, categoriaId: params.categoria ?? null });
  const [folha, setFolha] = useState(!!params.filtros);
  // O texto digitado espera 350 ms parado antes de consultar o servidor.
  const [texto, setTexto] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setF((atual) => ({ ...atual, texto })), 350);
    return () => clearTimeout(t);
  }, [texto]);

  const { dados, carregando, erro, recarregar } = useConsulta(() => pesquisar(f), [f.texto, f.categoriaId, f.uf, f.cidade]);
  const lista = dados ?? [];

  const ativos: { chave: string; rotulo: string; remover: () => void }[] = [
    ...(f.categoriaId ? [{ chave: 'cat', rotulo: categorias.find((c) => c.id === f.categoriaId)?.nome ?? 'Categoria', remover: () => setF({ ...f, categoriaId: null }) }] : []),
    ...(f.uf ? [{ chave: 'uf', rotulo: f.uf, remover: () => setF({ ...f, uf: null }) }] : []),
    ...(f.cidade.trim() ? [{ chave: 'cidade', rotulo: f.cidade.trim(), remover: () => setF({ ...f, cidade: '' }) }] : []),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: cores.creme, paddingTop: insets.top + 6 }}>
      <View style={[s.linha, { gap: 6, paddingLeft: 6, paddingRight: margem }]}>
        <BotaoIcone i={ChevronLeft} v="limpo" rotulo="Voltar" onPress={voltar} />
        <View style={[s.busca, texto.length > 0 && { borderColor: cores.coral500 }]}>
          <Icone i={Search} tam={18} cor={cores.tintaSuave} />
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Buscar roupas, livros, móveis…"
            placeholderTextColor={cores.tintaSuave}
            autoFocus={!params.categoria && !params.filtros}
            returnKeyType="search"
            style={s.buscaInput}
            accessibilityLabel="Buscar"
          />
          {texto.length > 0 && (
            <Pressable onPress={() => setTexto('')} hitSlop={8} accessibilityLabel="Limpar busca">
              <Icone i={X} tam={16} cor={cores.tintaSuave} />
            </Pressable>
          )}
        </View>
        <BotaoIcone i={SlidersHorizontal} v="suave" tam={48} rotulo="Filtros" contador={ativos.length} onPress={() => setFolha(true)} />
      </View>

      {ativos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginTop: 12 }} contentContainerStyle={{ gap: 8, paddingHorizontal: margem }}>
          {ativos.map((a) => (
            <Chip key={a.chave} rotulo={a.rotulo} removivel onPress={a.remover} />
          ))}
        </ScrollView>
      )}

      <Text style={s.contagem}>
        {carregando ? 'Buscando…' : erro ? ' ' : lista.length === 1 ? '1 anúncio disponível' : `${lista.length} anúncios disponíveis`}
      </Text>

      <FlatList
        data={erro ? [] : lista}
        keyExtractor={(a) => String(a.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: margem, paddingBottom: insets.bottom + 24, gap: 10 }}
        ListEmptyComponent={
          erro ? (
            <FalhaCarga mensagem={erro} aoTentar={recarregar} />
          ) : carregando ? (
            <Carregando />
          ) : (
            <Vazio i={Search} titulo="Nada por aqui com essa busca" texto="Tente outras palavras ou tire alguns filtros." />
          )
        }
        renderItem={({ item }) => (
          <LinhaAnuncio
            anuncio={item}
            onPress={() => navigation.navigate('Anuncio', { id: item.id })}
            topo={item.categoria ? <Selo texto={item.categoria.nome} ponto={false} /> : undefined}
            sub={<Local a={item} />}
          />
        )}
      />

      <FolhaFiltros
        visivel={folha}
        filtros={f}
        aoFechar={() => setFolha(false)}
        aoAplicar={(novo) => {
          setF({ ...novo, texto: f.texto });
          setFolha(false);
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center' },
  busca: {
    flex: 1, height: 48, borderRadius: raio.md, borderWidth: 1.5, borderColor: cores.linha, backgroundColor: cores.branco,
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12,
  },
  buscaInput: { flex: 1, fontFamily: fontes.corpo, fontSize: 14.5, color: cores.tinta, paddingVertical: 8 },
  contagem: { fontFamily: fontes.negrito, fontSize: 13, color: cores.tinta, paddingHorizontal: margem, marginTop: 14, marginBottom: 8 },
});
