// UC-07 · Publicar anúncio, passo 1: título, categoria e descrição (RF-003).
import { Info } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Botao, Campo, Chip, Dica } from '@/componentes/base';
import { TelaFormulario } from '@/componentes/formulario';
import { ICONE_CATEGORIA } from '@/componentes/icones';
import { useRascunho } from '@/estado/RascunhoContexto';
import { useSessao } from '@/estado/SessaoContexto';
import type { TelaAnunciar } from '@/navegacao/tipos';
import { LIMITES } from '@/negocio/catalogo';
import { temErros, validarDetalhes } from '@/negocio/regras';
import { cores, fontes } from '@/tema';

export default function PassoDetalhes({ navigation }: TelaAnunciar<'Detalhes'>) {
  const { categorias } = useSessao();
  const { rascunho: r, mudar } = useRascunho();
  const [tentou, setTentou] = useState(false);
  const erros = validarDetalhes(r);

  const continuar = () => {
    setTentou(true);
    if (!temErros(erros)) navigation.navigate('Local');
  };

  return (
    <TelaFormulario passo={1} titulo="Conte sobre o item" rodape={<Botao titulo="Continuar" onPress={continuar} />}>
      <Campo
        rotulo="Título"
        placeholder="Ex.: Casaco de lã infantil"
        value={r.titulo}
        onChangeText={(titulo) => mudar({ titulo })}
        limite={LIMITES.titulo}
        contador
        erro={tentou ? erros.titulo : undefined}
        autoCapitalize="sentences"
      />

      <View style={{ gap: 8 }}>
        <Text style={s.rotulo}>Categoria</Text>
        <View style={s.chips}>
          {categorias.map((c) => (
            <Chip key={c.id} rotulo={c.nome} icone={ICONE_CATEGORIA[c.slug]} selecionado={r.categoriaId === c.id} onPress={() => mudar({ categoriaId: c.id })} />
          ))}
        </View>
        {tentou && erros.categoria && <Text style={s.erro}>{erros.categoria}</Text>}
      </View>

      <Campo
        rotulo="Descrição"
        placeholder="Como está o item? Tem algum defeito? Para quem serve?"
        value={r.descricao}
        onChangeText={(descricao) => mudar({ descricao })}
        multiline
        limite={LIMITES.descricao}
        contador
        erro={tentou ? erros.descricao : undefined}
      />
      <Dica i={Info}>Não coloque telefone ou endereço na descrição. Quem tiver interesse aparece na sua lista de interessados.</Dica>
    </TelaFormulario>
  );
}

const s = StyleSheet.create({
  rotulo: { fontFamily: fontes.negrito, fontSize: 12, color: cores.tinta },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  erro: { fontFamily: fontes.semi, fontSize: 11.5, color: cores.erro },
});
