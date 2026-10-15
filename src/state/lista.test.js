import {
  calcularResumo,
  listaReducer,
  montarCompra,
  ultimoPrecoNoHistorico,
} from "./lista";
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
  const resumo = calcularResumo(
    [
      produto({ nome: "Arroz", qte: 2, preco: 1000 }),
      produto({ nome: "Feijão", qte: 1, ultimoPreco: 850 }),
      produto({ nome: "Sal", qte: 0, preco: 300 }),
    ],
    4000
  );
  expect(resumo.total).toBe(2850);
  expect(resumo.usaEstimativa).toBe(true);
  expect(resumo.quantidadeItens).toBe(2);
  expect(resumo.pctOrcamento).toBe(71);
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

test("finalizar guarda os pegos no histórico e mantém o que faltou", () => {
  const produtos = [
    { ...produto({ nome: "Arroz", qte: 2, preco: 1000 }), pego: true },
    produto({ nome: "Feijão", qte: 1, preco: 850 }),
    {
      ...produto({ nome: "Bolo", qte: 1, preco: 1500, manterNoReset: false }),
      pego: true,
    },
  ];
  const estado = estadoCom(produtos);
  const compra = montarCompra(produtos, estado.categorias, {
    id: "c1",
    data: "2026-10-01T10:00:00.000Z",
  });
  expect(compra.total).toBe(3500);
  expect(compra.itens).toHaveLength(2);
  expect(compra.itens[0].categoria).toBe("Alimentos");

  const depois = listaReducer(estado, { type: "FINALIZAR", compra });
  expect(depois.historico).toHaveLength(1);
  expect(depois.produtos.map((p) => p.nome)).toEqual(["Arroz", "Feijão"]);
  expect(depois.produtos[0]).toMatchObject({ qte: 0, ultimoPreco: 1000 });
  expect(depois.produtos[1]).toMatchObject({ qte: 1, preco: 850 });
});

test("procura o último preço de um produto no histórico", () => {
  const historico = [
    { id: "1", data: "2026-08-01", itens: [{ nome: "Café", preco: 1500 }] },
    { id: "2", data: "2026-09-01", itens: [{ nome: "cafe", preco: 1790 }] },
    { id: "3", data: "2026-10-01", itens: [{ nome: "Leite", preco: 500 }] },
  ];
  expect(ultimoPrecoNoHistorico(historico, "Café")).toBe(1790);
  expect(ultimoPrecoNoHistorico(historico, "Pão")).toBe(0);
});

test("não exclui categoria com produtos nem a última categoria", () => {
  const estado = estadoCom([produto({ nome: "Arroz" })]);
  expect(
    listaReducer(estado, { type: "CATEGORIA_EXCLUIR", id: "alimentos" })
  ).toBe(estado);

  const semLimpeza = listaReducer(estado, {
    type: "CATEGORIA_EXCLUIR",
    id: "limpeza",
  });
  expect(semLimpeza.categorias.map((c) => c.id)).toEqual(["alimentos"]);
});

test("move categorias respeitando os limites", () => {
  const estado = estadoCom([]);
  const movida = listaReducer(estado, {
    type: "CATEGORIA_MOVER",
    id: "limpeza",
    direcao: -1,
  });
  expect(movida.categorias.map((c) => c.id)).toEqual(["limpeza", "alimentos"]);
  expect(
    listaReducer(movida, {
      type: "CATEGORIA_MOVER",
      id: "limpeza",
      direcao: -1,
    }).categorias
  ).toEqual(movida.categorias);
});
