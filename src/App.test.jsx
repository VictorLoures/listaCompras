import { act, render, screen, within } from "@testing-library/react";
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

  expect(screen.getByText("1 item")).toBeInTheDocument();
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
  expect(screen.getByText("1 item")).toBeInTheDocument();
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

test("finaliza a compra: pegos saem, o que faltou fica", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Aumentar Café" }));
  await user.type(screen.getByLabelText("Preço de Café"), "1790");
  await user.click(screen.getByRole("button", { name: "Já pegou Café?" }));
  await user.click(screen.getByRole("button", { name: "Aumentar Leite" }));

  await abrirMenu(user, "Finalizar compra");
  const dialog = screen.getByRole("dialog");
  expect(dialog).not.toHaveTextContent(/histórico/i);
  expect(dialog).toHaveTextContent("1 item(ns) que faltaram");
  await user.click(within(dialog).getByRole("button", { name: "Finalizar" }));

  expect(salvo()).not.toHaveProperty("historico");
  expect(produtoSalvo("Café")).toMatchObject({ qte: 0, ultimoPreco: 1790 });
  expect(produtoSalvo("Leite").qte).toBe(1);
  expect(await screen.findByText("Compra finalizada")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Desfazer" }));
  expect(produtoSalvo("Café")).toMatchObject({ qte: 1, pego: true });
});

test("menu não tem histórico, ajustes, orçamento nem tema", async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(
    screen.queryByRole("button", { name: /orçamento/i })
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Mais ações" }));
  const menu = screen.getByRole("dialog");
  for (const removido of [/histórico/i, /ajustes/i, /orçamento/i, /tema/i]) {
    expect(menu).not.toHaveTextContent(removido);
  }
  // jsdom não tem Wake Lock: a opção aparece desabilitada com aviso.
  expect(
    within(menu).getByRole("button", { name: /Manter a tela ligada/ })
  ).toBeDisabled();
  expect(menu).toHaveTextContent("Não disponível neste navegador");
  expect(document.documentElement).not.toHaveAttribute("data-theme");
});

test("categorias: só renomear, sem criar, excluir ou reordenar", async () => {
  const user = userEvent.setup();
  render(<App />);
  await abrirMenu(user, "Renomear categorias");
  const dialog = screen.getByRole("dialog");
  expect(
    within(dialog).queryByLabelText("Nome da nova categoria")
  ).not.toBeInTheDocument();
  expect(
    within(dialog).queryByRole("button", { name: /Subir|Descer|Excluir/ })
  ).not.toBeInTheDocument();

  await user.click(
    within(dialog).getByRole("button", { name: "Renomear Limpeza" })
  );
  const campo = within(dialog).getByLabelText("Novo nome para Limpeza");
  await user.clear(campo);
  await user.type(campo, "alimentos");
  expect(within(dialog).getByRole("alert")).toHaveTextContent("Já existe");
  expect(within(dialog).getByRole("button", { name: "OK" })).toBeDisabled();

  await user.clear(campo);
  await user.type(campo, "Higiene e limpeza{Enter}");
  expect(salvo().categorias).toEqual([
    { id: "alimentos", nome: "Alimentos" },
    { id: "limpeza", nome: "Higiene e limpeza" },
  ]);
  expect(
    screen.getByRole("heading", { name: /Higiene e limpeza/ })
  ).toBeInTheDocument();
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

// ---------- Modo viagem ----------
const viagemSalva = () => JSON.parse(localStorage.getItem("listaViagem:v1"));
const itemViagem = (nome, grupo) =>
  viagemSalva().produtos.find((p) => p.nome === nome && p.categoria === grupo);

const irParaViagem = async (user) => {
  await user.click(screen.getByRole("button", { name: "Viagem" }));
};

test("alterna para viagem: pessoas, sem preço e sem calculadora", async () => {
  const user = userEvent.setup();
  render(<App />);
  await irParaViagem(user);

  expect(screen.getByRole("heading", { name: "Minha viagem" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Viagem" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  for (const nome of ["Geral", "Victor", "Erica", "Helena", "Anderson"]) {
    expect(
      screen.getByRole("heading", { name: new RegExp(nome) })
    ).toBeInTheDocument();
  }
  expect(screen.queryByLabelText(/Preço de/)).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /Comparar preços/ })
  ).not.toBeInTheDocument();
  expect(screen.getByText("Para levar")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Na mala" })).toBeInTheDocument();
  expect(localStorage.getItem("listaCompras:modo")).toBe("viagem");
});

test("viagem: quantidade e 'na mala' por pessoa, separado das compras", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Aumentar Arroz" }));
  await irParaViagem(user);

  await user.click(
    screen.getByRole("button", { name: "Aumentar Camiseta (Victor)" })
  );
  await user.click(
    screen.getByRole("button", { name: "Aumentar Camiseta (Victor)" })
  );
  await user.click(
    screen.getByRole("button", { name: "Aumentar Escova de dente (Helena)" })
  );
  await user.click(
    screen.getByRole("button", {
      name: "Já está na mala Escova de dente (Helena)?",
    })
  );

  expect(screen.getByTestId("total-estimado")).toHaveTextContent("2 itens");
  expect(screen.getByText("1 já na mala")).toBeInTheDocument();
  expect(itemViagem("Camiseta", "victor").qte).toBe(2);
  expect(itemViagem("Camiseta", "erica").qte).toBe(0);
  expect(itemViagem("Escova de dente", "helena").pego).toBe(true);

  // A lista de compras continua intacta.
  await user.click(screen.getByRole("button", { name: "Compras" }));
  expect(screen.getByRole("heading", { name: "Minhas compras" })).toBeVisible();
  expect(produtoSalvo("Arroz").qte).toBe(1);
  expect(screen.getByText("1 item")).toBeInTheDocument();
});

test("viagem: item com mesmo nome pode existir em pessoas diferentes", async () => {
  const user = userEvent.setup();
  render(<App />);
  await irParaViagem(user);
  await user.click(screen.getByRole("button", { name: "Incluir item" }));
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByText("Pessoa")).toBeInTheDocument();
  await user.type(within(dialog).getByLabelText("Item"), "camiseta");
  await user.click(within(dialog).getByRole("radio", { name: "Erica" }));
  expect(within(dialog).getByRole("alert")).toHaveTextContent(
    "Camiseta já está na lista de Erica."
  );
  await user.clear(within(dialog).getByLabelText("Item"));
  await user.type(within(dialog).getByLabelText("Item"), "Protetor labial");
  await user.click(within(dialog).getByRole("button", { name: "Adicionar" }));
  expect(itemViagem("Protetor labial", "erica")).toMatchObject({ qte: 1 });

  // O mesmo item para outra pessoa é permitido.
  await user.click(screen.getByRole("button", { name: "Incluir item" }));
  const outro = screen.getByRole("dialog");
  await user.type(within(outro).getByLabelText("Item"), "Protetor labial");
  await user.click(within(outro).getByRole("radio", { name: "Victor" }));
  expect(within(outro).queryByRole("alert")).not.toBeInTheDocument();
  await user.click(within(outro).getByRole("button", { name: "Adicionar" }));
  expect(itemViagem("Protetor labial", "victor")).toBeTruthy();
});

test("viagem: incluir, renomear e remover pessoas (com desfazer)", async () => {
  const user = userEvent.setup();
  render(<App />);
  await irParaViagem(user);
  await abrirMenu(user, "Pessoas");
  const dialog = screen.getByRole("dialog");
  expect(
    within(dialog).queryByRole("button", { name: "Remover Geral" })
  ).not.toBeInTheDocument();

  await user.type(within(dialog).getByLabelText("Nova pessoa"), "victor");
  expect(within(dialog).getByRole("alert")).toHaveTextContent("Já existe");
  await user.clear(within(dialog).getByLabelText("Nova pessoa"));
  await user.type(within(dialog).getByLabelText("Nova pessoa"), "Maria{Enter}");
  const maria = viagemSalva().categorias.find((c) => c.nome === "Maria");
  expect(maria).toBeTruthy();
  expect(
    viagemSalva().produtos.filter((p) => p.categoria === maria.id).length
  ).toBeGreaterThan(20);

  await user.click(
    within(dialog).getByRole("button", { name: "Renomear Anderson" })
  );
  const campo = within(dialog).getByLabelText("Novo nome para Anderson");
  await user.clear(campo);
  await user.type(campo, "Anderson Jr{Enter}");
  expect(viagemSalva().categorias.map((c) => c.nome)).toContain("Anderson Jr");

  await user.click(
    within(dialog).getByRole("button", { name: "Remover Erica" })
  );
  const confirmacao = screen.getByRole("dialog");
  expect(confirmacao).toHaveTextContent("Remover Erica da viagem?");
  await user.click(
    within(confirmacao).getByRole("button", { name: "Remover" })
  );
  expect(viagemSalva().categorias.map((c) => c.nome)).not.toContain("Erica");
  expect(viagemSalva().produtos.some((p) => p.categoria === "erica")).toBe(
    false
  );

  await user.click(await screen.findByRole("button", { name: "Desfazer" }));
  expect(viagemSalva().categorias.map((c) => c.nome)).toContain("Erica");
  expect(itemViagem("Camiseta", "erica")).toBeTruthy();
});

test("viagem: menu sem finalizar compra; reset original volta as pessoas", async () => {
  const user = userEvent.setup();
  render(<App />);
  await irParaViagem(user);
  await user.click(screen.getByRole("button", { name: "Mais ações" }));
  expect(screen.getByRole("dialog")).not.toHaveTextContent("Finalizar compra");
  await user.keyboard("{Escape}");

  await user.click(
    screen.getByRole("button", { name: "Aumentar Toalha (Victor)" })
  );
  await abrirMenu(user, "Resetar lista");
  await user.click(screen.getByText("Resetar para a lista original"));
  await user.click(screen.getByRole("button", { name: "Resetar" }));
  expect(itemViagem("Toalha", "victor").qte).toBe(0);
  expect(viagemSalva().categorias).toHaveLength(5);
});

test("abre direto no último modo usado", () => {
  localStorage.setItem("listaCompras:modo", "viagem");
  render(<App />);
  expect(screen.getByRole("heading", { name: "Minha viagem" })).toBeVisible();
});

// ---------- Correções da bateria de estresse ----------
test("sincroniza com outra aba que salvou a lista", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Aumentar Arroz" }));

  // Simula outra aba gravando uma versão com Feijão = 4.
  const outraAba = salvo();
  outraAba.produtos.find((p) => p.nome === "Feijão").qte = 4;
  const valor = JSON.stringify(outraAba);
  localStorage.setItem(CHAVE_ESTADO, valor);
  act(() => {
    window.dispatchEvent(
      new StorageEvent("storage", { key: CHAVE_ESTADO, newValue: valor })
    );
  });

  expect(screen.getByLabelText("Quantidade de Feijão")).toHaveTextContent("4");
  expect(screen.getByLabelText("Quantidade de Arroz")).toHaveTextContent("1");
});

test("nomes são salvos sem espaços repetidos", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Incluir produto" }));
  await user.type(
    within(screen.getByRole("dialog")).getByLabelText("Produto"),
    "  Pão   de   forma  "
  );
  await user.click(screen.getByRole("button", { name: "Adicionar" }));
  expect(produtoSalvo("Pão de forma")).toBeTruthy();
});

test("total informa o tamanho do texto para o CSS ajustar a fonte", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Aumentar Arroz" }));
  await user.type(screen.getByLabelText("Preço de Arroz"), "9999999999");
  const total = screen.getByTestId("total-estimado");
  expect(total).toHaveTextContent(/99\.999\.999,99/);
  expect(total.style.getPropertyValue("--caracteres")).toBe("16");
});
