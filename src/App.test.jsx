import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { CHAVE_ESTADO } from "./utils/persistencia";

const salvo = () => JSON.parse(localStorage.getItem(CHAVE_ESTADO));
const produtoSalvo = (nome) => salvo().produtos.find((p) => p.nome === nome);

const abrirMenu = async (user, item) => {
  await user.click(screen.getByRole("button", { name: "Mais ações" }));
  await user.click(screen.getByRole("button", { name: new RegExp(item) }));
};

beforeEach(() => {
  localStorage.clear();
});

test("renderiza a lista de compras", () => {
  render(<App />);
  expect(screen.getByText("Minhas compras")).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: /Alimentos/ })
  ).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /Limpeza/ })).toBeInTheDocument();
});

test("altera quantidade e preço e atualiza o total", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Aumentar Arroz" }));
  await user.click(screen.getByRole("button", { name: "Aumentar Arroz" }));
  await user.type(screen.getByLabelText("Preço de Arroz"), "1250");

  expect(screen.getByText("1 itens")).toBeInTheDocument();
  expect(screen.getByTestId("total-estimado")).toHaveTextContent("R$ 25,00");
  expect(produtoSalvo("Arroz")).toMatchObject({ qte: 2, preco: 1250 });
});

test("reset guarda o último preço e permite desfazer", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Aumentar Arroz" }));
  await user.type(screen.getByLabelText("Preço de Arroz"), "999");

  await abrirMenu(user, "Resetar lista");
  await user.click(screen.getByRole("button", { name: "Resetar" }));

  expect(screen.getByText("0 itens")).toBeInTheDocument();
  expect(produtoSalvo("Arroz")).toMatchObject({
    qte: 0,
    preco: 0,
    ultimoPreco: 999,
  });
  expect(screen.getByLabelText("Preço de Arroz")).toHaveAttribute(
    "placeholder",
    "9,99"
  );

  // Depois do reset, só o item clicado muda.
  await user.click(screen.getByRole("button", { name: "Aumentar Arroz" }));
  expect(screen.getByText("1 itens")).toBeInTheDocument();
  expect(screen.getByTestId("total-estimado")).toHaveTextContent("R$ 9,99");

  await user.click(
    await screen.findByRole("button", { name: /último R\$\s9,99/ })
  );
  expect(produtoSalvo("Arroz").preco).toBe(999);
});

test("desfaz a exclusão de um produto", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Excluir Sal" }));
  await user.click(screen.getByRole("button", { name: "Excluir" }));
  expect(screen.queryByText("Sal")).not.toBeInTheDocument();

  await user.click(await screen.findByRole("button", { name: "Desfazer" }));
  expect(screen.getByText("Sal")).toBeInTheDocument();
});

test("inclui, edita e valida produtos duplicados", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Incluir produto" }));
  const dialog = screen.getByRole("dialog");
  await user.type(within(dialog).getByLabelText("Produto"), "arroz");
  expect(within(dialog).getByRole("alert")).toHaveTextContent(
    "já existe na lista na seção Alimentos"
  );
  expect(
    within(dialog).getByRole("button", { name: "Adicionar" })
  ).toBeDisabled();

  await user.clear(within(dialog).getByLabelText("Produto"));
  await user.type(within(dialog).getByLabelText("Produto"), "Vassoura");
  await user.click(within(dialog).getByRole("radio", { name: "Limpeza" }));
  await user.click(within(dialog).getByRole("button", { name: "Adicionar" }));

  expect(produtoSalvo("Vassoura")).toMatchObject({
    categoria: "limpeza",
    qte: 1,
  });

  await user.click(screen.getByRole("button", { name: "Editar Vassoura" }));
  const edicao = screen.getByRole("dialog");
  await user.clear(within(edicao).getByLabelText("Produto"));
  await user.type(within(edicao).getByLabelText("Produto"), "Vassoura grande");
  await user.click(within(edicao).getByRole("button", { name: "Atualizar" }));
  expect(produtoSalvo("Vassoura grande")).toBeTruthy();
});

test("finaliza a compra e mostra no histórico", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Aumentar Café" }));
  await user.type(screen.getByLabelText("Preço de Café"), "1790");
  await user.click(screen.getByRole("button", { name: "Já pegou Café?" }));
  await user.click(screen.getByRole("button", { name: "Aumentar Leite" }));

  await abrirMenu(user, "Finalizar compra");
  await user.click(screen.getByRole("button", { name: "Finalizar" }));

  expect(salvo().historico).toHaveLength(1);
  expect(produtoSalvo("Café")).toMatchObject({ qte: 0, ultimoPreco: 1790 });
  expect(produtoSalvo("Leite").qte).toBe(1);

  await abrirMenu(user, "Histórico de compras");
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByText(/1 compra\(s\)/)).toBeInTheDocument();
  await user.click(within(dialog).getByRole("tab", { name: "Preços" }));
  expect(within(dialog).getByText("Café")).toBeInTheDocument();
});

test("orçamento mostra o status em texto", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: /Definir orçamento/ }));
  await user.type(screen.getByLabelText("Orçamento da compra"), "1000");
  await user.click(screen.getByRole("button", { name: "Pronto" }));

  await user.click(screen.getByRole("button", { name: "Aumentar Arroz" }));
  await user.type(screen.getByLabelText("Preço de Arroz"), "900");
  expect(screen.getByText("Perto do limite")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Aumentar Arroz" }));
  expect(screen.getByText("Acima do orçamento")).toBeInTheDocument();
  expect(await screen.findByText(/passou do orçamento/)).toBeInTheDocument();
});

test("gerencia categorias", async () => {
  const user = userEvent.setup();
  render(<App />);
  await abrirMenu(user, "Categorias");
  await user.type(
    screen.getByLabelText("Nome da nova categoria"),
    "Hortifruti"
  );
  await user.click(screen.getByRole("button", { name: "Adicionar" }));
  await user.click(screen.getByRole("button", { name: "Subir Hortifruti" }));
  expect(salvo().categorias.map((c) => c.nome)).toEqual([
    "Alimentos",
    "Hortifruti",
    "Limpeza",
  ]);
  expect(
    screen.getByRole("button", { name: "Excluir Alimentos" })
  ).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "Excluir Hortifruti" }));
  expect(salvo().categorias).toHaveLength(2);
});

test("calculadora indica qual opção compensa e usa o preço na lista", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(
    screen.getByRole("button", { name: "Comparar preços de Arroz" })
  );

  await user.type(screen.getByLabelText("Quantidade da opção A"), "1,6");
  await user.type(screen.getByLabelText("Preço da opção A"), "1599");
  await user.type(screen.getByLabelText("Quantidade da opção B"), "2,2");
  await user.type(screen.getByLabelText("Preço da opção B"), "1899");

  expect(screen.getByLabelText("Preço da opção A")).toHaveValue("R$ 15,99");
  expect(screen.getByText(/A opção B sai a/)).toBeInTheDocument();
  expect(screen.getByText("Compensa")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Adicionar opção" }));
  expect(screen.getByLabelText("Quantidade da opção C")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /Usar R\$\s18,99/ }));
  expect(produtoSalvo("Arroz").preco).toBe(1899);
});

test("filtros, busca e ocultar zerados", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByLabelText("Buscar item"), "acucar");
  expect(screen.getByText("Açúcar cristal")).toBeInTheDocument();
  expect(screen.queryByText("Arroz")).not.toBeInTheDocument();
  await user.clear(screen.getByLabelText("Buscar item"));

  await user.click(screen.getByRole("button", { name: "Aumentar Arroz" }));
  await user.click(
    screen.getByRole("button", { name: "Ocultar itens sem quantidade" })
  );
  expect(screen.getByText("Arroz")).toBeInTheDocument();
  expect(screen.queryByText("Feijão")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Pegos" }));
  expect(screen.getByText("Nenhum item por aqui.")).toBeInTheDocument();
});

test("só o desfazer mais recente fica disponível", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Excluir Sal" }));
  await user.click(screen.getByRole("button", { name: "Excluir" }));
  await user.click(screen.getByRole("button", { name: "Excluir Fubá" }));
  await user.click(screen.getByRole("button", { name: "Excluir" }));

  // O toast mais novo fica em cima. O antigo pode ainda estar saindo da tela,
  // mas o botão dele não restaura mais nada.
  const botoes = await screen.findAllByRole("button", { name: "Desfazer" });
  if (botoes.length > 1) {
    await user.click(botoes[botoes.length - 1]);
    expect(produtoSalvo("Sal")).toBeUndefined();
    expect(produtoSalvo("Fubá")).toBeUndefined();
  }
  await user.click(botoes[0]);
  expect(produtoSalvo("Fubá")).toBeTruthy();
  expect(produtoSalvo("Sal")).toBeUndefined();
});
