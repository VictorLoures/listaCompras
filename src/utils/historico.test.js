import { gastoPorMes, variacaoDePrecos } from "./historico";
import { gerarTextoLista } from "./compartilhar";
import { novoProduto } from "./ProdutosIniciais";

const historico = [
  {
    id: "1",
    data: "2026-08-10T12:00:00.000Z",
    total: 3000,
    itens: [
      { nome: "Café", qte: 1, preco: 1500 },
      { nome: "Leite", qte: 3, preco: 500 },
    ],
  },
  {
    id: "2",
    data: "2026-08-25T12:00:00.000Z",
    total: 1000,
    itens: [{ nome: "Arroz", qte: 1, preco: 1000 }],
  },
  {
    id: "3",
    data: "2026-09-15T12:00:00.000Z",
    total: 2290,
    itens: [
      { nome: "Café", qte: 1, preco: 1790 },
      { nome: "Leite", qte: 1, preco: 500 },
    ],
  },
];

test("agrupa o gasto por mês em ordem cronológica", () => {
  expect(gastoPorMes(historico)).toEqual([
    { chave: "2026-08", rotulo: "ago/26", total: 4000, compras: 2 },
    { chave: "2026-09", rotulo: "set/26", total: 2290, compras: 1 },
  ]);
});

test("calcula a variação de preço de cada produto", () => {
  const variacoes = variacaoDePrecos(historico);
  expect(variacoes.map((v) => v.nome)).toEqual(["Café", "Leite", "Arroz"]);
  expect(variacoes[0]).toMatchObject({ ultimo: 1790, anterior: 1500 });
  expect(variacoes[0].variacaoPct).toBeCloseTo(19.33, 1);
  expect(variacoes[1].variacaoPct).toBe(0);
  expect(variacoes[2].variacaoPct).toBeNull();
});

test("gera o texto da lista para compartilhar", () => {
  const produtos = [
    novoProduto({
      id: "1",
      nome: "Feijão",
      categoria: "alimentos",
      qte: 2,
      preco: 850,
    }),
    {
      ...novoProduto({
        id: "2",
        nome: "Arroz",
        categoria: "alimentos",
        qte: 1,
      }),
      pego: true,
    },
    novoProduto({ id: "3", nome: "Sal", categoria: "alimentos", qte: 0 }),
    novoProduto({
      id: "4",
      nome: "Bucha",
      categoria: "limpeza",
      qte: 1,
      ultimoPreco: 300,
    }),
  ];
  const texto = gerarTextoLista(
    produtos,
    [
      { id: "alimentos", nome: "Alimentos" },
      { id: "limpeza", nome: "Limpeza" },
    ],
    { total: 2000 }
  );
  expect(texto).toContain("*Alimentos*");
  expect(texto).toContain("✅ ~Arroz ×1~");
  expect(texto).toMatch(/▫️ Feijão ×2 — R\$\s17,00/);
  expect(texto).toMatch(/▫️ Bucha ×1 — R\$\s3,00/);
  expect(texto).not.toContain("Sal");
  expect(texto.indexOf("Arroz")).toBeLessThan(texto.indexOf("Feijão"));
  expect(texto).toMatch(/Total estimado: \*R\$\s20,00\*/);
});
