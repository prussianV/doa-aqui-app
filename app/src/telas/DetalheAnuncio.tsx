// UC-05 · Consultar anúncio: descrição, categoria, local aproximado, situação e responsável (RF-005).
// Daqui a pessoa manifesta interesse (UC-06) ou, se o anúncio é dela, gerencia (UC-08 a UC-10).
// Depois do interesse, mostra o telefone de contato do doador, se ele informou (DA-10).
import { Check, ChevronLeft, MessageCircle, Phone, Search, Settings2, Share2 } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ImagemAnuncio, SeloStatus } from '@/componentes/anuncio';
import { Avatar, Botao, BotaoIcone, Icone, Selo, Texto } from '@/componentes/base';
import { Carregando, FalhaCarga, MapaAproximado, Vazio } from '@/componentes/estrutura';
import { FolhaConfirmar, FolhaGerenciar, FolhaInteresse } from '@/componentes/folhas';
import { useConsulta } from '@/estado/useConsulta';
import { useSessao } from '@/estado/SessaoContexto';
import { useNavegacao } from '@/navegacao/acoes';
import type { TelaRaiz } from '@/navegacao/tipos';
import { ROTULO_TIPO_CONTA } from '@/negocio/catalogo';
import { formatarTelefone, iniciais, linkLigar, linkWhatsApp, situacaoInteresse, tempoRelativo } from '@/negocio/regras';
import { concluir, desativar, obter, obterContato } from '@/servicos/anuncios';
import { jaManifestou } from '@/servicos/interesses';
import { cores, fontes, margem, raio } from '@/tema';

type Confirmacao = { tipo: 'concluir' | 'desativar' } | null;

export default function DetalheAnuncio({ route }: TelaRaiz<'Anuncio'>) {
  const anuncioId = route.params.id;
  const { navigation, voltar } = useNavegacao();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { perfil, mostrarAviso } = useSessao();
  const [folhaInteresse, setFolhaInteresse] = useState(false);
  const [folhaGerenciar, setFolhaGerenciar] = useState(false);
  const [confirmacao, setConfirmacao] = useState<Confirmacao>(null);

  const consulta = useConsulta(async () => {
    const anuncio = await obter(anuncioId);
    const manifestou = anuncio && perfil && anuncio.usuario_id !== perfil.id ? await jaManifestou(anuncioId, perfil.id) : false;
    return { anuncio, manifestou };
  }, [anuncioId, perfil?.id]);

  // O telefone só é pedido ao banco por quem pode vê-lo: o dono e quem já manifestou interesse.
  const anuncioCarregado = consulta.dados?.anuncio;
  const verContato = !!perfil && !!anuncioCarregado && (anuncioCarregado.usuario_id === perfil.id || !!consulta.dados?.manifestou);
  const contato = useConsulta(async () => (verContato ? obterContato(anuncioId) : null), [anuncioId, verContato]);

  if (consulta.carregando && !consulta.dados) {
    return <View style={[s.tela, { paddingTop: insets.top + 40 }]}><Carregando /></View>;
  }
  if (consulta.erro) {
    return <View style={[s.tela, { paddingTop: insets.top + 40 }]}><FalhaCarga mensagem={consulta.erro} aoTentar={consulta.recarregar} /></View>;
  }
  const anuncio = consulta.dados?.anuncio;
  if (!anuncio) {
    return (
      <View style={[s.tela, { paddingTop: insets.top + 40 }]}>
        <Vazio i={Search} titulo="Anúncio não encontrado" texto="Ele pode ter sido concluído ou desativado." acao={<Botao titulo="Voltar" v="secundario" onPress={voltar} />} />
      </View>
    );
  }

  const situacao = situacaoInteresse(anuncio, perfil, !!consulta.dados?.manifestou);
  const proprio = situacao === 'proprio';
  const larguraImagem = Math.min(width, 640);

  const compartilhar = () => {
    const texto = `${anuncio.titulo} — doação no Doa Aqui, em ${anuncio.cidade}/${anuncio.uf}.`;
    Share.share({ message: texto }).catch(() => {});
  };

  // Ao trocar de folha, espera a anterior fechar (evita conflito de modais no iOS).
  const abrirConfirmacao = (tipo: 'concluir' | 'desativar') => {
    setFolhaGerenciar(false);
    setTimeout(() => setConfirmacao({ tipo }), 350);
  };

  return (
    <View style={s.tela}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <View>
          <ImagemAnuncio slug={anuncio.categoria?.slug} escala={0.6} style={{ width: larguraImagem, height: 280 + insets.top }} />
          <View style={[s.topo, { top: insets.top + 8 }]}>
            <BotaoIcone i={ChevronLeft} v="vidro" rotulo="Voltar" onPress={voltar} />
            <BotaoIcone i={Share2} v="vidro" rotulo="Compartilhar" onPress={compartilhar} />
          </View>
        </View>

        <View style={s.painel}>
          <View style={[s.linha, { gap: 6 }]}>
            <SeloStatus status={anuncio.status} />
            {anuncio.categoria && <Selo texto={anuncio.categoria.nome} ponto={false} />}
          </View>
          <Texto v="titulo" style={{ marginTop: 10 }}>{anuncio.titulo}</Texto>
          <Texto v="legenda" style={{ marginTop: 4 }}>Publicado {tempoRelativo(anuncio.criado_em)}</Texto>

          <Texto v="corpo" style={{ marginTop: 14 }}>{anuncio.descricao}</Texto>

          <View style={s.local}>
            <MapaAproximado style={{ width: 68, height: 68, borderRadius: raio.md }} pequeno />
            <View style={{ flex: 1 }}>
              <Text style={s.localTitulo}>{anuncio.cidade} · {anuncio.uf}</Text>
              <Texto v="legenda" style={{ marginTop: 2 }}>Localização aproximada. A retirada é combinada com quem anunciou.</Texto>
            </View>
          </View>

          <View style={s.anunciante}>
            <Avatar iniciais={iniciais(anuncio.usuario?.nome ?? '?')} tom={anuncio.usuario?.tipo === 'ONG' ? 'verde' : 'coral'} />
            <View style={{ flex: 1 }}>
              <Text style={s.anuncianteNome}>{proprio ? 'Você' : anuncio.usuario?.nome ?? 'Responsável'}</Text>
              <Texto v="legenda">{anuncio.usuario ? ROTULO_TIPO_CONTA[anuncio.usuario.tipo] : ''}{anuncio.usuario?.tipo === 'ONG' ? ' (autodeclarada)' : ''}</Texto>
            </View>
          </View>

          {verContato && !contato.carregando && (
            <View style={s.contato}>
              <View style={[s.linha, { gap: 8 }]}>
                <Icone i={Phone} tam={18} cor={cores.verde700} />
                <Text style={s.contatoTitulo}>{proprio ? 'Seu telefone neste anúncio' : 'Contato de quem anunciou'}</Text>
              </View>
              {contato.dados ? (
                <>
                  <Text style={s.contatoNumero} selectable>{formatarTelefone(contato.dados)}</Text>
                  {proprio ? (
                    <Texto v="legenda">Só quem demonstrar interesse vê este número.</Texto>
                  ) : (
                    <>
                      <View style={[s.linha, { gap: 8, marginTop: 4 }]}>
                        <Botao flex pequeno icone={Phone} v="secundario" titulo="Ligar" onPress={() => Linking.openURL(linkLigar(contato.dados!)).catch(() => {})} />
                        <Botao
                          flex
                          pequeno
                          icone={MessageCircle}
                          titulo="WhatsApp"
                          onPress={() => Linking.openURL(linkWhatsApp(contato.dados!, `Olá! Vi seu anúncio "${anuncio.titulo}" no Doa Aqui e tenho interesse.`)).catch(() => {})}
                        />
                      </View>
                      <Texto v="legenda">Combine a retirada direto com quem anunciou.</Texto>
                    </>
                  )}
                </>
              ) : (
                <Texto v="legenda">
                  {proprio
                    ? 'Você não informou telefone. Para incluir, use Gerenciar anúncio → Editar anúncio.'
                    : 'Quem anunciou não informou telefone. Se você autorizou, essa pessoa pode chamar você pelo e-mail.'}
                </Texto>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[s.rodape, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {situacao === 'proprio' && <Botao flex icone={Settings2} titulo="Gerenciar anúncio" v="escuro" onPress={() => setFolhaGerenciar(true)} />}
        {situacao === 'pode' && <Botao flex titulo="Tenho interesse" onPress={() => setFolhaInteresse(true)} />}
        {situacao === 'visitante' && (
          <Botao flex titulo="Entrar para demonstrar interesse" onPress={() => navigation.navigate('Entrar', { motivo: 'interesse' })} />
        )}
        {situacao === 'ja_manifestou' && <Botao flex icone={Check} titulo="Interesse já registrado" v="secundario" desativado />}
        {situacao === 'indisponivel' && <Botao flex titulo="Este item não está mais disponível" v="secundario" desativado />}
        {situacao === 'bloqueado' && <Botao flex titulo="Conta bloqueada" v="secundario" desativado />}
      </View>

      <FolhaInteresse
        anuncio={anuncio}
        visivel={folhaInteresse}
        aoFechar={() => setFolhaInteresse(false)}
        aoRegistrar={() => consulta.setDados((d) => (d ? { ...d, manifestou: true } : d))}
      />
      <FolhaGerenciar
        anuncio={anuncio}
        visivel={folhaGerenciar}
        aoFechar={() => setFolhaGerenciar(false)}
        aoConcluir={() => abrirConfirmacao('concluir')}
        aoDesativar={() => abrirConfirmacao('desativar')}
      />
      <FolhaConfirmar
        visivel={!!confirmacao}
        titulo={confirmacao?.tipo === 'concluir' ? 'Marcar como doado?' : 'Desativar anúncio?'}
        texto={
          confirmacao?.tipo === 'concluir'
            ? 'Confirme que o item já foi entregue. O anúncio sai da pesquisa e não pode mais ser editado.'
            : 'O anúncio sai da pesquisa e não poderá ser reativado.'
        }
        rotuloConfirmar={confirmacao?.tipo === 'concluir' ? 'Marcar como doado' : 'Desativar'}
        perigo={confirmacao?.tipo === 'desativar'}
        aoFechar={() => setConfirmacao(null)}
        aoConfirmar={async () => {
          if (confirmacao?.tipo === 'concluir') {
            await concluir(anuncio.id);
            mostrarAviso('Que bom! Doação concluída');
          } else {
            await desativar(anuncio.id);
            mostrarAviso('Anúncio desativado');
          }
          await consulta.recarregar();
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.creme },
  linha: { flexDirection: 'row', alignItems: 'center' },
  topo: { position: 'absolute', left: 14, right: 14, flexDirection: 'row', justifyContent: 'space-between' },
  painel: { marginTop: -22, backgroundColor: cores.creme, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: margem, paddingTop: 20 },
  local: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, padding: 8,
    backgroundColor: cores.branco, borderRadius: raio.lg, borderWidth: 1, borderColor: cores.linha,
  },
  localTitulo: { fontFamily: fontes.negrito, fontSize: 14, color: cores.tinta },
  anunciante: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: cores.linha },
  anuncianteNome: { fontFamily: fontes.negrito, fontSize: 14, color: cores.tinta },
  contato: { gap: 6, marginTop: 4, padding: 14, backgroundColor: cores.verde50, borderRadius: raio.lg },
  contatoTitulo: { fontFamily: fontes.negrito, fontSize: 14, color: cores.verde700 },
  contatoNumero: { fontFamily: fontes.extra, fontSize: 20, color: cores.tinta, letterSpacing: 0.3 },
  rodape: {
    position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10,
    paddingHorizontal: margem, paddingTop: 12, backgroundColor: cores.creme, borderTopWidth: 1, borderTopColor: cores.linha,
  },
});
