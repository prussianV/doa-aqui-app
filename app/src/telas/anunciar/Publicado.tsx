// UC-07 · Confirmação de anúncio publicado.
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Botao, Texto } from '@/componentes/base';
import { Marca } from '@/componentes/Ilustracoes';
import { useRascunho } from '@/estado/RascunhoContexto';
import type { NavegacaoRaiz, TelaAnunciar } from '@/navegacao/tipos';
import { cores, margem } from '@/tema';

const CONFETES = [
  { left: 22, top: 40, c: cores.mel400, r: 2, rot: '20deg' },
  { right: 26, top: 30, c: cores.verde600, r: 2, rot: '-15deg' },
  { left: 8, bottom: 70, c: cores.coral500, r: 5 },
  { right: 10, bottom: 56, c: cores.mel400, r: 5 },
  { left: 116, top: 2, c: cores.verde600, r: 4 },
  { left: 70, bottom: 10, c: cores.coral500, r: 2, rot: '40deg' },
];

export default function Publicado({ route, navigation }: TelaAnunciar<'Publicado'>) {
  const { id, titulo, cidade } = route.params;
  const insets = useSafeAreaInsets();
  const { fechar } = useRascunho();

  return (
    <View style={{ flex: 1, backgroundColor: cores.creme, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16), paddingHorizontal: margem }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <View style={{ width: 240, height: 240 }}>
          <View style={s.anel} />
          <View style={s.disco} />
          <View style={{ position: 'absolute', left: 74, top: 70 }}>
            <Marca tamanho={92} />
          </View>
          {CONFETES.map((c, i) => (
            <View
              key={i}
              style={{
                position: 'absolute', width: 9, height: 9, borderRadius: c.r, backgroundColor: c.c,
                left: c.left, right: c.right, top: c.top, bottom: c.bottom, transform: c.rot ? [{ rotate: c.rot }] : undefined,
              }}
            />
          ))}
        </View>
        <View style={{ gap: 8, maxWidth: 320 }}>
          <Texto v="display" style={{ textAlign: 'center' }}>Anúncio publicado!</Texto>
          <Texto v="corpo" style={{ textAlign: 'center', color: cores.tintaSuave }}>
            {titulo ? `“${titulo}” já aparece para quem procura doações${cidade ? ` em ${cidade}` : ''}.` : 'Seu item já aparece na pesquisa.'}
          </Texto>
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <Botao
          titulo="Ver meu anúncio"
          onPress={() => {
            // Troca o formulário (modal) pelo detalhe do anúncio recém-publicado.
            const raiz = navigation.getParent<NavegacaoRaiz>();
            if (raiz) raiz.replace('Anuncio', { id });
            else fechar();
          }}
        />
        <Botao v="secundario" titulo="Voltar ao início" onPress={fechar} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  anel: { position: 'absolute', borderRadius: 999, borderWidth: 1.5, borderStyle: 'dashed', borderColor: cores.linhaForte, left: 0, top: 0, right: 0, bottom: 0 },
  disco: { position: 'absolute', left: 40, top: 40, right: 40, bottom: 40, borderRadius: 999, backgroundColor: cores.coral50 },
});
