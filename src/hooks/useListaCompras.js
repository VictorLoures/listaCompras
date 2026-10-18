import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import {
  calcularResumo,
  criarInicialCompras,
  criarListaReducer,
} from "../state/lista";
import {
  carregarEstado,
  carregarViagem,
  CHAVE_ESTADO,
  CHAVE_VIAGEM,
  salvarEstado,
  salvarViagem,
} from "../utils/persistencia";
import { criarInicialViagem, criarItensPessoa } from "../utils/ItensViagem";
import { novoProduto } from "../utils/ProdutosIniciais";
import { criarId } from "../utils/texto";

// Nome digitado pelo usuário: sem espaços nas pontas nem repetidos no meio.
const limparNome = (nome) => nome.trim().replace(/\s+/g, " ");

// Como cada modo carrega, salva e recria a lista original.
export const LISTA_COMPRAS = {
  chave: CHAVE_ESTADO,
  carregar: carregarEstado,
  salvar: salvarEstado,
  reducer: criarListaReducer(criarInicialCompras),
};

export const LISTA_VIAGEM = {
  chave: CHAVE_VIAGEM,
  carregar: carregarViagem,
  salvar: salvarViagem,
  reducer: criarListaReducer(criarInicialViagem),
  // Pessoa nova já começa com os itens pessoais sugeridos.
  criarItensGrupo: criarItensPessoa,
};

// Estado de uma lista (produtos, grupos e configurações), persistido no
// localStorage a cada alteração. `definicao` é LISTA_COMPRAS ou LISTA_VIAGEM.
export const useLista = (definicao) => {
  const [estado, dispatch] = useReducer(
    definicao.reducer,
    undefined,
    definicao.carregar
  );

  // Referência ao estado atual, usada para tirar "fotos" antes de ações
  // destrutivas e permitir desfazer.
  const estadoRef = useRef(estado);
  estadoRef.current = estado;

  const { salvar, criarItensGrupo, chave, carregar } = definicao;
  useEffect(() => {
    salvar(estado);
  }, [estado, salvar]);

  // Com o app aberto em mais de uma aba (ex.: app instalado + navegador),
  // cada aba recarrega a lista quando outra salva; senão a última a salvar
  // apagaria as mudanças da outra.
  useEffect(() => {
    const aoMudarEmOutraAba = (e) => {
      if (e.key === chave && e.newValue) {
        dispatch({ type: "RESTAURAR", estado: carregar() });
      }
    };
    window.addEventListener("storage", aoMudarEmOutraAba);
    return () => window.removeEventListener("storage", aoMudarEmOutraAba);
  }, [chave, carregar]);

  const resumo = useMemo(
    () => calcularResumo(estado.produtos),
    [estado.produtos]
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
          nome: limparNome(nome),
          categoria,
          manterNoReset,
          qte: 1,
        });
        dispatch({ type: "ADICIONAR", produto });
        return produto;
      },
      editarProduto: (id, { nome, categoria, manterNoReset }) =>
        dispatch({
          type: "EDITAR",
          id,
          dados: { nome: limparNome(nome), categoria, manterNoReset },
        }),
      excluirProduto: (id) => dispatch({ type: "EXCLUIR", id }),

      resetar: (original) => dispatch({ type: "RESETAR", original }),
      finalizarCompra: () => dispatch({ type: "FINALIZAR" }),

      renomearCategoria: (id, nome) =>
        dispatch({ type: "CATEGORIA_RENOMEAR", id, nome: limparNome(nome) }),
      adicionarCategoria: (nome) => {
        const id = criarId("grupo");
        dispatch({
          type: "CATEGORIA_ADICIONAR",
          categoria: { id, nome: limparNome(nome) },
          produtos: criarItensGrupo ? criarItensGrupo(id) : [],
        });
      },
      excluirCategoria: (id) => dispatch({ type: "CATEGORIA_EXCLUIR", id }),

      configurar: (config) => dispatch({ type: "CONFIG", config }),
    }),
    [criarItensGrupo]
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

export const useListaCompras = () => useLista(LISTA_COMPRAS);
