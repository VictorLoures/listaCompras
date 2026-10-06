import { compararOpcoes, parseNumero } from "./CalculadoraPreco";

test("aceita vírgula ou ponto como separador decimal", () => {
  expect(parseNumero("1,6")).toBe(1.6);
  expect(parseNumero("1.6")).toBe(1.6);
  expect(parseNumero("1.600,5")).toBe(1600.5);
});

test("o pacote maior compensa quando o preço por kg é menor", () => {
  const resultado = compararOpcoes(
    { quantidade: "1,6", unidade: "kg", preco: "R$ 15,99" },
    { quantidade: "2,2", unidade: "kg", preco: "R$ 18,99" }
  );
  expect(resultado.tipo).toBe("vencedora");
  expect(resultado.vencedora).toBe("B");
  expect(resultado.porUnidade.A).toMatch(/9,99\/kg/);
  expect(resultado.porUnidade.B).toMatch(/8,63\/kg/);
  expect(resultado.economiaPct).toBeCloseTo(13.6, 1);
});

test("compara unidades diferentes da mesma grandeza", () => {
  const resultado = compararOpcoes(
    { quantidade: "500", unidade: "g", preco: "R$ 5,00" },
    { quantidade: "1", unidade: "kg", preco: "R$ 10,00" }
  );
  expect(resultado.tipo).toBe("empate");
});

test("avisa quando as grandezas são incompatíveis", () => {
  const resultado = compararOpcoes(
    { quantidade: "1", unidade: "kg", preco: "R$ 5,00" },
    { quantidade: "1", unidade: "L", preco: "R$ 5,00" }
  );
  expect(resultado.tipo).toBe("incompativel");
});

test("retorna null enquanto faltam dados", () => {
  expect(
    compararOpcoes(
      { quantidade: "1", unidade: "kg", preco: "" },
      { quantidade: "1", unidade: "kg", preco: "R$ 5,00" }
    )
  ).toBeNull();
});
