import {
  carregarEstado,
  carregarViagem,
  CHAVE_ESTADO,
  CHAVE_MODO,
  CHAVE_VIAGEM,
  lerModo,
  salvarEstado,
  salvarModo,
  salvarViagem,
} from "./persistencia";

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
  expect(estado.config).toEqual({ ocultar: false, telaLigada: false });
  expect(estado).not.toHaveProperty("historico");
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

test("descarta histórico, orçamento e tema salvos por versões anteriores", () => {
  localStorage.setItem(
    CHAVE_ESTADO,
    JSON.stringify({
      versao: 2,
      produtos: [{ id: "1", nome: "Arroz", categoria: "alimentos", qte: 2 }],
      categorias: [
        { id: "alimentos", nome: "Alimentos" },
        { id: "limpeza", nome: "Limpeza" },
      ],
      historico: [{ id: "c1", data: "2026-10-01", total: 100, itens: [] }],
      config: { ocultar: true, orcamento: 8000, tema: "escuro", telaLigada: 1 },
    })
  );
  const estado = carregarEstado();
  expect(estado).not.toHaveProperty("historico");
  // telaLigada com tipo inválido volta ao padrão.
  expect(estado.config).toEqual({ ocultar: true, telaLigada: false });
  expect(estado.produtos[0]).toMatchObject({ nome: "Arroz", qte: 2 });

  salvarEstado(estado);
  const gravado = JSON.parse(localStorage.getItem(CHAVE_ESTADO));
  expect(gravado).not.toHaveProperty("historico");
  expect(gravado.config).not.toHaveProperty("orcamento");
  expect(gravado.config).not.toHaveProperty("tema");
});

test("viagem é salva numa chave própria, sem mexer nas compras", () => {
  const compras = carregarEstado();
  salvarEstado(compras);
  const viagem = carregarViagem();
  expect(viagem.config).toEqual({ ocultar: false });
  viagem.produtos[0].qte = 2;
  salvarViagem(viagem);

  expect(JSON.parse(localStorage.getItem(CHAVE_VIAGEM)).versao).toBe(1);
  expect(carregarViagem().produtos[0].qte).toBe(2);
  expect(carregarEstado().produtos.every((p) => p.qte === 0)).toBe(true);
  expect(carregarViagem().categorias[0]).toMatchObject({
    id: "geral",
    fixa: true,
  });
});

test("viagem com dados corrompidos volta à lista sugerida", () => {
  localStorage.setItem(CHAVE_VIAGEM, "{{lixo");
  expect(carregarViagem().categorias).toHaveLength(5);
});

test("lembra o último modo usado", () => {
  expect(lerModo()).toBe("compras");
  salvarModo("viagem");
  expect(localStorage.getItem(CHAVE_MODO)).toBe("viagem");
  expect(lerModo()).toBe("viagem");
  localStorage.setItem(CHAVE_MODO, "qualquer");
  expect(lerModo()).toBe("compras");
});
