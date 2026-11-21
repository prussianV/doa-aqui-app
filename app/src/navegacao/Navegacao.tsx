// Navegação do app: pilha principal, barra de abas e links doaaqui://.
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  DefaultTheme,
  getStateFromPath as estadoPadraoDoLink,
  LinkingOptions,
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { House, Package, Plus, ShieldCheck, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { ColorValue, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSessao } from '@/estado/SessaoContexto';
import Admin from '@/telas/Admin';
import FluxoAnunciar from '@/telas/anunciar/FluxoAnunciar';
import BoasVindas from '@/telas/BoasVindas';
import Busca from '@/telas/Busca';
import Cadastro from '@/telas/Cadastro';
import Conta from '@/telas/Conta';
import DetalheAnuncio from '@/telas/DetalheAnuncio';
import Entrar from '@/telas/Entrar';
import Inicio from '@/telas/Inicio';
import Interessados from '@/telas/Interessados';
import MeusItens from '@/telas/MeusItens';
import NovaSenha from '@/telas/NovaSenha';
import RecuperarSenha from '@/telas/RecuperarSenha';
import { cores, fontes, sombra } from '@/tema';
import type { NavegacaoRaiz, RotasAbas, RotasRaiz } from './tipos';

const Pilha = createNativeStackNavigator<RotasRaiz>();
const Abas = createBottomTabNavigator<RotasAbas>();

const icone = (I: LucideIcon) =>
  function IconeAba({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <I size={22} color={color as string} strokeWidth={focused ? 2.2 : 1.8} />;
  };

/** A aba "Novo" nunca é exibida: o botão abre o formulário de anúncio (ou o login, para visitantes). */
const SemTela = () => null;

function BotaoAnunciar() {
  const navigation = useNavigation<NavegacaoRaiz>();
  const { perfil } = useSessao();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Anunciar um item"
      onPress={() => (perfil ? navigation.navigate('Anunciar') : navigation.navigate('Entrar', { motivo: 'anunciar' }))}
      style={e.anunciar}
    >
      <View style={e.anunciarBotao}>
        <Plus size={24} color={cores.branco} strokeWidth={2.4} />
      </View>
      <Text style={e.anunciarTexto}>Anunciar</Text>
    </Pressable>
  );
}

const botaoAnunciar = () => <BotaoAnunciar />;

/** Barra inferior: Início, Meus itens, Anunciar (destaque), Conta e, só para o administrador, Admin. */
function NavegacaoAbas() {
  const { ehAdmin } = useSessao();
  const insets = useSafeAreaInsets();
  return (
    <Abas.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.coral600,
        tabBarInactiveTintColor: cores.tintaSuave,
        tabBarLabelStyle: { fontFamily: fontes.semi, fontSize: 10.5 },
        tabBarStyle: {
          backgroundColor: cores.branco,
          borderTopColor: cores.linha,
          height: 62 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        sceneStyle: { backgroundColor: cores.creme },
      }}
    >
      <Abas.Screen name="Inicio" component={Inicio} options={{ title: 'Início', tabBarIcon: icone(House) }} />
      <Abas.Screen name="Meus" component={MeusItens} options={{ title: 'Meus itens', tabBarIcon: icone(Package) }} />
      <Abas.Screen name="Novo" component={SemTela} options={{ title: 'Anunciar', tabBarButton: botaoAnunciar }} />
      <Abas.Screen name="Conta" component={Conta} options={{ title: 'Conta', tabBarIcon: icone(User) }} />
      {ehAdmin && <Abas.Screen name="Admin" component={Admin} options={{ title: 'Admin', tabBarIcon: icone(ShieldCheck) }} />}
    </Abas.Navigator>
  );
}

/**
 * Links que abrem o app: doaaqui://nova-senha (e-mail de redefinição de senha) e doaaqui://anuncio/ID.
 * O link de senha traz os tokens depois de "#", que o roteador padrão não entende: ele vai inteiro
 * para a tela Nova senha, que cria a sessão de recuperação.
 */
const linking: LinkingOptions<RotasRaiz> = {
  prefixes: ['doaaqui://'],
  config: {
    initialRouteName: 'Abas',
    screens: {
      Abas: { screens: { Inicio: '', Meus: 'meus', Conta: 'conta' } },
      Anuncio: { path: 'anuncio/:id', parse: { id: Number } },
      NovaSenha: 'nova-senha',
    },
  },
  getStateFromPath(caminho, opcoes) {
    const limpo = caminho.replace(/^\/+/, '');
    if (limpo.startsWith('nova-senha')) {
      return { routes: [{ name: 'Abas' }, { name: 'NovaSenha', params: { link: `doaaqui://${limpo}` } }] } as ReturnType<
        typeof estadoPadraoDoLink
      >;
    }
    return estadoPadraoDoLink(caminho, opcoes);
  },
};

const temaNavegacao = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: cores.creme, primary: cores.coral500, card: cores.branco, text: cores.tinta, border: cores.linha },
};

export function Navegacao({ inicial }: { inicial: 'Abas' | 'BoasVindas' }) {
  return (
    <NavigationContainer linking={linking} theme={temaNavegacao}>
      <Pilha.Navigator initialRouteName={inicial} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.creme } }}>
        <Pilha.Screen name="Abas" component={NavegacaoAbas} />
        <Pilha.Screen name="BoasVindas" component={BoasVindas} options={{ animation: 'fade' }} />
        <Pilha.Screen name="Busca" component={Busca} />
        <Pilha.Screen name="Anuncio" component={DetalheAnuncio} />
        <Pilha.Screen name="Interessados" component={Interessados} />
        <Pilha.Screen name="NovaSenha" component={NovaSenha} />
        <Pilha.Group screenOptions={{ presentation: 'modal', animation: 'slide_from_bottom' }}>
          <Pilha.Screen name="Entrar" component={Entrar} />
          <Pilha.Screen name="Cadastro" component={Cadastro} />
          <Pilha.Screen name="RecuperarSenha" component={RecuperarSenha} />
          <Pilha.Screen name="Anunciar" component={FluxoAnunciar} />
        </Pilha.Group>
      </Pilha.Navigator>
    </NavigationContainer>
  );
}

const e = StyleSheet.create({
  anunciar: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 3, paddingBottom: 2 },
  anunciarBotao: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: cores.coral500,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    ...sombra.botao,
  },
  anunciarTexto: { fontFamily: fontes.semi, fontSize: 10.5, color: cores.tintaSuave },
});
