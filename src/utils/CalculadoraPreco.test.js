import { compararOpcoes, parseNumero } from "./CalculadoraPreco";

const opcao = (quantidade, unidade, preco, pacotes = "") => ({
  quantidade,
  unidade,
  preco,
  pacotes,
});

test("aceita vírgula ou ponto como separador decimal", () => {
  expect(parseNumero("1,6")).toBe(1.6);
  expect(parseNumero("1.6")).toBe(1.6);
  expect(parseNumero("1.600,5")).toBe(1600.5);
});

test("o pacote maior compensa quando o preço por kg é menor", () => {
  const resultado = compararOpcoes([
    opcao("1,6", "kg", "R$ 15,99"),
    opcao("2,2", "kg", "R$ 18,99"),
  ]);
  expect(resultado.tipo).toBe("vencedora");
  expect(resultado.vencedora).toBe("B");
  expect(resultado.precoVencedora).toBe(1899);
  expect(resultado.porUnidade.A).toMatch(/9,99\/kg/);
  expect(resultado.porUnidade.B).toMatch(/8,63\/kg/);
  expect(resultado.economiaPct).toBeCloseTo(13.6, 1);
});

test("compara unidades diferentes da mesma grandeza", () => {
  const resultado = compararOpcoes([
    opcao("500", "g", "R$ 5,00"),
    opcao("1", "kg", "R$ 10,00"),
  ]);
  expect(resultado.tipo).toBe("empate");
  expect(resultado.empatadas).toEqual(["A", "B"]);
});

test("avisa quando as grandezas são incompatíveis", () => {
  const resultado = compararOpcoes([
    opcao("1", "kg", "R$ 5,00"),
    opcao("1", "L", "R$ 5,00"),
  ]);
  expect(resultado.tipo).toBe("incompativel");
});

test("retorna null enquanto faltam dados", () => {
  expect(
    compararOpcoes([opcao("1", "kg", ""), opcao("1", "kg", "R$ 5,00")])
  ).toBeNull();
});

test("considera o número de embalagens (fardo 6 × 350 ml)", () => {
  // Fardo: 2,1 L por R$ 18,00 = R$ 8,57/L. Garrafa 2 L por R$ 9,00 = R$ 4,50/L.
  const resultado = compararOpcoes([
    opcao("350", "ml", "R$ 18,00", "6"),
    opcao("2", "L", "R$ 9,00"),
  ]);
  expect(resultado.porUnidade.A).toMatch(/8,57\/L/);
  expect(resultado.vencedora).toBe("B");
  expect(resultado.explicacao).not.toMatch(/×/);

  const fardoVence = compararOpcoes([
    opcao("350", "ml", "R$ 9,00", "6"),
    opcao("2", "L", "R$ 9,00"),
  ]);
  expect(fardoVence.vencedora).toBe("A");
  expect(fardoVence.explicacao).toMatch(/Levar 6 × 350 ml/);
});

test("com mais de duas opções compara a vencedora com a segunda mais barata", () => {
  const resultado = compararOpcoes([
    opcao("1", "kg", "R$ 10,00"),
    opcao("1", "kg", "R$ 8,00"),
    opcao("1", "kg", "R$ 9,00"),
    opcao("", "kg", ""),
  ]);
  expect(resultado.vencedora).toBe("B");
  expect(resultado.explicacao).toMatch(/segunda mais barata \(opção C/);
  expect(resultado.economiaPct).toBeCloseTo(11.1, 1);
  expect(Object.keys(resultado.porUnidade)).toEqual(["A", "B", "C"]);
});

test("empate parcial entre as mais baratas", () => {
  const resultado = compararOpcoes([
    opcao("1", "kg", "R$ 8,00"),
    opcao("1", "kg", "R$ 12,00"),
    opcao("2", "kg", "R$ 16,00"),
  ]);
  expect(resultado.tipo).toBe("empate");
  expect(resultado.empatadas).toEqual(["A", "C"]);
  expect(resultado.explicacao).toMatch(/As opções A e C saem/);
});
