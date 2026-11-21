// Tokens de design do Doa Aqui.
// Mesmos valores do guia de identidade (design/doa-aqui-identidade.html).
import { Platform, TextStyle } from 'react-native';

export const cores = {
  coral500: '#E8634A', // marca, botão principal, doação
  coral600: '#C94F38', // textos e links coral (contraste AA)
  coral50: '#FCE6DF',
  verde600: '#2F8F6B', // ONG, verificado, sucesso
  verde700: '#23735A',
  verde50: '#DDEFE7',
  mel400: '#F2B544', // estrelas, avisos
  mel700: '#8A5A00',
  mel50: '#FCEFD3',
  creme: '#FBF6EF', // fundo das telas
  areia: '#F4EBDF',
  branco: '#FFFFFF',
  tinta: '#2B2420', // texto principal
  tintaSuave: '#7A6D63',
  linha: '#EADFD1',
  linhaForte: '#CDBFAE',
  erro: '#C23B2A',
  erro50: '#F8E0DC',
  sombra: '#2B2420',
} as const;

export const espaco = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32 } as const;

/** Margem lateral padrão das telas. */
export const margem = 18;

export const raio = { sm: 8, md: 12, lg: 16, xl: 24, pleno: 999 } as const;

// No Android a fonte é chamada pelo nome do arquivo (android/app/src/main/assets/fonts);
// no iOS, pelo nome PostScript. Os arquivos ficam em src/assets/fonts (npx react-native-asset).
const fonte = (arquivo: string, postscript: string) => (Platform.OS === 'ios' ? postscript : arquivo);

export const fontes = {
  display: fonte('Nunito_800ExtraBold', 'Nunito-ExtraBold'),
  black: fonte('Nunito_900Black', 'Nunito-Black'),
  corpo: fonte('PlusJakartaSans_400Regular', 'PlusJakartaSans-Regular'),
  medio: fonte('PlusJakartaSans_500Medium', 'PlusJakartaSans-Medium'),
  semi: fonte('PlusJakartaSans_600SemiBold', 'PlusJakartaSans-SemiBold'),
  negrito: fonte('PlusJakartaSans_700Bold', 'PlusJakartaSans-Bold'),
  extra: fonte('PlusJakartaSans_800ExtraBold', 'PlusJakartaSans-ExtraBold'),
} as const;

export const tipo = {
  display: { fontFamily: fontes.display, fontSize: 28, lineHeight: 34, color: cores.tinta },
  titulo: { fontFamily: fontes.display, fontSize: 22, lineHeight: 28, color: cores.tinta },
  subtitulo: { fontFamily: fontes.display, fontSize: 16, lineHeight: 22, color: cores.tinta },
  corpo: { fontFamily: fontes.corpo, fontSize: 14, lineHeight: 21, color: cores.tinta },
  forte: { fontFamily: fontes.negrito, fontSize: 14, lineHeight: 20, color: cores.tinta },
  legenda: { fontFamily: fontes.medio, fontSize: 12, lineHeight: 16, color: cores.tintaSuave },
  rotulo: {
    fontFamily: fontes.extra,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: cores.tintaSuave,
  },
} satisfies Record<string, TextStyle>;

export type VarianteTexto = keyof typeof tipo;

export const sombra = {
  card: {
    shadowColor: cores.sombra,
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  botao: {
    shadowColor: cores.coral500,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
} as const;
