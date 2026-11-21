// UC-07 · Publicar anúncio, passo 2: cidade/UF (localização aproximada), telefone opcional e revisão.
// O telefone é uma funcionalidade adicional (DA-10): só quem demonstrar interesse o vê.
import { MapPin, Phone, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { LinhaAnuncio, Local } from '@/componentes/anuncio';
import { Botao, Campo, Chip, Icone, Rotulo, Selo } from '@/componentes/base';
import { MapaAproximado } from '@/componentes/estrutura';
import { TelaFormulario } from '@/componentes/formulario';
import { useRascunho } from '@/estado/RascunhoContexto';
import { useSessao } from '@/estado/SessaoContexto';
import type { TelaAnunciar } from '@/navegacao/tipos';
import { LIMITES, UFS } from '@/negocio/catalogo';
import { formatarTelefone, temErros, validarLocal } from '@/negocio/regras';
import type { Anuncio } from '@/negocio/tipos';
import { editar, publicar, salvarContato } from '@/servicos/anuncios';
import { cores, fontes } from '@/tema';

export default function PassoLocal({ navigation }: TelaAnunciar<'Local'>) {
  const { rascunho: r, mudar, editarId, fechar } = useRascunho();
  const { categorias, perfil, mostrarAviso } = useSessao();
  const [tentou, setTentou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const erros = validarLocal(r);
  const categoria = categorias.find((c) => c.id === r.categoriaId);

  const previa: Anuncio = {
    id: 0, usuario_id: perfil?.id ?? '', categoria_id: r.categoriaId ?? 0, titulo: r.titulo.trim() || 'Título do anúncio',
    descricao: r.descricao, cidade: r.cidade.trim() || 'Cidade', uf: r.uf ?? 'UF', status: 'DISPONIVEL', inativado_por: null,
    criado_em: '', atualizado_em: '', concluido_em: null, categoria: categoria ? { nome: categoria.nome, slug: categoria.slug } : null, usuario: null,
  };

  const enviar = async () => {
    setTentou(true);
    setErro(null);
    if (temErros(erros)) return;
    setEnviando(true);
    try {
      if (editarId) {
        await editar(editarId, r);
        await salvarContato(editarId, r.telefone);
        mostrarAviso('Alterações salvas');
        fechar();
      } else {
        const salvo = await publicar(r);
        if (r.telefone.trim()) {
          try {
            await salvarContato(salvo.id, r.telefone);
          } catch {
            mostrarAviso('Anúncio publicado, mas o telefone não foi salvo. Edite o anúncio para tentar de novo.');
          }
        }
        navigation.replace('Publicado', { id: salvo.id, titulo: salvo.titulo, cidade: salvo.cidade });
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar o anúncio.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <TelaFormulario passo={2} titulo="Onde retirar?" rodape={<Botao titulo={editarId ? 'Salvar alterações' : 'Publicar anúncio'} carregando={enviando} onPress={enviar} />}>
      <Campo
        rotulo="Cidade"
        icone={MapPin}
        placeholder="Ex.: Campinas"
        value={r.cidade}
        onChangeText={(cidade) => mudar({ cidade })}
        autoCapitalize="words"
        limite={LIMITES.cidade}
        erro={tentou ? erros.cidade : undefined}
      />
      <View style={{ gap: 8 }}>
        <Text style={s.rotulo}>Estado (UF)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }} keyboardShouldPersistTaps="handled">
          {UFS.map((uf) => (
            <Chip key={uf} rotulo={uf} ativo={r.uf === uf} onPress={() => mudar({ uf })} />
          ))}
        </ScrollView>
        {tentou && erros.uf && <Text style={s.erro}>{erros.uf}</Text>}
      </View>
      <MapaAproximado rotulo={r.cidade.trim() ? `${r.cidade.trim()}${r.uf ? ` · ${r.uf}` : ''}` : 'Sua cidade'} style={{ height: 130 }} />
      <View style={[s.linha, { gap: 6, marginTop: -6 }]}>
        <Icone i={ShieldCheck} tam={16} cor={cores.verde600} />
        <Text style={s.privacidade}>Mostramos só a cidade e o estado, nunca seu endereço.</Text>
      </View>

      <Campo
        rotulo="Telefone ou WhatsApp (opcional)"
        icone={Phone}
        placeholder="(11) 98765-4321"
        value={r.telefone}
        onChangeText={(t) => mudar({ telefone: formatarTelefone(t) })}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        erro={tentou ? erros.telefone : undefined}
      />
      <View style={[s.linha, { gap: 6, marginTop: -6 }]}>
        <Icone i={ShieldCheck} tam={16} cor={cores.verde600} />
        <Text style={s.privacidade}>O telefone só aparece para quem demonstrar interesse no item.</Text>
      </View>

      <View>
        <Rotulo>Prévia do anúncio</Rotulo>
        <LinhaAnuncio anuncio={previa} topo={categoria ? <Selo texto={categoria.nome} ponto={false} /> : undefined} sub={<Local a={previa} />} />
      </View>
      {erro && <Text style={s.erroEnvio} accessibilityLiveRegion="polite">{erro}</Text>}
    </TelaFormulario>
  );
}

const s = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center' },
  rotulo: { fontFamily: fontes.negrito, fontSize: 12, color: cores.tinta },
  erro: { fontFamily: fontes.semi, fontSize: 11.5, color: cores.erro },
  erroEnvio: { fontFamily: fontes.semi, fontSize: 13, color: cores.erro },
  privacidade: { flex: 1, fontFamily: fontes.semi, fontSize: 12, color: cores.verde700 },
});
