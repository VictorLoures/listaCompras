import { gerarTextoLista } from "./compartilhar";
import { novoProduto } from "./ProdutosIniciais";

const categorias = [
  { id: "alimentos", nome: "Alimentos" },
  { id: "limpeza", nome: "Limpeza" },
];

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
  const texto = gerarTextoLista(produtos, categorias, { total: 2000 });
  expect(texto).toContain("*Alimentos*");
  expect(texto).toContain("✅ ~Arroz ×1~");
  expect(texto).toMatch(/▫️ Feijão ×2 — R\$\s17,00/);
  expect(texto).toMatch(/▫️ Bucha ×1 — R\$\s3,00/);
  expect(texto).not.toContain("Sal");
  expect(texto.indexOf("Arroz")).toBeLessThan(texto.indexOf("Feijão"));
  expect(texto).toMatch(/Total estimado: \*R\$\s20,00\*/);
});

test("lista vazia avisa em vez de mandar só o título", () => {
  const texto = gerarTextoLista(
    [novoProduto({ id: "1", nome: "Sal", categoria: "alimentos" })],
    categorias
  );
  expect(texto).toContain("(lista vazia)");
  expect(texto).not.toContain("Total estimado");
});

test("texto da viagem: título próprio, sem valores nem total", () => {
  const produtos = [
    novoProduto({
      id: "1",
      nome: "Camiseta",
      categoria: "victor",
      qte: 3,
      preco: 999,
    }),
  ];
  const texto = gerarTextoLista(produtos, [{ id: "victor", nome: "Victor" }], {
    titulo: "🧳 *Lista de viagem*",
    comPreco: false,
    total: 2997,
  });
  expect(texto).toBe("🧳 *Lista de viagem*\n\n*Victor*\n▫️ Camiseta ×3");
});
