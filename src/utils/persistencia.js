import {
  CATEGORIAS_INICIAIS,
  criarProdutosIniciais,
  novoProduto,
} from "./ProdutosIniciais";
import { centavosDeTexto } from "./dinheiro";
import { criarId, normalizarTexto } from "./texto";

export const CHAVE_ESTADO = "listaCompras:v2";
export const VERSAO_ESTADO = 2;

// Chaves da versão 1, migradas automaticamente na primeira carga.
const CHAVES_V1 = {
  alimentos: "produtosAlimentosLocalStorage",
  limpeza: "produtosLimpezaLocalStorage",
  ocultar: "ocultar",
};

export const CONFIG_PADRAO = {
  ocultar: false,
  telaLigada: false,
};

export const criarEstadoInicial = () => ({
  produtos: criarProdutosIniciais(),
  categorias: CATEGORIAS_INICIAIS.map((c) => ({ ...c })),
  config: { ...CONFIG_PADRAO },
});

const lerJson = (chave) => {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
};

const idCategoriaV1 = (nome) => {
  const existente = CATEGORIAS_INICIAIS.find(
    (c) => normalizarTexto(c.nome) === normalizarTexto(nome)
  );
  return existente ? existente.id : normalizarTexto(nome) || "alimentos";
};

const migrarProdutoV1 = (produto, categoriaPadrao) => ({
  ...novoProduto({
    id: produto.id || criarId("produto"),
    nome: String(produto.produto ?? "").trim(),
    categoria: idCategoriaV1(produto.categoria || categoriaPadrao),
    manterNoReset: produto.resetarPadrao !== false,
    original: produto.originalPadrao === true,
    qte: Math.max(0, Number(produto.qte) || 0),
    preco: centavosDeTexto(produto.preco),
  }),
  pego: produto.m1 === true,
});

export const migrarV1 = (alimentos, limpeza, ocultar) => {
  const produtos = [
    ...(Array.isArray(alimentos) ? alimentos : []).map((p) =>
      migrarProdutoV1(p, "Alimentos")
    ),
    ...(Array.isArray(limpeza) ? limpeza : []).map((p) =>
      migrarProdutoV1(p, "Limpeza")
    ),
  ].filter((p) => p.nome);

  return garantirCategorias({
    ...criarEstadoInicial(),
    produtos,
    config: { ...CONFIG_PADRAO, ocultar: ocultar === true },
  });
};

// Cria categorias para ids usados por produtos mas ausentes da lista.
const garantirCategorias = (estado) => {
  const ids = new Set(estado.categorias.map((c) => c.id));
  const faltando = [...new Set(estado.produtos.map((p) => p.categoria))].filter(
    (id) => !ids.has(id)
  );
  if (faltando.length === 0) {
    return estado;
  }
  return {
    ...estado,
    categorias: [
      ...estado.categorias,
      ...faltando.map((id) => ({
        id,
        nome: id.charAt(0).toUpperCase() + id.slice(1),
      })),
    ],
  };
};

// Só as configurações conhecidas são aproveitadas; campos de versões
// anteriores (ex.: orçamento, tema) são descartados.
const lerConfig = (config) =>
  Object.fromEntries(
    Object.entries(CONFIG_PADRAO).map(([chave, padrao]) => [
      chave,
      typeof config?.[chave] === typeof padrao ? config[chave] : padrao,
    ])
  );

// Garante que um estado lido do storage tenha todos os campos esperados.
const completarEstado = (salvo) => {
  const base = criarEstadoInicial();
  return garantirCategorias({
    produtos: Array.isArray(salvo.produtos)
      ? salvo.produtos.map((p) => ({ ...novoProduto(p), ...p }))
      : base.produtos,
    categorias:
      Array.isArray(salvo.categorias) && salvo.categorias.length > 0
        ? salvo.categorias
        : base.categorias,
    config: lerConfig(salvo.config),
  });
};

export const carregarEstado = () => {
  const salvo = lerJson(CHAVE_ESTADO);
  if (salvo && salvo.versao === VERSAO_ESTADO) {
    return completarEstado(salvo);
  }

  const alimentosV1 = lerJson(CHAVES_V1.alimentos);
  const limpezaV1 = lerJson(CHAVES_V1.limpeza);
  if (alimentosV1 || limpezaV1) {
    return migrarV1(alimentosV1, limpezaV1, lerJson(CHAVES_V1.ocultar));
  }

  return criarEstadoInicial();
};

export const salvarEstado = (estado) => {
  try {
    localStorage.setItem(
      CHAVE_ESTADO,
      JSON.stringify({ versao: VERSAO_ESTADO, ...estado })
    );
    // Depois que a versão nova foi gravada, as chaves antigas não são mais lidas.
    Object.values(CHAVES_V1).forEach((chave) => localStorage.removeItem(chave));
    return true;
  } catch {
    return false;
  }
};
