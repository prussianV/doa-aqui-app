// Hook simples para carregar dados de um serviço com estados de carregando e erro (RNF-005).
// O estado só muda depois da resposta do servidor (nunca de forma síncrona dentro do efeito).
import { useFocusEffect } from '@react-navigation/native';
import { DependencyList, useCallback, useEffect, useRef, useState } from 'react';

type Estado<T> = { chave: string | null; dados: T | null; erro: string | null };

const mensagem = (e: unknown) => (e instanceof Error ? e.message : 'Algo deu errado.');

export function useConsulta<T>(buscar: () => Promise<T>, deps: DependencyList, opcoes?: { aoFocar?: boolean }) {
  // As dependências são valores simples (ids, filtros); a chave identifica a consulta atual.
  const chave = JSON.stringify(deps);
  const aoFocar = !!opcoes?.aoFocar;
  const buscarRef = useRef(buscar);
  useEffect(() => {
    buscarRef.current = buscar;
  });

  const [estado, setEstado] = useState<Estado<T>>({ chave: null, dados: null, erro: null });
  const [recarregando, setRecarregando] = useState(false);
  const seq = useRef(0);

  const carregar = useCallback(async (k: string) => {
    const minha = ++seq.current;
    try {
      const r = await buscarRef.current();
      if (minha === seq.current) setEstado({ chave: k, dados: r, erro: null });
    } catch (e) {
      if (minha === seq.current) setEstado((s) => ({ chave: k, dados: s.dados, erro: mensagem(e) }));
    } finally {
      if (minha === seq.current) setRecarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!aoFocar) carregar(chave);
  }, [chave, aoFocar, carregar]);

  // Telas de lista recarregam ao voltar para elas (ex.: depois de publicar ou editar).
  useFocusEffect(
    useCallback(() => {
      if (aoFocar) carregar(chave);
    }, [chave, aoFocar, carregar]),
  );

  /** Recarga pedida pela pessoa (puxar para atualizar, "Tentar de novo", depois de uma ação). */
  const recarregar = useCallback(async () => {
    setRecarregando(true);
    await carregar(chave);
  }, [carregar, chave]);

  const setDados = useCallback((fn: (d: T | null) => T | null) => setEstado((s) => ({ ...s, dados: fn(s.dados) })), []);

  return {
    dados: estado.dados,
    carregando: recarregando || estado.chave !== chave,
    erro: estado.chave === chave ? estado.erro : null,
    recarregar,
    setDados,
  };
}
