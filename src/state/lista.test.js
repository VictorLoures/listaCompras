import { calcularResumo, listaReducer } from "./lista";
import { criarEstadoInicial } from "../utils/persistencia";
import { novoProduto } from "../utils/ProdutosIniciais";

const produto = (dados) =>
  novoProduto({ id: dados.nome, categoria: "alimentos", ...dados });

const estadoCom = (produtos, extra = {}) => ({
  ...criarEstadoInicial(),
  produtos,
  ...extra,
});

test("quantidade nunca fica negativa", () => {
  const estado = estadoCom([produto({ nome: "Arroz" })]);
  const depois = listaReducer(estado, { type: "QTE", id: "Arroz", delta: -1 });
  expect(depois.produtos[0].qte).toBe(0);
});

test("o resumo usa o último preço quando o preço não foi digitado", () => {
  const resumo = calcularResumo([
    produto({ nome: "Arroz", qte: 2, preco: 1000 }),
    produto({ nome: "Feijão", qte: 1, ultimoPreco: 850 }),
    produto({ nome: "Sal", qte: 0, preco: 300 }),
  ]);
  expect(resumo.total).toBe(2850);
  expect(resumo.usaEstimativa).toBe(true);
  expect(resumo.quantidadeItens).toBe(2);
  expect(resumo).not.toHaveProperty("pctOrcamento");
});

test("reset guarda o último preço pago e remove produtos não padrão", () => {
  const estado = estadoCom([
    { ...produto({ nome: "Arroz", qte: 2, preco: 1000 }), pego: true },
    produto({ nome: "Feijão", qte: 1, ultimoPreco: 850 }),
    produto({ nome: "Pão", qte: 1, preco: 700, manterNoReset: false }),
  ]);
  const depois = listaReducer(estado, { type: "RESETAR", original: false });
  expect(depois.produtos.map((p) => p.nome)).toEqual(["Arroz", "Feijão"]);
  expect(depois.produtos[0]).toMatchObject({
    qte: 0,
    preco: 0,
    pego: false,
    ultimoPreco: 1000,
  });
  // Sem preço novo, a memória anterior é mantida.
  expect(depois.produtos[1].ultimoPreco).toBe(850);
});

test("reset para a lista original mantém a memória de preço pelo nome", () => {
  const estado = estadoCom(
    [produto({ id: "x", nome: "arroz", qte: 3, preco: 2599 })],
    { categorias: [{ id: "minha", nome: "Minha" }] }
  );
  const depois = listaReducer(estado, { type: "RESETAR", original: true });
  const arroz = depois.produtos.find((p) => p.nome === "Arroz");
  expect(arroz.ultimoPreco).toBe(2599);
  expect(arroz.qte).toBe(0);
  expect(depois.categorias.map((c) => c.id)).toEqual(["alimentos", "limpeza"]);
  expect(depois.produtos.length).toBeGreaterThan(70);
});

test("finalizar tira os pegos da lista e mantém o que faltou", () => {
  const estado = estadoCom([
    { ...produto({ nome: "Arroz", qte: 2, preco: 1000 }), pego: true },
    produto({ nome: "Feijão", qte: 1, preco: 850 }),
    {
      ...produto({ nome: "Bolo", qte: 1, preco: 1500, manterNoReset: false }),
      pego: true,
    },
  ]);
  const depois = listaReducer(estado, { type: "FINALIZAR" });
  expect(depois).not.toHaveProperty("historico");
  expect(depois.produtos.map((p) => p.nome)).toEqual(["Arroz", "Feijão"]);
  expect(depois.produtos[0]).toMatchObject({
    qte: 0,
    preco: 0,
    pego: false,
    ultimoPreco: 1000,
  });
  expect(depois.produtos[1]).toMatchObject({ qte: 1, preco: 850 });
});

test("renomeia categoria sem mudar id nem ordem", () => {
  const estado = estadoCom([produto({ nome: "Arroz" })]);
  const depois = listaReducer(estado, {
    type: "CATEGORIA_RENOMEAR",
    id: "limpeza",
    nome: "Higiene e limpeza",
  });
  expect(depois.categorias).toEqual([
    { id: "alimentos", nome: "Alimentos" },
    { id: "limpeza", nome: "Higiene e limpeza" },
  ]);
});

test("ações removidas (histórico, categorias) não alteram o estado", () => {
  const estado = estadoCom([produto({ nome: "Arroz" })]);
  for (const type of [
    "EXCLUIR_COMPRA",
    "CATEGORIA_ADICIONAR",
    "CATEGORIA_EXCLUIR",
    "CATEGORIA_MOVER",
  ]) {
    expect(listaReducer(estado, { type, id: "limpeza", direcao: -1 })).toBe(
      estado
    );
  }
});

test("reset original volta os nomes das categorias", () => {
  const estado = estadoCom([], {
    categorias: [
      { id: "alimentos", nome: "Comida" },
      { id: "limpeza", nome: "Casa" },
    ],
  });
  const depois = listaReducer(estado, { type: "RESETAR", original: true });
  expect(depois.categorias.map((c) => c.nome)).toEqual([
    "Alimentos",
    "Limpeza",
  ]);
});
