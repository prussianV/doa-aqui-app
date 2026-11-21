// Guarda o que a pessoa digita nos dois passos do formulário de anúncio (UC-07 e edição no UC-08).
import { createContext, ReactNode, useContext, useState } from 'react';

import type { DadosAnuncio } from '@/negocio/tipos';

type Contexto = {
  rascunho: DadosAnuncio;
  mudar: (p: Partial<DadosAnuncio>) => void;
  /** Id do anúncio em edição, ou undefined para um anúncio novo. */
  editarId?: number;
  /** Fecha o formulário inteiro e volta para onde a pessoa estava. */
  fechar: () => void;
};

const Ctx = createContext<Contexto | null>(null);

export function RascunhoProvider({ inicial, editarId, fechar, children }: { inicial: DadosAnuncio; editarId?: number; fechar: () => void; children: ReactNode }) {
  const [rascunho, setRascunho] = useState(inicial);
  const mudar = (p: Partial<DadosAnuncio>) => setRascunho((r) => ({ ...r, ...p }));
  return <Ctx.Provider value={{ rascunho, mudar, editarId, fechar }}>{children}</Ctx.Provider>;
}

export function useRascunho() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useRascunho precisa estar dentro de <RascunhoProvider>');
  return c;
}
