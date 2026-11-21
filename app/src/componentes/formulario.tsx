// Topo e rodapé compartilhados pelos passos do formulário de anúncio.
import { useNavigation } from '@react-navigation/native';
import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRascunho } from '@/estado/RascunhoContexto';
import { cores, fontes, margem } from '@/tema';
import { Topo } from './estrutura';

export function TelaFormulario({ passo, titulo, children, rodape }: { passo: 1 | 2; titulo: string; children: ReactNode; rodape: ReactNode }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { editarId, fechar } = useRascunho();
  // No iOS o modal já começa abaixo da barra de status; nas outras plataformas, compensamos.
  const topo = Platform.OS === 'ios' ? 8 : insets.top;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: cores.creme, paddingTop: topo }}>
      <Topo
        titulo={editarId ? 'Editar anúncio' : 'Novo anúncio'}
        fechar={passo === 1}
        aoVoltar={passo === 1 ? fechar : () => navigation.goBack()}
        direita={<Text style={s.passo}>{passo} de 2</Text>}
      />
      <View style={s.progresso} accessibilityLabel={`Passo ${passo} de 2`}>
        {[1, 2].map((i) => (
          <View key={i} style={[s.barra, i <= passo && { backgroundColor: cores.coral500 }]} />
        ))}
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: margem, paddingTop: 18, paddingBottom: 24, gap: 16 }}>
        <Text style={s.titulo}>{titulo}</Text>
        {children}
      </ScrollView>
      <View style={[s.rodape, { paddingBottom: Math.max(insets.bottom, 14) }]}>{rodape}</View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  passo: { fontFamily: fontes.medio, fontSize: 12, color: cores.tintaSuave, paddingRight: 8 },
  progresso: { flexDirection: 'row', gap: 6, paddingHorizontal: margem },
  barra: { flex: 1, height: 4, borderRadius: 2, backgroundColor: cores.linha },
  titulo: { fontFamily: fontes.display, fontSize: 23, lineHeight: 29, color: cores.tinta },
  rodape: { paddingHorizontal: margem, paddingTop: 10, backgroundColor: cores.creme },
});
