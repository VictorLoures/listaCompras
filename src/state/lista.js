import {
  CATEGORIAS_INICIAIS,
  criarProdutosIniciais,
} from "../utils/ProdutosIniciais";
import { normalizarTexto } from "../utils/texto";

// Preço usado nas estimativas: o preço digitado ou, na falta dele, o último pago.
export const precoEfetivo = (produto) =>
  produto.preco > 0 ? produto.preco : produto.ultimoPreco || 0;

export const calcularResumo = (produtos, orcamento = 0) => {
  const naLista = produtos.filter((p) => p.qte > 0);
  const pegos = naLista.filter((p) => p.pego);
  const total = naLista.reduce((s, p) => s + p.qte * precoEfetivo(p), 0);
  const noCarrinho = pegos.reduce((s, p) => s + p.qte * precoEfetivo(p), 0);
  const usaEstimativa = naLista.some((p) => !p.preco && p.ultimoPreco > 0);
  const semPreco = naLista.filter((p) => precoEfetivo(p) === 0).length;

  return {
    quantidadeItens: naLista.length,
    quantidadePegos: pegos.length,
    total,
    noCarrinho,
    usaEstimativa,
    semPreco,
    pct: naLista.length ? Math.round((pegos.length / naLista.length) * 100) : 0,
    orcamento,
    pctOrcamento: orcamento > 0 ? Math.round((total / orcamento) * 100) : 0,
  };
};

// Monta o registro de uma compra finalizada a partir dos itens pegos.
export const montarCompra = (produtos, categorias, { id, data }) => {
  const nomeCategoria = Object.fromEntries(
    categorias.map((c) => [c.id, c.nome])
  );
  const itens = produtos
    .filter((p) => p.qte > 0 && p.pego)
    .map((p) => ({
      nome: p.nome,
      categoria: nomeCategoria[p.categoria] || "",
      qte: p.qte,
      preco: precoEfetivo(p),
    }));
  return {
    id,
    data,
    itens,
    total: itens.reduce((s, it) => s + it.qte * it.preco, 0),
  };
};

// Procura o preço mais recente pago por um produto (pelo nome) no histórico.
export const ultimoPrecoNoHistorico = (historico, nome) => {
  const alvo = normalizarTexto(nome);
  const compras = [...historico].sort((a, b) => b.data.localeCompare(a.data));
  for (const compra of compras) {
    const item = compra.itens.find(
      (it) => normalizarTexto(it.nome) === alvo && it.preco > 0
    );
    if (item) {
      return item.preco;
    }
  }
  return 0;
};

const zerarProduto = (produto, anterior = produto) => ({
  ...produto,
  qte: 0,
  pego: false,
  preco: 0,
  ultimoPreco: anterior ? anterior.preco || anterior.ultimoPreco || 0 : 0,
});

const resetarProdutos = (estado, original) => {
  if (!original) {
    return {
      ...estado,
      produtos: estado.produtos
        .filter((p) => p.manterNoReset)
        .map((p) => zerarProduto(p)),
    };
  }

  // Volta para a lista original, mas mantém a memória do último preço pago.
  const atuaisPorNome = new Map(
    estado.produtos.map((p) => [normalizarTexto(p.nome), p])
  );
  return {
    ...estado,
    categorias: CATEGORIAS_INICIAIS.map((c) => ({ ...c })),
    produtos: criarProdutosIniciais().map((p) =>
      zerarProduto(p, atuaisPorNome.get(normalizarTexto(p.nome)) || null)
    ),
  };
};

const atualizarProduto = (estado, id, alterar) => ({
  ...estado,
  produtos: estado.produtos.map((p) => (p.id === id ? alterar(p) : p)),
});

const moverCategoria = (categorias, id, direcao) => {
  const i = categorias.findIndex((c) => c.id === id);
  const j = i + direcao;
  if (i < 0 || j < 0 || j >= categorias.length) {
    return categorias;
  }
  const nova = [...categorias];
  [nova[i], nova[j]] = [nova[j], nova[i]];
  return nova;
};

export const listaReducer = (estado, acao) => {
  switch (acao.type) {
    case "QTE":
      return atualizarProduto(estado, acao.id, (p) => ({
        ...p,
        qte: Math.max(0, p.qte + acao.delta),
      }));

    case "PEGO":
      return atualizarProduto(estado, acao.id, (p) => ({
        ...p,
        pego: !p.pego,
      }));

    case "PRECO":
      return atualizarProduto(estado, acao.id, (p) => ({
        ...p,
        preco: Math.max(0, acao.preco),
      }));

    case "ADICIONAR":
      return { ...estado, produtos: [...estado.produtos, acao.produto] };

    case "EDITAR":
      return atualizarProduto(estado, acao.id, (p) => ({
        ...p,
        ...acao.dados,
      }));

    case "EXCLUIR":
      return {
        ...estado,
        produtos: estado.produtos.filter((p) => p.id !== acao.id),
      };

    case "RESETAR":
      return resetarProdutos(estado, acao.original);

    case "FINALIZAR":
      // Os itens pegos vão para o histórico e são zerados (guardando o preço
      // pago); os que faltaram continuam na lista para a próxima compra.
      return {
        ...estado,
        historico: [...estado.historico, acao.compra],
        produtos: estado.produtos.flatMap((p) => {
          if (!p.pego) {
            return [p];
          }
          return p.manterNoReset ? [zerarProduto(p)] : [];
        }),
      };

    case "EXCLUIR_COMPRA":
      return {
        ...estado,
        historico: estado.historico.filter((c) => c.id !== acao.id),
      };

    case "CATEGORIA_ADICIONAR":
      return { ...estado, categorias: [...estado.categorias, acao.categoria] };

    case "CATEGORIA_RENOMEAR":
      return {
        ...estado,
        categorias: estado.categorias.map((c) =>
          c.id === acao.id ? { ...c, nome: acao.nome } : c
        ),
      };

    case "CATEGORIA_EXCLUIR":
      // Só exclui categorias vazias e nunca a última que sobrou.
      if (
        estado.categorias.length <= 1 ||
        estado.produtos.some((p) => p.categoria === acao.id)
      ) {
        return estado;
      }
      return {
        ...estado,
        categorias: estado.categorias.filter((c) => c.id !== acao.id),
      };

    case "CATEGORIA_MOVER":
      return {
        ...estado,
        categorias: moverCategoria(estado.categorias, acao.id, acao.direcao),
      };

    case "CONFIG":
      return { ...estado, config: { ...estado.config, ...acao.config } };

    case "RESTAURAR":
      return acao.estado;

    default:
      return estado;
  }
};
