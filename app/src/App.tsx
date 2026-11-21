// Raiz do app: área segura, sessão do Supabase, barra de status, navegação e avisos.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Aviso } from '@/componentes/estrutura';
import { Marca } from '@/componentes/Ilustracoes';
import { SessaoProvider, useSessao } from '@/estado/SessaoContexto';
import { CHAVE_BOAS_VINDAS } from '@/lib/preferencias';
import { Navegacao } from '@/navegacao/Navegacao';
import { cores } from '@/tema';

/** Continua a tela de abertura do sistema (coral) enquanto a sessão salva é restaurada. */
function TelaAbertura() {
  return (
    <View style={s.abertura} accessibilityLabel="Abrindo o Doa Aqui">
      <Marca tamanho={96} cor={cores.creme} coracao={cores.coral500} />
      <ActivityIndicator color={cores.creme} style={{ marginTop: 28 }} />
    </View>
  );
}

function Raiz() {
  const { pronto, perfil } = useSessao();
  const [boasVindas, setBoasVindas] = useState<'carregando' | 'mostrar' | 'vista'>('carregando');

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_BOAS_VINDAS)
      .then((v) => setBoasVindas(v ? 'vista' : 'mostrar'))
      .catch(() => setBoasVindas('vista'));
  }, []);

  if (!pronto || boasVindas === 'carregando') return <TelaAbertura />;

  return (
    <View style={{ flex: 1, backgroundColor: cores.creme }}>
      {/* Na primeira abertura mostra as boas-vindas, exceto para quem já entrou numa conta. */}
      <Navegacao inicial={boasVindas === 'mostrar' && !perfil ? 'BoasVindas' : 'Abas'} />
      <Aviso />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <SessaoProvider>
        <Raiz />
      </SessaoProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  abertura: { flex: 1, backgroundColor: cores.coral500, alignItems: 'center', justifyContent: 'center' },
});
