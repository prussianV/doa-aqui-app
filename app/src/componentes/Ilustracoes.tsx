// Logo e ilustrações de categoria, desenhadas com react-native-svg (mesmos desenhos do guia).
import Svg, { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { cores } from '@/tema';

/** Desenho usado no lugar de foto (o MVP não tem imagens nos anúncios). */
export type Ilustracao = {
  tipo: 'casaco' | 'livros' | 'cadeira' | 'racao' | 'blocos' | 'bicicleta';
  fundo: 'coral' | 'verde' | 'mel' | 'areia';
  cor?: [string, string];
};

/** Símbolo da marca: pin com coração vazado. */
export function Marca({ tamanho = 48, cor = cores.coral500, coracao = cores.creme }: { tamanho?: number; cor?: string; coracao?: string }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 48 48">
      <Path fill={cor} d="M24 3.5C14.9 3.5 7.5 10.7 7.5 19.6 7.5 31.4 24 45 24 45s16.5-13.6 16.5-25.4C40.5 10.7 33.1 3.5 24 3.5z" />
      <Path fill={coracao} d="M24 27.2c0 0-7.6-4.6-7.6-9.6 0-2.5 1.9-4.3 4.2-4.3 1.5 0 2.7.8 3.4 2 .7-1.2 1.9-2 3.4-2 2.3 0 4.2 1.8 4.2 4.3 0 5-7.6 9.6-7.6 9.6z" />
    </Svg>
  );
}

export const FUNDOS: Record<Ilustracao['fundo'], string> = {
  coral: '#FCE6DF',
  verde: '#DDEFE7',
  mel: '#FCEFD3',
  areia: '#F4EBDF',
};

const Sombra = () => <Ellipse cx={60} cy={100} rx={34} ry={4} fill="#2B2420" opacity={0.08} />;

function Casaco({ c = '#5B8DEF', d = '#3E6DB5' }: { c?: string; d?: string }) {
  return (
    <G>
      <Sombra />
      <Path d="M44 26 60 33l16-7 20 15-8 18-6-4v41H38V55l-6 4-8-18z" fill={c} />
      <Path d="M44 26l16 18 16-18-6-3-10 10-10-10z" fill={d} />
      <Path d="M60 44v52" stroke={d} strokeWidth={2.5} />
      <Rect x={43} y={68} width={11} height={3.5} rx={1.75} fill={d} />
      <Rect x={66} y={68} width={11} height={3.5} rx={1.75} fill={d} />
      <Circle cx={60} cy={56} r={2} fill="#FBF6EF" />
      <Circle cx={60} cy={68} r={2} fill="#FBF6EF" />
      <Circle cx={60} cy={80} r={2} fill="#FBF6EF" />
    </G>
  );
}

function Livros() {
  return (
    <G>
      <Sombra />
      <Rect x={26} y={76} width={68} height={18} rx={3} fill="#2F8F6B" />
      <Rect x={26} y={76} width={8} height={18} rx={2} fill="#23735A" />
      <Rect x={32} y={58} width={60} height={18} rx={3} fill="#E8634A" />
      <Rect x={84} y={58} width={8} height={18} rx={2} fill="#C94F38" />
      <Rect x={22} y={40} width={62} height={18} rx={3} fill="#F2B544" />
      <Rect x={22} y={40} width={8} height={18} rx={2} fill="#D99A2B" />
      <Rect x={40} y={47} width={30} height={3.5} rx={1.75} fill="#FBF6EF" opacity={0.85} />
      <Rect x={44} y={65} width={26} height={3.5} rx={1.75} fill="#FBF6EF" opacity={0.85} />
      <Rect x={44} y={83} width={34} height={3.5} rx={1.75} fill="#FBF6EF" opacity={0.85} />
      <Rect x={52} y={20} width={14} height={20} rx={2} fill="#2B2420" transform="rotate(10 59 30)" />
    </G>
  );
}

function Cadeira() {
  return (
    <G>
      <Sombra />
      <Rect x={42} y={66} width={5} height={30} rx={2} fill="#9A5F2E" />
      <Rect x={73} y={66} width={5} height={30} rx={2} fill="#9A5F2E" />
      <Rect x={44} y={18} width={32} height={42} rx={6} fill="#C98A4E" />
      <Rect x={50} y={26} width={20} height={4} rx={2} fill="#A86A35" />
      <Rect x={50} y={35} width={20} height={4} rx={2} fill="#A86A35" />
      <Rect x={50} y={44} width={20} height={4} rx={2} fill="#A86A35" />
      <Rect x={34} y={58} width={52} height={12} rx={4} fill="#DDA064" />
      <Rect x={36} y={70} width={6} height={30} rx={2.5} fill="#B5753D" />
      <Rect x={78} y={70} width={6} height={30} rx={2.5} fill="#B5753D" />
    </G>
  );
}

function Racao() {
  return (
    <G>
      <Sombra />
      <Path d="M38 34h44l5 62H33z" fill="#2F8F6B" />
      <Rect x={36} y={25} width={48} height={11} rx={2} fill="#23735A" />
      <Circle cx={60} cy={66} r={15} fill="#FBF6EF" />
      <G fill="#E8634A">
        <Path d="M60 65c-3.4 0-5.8 3.4-5.8 5.8 0 1.6 1.3 2.6 2.8 2.3 1.2-.2 1.8-.7 3-.7s1.8.5 3 .7c1.5.3 2.8-.7 2.8-2.3 0-2.4-2.4-5.8-5.8-5.8z" />
        <Circle cx={55.8} cy={59.5} r={2} />
        <Circle cx={64.2} cy={59.5} r={2} />
        <Circle cx={51.8} cy={64.5} r={1.8} />
        <Circle cx={68.2} cy={64.5} r={1.8} />
      </G>
      <Rect x={46} y={86} width={28} height={3.5} rx={1.75} fill="#FBF6EF" opacity={0.75} />
    </G>
  );
}

function Blocos() {
  return (
    <G>
      <Sombra />
      <Rect x={24} y={62} width={34} height={34} rx={5} fill="#F2B544" />
      <Rect x={62} y={62} width={34} height={34} rx={5} fill="#2F8F6B" />
      <G transform="rotate(-6 60 42)">
        <Rect x={43} y={25} width={34} height={34} rx={5} fill="#E8634A" />
        <SvgText x={60} y={49} fontSize={20} fontWeight="900" fill="#FBF6EF" textAnchor="middle">C</SvgText>
      </G>
      <SvgText x={41} y={86} fontSize={20} fontWeight="900" fill="#FBF6EF" textAnchor="middle">A</SvgText>
      <SvgText x={79} y={86} fontSize={20} fontWeight="900" fill="#FBF6EF" textAnchor="middle">B</SvgText>
    </G>
  );
}

function Bicicleta() {
  return (
    <G>
      <Sombra />
      <Circle cx={36} cy={76} r={17} fill="none" stroke="#2B2420" strokeWidth={5} />
      <Circle cx={86} cy={76} r={17} fill="none" stroke="#2B2420" strokeWidth={5} />
      <Path
        d="M36 76 52 52h26l8 24M52 52l12 24H36M78 52l-4-12M68 40h12M52 52l-3-8h-8"
        fill="none"
        stroke="#E8634A"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={64} cy={76} r={4} fill="#2B2420" />
    </G>
  );
}

/** Desenho de um item, sem fundo. Ocupa o tamanho dado. */
export function DesenhoItem({ ilustracao, tamanho }: { ilustracao: Ilustracao; tamanho: number }) {
  const [c, d] = ilustracao.cor ?? [];
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 120 120">
      {ilustracao.tipo === 'casaco' && <Casaco c={c} d={d} />}
      {ilustracao.tipo === 'livros' && <Livros />}
      {ilustracao.tipo === 'cadeira' && <Cadeira />}
      {ilustracao.tipo === 'racao' && <Racao />}
      {ilustracao.tipo === 'blocos' && <Blocos />}
      {ilustracao.tipo === 'bicicleta' && <Bicicleta />}
    </Svg>
  );
}
