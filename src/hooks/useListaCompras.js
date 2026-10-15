import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import {
  calcularResumo,
  listaReducer,
  montarCompra,
  ultimoPrecoNoHistorico,
} from "../state/lista";
import { carregarEstado, salvarEstado } from "../utils/persistencia";
import { novoProduto } from "../utils/ProdutosIniciais";
import { criarId } from "../utils/texto";

// Estado da lista de compras: produtos, categorias, histórico e configurações,
// persistido no localStorage a cada alteração.
export const useListaCompras = () => {
  const [estado, dispatch] = useReducer(
    listaReducer,
    undefined,
    carregarEstado
  );

  // Referência ao estado atual, usada para tirar "fotos" antes de ações
  // destrutivas e permitir desfazer.
  const estadoRef = useRef(estado);
  estadoRef.current = estado;

  useEffect(() => {
    salvarEstado(estado);
  }, [estado]);

  const resumo = useMemo(
    () => calcularResumo(estado.produtos, estado.config.orcamento),
    [estado.produtos, estado.config.orcamento]
  );

  const acoes = useMemo(
    () => ({
      incrementar: (id) => dispatch({ type: "QTE", id, delta: 1 }),
      decrementar: (id) => dispatch({ type: "QTE", id, delta: -1 }),
      alternarPego: (id) => dispatch({ type: "PEGO", id }),
      definirPreco: (id, preco) => dispatch({ type: "PRECO", id, preco }),

      adicionarProduto: ({ nome, categoria, manterNoReset }) => {
        const produto = novoProduto({
          id: criarId("produto"),
          nome: nome.trim(),
          categoria,
          manterNoReset,
          qte: 1,
          ultimoPreco: ultimoPrecoNoHistorico(
            estadoRef.current.historico,
            nome
          ),
        });
        dispatch({ type: "ADICIONAR", produto });
        return produto;
      },
      editarProduto: (id, { nome, categoria, manterNoReset }) =>
        dispatch({
          type: "EDITAR",
          id,
          dados: { nome: nome.trim(), categoria, manterNoReset },
        }),
      excluirProduto: (id) => dispatch({ type: "EXCLUIR", id }),

      resetar: (original) => dispatch({ type: "RESETAR", original }),
      finalizarCompra: () => {
        const atual = estadoRef.current;
        const compra = montarCompra(atual.produtos, atual.categorias, {
          id: criarId("compra"),
          data: new Date().toISOString(),
        });
        dispatch({ type: "FINALIZAR", compra });
        return compra;
      },
      excluirCompra: (id) => dispatch({ type: "EXCLUIR_COMPRA", id }),

      adicionarCategoria: (nome) =>
        dispatch({
          type: "CATEGORIA_ADICIONAR",
          categoria: { id: criarId("categoria"), nome: nome.trim() },
        }),
      renomearCategoria: (id, nome) =>
        dispatch({ type: "CATEGORIA_RENOMEAR", id, nome: nome.trim() }),
      excluirCategoria: (id) => dispatch({ type: "CATEGORIA_EXCLUIR", id }),
      moverCategoria: (id, direcao) =>
        dispatch({ type: "CATEGORIA_MOVER", id, direcao }),

      configurar: (config) => dispatch({ type: "CONFIG", config }),
    }),
    []
  );

  // Executa uma ação e devolve uma função que desfaz exatamente ela.
  const comDesfazer = useCallback((executar) => {
    const anterior = estadoRef.current;
    const resultado = executar();
    return {
      resultado,
      desfazer: () => dispatch({ type: "RESTAURAR", estado: anterior }),
    };
  }, []);

  return { ...estado, resumo, acoes, comDesfazer };
};
