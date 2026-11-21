// UC-09 · Ver interessados: só o proprietário acessa; o e-mail aparece apenas com autorização (RF-007, RN-07).
import { Lock, Mail, Users } from 'lucide-react-native';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Dica, Icone, Texto } from '@/componentes/base';
import { Carregando, FalhaCarga, Topo, Vazio } from '@/componentes/estrutura';
import { useConsulta } from '@/estado/useConsulta';
import { useNavegacao } from '@/navegacao/acoes';
import type { TelaRaiz } from '@/navegacao/tipos';
import { ROTULO_TIPO_CONTA } from '@/negocio/catalogo';
import { iniciais, tempoRelativo } from '@/negocio/regras';
import { obter } from '@/servicos/anuncios';
import { listarInteressados } from '@/servicos/interesses';
import { cores, fontes, margem, raio } from '@/tema';

export default function Interessados({ route }: TelaRaiz<'Interessados'>) {
  const anuncioId = route.params.id;
  const { voltar } = useNavegacao();
  const insets = useSafeAreaInsets();

  const { dados, carregando, erro, recarregar } = useConsulta(async () => {
    const [anuncio, lista] = await Promise.all([obter(anuncioId), listarInteressados(anuncioId)]);
    return { anuncio, lista };
  }, [anuncioId]);

  const lista = dados?.lista ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: cores.creme, paddingTop: insets.top }}>
      <Topo titulo="Interessados" aoVoltar={voltar} />
      {carregando && !dados ? (
        <Carregando />
      ) : erro ? (
        <FalhaCarga mensagem={erro} aoTentar={recarregar} />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(i) => String(i.interesse_id)}
          contentContainerStyle={{ padding: margem, paddingTop: 4, gap: 10, paddingBottom: insets.bottom + 24 }}
          ListHeaderComponent={
            <View style={{ gap: 12, marginBottom: 6 }}>
              <View>
                <Texto v="legenda">Anúncio</Texto>
                <Texto v="subtitulo">{dados?.anuncio?.titulo}</Texto>
              </View>
              {lista.length > 0 && (
                <Dica i={Lock}>Entre em contato pelo e-mail de quem autorizou e combine a retirada fora do app. Depois, marque o anúncio como doado.</Dica>
              )}
            </View>
          }
          ListEmptyComponent={<Vazio i={Users} titulo="Ninguém demonstrou interesse ainda" texto="Quando alguém tiver interesse, o nome aparece aqui." />}
          renderItem={({ item }) => (
            <View style={s.linha}>
              <Avatar iniciais={iniciais(item.nome)} tom={item.tipo === 'ONG' ? 'verde' : 'coral'} />
              <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
                <Text style={s.nome}>{item.nome}</Text>
                <Texto v="legenda">{ROTULO_TIPO_CONTA[item.tipo]} · {tempoRelativo(item.criado_em)}</Texto>
                <View style={[s.email, !item.email && { backgroundColor: cores.areia }]}>
                  <Icone i={item.email ? Mail : Lock} tam={14} cor={item.email ? cores.verde700 : cores.tintaSuave} />
                  <Text selectable style={[s.emailTexto, !item.email && { color: cores.tintaSuave, fontFamily: fontes.medio }]}>
                    {item.email ?? 'Não autorizou mostrar o e-mail'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  linha: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: cores.branco, borderRadius: raio.lg, padding: 12, borderWidth: 1, borderColor: cores.linha },
  nome: { fontFamily: fontes.negrito, fontSize: 14.5, color: cores.tinta },
  email: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: cores.verde50, alignSelf: 'flex-start', maxWidth: '100%' },
  emailTexto: { fontFamily: fontes.semi, fontSize: 13, color: cores.verde700, flexShrink: 1 },
});
