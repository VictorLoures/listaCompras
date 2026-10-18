import { calcularResumo, criarListaReducer, listaReducer } from "./lista";
import { criarInicialViagem, criarItensPessoa } from "../utils/ItensViagem";
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

test("ações removidas (histórico, reordenar) não alteram o estado", () => {
  const estado = estadoCom([produto({ nome: "Arroz" })]);
  for (const type of ["EXCLUIR_COMPRA", "CATEGORIA_MOVER"]) {
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

// ---------- Modo viagem ----------
const viagemReducer = criarListaReducer(criarInicialViagem);
const estadoViagem = () => ({ ...criarInicialViagem(), config: {} });

test("viagem começa com Geral + 4 pessoas, cada uma com a lista sugerida", () => {
  const { categorias, produtos } = criarInicialViagem();
  expect(categorias.map((c) => c.nome)).toEqual([
    "Geral",
    "Victor",
    "Erica",
    "Helena",
    "Anderson",
  ]);
  expect(categorias[0].fixa).toBe(true);
  const porGrupo = (id) => produtos.filter((p) => p.categoria === id);
  expect(porGrupo("geral").map((p) => p.nome)).toContain("Documentos (RG/CNH)");
  for (const id of ["victor", "erica", "helena", "anderson"]) {
    const nomes = porGrupo(id).map((p) => p.nome);
    expect(nomes).toEqual(porGrupo("victor").map((p) => p.nome));
    expect(nomes).toContain("Escova de dente");
    expect(nomes).toContain("Carregador de celular");
  }
  expect(new Set(produtos.map((p) => p.id)).size).toBe(produtos.length);
  expect(produtos.every((p) => p.qte === 0 && p.preco === 0)).toBe(true);
});

test("incluir pessoa adiciona o grupo com os itens sugeridos", () => {
  const estado = estadoViagem();
  const depois = viagemReducer(estado, {
    type: "CATEGORIA_ADICIONAR",
    categoria: { id: "p1", nome: "Maria" },
    produtos: criarItensPessoa("p1"),
  });
  expect(depois.categorias.at(-1)).toEqual({ id: "p1", nome: "Maria" });
  const itensMaria = depois.produtos.filter((p) => p.categoria === "p1");
  expect(itensMaria.length).toBe(
    estado.produtos.filter((p) => p.categoria === "victor").length
  );
  expect(new Set(depois.produtos.map((p) => p.id)).size).toBe(
    depois.produtos.length
  );
});

test("remover pessoa tira o grupo e os itens; Geral e a última pessoa ficam", () => {
  let estado = estadoViagem();
  estado = viagemReducer(estado, { type: "CATEGORIA_EXCLUIR", id: "erica" });
  expect(estado.categorias.map((c) => c.id)).not.toContain("erica");
  expect(estado.produtos.some((p) => p.categoria === "erica")).toBe(false);

  expect(
    viagemReducer(estado, { type: "CATEGORIA_EXCLUIR", id: "geral" })
  ).toBe(estado);
  expect(viagemReducer(estado, { type: "CATEGORIA_EXCLUIR", id: "x" })).toBe(
    estado
  );
});

test("reset original da viagem volta pessoas e itens sugeridos", () => {
  let estado = estadoViagem();
  estado = viagemReducer(estado, { type: "CATEGORIA_EXCLUIR", id: "helena" });
  estado = viagemReducer(estado, {
    type: "CATEGORIA_ADICIONAR",
    categoria: { id: "p1", nome: "Maria" },
    produtos: criarItensPessoa("p1"),
  });
  estado = viagemReducer(estado, {
    type: "QTE",
    id: "viagem-victor-camiseta",
    delta: 3,
  });
  const depois = viagemReducer(estado, { type: "RESETAR", original: true });
  expect(depois.categorias.map((c) => c.nome)).toEqual([
    "Geral",
    "Victor",
    "Erica",
    "Helena",
    "Anderson",
  ]);
  expect(depois.produtos.every((p) => p.qte === 0)).toBe(true);
});
