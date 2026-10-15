import { carregarEstado, CHAVE_ESTADO, salvarEstado } from "./persistencia";

beforeEach(() => {
  localStorage.clear();
});

test("sem nada salvo, carrega a lista inicial", () => {
  const estado = carregarEstado();
  expect(estado.produtos.length).toBeGreaterThan(70);
  expect(estado.categorias.map((c) => c.nome)).toEqual([
    "Alimentos",
    "Limpeza",
  ]);
  expect(estado.config).toMatchObject({
    ocultar: false,
    orcamento: 0,
    tema: "auto",
  });
});

test("migra os dados da versão 1 e remove as chaves antigas", () => {
  localStorage.setItem(
    "produtosAlimentosLocalStorage",
    JSON.stringify([
      {
        id: "Alimentos-0-Arroz",
        m1: true,
        qte: 2,
        produto: "Arroz",
        preco: "R$ 1.234,56",
        originalPadrao: true,
        resetarPadrao: true,
        categoria: "Alimentos",
      },
      {
        id: "abc",
        m1: false,
        qte: 1,
        produto: "Pão de queijo",
        preco: "R$ 0,00",
        isAdicional: true,
        originalPadrao: false,
        resetarPadrao: false,
        categoria: "Alimentos",
      },
    ])
  );
  localStorage.setItem(
    "produtosLimpezaLocalStorage",
    JSON.stringify([{ m1: false, qte: 0, produto: "Bucha", preco: "R$ 3,50" }])
  );
  localStorage.setItem("ocultar", "true");

  const estado = carregarEstado();
  expect(estado.produtos).toHaveLength(3);
  expect(estado.produtos[0]).toMatchObject({
    id: "Alimentos-0-Arroz",
    nome: "Arroz",
    categoria: "alimentos",
    qte: 2,
    preco: 123456,
    pego: true,
    original: true,
    manterNoReset: true,
  });
  expect(estado.produtos[1]).toMatchObject({
    nome: "Pão de queijo",
    manterNoReset: false,
  });
  expect(estado.produtos[2]).toMatchObject({
    categoria: "limpeza",
    preco: 350,
  });
  expect(estado.produtos[2].id).toBeTruthy();
  expect(estado.config.ocultar).toBe(true);

  salvarEstado(estado);
  expect(localStorage.getItem("produtosAlimentosLocalStorage")).toBeNull();
  expect(localStorage.getItem("ocultar")).toBeNull();
  expect(carregarEstado().produtos).toHaveLength(3);
});

test("ignora dados corrompidos sem quebrar", () => {
  localStorage.setItem(CHAVE_ESTADO, "{não é json");
  expect(carregarEstado().produtos.length).toBeGreaterThan(70);
});

test("cria categorias que faltam para não perder produtos", () => {
  localStorage.setItem(
    CHAVE_ESTADO,
    JSON.stringify({
      versao: 2,
      produtos: [{ id: "1", nome: "Banana", categoria: "hortifruti", qte: 1 }],
      categorias: [{ id: "alimentos", nome: "Alimentos" }],
    })
  );
  const estado = carregarEstado();
  expect(estado.categorias.map((c) => c.id)).toEqual([
    "alimentos",
    "hortifruti",
  ]);
  expect(estado.produtos[0]).toMatchObject({ preco: 0, pego: false });
});
