module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // O projeto usa StyleSheet para os estilos do tema e estilos inline para ajustes pontuais de layout
    // (gap, margens, larguras calculadas), como no guia de identidade. Não é erro de funcionamento.
    'react-native/no-inline-styles': 'off',
  },
};
