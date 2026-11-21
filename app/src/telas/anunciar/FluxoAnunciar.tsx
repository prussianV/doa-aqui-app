// Formulário de anúncio: UC-07 (publicar) e edição do UC-08 (parâmetro editar = id do anúncio).
// Passo 1 → detalhes do item; passo 2 → cidade/UF, telefone opcional e revisão; depois, confirmação.
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Package } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Botao } from '@/componentes/base';
import { Carregando, Vazio } from '@/componentes/estrutura';
import { RascunhoProvider } from '@/estado/RascunhoContexto';
import { useSessao } from '@/estado/SessaoContexto';
import type { RotasAnunciar, TelaRaiz } from '@/navegacao/tipos';
import { formatarTelefone } from '@/negocio/regras';
import type { DadosAnuncio } from '@/negocio/tipos';
import { obter, obterContato } from '@/servicos/anuncios';
import { cores } from '@/tema';
import PassoDetalhes from './Detalhes';
import PassoLocal from './Local';
import Publicado from './Publicado';

const Passos = createNativeStackNavigator<RotasAnunciar>();

const VAZIO: DadosAnuncio = { titulo: '', descricao: '', categoriaId: null, cidade: '', uf: null, telefone: '' };

export default function FluxoAnunciar({ route, navigation }: TelaRaiz<'Anunciar'>) {
  const editar = route.params?.editar;
  const { perfil } = useSessao();
  const [inicio, setInicio] = useState<{ dados: DadosAnuncio; editarId?: number } | null>(editar ? null : { dados: VAZIO });
  const [erro, setErro] = useState<string | null>(null);

  const fechar = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Abas', { screen: 'Inicio' }));

  // Na edição, carrega o anúncio uma vez. Só anúncios disponíveis do próprio usuário são editáveis.
  useEffect(() => {
    if (!editar || inicio) return;
    Promise.all([obter(editar), obterContato(editar)])
      .then(([a, telefone]) => {
        if (!a || a.usuario_id !== perfil?.id || a.status !== 'DISPONIVEL') {
          setErro('Este anúncio não pode ser editado.');
          return;
        }
        setInicio({
          editarId: a.id,
          dados: {
            titulo: a.titulo,
            descricao: a.descricao,
            categoriaId: a.categoria_id,
            cidade: a.cidade,
            uf: a.uf,
            telefone: telefone ? formatarTelefone(telefone) : '',
          },
        });
      })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Não foi possível carregar o anúncio.'));
  }, [editar, inicio, perfil?.id]);

  if (!perfil) {
    return (
      <View style={{ flex: 1, backgroundColor: cores.creme, paddingTop: 60 }}>
        <Vazio i={Package} titulo="Entre para anunciar" texto="Só usuários com conta publicam anúncios." acao={<Botao titulo="Entrar" onPress={() => navigation.replace('Entrar')} />} />
      </View>
    );
  }
  if (erro) {
    return (
      <View style={{ flex: 1, backgroundColor: cores.creme, paddingTop: 60 }}>
        <Vazio i={Package} titulo="Não deu para abrir" texto={erro} acao={<Botao titulo="Voltar" v="secundario" onPress={fechar} />} />
      </View>
    );
  }
  if (!inicio) {
    return (
      <View style={{ flex: 1, backgroundColor: cores.creme }}>
        <Carregando />
      </View>
    );
  }

  return (
    <RascunhoProvider inicial={inicio.dados} editarId={inicio.editarId} fechar={fechar}>
      <Passos.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.creme } }}>
        <Passos.Screen name="Detalhes" component={PassoDetalhes} />
        <Passos.Screen name="Local" component={PassoLocal} />
        <Passos.Screen name="Publicado" component={Publicado} options={{ gestureEnabled: false, animation: 'fade' }} />
      </Passos.Navigator>
    </RascunhoProvider>
  );
}
