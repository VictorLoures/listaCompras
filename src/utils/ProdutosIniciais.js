export const sortArray = (array) => {
  return array.sort((a, b) => {
    const produtoA = a.produto.toLowerCase();
    const produtoB = b.produto.toLowerCase();

    if (produtoA < produtoB) {
      return -1;
    }
    if (produtoA > produtoB) {
      return 1;
    }
    return 0;
  });
};

export const produtosIniciaisAlimentos = [
  { jaPegou: false, qte: 0, produto: "Arroz", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Açúcar cristal", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Açúcar refinado", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Feijão", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Maizena", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Sal", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Farinha de trigo", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Farinha de mandioca", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Fubá", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Café", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Macarrão", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Miojo", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Milho de Pipoca", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Nescau", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Coco", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Creme Craquer", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Creme Craquer Int.", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Biscoito Maizena", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Waifer", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Biscoito Vaquinha", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Chocolate Amargo", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Sucrilios", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Tempero para salada", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Suco", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Knor", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Leite de coco", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Leite condensado", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Gelatina", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Creme de leite", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Oleo", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Azeite", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Extrato de tomate", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Molho de tomate", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Atum", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Ervilha", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Milho verde", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Molho inglês", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Molho de pimenta", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Ketchup", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Maionese", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Alho", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Cebola", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Azeitona", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Leite", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Danone", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Gordura hidrogenada", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Margarina", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Requeijão", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Peito de Frango", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Coxinha da asa", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Sobrecoxa", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Batata palha", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Suco de caixa", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Biscoito de broa", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Salpete", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Bacon", preco: "R$ 0,00" },
];

export const produtosIniciaisLimpeza = [
  { jaPegou: false, qte: 0, produto: "Toalha de papel", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Palito", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Fósforo", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Álcool", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Água sanitária", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Sapolio", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Detergente", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Sabão em pó", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Sabão em barra", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Amaciante", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Bombril", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Pasta de dente", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Papel higiênico", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Sabonete", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Shampo", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Condicionador", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Absorvente", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Barbeador", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Cotonete", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Bucha", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Pedra Sanitária", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Desodorante", preco: "R$ 0,00" },
  { jaPegou: false, qte: 0, produto: "Desinfetante", preco: "R$ 0,00" },
];
