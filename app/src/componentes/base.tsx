// Componentes básicos reaproveitados em várias telas (ver seção "Componentes" do guia).
import type { LucideIcon } from 'lucide-react-native';
import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { cores, fontes, raio, tipo, VarianteTexto } from '@/tema';

/* ---------- Texto ---------- */
export function Texto({ v = 'corpo', style, ...p }: TextProps & { v?: VarianteTexto; style?: StyleProp<TextStyle> }) {
  return <Text {...p} style={[tipo[v], style]} />;
}

/* ---------- Ícone ---------- */
export function Icone({ i: I, tam = 20, cor = cores.tinta, espessura = 1.8, preenchido }: { i: LucideIcon; tam?: number; cor?: string; espessura?: number; preenchido?: boolean }) {
  return <I size={tam} color={cor} strokeWidth={espessura} fill={preenchido ? cor : 'none'} />;
}

/* ---------- Botão ---------- */
type VarianteBotao = 'primario' | 'secundario' | 'suave' | 'fantasma' | 'perigo' | 'escuro';

export function Botao({
  titulo,
  onPress,
  v = 'primario',
  pequeno,
  icone,
  desativado,
  carregando,
  style,
  flex,
}: {
  titulo: string;
  onPress?: () => void;
  v?: VarianteBotao;
  pequeno?: boolean;
  icone?: LucideIcon;
  desativado?: boolean;
  carregando?: boolean;
  style?: StyleProp<ViewStyle>;
  flex?: boolean;
}) {
  const s = estiloBotao[v];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: desativado }}
      onPress={onPress}
      disabled={desativado || carregando}
      style={({ pressed }) => [
        b.botao,
        pequeno && b.pequeno,
        { backgroundColor: pressed && s.fundoPress ? s.fundoPress : s.fundo, borderColor: s.borda ?? 'transparent' },
        flex && { flex: 1 },
        (desativado || carregando) && { opacity: 0.5 },
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={s.texto} />
      ) : (
        <>
          {icone && <Icone i={icone} tam={pequeno ? 16 : 19} cor={s.texto} espessura={2} />}
          <Text style={[b.botaoTexto, pequeno && { fontSize: 13 }, { color: s.texto }]}>{titulo}</Text>
        </>
      )}
    </Pressable>
  );
}

const estiloBotao: Record<VarianteBotao, { fundo: string; fundoPress?: string; texto: string; borda?: string }> = {
  primario: { fundo: cores.coral500, fundoPress: cores.coral600, texto: cores.branco },
  secundario: { fundo: cores.branco, fundoPress: cores.areia, texto: cores.tinta, borda: cores.linha },
  suave: { fundo: cores.coral50, fundoPress: '#F8D5CA', texto: cores.coral600 },
  fantasma: { fundo: 'transparent', fundoPress: cores.coral50, texto: cores.coral600 },
  perigo: { fundo: cores.erro, fundoPress: '#A33022', texto: cores.branco },
  escuro: { fundo: cores.tinta, texto: cores.creme },
};

/* ---------- Botão de ícone ---------- */
export function BotaoIcone({
  i,
  onPress,
  v = 'padrao',
  rotulo,
  cor,
  preenchido,
  tam = 40,
  contador,
  ponto,
}: {
  i: LucideIcon;
  onPress?: () => void;
  v?: 'padrao' | 'suave' | 'vidro' | 'limpo';
  rotulo: string;
  cor?: string;
  preenchido?: boolean;
  tam?: number;
  contador?: number;
  ponto?: boolean;
}) {
  const fundo = { padrao: cores.branco, suave: cores.coral50, vidro: 'rgba(255,255,255,0.92)', limpo: 'transparent' }[v];
  const corIcone = cor ?? (v === 'suave' ? cores.coral600 : cores.tinta);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        b.botaoIcone,
        { width: tam, height: tam, backgroundColor: fundo, borderRadius: v === 'suave' ? raio.md : tam / 2 },
        v === 'padrao' && { borderWidth: 1, borderColor: cores.linha },
        pressed && { opacity: 0.6 },
      ]}
    >
      <Icone i={i} tam={Math.round(tam * 0.5)} cor={corIcone} preenchido={preenchido} />
      {!!contador && (
        <View style={b.contador}>
          <Text style={b.contadorTexto}>{contador}</Text>
        </View>
      )}
      {ponto && <View style={b.ponto} />}
    </Pressable>
  );
}

/* ---------- Chip (filtro / categoria) ---------- */
export function Chip({
  rotulo,
  ativo,
  selecionado,
  removivel,
  icone,
  onPress,
}: {
  rotulo: string;
  ativo?: boolean; // preenchido escuro (ex.: "Tudo")
  selecionado?: boolean; // contorno coral (seleção múltipla)
  removivel?: boolean;
  icone?: LucideIcon;
  onPress?: () => void;
}) {
  const corTexto = ativo ? cores.creme : selecionado || removivel ? cores.coral600 : cores.tinta;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!(ativo || selecionado) }}
      onPress={onPress}
      style={({ pressed }) => [
        b.chip,
        ativo && { backgroundColor: cores.tinta, borderColor: cores.tinta },
        selecionado && { backgroundColor: cores.coral50, borderColor: cores.coral500 },
        removivel && { backgroundColor: cores.coral50, borderColor: 'transparent', height: 30, paddingRight: 8 },
        pressed && { opacity: 0.7 },
      ]}
    >
      {icone && <Icone i={icone} tam={14} cor={corTexto} espessura={2} />}
      <Text style={[b.chipTexto, { color: corTexto }]}>{rotulo}</Text>
      {removivel && <Text style={[b.chipTexto, { color: corTexto, fontSize: 14 }]}>×</Text>}
    </Pressable>
  );
}

/* ---------- Selo (pill) ---------- */
export function Selo({ texto, tom = 'neutro', ponto = true, sobreImagem }: { texto: string; tom?: 'doacao' | 'troca' | 'neutro' | 'aviso' | 'ok'; ponto?: boolean; sobreImagem?: boolean }) {
  const t = {
    doacao: { fundo: cores.coral50, texto: cores.coral600 },
    troca: { fundo: cores.verde50, texto: cores.verde700 },
    ok: { fundo: cores.verde50, texto: cores.verde700 },
    neutro: { fundo: cores.areia, texto: cores.tintaSuave },
    aviso: { fundo: cores.mel50, texto: cores.mel700 },
  }[tom];
  return (
    <View style={[b.selo, { backgroundColor: sobreImagem ? cores.branco : t.fundo }]}>
      {ponto && <View style={[b.seloPonto, { backgroundColor: t.texto }]} />}
      <Text style={[b.seloTexto, { color: t.texto }]}>{texto}</Text>
    </View>
  );
}

/* ---------- Segmentado ---------- */
export function Segmentado<T extends string>({ opcoes, valor, onChange }: { opcoes: { id: T; nome: string }[]; valor: T; onChange: (v: T) => void }) {
  return (
    <View style={b.seg} accessibilityRole="tablist">
      {opcoes.map((o) => {
        const on = o.id === valor;
        return (
          <Pressable key={o.id} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => onChange(o.id)} style={[b.segItem, on && b.segOn]}>
            <Text style={[b.segTexto, on && { color: cores.tinta }]}>{o.nome}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------- Campo de formulário ---------- */
export function Campo({
  rotulo,
  erro,
  contador,
  limite,
  icone,
  multiline,
  style,
  ...p
}: TextInputProps & { rotulo?: string; erro?: string; contador?: boolean; limite?: number; icone?: LucideIcon }) {
  const valor = String(p.value ?? '');
  return (
    <View style={{ gap: 6 }}>
      {rotulo && <Text style={b.rotuloCampo}>{rotulo}</Text>}
      <View style={[b.campo, multiline && b.campoMulti, !!erro && { borderColor: cores.erro }]}>
        {icone && <Icone i={icone} tam={18} cor={cores.tintaSuave} />}
        <TextInput
          placeholderTextColor={cores.tintaSuave}
          multiline={multiline}
          maxLength={limite}
          style={[b.campoInput, multiline && { minHeight: 76, textAlignVertical: 'top' }, style]}
          {...p}
        />
      </View>
      {(erro || contador) && (
        <View style={b.ajuda}>
          <Text style={[b.ajudaTexto, !!erro && { color: cores.erro, fontFamily: fontes.semi }]}>{erro ?? ''}</Text>
          {contador && limite && <Text style={b.ajudaTexto}>{valor.length}/{limite}</Text>}
        </View>
      )}
    </View>
  );
}

/* ---------- Rótulo de seção ---------- */
export const Rotulo = ({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) => (
  <Texto v="rotulo" style={[{ marginBottom: 8 }, style]}>{children}</Texto>
);

/* ---------- Avatar com iniciais ---------- */
export function Avatar({ iniciais, tam = 40, tom = 'coral' }: { iniciais: string; tam?: number; tom?: 'coral' | 'verde' | 'mel' }) {
  const t = { coral: [cores.coral50, cores.coral600], verde: [cores.verde50, cores.verde700], mel: [cores.mel50, cores.mel700] }[tom];
  return (
    <View style={{ width: tam, height: tam, borderRadius: tam / 2, backgroundColor: t[0], alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: fontes.display, fontSize: tam * 0.36, color: t[1] }}>{iniciais}</Text>
    </View>
  );
}

/* ---------- Dica ---------- */
export function Dica({ i, children, tom = 'areia' }: { i: LucideIcon; children: ReactNode; tom?: 'areia' | 'verde' }) {
  return (
    <View style={[b.dica, tom === 'verde' && { backgroundColor: cores.verde50 }]}>
      <Icone i={i} tam={16} cor={cores.verde600} />
      <Text style={b.dicaTexto}>{children}</Text>
    </View>
  );
}

/* ---------- Área tocável simples ---------- */
export const Tocavel = ({ style, ...p }: PressableProps & { style?: StyleProp<ViewStyle> }) => (
  <Pressable {...p} style={({ pressed }) => [style, pressed && { opacity: 0.65 }]} />
);

const b = StyleSheet.create({
  botao: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pequeno: { height: 40, borderRadius: 11, paddingHorizontal: 14 },
  botaoTexto: { fontFamily: fontes.extra, fontSize: 15 },
  botaoIcone: { alignItems: 'center', justifyContent: 'center' },
  contador: {
    position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: cores.tinta, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  contadorTexto: { color: cores.creme, fontFamily: fontes.negrito, fontSize: 10 },
  ponto: {
    position: 'absolute', top: 9, right: 10, width: 9, height: 9, borderRadius: 5,
    backgroundColor: cores.coral500, borderWidth: 2, borderColor: cores.branco,
  },
  chip: {
    height: 34, paddingHorizontal: 13, borderRadius: raio.pleno, borderWidth: 1.5, borderColor: cores.linha,
    backgroundColor: cores.branco, flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  chipTexto: { fontFamily: fontes.semi, fontSize: 12.5 },
  selo: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: raio.pleno, alignSelf: 'flex-start' },
  seloPonto: { width: 6, height: 6, borderRadius: 3 },
  seloTexto: { fontFamily: fontes.negrito, fontSize: 10.5 },
  seg: { flexDirection: 'row', backgroundColor: cores.areia, borderRadius: raio.md, padding: 3 },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: raio.md - 3 },
  segOn: {
    backgroundColor: cores.branco,
    shadowColor: cores.sombra, shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  segTexto: { fontFamily: fontes.semi, fontSize: 12.5, color: cores.tintaSuave },
  rotuloCampo: { fontFamily: fontes.negrito, fontSize: 12, color: cores.tinta },
  campo: {
    minHeight: 48, borderRadius: raio.md, borderWidth: 1.5, borderColor: cores.linha, backgroundColor: cores.branco,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8,
  },
  campoMulti: { alignItems: 'flex-start', paddingVertical: 10 },
  campoInput: { flex: 1, fontFamily: fontes.corpo, fontSize: 14.5, color: cores.tinta, paddingVertical: 10, outlineWidth: 0 } as TextStyle,
  ajuda: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  ajudaTexto: { fontFamily: fontes.medio, fontSize: 11.5, color: cores.tintaSuave, flexShrink: 1 },
  dica: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: cores.areia, borderRadius: raio.md, padding: 12 },
  dicaTexto: { flex: 1, fontFamily: fontes.medio, fontSize: 12, lineHeight: 17, color: cores.tintaSuave },
});
