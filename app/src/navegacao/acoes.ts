// Ações de navegação usadas em várias telas.
import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';

import type { NavegacaoRaiz } from './tipos';

export function useNavegacao() {
  const navigation = useNavigation<NavegacaoRaiz>();
  return useMemo(
    () => ({
      navigation,
      /** Volta uma tela; se não houver para onde voltar (aberto por link), vai para o Início. */
      voltar: () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Abas', { screen: 'Inicio' })),
      /** Fecha tudo o que está por cima das abas e mostra o Início. */
      irParaInicio: () => navigation.popTo('Abas', { screen: 'Inicio' }),
    }),
    [navigation],
  );
}
