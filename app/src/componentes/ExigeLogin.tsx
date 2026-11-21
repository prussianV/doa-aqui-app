// Mostra um convite para entrar quando a tela exige conta (RF-002: operações privadas exigem autenticação).
import { useNavigation } from '@react-navigation/native';
import type { LucideIcon } from 'lucide-react-native';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSessao } from '@/estado/SessaoContexto';
import { cores } from '@/tema';
import { Botao } from './base';
import { Vazio } from './estrutura';

export function ExigeLogin({ i, titulo, texto, children }: { i: LucideIcon; titulo: string; texto: string; children: ReactNode }) {
  const { perfil } = useSessao();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  if (perfil) return <>{children}</>;
  return (
    <View style={{ flex: 1, backgroundColor: cores.creme, paddingTop: insets.top + 40 }}>
      <Vazio
        i={i}
        titulo={titulo}
        texto={texto}
        acao={
          <View style={{ gap: 8, alignSelf: 'stretch', marginTop: 8 }}>
            <Botao titulo="Entrar" onPress={() => navigation.navigate('Entrar')} />
            <Botao titulo="Criar conta" v="secundario" onPress={() => navigation.navigate('Cadastro')} />
          </View>
        }
      />
    </View>
  );
}
