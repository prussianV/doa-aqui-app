import type { LucideIcon } from 'lucide-react-native';
import { Book, PawPrint, Shirt, Sofa, ToyBrick } from 'lucide-react-native';

import type { SlugCategoria } from '@/negocio/tipos';

export const ICONE_CATEGORIA: Record<SlugCategoria, LucideIcon> = {
  roupa: Shirt,
  livro: Book,
  movel: Sofa,
  racao: PawPrint,
  brinquedo: ToyBrick,
};
