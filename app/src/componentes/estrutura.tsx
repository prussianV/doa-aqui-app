// Estrutura de tela: folha inferior, topo, mapa aproximado, aviso (toast) e estado vazio.
import type { LucideIcon } from 'lucide-react-native';
import { ChevronLeft, MapPin, RefreshCw, WifiOff, X } from 'lucide-react-native';
import { ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, Animated, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSessao } from '@/estado/SessaoContexto';
import { cores, fontes, margem, raio } from '@/tema';
import { Botao, BotaoIcone, Icone, Texto } from './base';

/** Folha inferior (bottom sheet) usada em filtros, interesse e ações. */
export function Folha({ visivel, aoFechar, children, rolavel }: { visivel: boolean; aoFechar: () => void; children: ReactNode; rolavel?: boolean }) {
  const insets = useSafeAreaInsets();
  const conteudo = <View style={{ paddingHorizontal: margem, paddingBottom: Math.max(insets.bottom, 16) + 8 }}>{children}</View>;
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoFechar} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable style={f.fundo} onPress={aoFechar} accessibilityLabel="Fechar" />
        <View style={f.folha}>
          <View style={f.alca} />
          {rolavel ? <ScrollView bounces={false} style={{ maxHeight: 620 }} keyboardShouldPersistTaps="handled">{conteudo}</ScrollView> : conteudo}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** Barra de topo com voltar/fechar, título e ação opcional à direita. */
export function Topo({ titulo, aoVoltar, fechar, direita }: { titulo?: string; aoVoltar?: () => void; fechar?: boolean; direita?: ReactNode }) {
  return (
    <View style={f.topo}>
      <View style={{ width: 40 }}>
        {aoVoltar && <BotaoIcone i={fechar ? X : ChevronLeft} v="limpo" rotulo={fechar ? 'Fechar' : 'Voltar'} onPress={aoVoltar} />}
      </View>
      <Text style={f.topoTitulo} numberOfLines={1}>{titulo}</Text>
      <View style={{ minWidth: 40, alignItems: 'flex-end' }}>{direita}</View>
    </View>
  );
}

/** Mapa ilustrativo com a área aproximada (nunca o endereço). */
export function MapaAproximado({ rotulo, style, pequeno }: { rotulo?: string; style?: ViewStyle; pequeno?: boolean }) {
  const ruas = [0.18, 0.5, 0.82];
  return (
    <View style={[f.mapa, style]} accessibilityLabel={rotulo ? `Região aproximada: ${rotulo}` : 'Região aproximada'}>
      {ruas.map((p) => (
        <View key={`h${p}`} style={[f.rua, { top: `${p * 100}%`, left: 0, right: 0, height: pequeno ? 2 : 3 }]} />
      ))}
      {ruas.map((p) => (
        <View key={`v${p}`} style={[f.rua, { left: `${p * 100}%`, top: 0, bottom: 0, width: pequeno ? 2 : 3 }]} />
      ))}
      <View style={f.parque} />
      <View style={[f.avenida, { height: pequeno ? 4 : 7 }]} />
      <View style={f.zona} />
      {rotulo && (
        <View style={f.mapaRotulo}>
          <Icone i={MapPin} tam={13} cor={cores.coral500} />
          <Text style={f.mapaRotuloTexto}>{rotulo}</Text>
        </View>
      )}
    </View>
  );
}

/** Aviso curto que aparece na base da tela ("Salvo nos seus interesses"). */
export function Aviso() {
  const { aviso } = useSessao();
  const insets = useSafeAreaInsets();
  const [op] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(op, { toValue: aviso ? 1 : 0, duration: 180, useNativeDriver: true }).start();
  }, [aviso, op]);
  return (
    <Animated.View pointerEvents="none" style={[f.aviso, { bottom: insets.bottom + 92, opacity: op }]} accessibilityLiveRegion="polite">
      {aviso && <Text style={f.avisoTexto}>{aviso}</Text>}
    </Animated.View>
  );
}

/** Estado vazio com ícone, título, texto e ação opcional. */
export function Vazio({ i, titulo, texto, acao }: { i: LucideIcon; titulo: string; texto: string; acao?: ReactNode }) {
  return (
    <View style={f.vazio}>
      <View style={f.vazioIcone}>
        <Icone i={i} tam={30} cor={cores.coral600} />
      </View>
      <Texto v="subtitulo" style={{ textAlign: 'center', fontSize: 18 }}>{titulo}</Texto>
      <Texto v="corpo" style={{ textAlign: 'center', color: cores.tintaSuave, fontSize: 13.5 }}>{texto}</Texto>
      {acao}
    </View>
  );
}


/** Indicador de carregamento centralizado. */
export const Carregando = ({ texto = 'Carregando…' }: { texto?: string }) => (
  <View style={f.carregando} accessibilityLiveRegion="polite">
    <ActivityIndicator color={cores.coral500} size="large" />
    <Texto v="legenda">{texto}</Texto>
  </View>
);

/** Falha ao carregar (rede ou servidor), com botão para tentar de novo (RNF-005). */
export const FalhaCarga = ({ mensagem, aoTentar }: { mensagem: string; aoTentar: () => void }) => (
  <Vazio i={WifiOff} titulo="Não deu para carregar" texto={mensagem} acao={<Botao titulo="Tentar de novo" icone={RefreshCw} v="suave" onPress={aoTentar} style={{ marginTop: 8 }} />} />
);

const f = StyleSheet.create({
  carregando: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 64 },
  fundo: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(43,36,32,0.5)' },
  folha: {
    position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: cores.branco,
    borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingTop: 10, maxWidth: 640, alignSelf: 'center', width: '100%',
  },
  alca: { width: 40, height: 4, borderRadius: 2, backgroundColor: cores.linhaForte, alignSelf: 'center', marginBottom: 14 },
  topo: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  topoTitulo: { flex: 1, textAlign: 'center', fontFamily: fontes.extra, fontSize: 15.5, color: cores.tinta },
  mapa: { backgroundColor: '#ECE2D2', overflow: 'hidden', borderRadius: raio.lg, alignItems: 'center', justifyContent: 'center' },
  rua: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.9)' },
  parque: { position: 'absolute', width: '46%', height: '38%', left: '-8%', bottom: '-6%', backgroundColor: '#CFE3C8', borderRadius: 40 },
  avenida: { position: 'absolute', left: '-10%', right: '-10%', top: '62%', backgroundColor: '#F7D9A4', transform: [{ rotate: '-14deg' }] },
  zona: {
    position: 'absolute', width: '46%', aspectRatio: 1, borderRadius: 999, backgroundColor: 'rgba(232,99,74,0.2)',
    borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(201,79,56,0.75)',
  },
  mapaRotulo: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: cores.branco, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: raio.pleno, shadowColor: cores.sombra, shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  mapaRotuloTexto: { fontFamily: fontes.negrito, fontSize: 12, color: cores.tinta },
  aviso: {
    position: 'absolute', alignSelf: 'center', backgroundColor: cores.tinta, borderRadius: raio.pleno,
    paddingHorizontal: 18, paddingVertical: 11, zIndex: 50, elevation: 8,
  },
  avisoTexto: { color: cores.creme, fontFamily: fontes.semi, fontSize: 13.5 },
  vazio: { alignItems: 'center', gap: 10, paddingHorizontal: 32, paddingVertical: 48 },
  vazioIcone: { width: 72, height: 72, borderRadius: 24, backgroundColor: cores.coral50, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
});
