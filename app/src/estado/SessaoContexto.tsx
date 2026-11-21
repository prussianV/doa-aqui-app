// Estado global: sessão do Supabase Auth, perfil do usuário logado, categorias e avisos curtos.
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Categoria, Perfil } from '@/negocio/tipos';
import { garantirPerfil, sair as sairServico } from '@/servicos/autenticacao';
import { listarCategorias } from '@/servicos/anuncios';

type Contexto = {
  /** true depois de restaurar a sessão salva (ou concluir que não há sessão). */
  pronto: boolean;
  perfil: Perfil | null;
  ehAdmin: boolean;
  categorias: Categoria[];
  aviso: string | null;
  mostrarAviso: (texto: string) => void;
  definirPerfil: (p: Perfil | null) => void;
  recarregarPerfil: () => Promise<void>;
  sair: () => Promise<void>;
};

const Ctx = createContext<Contexto | null>(null);

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [pronto, setPronto] = useState(false);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrarAviso = useCallback((texto: string) => {
    if (timer.current) clearTimeout(timer.current);
    setAviso(texto);
    timer.current = setTimeout(() => setAviso(null), 2600);
  }, []);

  // Lê o perfil da sessão atual. Conta bloqueada é desconectada (RF-011).
  const carregarPerfil = useCallback(async () => {
    try {
      const p = await garantirPerfil();
      if (p.situacao === 'BLOQUEADA') {
        await supabase.auth.signOut();
        setPerfil(null);
        mostrarAviso('Sua conta está bloqueada. Fale com a equipe do Doa Aqui.');
        return;
      }
      setPerfil(p);
    } catch {
      setPerfil(null);
    }
  }, [mostrarAviso]);

  useEffect(() => {
    let ativo = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) await carregarPerfil();
      listarCategorias().then((c) => ativo && setCategorias(c)).catch(() => {});
      if (ativo) setPronto(true);
    })();

    const { data: inscricao } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === 'SIGNED_OUT') setPerfil(null);
    });
    return () => {
      ativo = false;
      inscricao.subscription.unsubscribe();
    };
  }, [carregarPerfil]);

  // Se as categorias falharem na abertura (sem rede), tenta de novo quando alguém precisar.
  useEffect(() => {
    if (pronto && categorias.length === 0) {
      const t = setInterval(() => listarCategorias().then(setCategorias).catch(() => {}), 8000);
      return () => clearInterval(t);
    }
  }, [pronto, categorias.length]);

  const sair = useCallback(async () => {
    await sairServico();
    setPerfil(null);
  }, []);

  const valor = useMemo<Contexto>(
    () => ({
      pronto,
      perfil,
      ehAdmin: perfil?.papel === 'ADMINISTRADOR' && perfil.situacao === 'ATIVA',
      categorias,
      aviso,
      mostrarAviso,
      definirPerfil: setPerfil,
      recarregarPerfil: carregarPerfil,
      sair,
    }),
    [pronto, perfil, categorias, aviso, mostrarAviso, carregarPerfil, sair],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useSessao() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSessao precisa estar dentro de <SessaoProvider>');
  return c;
}
