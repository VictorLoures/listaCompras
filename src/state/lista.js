import {
  CATEGORIAS_INICIAIS,
  criarProdutosIniciais,
} from "../utils/ProdutosIniciais";
import { normalizarTexto } from "../utils/texto";

// Preço usado nas estimativas: o preço digitado ou, na falta dele, o último pago.
export const precoEfetivo = (produto) =>
  produto.preco > 0 ? produto.preco : produto.ultimoPreco || 0;

export const calcularResumo = (produtos) => {
  const naLista = produtos.filter((p) => p.qte > 0);
  const pegos = naLista.filter((p) => p.pego);
  const total = naLista.reduce((s, p) => s + p.qte * precoEfetivo(p), 0);
  const noCarrinho = pegos.reduce((s, p) => s + p.qte * precoEfetivo(p), 0);
  const usaEstimativa = naLista.some((p) => !p.preco && p.ultimoPreco > 0);

  return {
    quantidadeItens: naLista.length,
    quantidadePegos: pegos.length,
    total,
    noCarrinho,
    usaEstimativa,
    pct: naLista.length ? Math.round((pegos.length / naLista.length) * 100) : 0,
  };
};

const zerarProduto = (produto, anterior = produto) => ({
  ...produto,
  qte: 0,
  pego: false,
  preco: 0,
  ultimoPreco: anterior ? anterior.preco || anterior.ultimoPreco || 0 : 0,
});

// Lista original do modo compras (usada no "resetar para a lista original").
export const criarInicialCompras = () => ({
  categorias: CATEGORIAS_INICIAIS.map((c) => ({ ...c })),
  produtos: criarProdutosIniciais(),
});

const resetarProdutos = (estado, original, criarInicial) => {
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
  const inicial = criarInicial();
  return {
    ...estado,
    categorias: inicial.categorias,
    produtos: inicial.produtos.map((p) =>
      zerarProduto(p, atuaisPorNome.get(normalizarTexto(p.nome)) || null)
    ),
  };
};

const atualizarProduto = (estado, id, alterar) => ({
  ...estado,
  produtos: estado.produtos.map((p) => (p.id === id ? alterar(p) : p)),
});

// Cria o reducer de uma lista. `criarInicial` devolve { categorias, produtos }
// da lista original de cada modo (compras ou viagem).
export const criarListaReducer = (criarInicial) => (estado, acao) => {
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
      return resetarProdutos(estado, acao.original, criarInicial);

    case "FINALIZAR":
      // Os itens pegos saem da lista (guardando o preço pago como último
      // preço); os que faltaram continuam para a próxima compra.
      return {
        ...estado,
        produtos: estado.produtos.flatMap((p) => {
          if (!p.pego) {
            return [p];
          }
          return p.manterNoReset ? [zerarProduto(p)] : [];
        }),
      };

    case "CATEGORIA_RENOMEAR":
      return {
        ...estado,
        categorias: estado.categorias.map((c) =>
          c.id === acao.id ? { ...c, nome: acao.nome } : c
        ),
      };

    case "CATEGORIA_ADICIONAR":
      return {
        ...estado,
        categorias: [...estado.categorias, acao.categoria],
        produtos: [...estado.produtos, ...(acao.produtos || [])],
      };

    case "CATEGORIA_EXCLUIR": {
      // Remove o grupo e os itens dele. Grupos fixos e o último grupo ficam.
      const alvo = estado.categorias.find((c) => c.id === acao.id);
      if (!alvo || alvo.fixa || estado.categorias.length <= 1) {
        return estado;
      }
      return {
        ...estado,
        categorias: estado.categorias.filter((c) => c.id !== acao.id),
        produtos: estado.produtos.filter((p) => p.categoria !== acao.id),
      };
    }

    case "CONFIG":
      return { ...estado, config: { ...estado.config, ...acao.config } };

    case "RESTAURAR":
      return acao.estado;

    default:
      return estado;
  }
};

export const listaReducer = criarListaReducer(criarInicialCompras);
