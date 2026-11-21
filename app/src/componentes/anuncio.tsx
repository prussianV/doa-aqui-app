// Peças ligadas a anúncios: imagem (ilustração da categoria), card da grade e linha da lista.
import { MapPin } from 'lucide-react-native';
import { ReactNode, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { ilustracaoDe, ROTULO_STATUS } from '@/negocio/catalogo';
import type { Anuncio, StatusAnuncio } from '@/negocio/tipos';
import { cores, fontes, raio, sombra } from '@/tema';
import { Icone, Selo } from './base';
import { DesenhoItem, FUNDOS } from './Ilustracoes';

/** O MVP não tem fotos: cada anúncio mostra a ilustração da sua categoria. */
export function ImagemAnuncio({ slug, style, escala = 0.74 }: { slug?: string; style?: ViewStyle; escala?: number }) {
  const [lado, setLado] = useState(0);
  const ilustracao = ilustracaoDe(slug);
  const medir = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLado(Math.min(width, height));
  };
  return (
    <View onLayout={medir} style={[s.imagem, { backgroundColor: FUNDOS[ilustracao.fundo] }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {lado > 0 && <DesenhoItem ilustracao={ilustracao} tamanho={lado * escala} />}
    </View>
  );
}

const TOM_STATUS: Record<StatusAnuncio, 'ok' | 'doacao' | 'neutro'> = { DISPONIVEL: 'ok', DOADO: 'doacao', INATIVO: 'neutro' };

export const SeloStatus = ({ status, sobreImagem }: { status: StatusAnuncio; sobreImagem?: boolean }) => (
  <Selo texto={ROTULO_STATUS[status]} tom={TOM_STATUS[status]} sobreImagem={sobreImagem} />
);

export const Local = ({ a }: { a: Pick<Anuncio, 'cidade' | 'uf'> }) => (
  <View style={s.meta}>
    <Icone i={MapPin} tam={12} cor={cores.tintaSuave} />
    <Text style={s.metaTexto} numberOfLines={1}>{a.cidade} · {a.uf}</Text>
  </View>
);

/** Card da grade do Início (2 colunas). */
export function CardAnuncio({ anuncio, onPress }: { anuncio: Anuncio; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${anuncio.titulo}, ${anuncio.cidade}`} style={({ pressed }) => [s.card, pressed && { opacity: 0.85 }]}>
      <View>
        <ImagemAnuncio slug={anuncio.categoria?.slug} style={{ height: 118 }} />
        {anuncio.categoria && (
          <View style={s.seloCard}>
            <Selo texto={anuncio.categoria.nome} ponto={false} sobreImagem />
          </View>
        )}
      </View>
      <View style={s.cardCorpo}>
        <Text style={s.cardTitulo} numberOfLines={2}>{anuncio.titulo}</Text>
        <Local a={anuncio} />
      </View>
    </Pressable>
  );
}

/** Linha de lista (resultados, meus anúncios, administração). O conteúdo à direita fica fora da área tocável. */
export function LinhaAnuncio({ anuncio, onPress, topo, sub, direita }: { anuncio: Anuncio; onPress?: () => void; topo?: ReactNode; sub?: ReactNode; direita?: ReactNode }) {
  return (
    <View style={s.linha}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={anuncio.titulo}
        style={({ pressed }) => [s.linhaToque, pressed && { opacity: 0.8 }]}
      >
        <ImagemAnuncio slug={anuncio.categoria?.slug} style={s.miniatura} />
        <View style={{ flex: 1, gap: 4 }}>
          {topo}
          <Text style={s.linhaTitulo} numberOfLines={2}>{anuncio.titulo}</Text>
          {sub ?? <Local a={anuncio} />}
        </View>
      </Pressable>
      {direita}
    </View>
  );
}

const s = StyleSheet.create({
  imagem: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  card: { flex: 1, backgroundColor: cores.branco, borderRadius: raio.lg, overflow: 'hidden', ...sombra.card },
  seloCard: { position: 'absolute', top: 8, left: 8 },
  cardCorpo: { padding: 10, paddingTop: 8, gap: 4 },
  cardTitulo: { fontFamily: fontes.negrito, fontSize: 13, lineHeight: 17, color: cores.tinta, minHeight: 34 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaTexto: { fontFamily: fontes.medio, fontSize: 11.5, color: cores.tintaSuave, flexShrink: 1 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: cores.branco, borderRadius: raio.lg, padding: 8, ...sombra.card },
  linhaToque: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniatura: { width: 72, height: 72, borderRadius: 12 },
  linhaTitulo: { fontFamily: fontes.negrito, fontSize: 13.5, lineHeight: 18, color: cores.tinta },
});
