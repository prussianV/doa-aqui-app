// Boas-vindas: três telas na primeira abertura do app (apresentação, não é um caso de uso).
import { ShieldCheck } from 'lucide-react-native';
import { ComponentRef, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Botao, Icone, Texto } from '@/componentes/base';
import { MapaAproximado } from '@/componentes/estrutura';
import { DesenhoItem, FUNDOS, Marca } from '@/componentes/Ilustracoes';
import type { Ilustracao } from '@/componentes/Ilustracoes';
import { marcarBoasVindasVista } from '@/lib/preferencias';
import { useNavegacao } from '@/navegacao/acoes';
import { cores, fontes, margem } from '@/tema';

const PAGINAS = [
  { titulo: 'O que sobra aí faz falta aqui perto', texto: 'Doe roupas, livros, móveis, ração e brinquedos para pessoas e ONGs que precisam.' },
  { titulo: 'Doar leva menos de um minuto', texto: 'Conte o que é o item, escolha a categoria e a cidade. Quem tiver interesse aparece na sua lista.' },
  { titulo: 'Seu endereço fica com você', texto: 'Os anúncios mostram só cidade e estado. A entrega é combinada direto entre vocês, fora do app.' },
];

export default function BoasVindas() {
  const { navigation } = useNavegacao();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [pagina, setPagina] = useState(0);
  const rolagem = useRef<ComponentRef<typeof ScrollView>>(null);

  const concluir = () => {
    marcarBoasVindasVista();
    navigation.replace('Abas');
  };
  const avancar = () => {
    if (pagina === PAGINAS.length - 1) return concluir();
    rolagem.current?.scrollTo({ x: width * (pagina + 1), animated: true });
    setPagina(pagina + 1);
  };
  const aoRolar = (e: NativeSyntheticEvent<NativeScrollEvent>) => setPagina(Math.round(e.nativeEvent.contentOffset.x / width));

  return (
    <View style={{ flex: 1, backgroundColor: cores.creme, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }}>
      <View style={s.topo}>
        <Pressable onPress={concluir} hitSlop={10} accessibilityRole="button">
          <Text style={s.pular}>Pular</Text>
        </Pressable>
      </View>

      <ScrollView ref={rolagem} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={aoRolar} style={{ flex: 1 }}>
        {PAGINAS.map((p, i) => (
          <View key={i} style={{ width, paddingHorizontal: margem + 6, justifyContent: 'center', alignItems: 'center', gap: 28 }}>
            {i === 0 && <ArteItens />}
            {i === 1 && <ArtePassos />}
            {i === 2 && <MapaAproximado rotulo="Campinas · SP" style={{ width: 240, height: 240, borderRadius: 120 }} />}
            <View style={{ gap: 10, maxWidth: 360 }}>
              <Texto v="display" style={{ textAlign: 'center', fontSize: 27, lineHeight: 32 }}>{p.titulo}</Texto>
              <Texto v="corpo" style={{ textAlign: 'center', color: cores.tintaSuave, fontSize: 14.5 }}>{p.texto}</Texto>
              {i === 2 && (
                <View style={[s.linha, { gap: 6, justifyContent: 'center', marginTop: 4 }]}>
                  <Icone i={ShieldCheck} tam={16} cor={cores.verde600} />
                  <Text style={s.seguro}>Nunca mostramos seu endereço</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: margem, gap: 20 }}>
        <View style={[s.linha, { gap: 6, justifyContent: 'center' }]}>
          {PAGINAS.map((_, i) => (
            <View key={i} style={[s.ponto, i === pagina && s.pontoAtivo]} />
          ))}
        </View>
        <Botao titulo={pagina === PAGINAS.length - 1 ? 'Começar' : 'Continuar'} onPress={avancar} />
      </View>
    </View>
  );
}

function Orbe({ il, tam, style }: { il: Ilustracao; tam: number; style: object }) {
  return (
    <View style={[s.orbe, { width: tam, height: tam, borderRadius: tam / 2, backgroundColor: FUNDOS[il.fundo] }, style]}>
      <DesenhoItem ilustracao={il} tamanho={tam * 0.72} />
    </View>
  );
}

function ArteItens() {
  return (
    <View style={{ width: 270, height: 270 }}>
      <View style={[s.anel, { width: 260, height: 260, left: 5, top: 5 }]} />
      <View style={[s.anel, { width: 168, height: 168, left: 51, top: 51 }]} />
      <View style={{ position: 'absolute', left: 85, top: 85 }}>
        <Marca tamanho={100} />
      </View>
      <Orbe il={{ tipo: 'casaco', fundo: 'coral' }} tam={74} style={{ left: 0, top: 30 }} />
      <Orbe il={{ tipo: 'livros', fundo: 'mel' }} tam={64} style={{ right: 6, top: 10 }} />
      <Orbe il={{ tipo: 'racao', fundo: 'verde' }} tam={70} style={{ right: 0, bottom: 30 }} />
      <Orbe il={{ tipo: 'cadeira', fundo: 'areia' }} tam={58} style={{ left: 24, bottom: 10 }} />
    </View>
  );
}

function ArtePassos() {
  const passos = ['Detalhes', 'Cidade', 'Publicar'];
  return (
    <View style={{ alignItems: 'center', gap: 18 }}>
      <View style={[s.cartao]}>
        <View style={{ width: 200, height: 150, backgroundColor: FUNDOS.coral, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
          <DesenhoItem ilustracao={{ tipo: 'blocos', fundo: 'coral' }} tamanho={120} />
        </View>
        <Text style={s.cartaoTitulo}>Blocos de montar</Text>
      </View>
      <View style={[s.linha, { gap: 8 }]}>
        {passos.map((p, i) => (
          <View key={p} style={[s.linha, { gap: 6, backgroundColor: cores.branco, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: cores.linha }]}>
            <View style={s.passoNum}><Text style={s.passoNumTexto}>{i + 1}</Text></View>
            <Text style={s.passoTexto}>{p}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center' },
  topo: { height: 48, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: margem },
  pular: { fontFamily: fontes.negrito, fontSize: 14, color: cores.coral600 },
  ponto: { width: 8, height: 8, borderRadius: 4, backgroundColor: cores.linhaForte },
  pontoAtivo: { width: 24, backgroundColor: cores.coral500 },
  anel: { position: 'absolute', borderRadius: 999, borderWidth: 1.5, borderStyle: 'dashed', borderColor: cores.linhaForte },
  orbe: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center',
    shadowColor: cores.sombra, shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  seguro: { fontFamily: fontes.negrito, fontSize: 13, color: cores.verde700 },
  cartao: {
    backgroundColor: cores.branco, borderRadius: 22, padding: 10, gap: 10, transform: [{ rotate: '-3deg' }],
    shadowColor: cores.sombra, shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4,
  },
  cartaoTitulo: { fontFamily: fontes.negrito, fontSize: 15, color: cores.tinta, paddingHorizontal: 4, paddingBottom: 4 },
  passoNum: { width: 20, height: 20, borderRadius: 10, backgroundColor: cores.coral500, alignItems: 'center', justifyContent: 'center' },
  passoNumTexto: { fontFamily: fontes.display, fontSize: 11, color: cores.branco },
  passoTexto: { fontFamily: fontes.semi, fontSize: 12.5, color: cores.tinta },
});
