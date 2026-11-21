// Rotas do app e os parâmetros de cada uma (React Navigation, tipado).
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

/** Abas da barra inferior. "Novo" é só o botão Anunciar: abre o fluxo de anúncio por cima das abas. */
export type RotasAbas = {
  Inicio: undefined;
  Meus: undefined;
  Novo: undefined;
  Conta: undefined;
  Admin: undefined;
};

/** Passos do formulário de anúncio (UC-07 e edição do UC-08). */
export type RotasAnunciar = {
  Detalhes: undefined;
  Local: undefined;
  Publicado: { id: number; titulo: string; cidade: string };
};

/** Pilha principal. As telas de conta e o formulário de anúncio abrem como modal. */
export type RotasRaiz = {
  Abas: NavigatorScreenParams<RotasAbas> | undefined;
  BoasVindas: undefined;
  Busca: { categoria?: number; filtros?: boolean } | undefined;
  Anuncio: { id: number };
  Interessados: { id: number };
  Entrar: { motivo?: 'anunciar' | 'interesse' } | undefined;
  Cadastro: undefined;
  RecuperarSenha: { email?: string } | undefined;
  /** link: endereço completo do e-mail de redefinição (doaaqui://nova-senha#access_token=...). */
  NovaSenha: { link?: string } | undefined;
  Anunciar: { editar?: number } | undefined;
};

export type TelaRaiz<R extends keyof RotasRaiz> = NativeStackScreenProps<RotasRaiz, R>;
export type TelaAnunciar<R extends keyof RotasAnunciar> = NativeStackScreenProps<RotasAnunciar, R>;
export type NavegacaoRaiz = NativeStackNavigationProp<RotasRaiz>;

declare global {
  namespace ReactNavigation {
    // Faz useNavigation() conhecer as rotas da pilha principal em qualquer tela.
    interface RootParamList extends RotasRaiz {}
  }
}
