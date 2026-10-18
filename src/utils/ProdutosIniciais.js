import { normalizarTexto } from "./texto";

export const CATEGORIA_ALIMENTOS = "alimentos";
export const CATEGORIA_LIMPEZA = "limpeza";

export const CATEGORIAS_INICIAIS = [
  { id: CATEGORIA_ALIMENTOS, nome: "Alimentos" },
  { id: CATEGORIA_LIMPEZA, nome: "Limpeza" },
];

const NOMES_INICIAIS = {
  [CATEGORIA_ALIMENTOS]: [
    "Arroz",
    "Açúcar cristal",
    "Açúcar refinado",
    "Feijão",
    "Maizena",
    "Sal",
    "Farinha de trigo",
    "Farinha de mandioca",
    "Fubá",
    "Café",
    "Macarrão",
    "Miojo",
    "Milho de Pipoca",
    "Nescau",
    "Coco",
    "Creme Craquer",
    "Creme Craquer Int.",
    "Biscoito Maizena",
    "Waifer",
    "Biscoito Vaquinha",
    "Sucrilios",
    "Tempero para salada",
    "Suco",
    "Knor",
    "Leite de coco",
    "Leite condensado",
    "Gelatina",
    "Creme de leite",
    "Oleo",
    "Azeite",
    "Extrato de tomate",
    "Molho de tomate",
    "Atum",
    "Ervilha",
    "Milho verde",
    "Molho inglês",
    "Ketchup",
    "Maionese",
    "Alho",
    "Cebola",
    "Azeitona",
    "Leite",
    "Leite sem lactose",
    "Danone",
    "Margarina",
    "Peito de Frango",
    "Coxinha da asa",
    "Sobrecoxa",
    "Batata palha",
    "Biscoito de broa",
    "Bacon",
  ],
  [CATEGORIA_LIMPEZA]: [
    "Toalha de papel",
    "Palito",
    "Fósforo",
    "Álcool",
    "Água sanitária",
    "Sapolio",
    "Detergente",
    "Sabão em pó",
    "Sabão em barra",
    "Amaciante",
    "Bombril",
    "Pasta de dente",
    "Papel higiênico",
    "Sabonete",
    "Shampo",
    "Condicionador",
    "Barbeador",
    "Cotonete",
    "Bucha",
    "Pedra Sanitária",
    "Desodorante",
    "Desinfetante",
  ],
};

// Formato de um produto no estado do app.
export const novoProduto = ({
  id,
  nome,
  categoria,
  manterNoReset = true,
  original = false,
  qte = 0,
  preco = 0,
  ultimoPreco = 0,
}) => ({
  id,
  nome,
  categoria,
  qte,
  preco,
  ultimoPreco,
  pego: false,
  manterNoReset,
  original,
});

// O id dos produtos padrão é derivado do nome, para ser estável entre resets.
export const idProdutoPadrao = (nome) =>
  `padrao-${normalizarTexto(nome).replace(/[^a-z0-9]+/g, "-")}`;

export const criarProdutosIniciais = () =>
  Object.entries(NOMES_INICIAIS).flatMap(([categoria, nomes]) =>
    nomes.map((nome) =>
      novoProduto({
        id: idProdutoPadrao(nome),
        nome,
        categoria,
        original: true,
      })
    )
  );

export const ordenarPorNome = (produtos) =>
  [...produtos].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
