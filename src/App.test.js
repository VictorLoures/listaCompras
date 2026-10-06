import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
});

test("renderiza a lista de compras", () => {
  render(<App />);
  expect(screen.getByText("Minhas compras")).toBeInTheDocument();
  expect(screen.getByText("Alimentos")).toBeInTheDocument();
  expect(screen.getByText("Limpeza")).toBeInTheDocument();
});

test("altera a quantidade de um produto e atualiza o contador", () => {
  render(<App />);
  fireEvent.click(screen.getAllByRole("button", { name: "Aumentar" })[0]);

  expect(screen.getByText("1 itens")).toBeInTheDocument();
  expect(localStorage.getItem("produtosAlimentosLocalStorage")).toContain(
    '"qte":1'
  );
});

test("após resetar a lista, altera apenas o produto clicado", () => {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "Resetar lista" }));
  fireEvent.click(screen.getByRole("button", { name: "Resetar" }));
  fireEvent.click(screen.getAllByRole("button", { name: "Aumentar" })[0]);

  expect(screen.getByText("1 itens")).toBeInTheDocument();
});

test("calculadora indica qual opção compensa mais", () => {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "Comparar preços" }));

  const preencher = (label, valor) =>
    fireEvent.change(screen.getByLabelText(label), { target: { value: valor } });
  preencher("Quantidade da opção A", "1,6");
  preencher("Preço da opção A", "1599");
  preencher("Quantidade da opção B", "2,2");
  preencher("Preço da opção B", "1899");

  expect(screen.getByLabelText("Preço da opção A")).toHaveValue("R$\u00a015,99");
  expect(screen.getByText(/A opção B sai a/)).toBeInTheDocument();
  expect(screen.getByText("Compensa")).toBeInTheDocument();
});
