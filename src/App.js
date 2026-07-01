import { useEffect, useState } from "react";
import "./App.css";
import {
  sortArray,
  produtosIniciaisAlimentos,
  produtosIniciaisLimpeza,
  CATEGORIA_ALIMENTOS,
  CATEGORIA_LIMPEZA,
} from "./utils/ProdutosIniciais";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ComponenteTabela from "./components/ComponenteTabela";
import Modal from "./components/Modal";
import { toast } from "react-toastify";

const CHAVE_LOCAL_STORAGE_ALIMENTOS = "produtosAlimentosLocalStorage";
const CHAVE_LOCAL_STORAGE_LIMPEZA = "produtosLimpezaLocalStorage";

function App() {
  const [produtosAlimentos, setProdutosAlimentos] = useState(
    sortArray(produtosIniciaisAlimentos)
  );
  const [produtosLimpeza, setProdutosLimpeza] = useState(
    sortArray(produtosIniciaisLimpeza)
  );

  const [produtoNovo, setProdutoNovo] = useState("");
  const [incluirPadrao, setIncluirPadrao] = useState(false);
  const [resetarListaOriginal, setResetarListaOriginal] = useState(false);
  const [categoria, setCategoria] = useState("");
  const [checkAlimentos, setCheckAlimentos] = useState(false);
  const [checkLimpeza, setCheckLimpeza] = useState(false);
  const [produtoEditado, setProdutoEditado] = useState("");
  const [isOcultar, setIsOcultar] = useState(false);
  const [msgProdutoExistente, setMsgProdutoExistente] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalIsOpenExcluir, setModalIsOpenExcluir] = useState(false);
  const [produtoSelecionadoExclusao, setProdutoSelecionadoExclusao] =
    useState(null);
  const [modalIsOpenIncluir, setModalIsOpenIncuir] = useState(false);

  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("todos");

  const classOcultar = !isOcultar ? "bi bi-eye" : "bi bi-eye-slash";

  useEffect(() => {
    const produtosAlimentosLocalStorage = localStorage.getItem(
      CHAVE_LOCAL_STORAGE_ALIMENTOS
    );
    const produtosLimpezaLocalStorage = localStorage.getItem(
      CHAVE_LOCAL_STORAGE_LIMPEZA
    );

    if (produtosAlimentosLocalStorage && produtosLimpezaLocalStorage) {
      setProdutosAlimentos(JSON.parse(produtosAlimentosLocalStorage));
      setProdutosLimpeza(JSON.parse(produtosLimpezaLocalStorage));
    }
    const ocultar = JSON.parse(localStorage.getItem("ocultar"));
    setIsOcultar(ocultar);
    // eslint-disable-next-line
  }, []);

  const atualizarLocalStorage = (produtosAlimentos, produtosLimpeza) => {
    localStorage.removeItem(CHAVE_LOCAL_STORAGE_ALIMENTOS);
    localStorage.removeItem(CHAVE_LOCAL_STORAGE_LIMPEZA);

    localStorage.setItem(
      CHAVE_LOCAL_STORAGE_ALIMENTOS,
      JSON.stringify(produtosAlimentos)
    );
    localStorage.setItem(
      CHAVE_LOCAL_STORAGE_LIMPEZA,
      JSON.stringify(produtosLimpeza)
    );
  };

  const onChangeAlimentos = (valor, produto, idCampo) => {
    let listaProdutos = [...produtosAlimentos];
    valor = idCampo === "preco" ? formatPreco(valor) : valor;
    listaProdutos = atualizarLista(valor, produto, idCampo, listaProdutos);

    setProdutosAlimentos(listaProdutos);
    atualizarLocalStorage(listaProdutos, produtosLimpeza);
  };

  const onChangeLimpeza = (valor, produto, idCampo) => {
    let listaProdutos = [...produtosLimpeza];
    valor = idCampo === "preco" ? formatPreco(valor) : valor;
    listaProdutos = atualizarLista(valor, produto, idCampo, listaProdutos);

    setProdutosLimpeza(listaProdutos);
    atualizarLocalStorage(produtosAlimentos, listaProdutos);
  };

  const dispatchChange = (valor, produto, idCampo) => {
    if (produto.categoria === CATEGORIA_ALIMENTOS) {
      onChangeAlimentos(valor, produto, idCampo);
    } else {
      onChangeLimpeza(valor, produto, idCampo);
    }
  };

  const onInc = (produto) => dispatchChange(produto.qte + 1, produto, "qte");
  const onDec = (produto) =>
    dispatchChange(Math.max(0, produto.qte - 1), produto, "qte");
  const onToggleCheck = (produto) => dispatchChange(!produto.m1, produto, "m1");
  const onChangePreco = (valor, produto) =>
    dispatchChange(valor, produto, "preco");

  const formatPreco = (preco) => {
    let precoFmt = preco.replace(/\D/g, "");
    precoFmt = (parseFloat(precoFmt) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return precoFmt.includes("NaN") ? "R$ 0,00" : precoFmt;
  };

  const parsePreco = (preco) => {
    const n = parseFloat(
      String(preco)
        .replace(/[^\d,]/g, "")
        .replace(",", ".")
    );
    return isNaN(n) ? 0 : n;
  };

  const fmtMoney = (n) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const linhaFmt = (produto) =>
    fmtMoney(produto.qte * parsePreco(produto.preco));

  const atualizarLista = (valor, produto, idCampo, listaProdutos) => {
    const objParaAtualizar = listaProdutos.find(
      (prod) => prod.produto === produto.produto
    );

    const index = listaProdutos.indexOf(objParaAtualizar);

    listaProdutos[index] = {
      ...listaProdutos[index],
      [idCampo]: valor,
    };

    return listaProdutos;
  };

  const adicionarProduto = () => {
    setProdutoNovo("");
    setModalIsOpenIncuir(true);
  };

  const adicionarProdutoNaoPadrao = () => {
    if (categoria) {
      const categoriaSelecionada = checkAlimentos
        ? CATEGORIA_ALIMENTOS
        : CATEGORIA_LIMPEZA;
      const newProduto = {
        m1: false,
        qte: 1,
        produto: produtoNovo,
        preco: "R$ 0,00",
        isAdicional: true,
        selected: false,
        originalPadrao: false,
        resetarPadrao: incluirPadrao,
        categoria: categoriaSelecionada,
      };
      const isAlimentos = categoriaSelecionada === CATEGORIA_ALIMENTOS;
      let novaLista = isAlimentos
        ? produtosAlimentos.map((it) => it)
        : produtosLimpeza.map((it) => it);
      novaLista.push(newProduto);
      novaLista = sortArray(novaLista);
      toast.success("Produto incluido com sucesso");
      atualizarStates(novaLista, setProdutoNovo, isAlimentos);
      setModalIsOpenIncuir(false);
      atualizarStatesModalProduto();
    } else {
      toast.warning("Selecione uma categoria");
    }
  };

  const cancelarAdicionar = () => {
    setModalIsOpenIncuir(false);
    setProdutoNovo("");
    setMsgProdutoExistente("");
    setIncluirPadrao(false);
    setCheckAlimentos(false);
    setCheckLimpeza(false);
  };

  const atualizarProdutoNaoPadrao = () => {
    if (categoria) {
      const objParaAtt = produtosLimpeza
        .concat(produtosAlimentos)
        .find((it) => {
          return it.produto === produtoEditado;
        });
      if (objParaAtt) {
        const newObj = { ...objParaAtt };
        newObj.produto = produtoNovo;
        newObj.resetarPadrao = incluirPadrao;
        newObj.categoria = checkAlimentos
          ? CATEGORIA_ALIMENTOS
          : CATEGORIA_LIMPEZA;
        let listaAlimentosAtt = produtosAlimentos.filter(
          (it) => it.produto !== produtoEditado
        );
        let listaLimpezaAtt = produtosLimpeza.filter(
          (it) => it.produto !== produtoEditado
        );
        if (categoria === CATEGORIA_ALIMENTOS) {
          listaAlimentosAtt.push(newObj);
        } else {
          listaLimpezaAtt.push(newObj);
        }
        listaAlimentosAtt = sortArray(listaAlimentosAtt);
        listaLimpezaAtt = sortArray(listaLimpezaAtt);
        setProdutosAlimentos(listaAlimentosAtt);
        setProdutosLimpeza(listaLimpezaAtt);
        atualizarLocalStorage(listaAlimentosAtt, listaLimpezaAtt);
        atualizarStatesDeclarados();
        atualizarStatesModalProduto();
      } else {
        toast.warning("Selecione uma categoria");
      }
    }
  };

  const atualizarStates = (lista, funcaoSetState, isCategoriaAlimentos) => {
    if (isCategoriaAlimentos) {
      setProdutosAlimentos(lista);
      atualizarLocalStorage(lista, produtosLimpeza);
    } else {
      setProdutosLimpeza(lista);
      atualizarLocalStorage(produtosAlimentos, lista);
    }

    atualizarStatesDeclarados(funcaoSetState);
  };

  const atualizarStatesDeclarados = (funcaoSetState = null) => {
    setModalIsOpenIncuir(false);
    setIncluirPadrao(false);
    setCategoria(null);
    setCheckAlimentos(false);
    setCheckLimpeza(false);
    if (funcaoSetState) {
      funcaoSetState("");
    }
  };

  const editarProdutoNaoPadrao = (prod) => {
    setModalIsOpenIncuir(true);
    setProdutoNovo(prod.produto);
    setProdutoEditado(prod.produto);
    setIncluirPadrao(prod.resetarPadrao);
    const isCategoriaAlimentos = prod.categoria === CATEGORIA_ALIMENTOS;
    setCategoria(
      isCategoriaAlimentos ? CATEGORIA_ALIMENTOS : CATEGORIA_LIMPEZA
    );
    setCheckAlimentos(isCategoriaAlimentos);
    setCheckLimpeza(!isCategoriaAlimentos);
  };

  const excluirProdutoNaoPadrao = () => {
    const isAlimentos =
      produtoSelecionadoExclusao.categoria === CATEGORIA_ALIMENTOS;
    const novaLista = isAlimentos
      ? produtosAlimentos.filter(
          (it) => it.produto !== produtoSelecionadoExclusao.produto
        )
      : produtosLimpeza.filter(
          (it) => it.produto !== produtoSelecionadoExclusao.produto
        );

    if (isAlimentos) {
      setProdutosAlimentos(novaLista);
      atualizarLocalStorage(novaLista, produtosLimpeza);
    } else {
      setProdutosLimpeza(novaLista);
      atualizarLocalStorage(produtosAlimentos, novaLista);
    }
    setMsgProdutoExistente("");
    setProdutoSelecionadoExclusao(null);
    setModalIsOpenExcluir(false);
    toast.success("Produto excluido com sucesso");
  };

  const ocultaDesocultarProdutos = (ocultar) => {
    localStorage.setItem("ocultar", JSON.stringify(ocultar));
    setIsOcultar(ocultar);
  };

  const reset = () => {
    let pordutosAlimentosJoin = [];
    let pordutosLimpezaJoin = [];
    if (resetarListaOriginal) {
      pordutosAlimentosJoin = produtosIniciaisAlimentos;
      pordutosLimpezaJoin = produtosIniciaisLimpeza;
    } else {
      pordutosAlimentosJoin = produtosIniciaisAlimentos.concat(
        produtosAlimentos.filter((it) => it.resetarPadrao && !it.originalPadrao)
      );
      pordutosLimpezaJoin = produtosIniciaisLimpeza.concat(
        produtosLimpeza.filter((it) => it.resetarPadrao && !it.originalPadrao)
      );
    }

    pordutosAlimentosJoin.forEach((it) => resetProdutoNaoPadrao(it));
    pordutosLimpezaJoin.forEach((it) => resetProdutoNaoPadrao(it));

    pordutosAlimentosJoin = sortArray(pordutosAlimentosJoin);
    pordutosLimpezaJoin = sortArray(pordutosLimpezaJoin);

    setProdutosAlimentos(pordutosAlimentosJoin);
    setProdutosLimpeza(pordutosLimpezaJoin);
    atualizarLocalStorage(pordutosAlimentosJoin, pordutosLimpezaJoin);
    ocultaDesocultarProdutos(false);
    setMsgProdutoExistente("");
    setModalIsOpen(false);
    setIncluirPadrao(false);
    setCheckAlimentos(false);
    setCheckLimpeza(false);
    setCategoria(null);
    setResetarListaOriginal(false);
    setProdutoNovo("");
    setProdutoEditado("");
    setSearch("");
    setFiltro("todos");
    toast.success("Lista resetada com sucesso!");
  };

  const resetProdutoNaoPadrao = (prod) => {
    if (!prod.originalPadrao) {
      prod.qte = 0;
      prod.preco = "R$ 0,00";
      prod.selected = false;
      prod.m1 = false;
    }
  };

  const onChangeProdutoNovo = (e) => {
    const produto = e.target.value;
    const listaProdutosGeral = produtosAlimentos
      .map((it) => ({ ...it, secao: CATEGORIA_ALIMENTOS }))
      .concat(
        produtosLimpeza.map((it) => ({ ...it, secao: CATEGORIA_LIMPEZA }))
      );
    const produtoExistente = listaProdutosGeral.find((it) => {
      return (
        removerAcentos(it.produto).toUpperCase() ===
        removerAcentos(produto).toUpperCase()
      );
    });

    if (produtoExistente) {
      setMsgProdutoExistente(
        `O produto ${produto} já existe na lista na seção ${produtoExistente.secao}.`
      );
    } else {
      setMsgProdutoExistente("");
    }

    setProdutoNovo(produto);
  };

  function removerAcentos(produto) {
    return produto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  const cancelReset = () => {
    setModalIsOpen(false);
    setResetarListaOriginal(false);
  };

  const modal = (
    <Modal
      show={modalIsOpen}
      onClose={() => setModalIsOpen(false)}
      title="Resetar produtos"
      footer={
        <>
          <button className="btn btn--secondary" onClick={cancelReset}>
            Cancelar
          </button>
          <button className="btn btn--primary" onClick={reset}>
            Resetar
          </button>
        </>
      }
    >
      <p className="modal-text">
        Tem certeza que deseja resetar todos os produtos?
      </p>
      <label className="check-row">
        <input
          type="checkbox"
          id="resetarListaOriginal"
          name="resetarListaOriginal"
          onChange={(e) => setResetarListaOriginal(e.target.checked)}
          checked={resetarListaOriginal}
          autoComplete="off"
        />
        <span>Resetar para lista original?</span>
      </label>
    </Modal>
  );

  const onClickExcluir = (produto) => {
    setModalIsOpenExcluir(true);
    setProdutoSelecionadoExclusao(produto);
    atualizarStatesModalProduto();
  };

  const atualizarStatesModalProduto = () => {
    setIncluirPadrao(false);
    setCheckAlimentos(false);
    setCheckLimpeza(false);
    setCategoria(null);
    setProdutoNovo("");
    setProdutoEditado("");
  };

  const onCancelExclusao = () => {
    setProdutoSelecionadoExclusao(null);
    setModalIsOpenExcluir(false);
  };

  const modalExcluir = (
    <Modal
      show={modalIsOpenExcluir}
      onClose={() => setModalIsOpenExcluir(false)}
      title="Excluir produto"
      footer={
        <>
          <button className="btn btn--secondary" onClick={onCancelExclusao}>
            Cancelar
          </button>
          <button className="btn btn--danger" onClick={excluirProdutoNaoPadrao}>
            Excluir
          </button>
        </>
      }
    >
      <p className="modal-text">Tem certeza que deseja excluir o produto?</p>
    </Modal>
  );

  const onChangeCategoria = (e) => {
    if (e.target.id === CATEGORIA_ALIMENTOS) {
      if (e.target.checked) {
        setCheckAlimentos(true);
        setCategoria(CATEGORIA_ALIMENTOS);
        setCheckLimpeza(false);
      } else {
        setCheckAlimentos(false);
        setCategoria(null);
      }
    } else {
      if (e.target.checked) {
        setCheckLimpeza(true);
        setCategoria(CATEGORIA_LIMPEZA);
        setCheckAlimentos(false);
      } else {
        setCheckLimpeza(false);
        setCategoria(null);
      }
    }
  };

  const modalIncluirProduto = (
    <Modal
      show={modalIsOpenIncluir}
      onClose={() => setModalIsOpenIncuir(false)}
      title={produtoEditado.length > 0 ? "Editar produto" : "Incluir novo produto"}
      footer={
        <>
          <button className="btn btn--secondary" onClick={cancelarAdicionar}>
            Cancelar
          </button>
          {produtoEditado.length <= 0 && (
            <button
              className="btn btn--primary"
              onClick={adicionarProdutoNaoPadrao}
              disabled={msgProdutoExistente.length > 0}
            >
              Adicionar
            </button>
          )}
          {produtoEditado.length > 0 && (
            <button
              className="btn btn--primary"
              onClick={atualizarProdutoNaoPadrao}
              disabled={msgProdutoExistente.length > 0}
            >
              Atualizar
            </button>
          )}
        </>
      }
    >
      <div className="modal-field">
        <label htmlFor="novoProduto">Produto</label>
        <input
          className="field-input"
          type="text"
          id="novoProduto"
          name="novoProduto"
          onChange={onChangeProdutoNovo}
          value={produtoNovo}
          placeholder="Nome do produto"
          autoComplete="off"
        />
      </div>

      <label className="check-row">
        <input
          type="checkbox"
          id="incluirPadrao"
          name="incluirPadrao"
          onChange={(e) => setIncluirPadrao(e.target.checked)}
          checked={incluirPadrao}
          autoComplete="off"
        />
        <span>Incluir produto como padrão?</span>
      </label>

      <div className="cat-choice">
        <label className={`cat-pill${checkAlimentos ? " is-active" : ""}`}>
          <input
            type="checkbox"
            id={CATEGORIA_ALIMENTOS}
            name={CATEGORIA_ALIMENTOS}
            onChange={onChangeCategoria}
            checked={checkAlimentos}
            autoComplete="off"
          />
          Alimentos
        </label>
        <label className={`cat-pill${checkLimpeza ? " is-active" : ""}`}>
          <input
            type="checkbox"
            id={CATEGORIA_LIMPEZA}
            name={CATEGORIA_LIMPEZA}
            onChange={onChangeCategoria}
            checked={checkLimpeza}
            autoComplete="off"
          />
          Limpeza
        </label>
      </div>

      {msgProdutoExistente.length > 0 && (
        <div className="produtoJaExiste">{msgProdutoExistente}</div>
      )}
    </Modal>
  );

  const filtrarLista = (lista) => {
    const q = removerAcentos(search).toLowerCase().trim();
    return lista.filter((prod) => {
      if (q && !removerAcentos(prod.produto).toLowerCase().includes(q)) {
        return false;
      }
      if (isOcultar && prod.qte === 0) {
        return false;
      }
      if (filtro === "faltam" && prod.m1) {
        return false;
      }
      if (filtro === "pegos" && !prod.m1) {
        return false;
      }
      return true;
    });
  };

  const alimentosVisiveis = filtrarLista(produtosAlimentos);
  const limpezaVisiveis = filtrarLista(produtosLimpeza);
  const semItens =
    alimentosVisiveis.length === 0 && limpezaVisiveis.length === 0;

  const naLista = produtosAlimentos
    .concat(produtosLimpeza)
    .filter((prod) => prod.qte > 0);
  const countAll = naLista.length;
  const totalAll = naLista.reduce(
    (soma, prod) => soma + prod.qte * parsePreco(prod.preco),
    0
  );
  const marcados = naLista.filter((prod) => prod.m1);
  const totalDone = marcados.reduce(
    (soma, prod) => soma + prod.qte * parsePreco(prod.preco),
    0
  );
  const pct = countAll ? Math.round((marcados.length / countAll) * 100) : 0;

  const segBtn = (valor, label) => (
    <button
      className={`seg-btn${filtro === valor ? " is-active" : ""}`}
      onClick={() => setFiltro(valor)}
    >
      {label}
    </button>
  );

  return (
    <div className="app-shell">
      <ToastContainer autoClose={3000} />
      {modal}
      {modalExcluir}
      {modalIncluirProduto}
      <div className="card">
        <div className="header">
          <div className="header-top">
            <div className="header-title">Minhas compras</div>
            <span className="header-count">{countAll} itens</span>
          </div>

          <div className="total-card">
            <div>
              <div className="total-label">Total estimado</div>
              <div className="total-value">{fmtMoney(totalAll)}</div>
              <div className="total-done">
                {fmtMoney(totalDone)} já no carrinho
              </div>
            </div>
            <div
              className="progress-ring"
              style={{
                background: `conic-gradient(#2f9e5f ${pct}%, #3a4038 ${pct}%)`,
              }}
            >
              <div className="progress-ring-inner">
                <span className="progress-ring-pct">{pct}%</span>
                <span className="progress-ring-caption">pego</span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <div className="search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="#9aa39c"
                  strokeWidth="2"
                ></circle>
                <path
                  d="M21 21l-4-4"
                  stroke="#9aa39c"
                  strokeWidth="2"
                  strokeLinecap="round"
                ></path>
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar item…"
                autoComplete="off"
              />
            </div>
            <button
              onClick={adicionarProduto}
              className="action-btn action-btn--add"
              aria-label="Incluir produto"
            >
              +
            </button>
            <button
              onClick={() => ocultaDesocultarProdutos(!isOcultar)}
              className={`action-btn action-btn--ghost${
                isOcultar ? " is-active" : ""
              }`}
              aria-label="Ocultar itens sem quantidade"
            >
              <i className={classOcultar}></i>
            </button>
            <button
              onClick={() => setModalIsOpen(true)}
              className="action-btn action-btn--ghost"
              aria-label="Resetar lista"
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>

          <div className="segmented">
            {segBtn("todos", "Todos")}
            {segBtn("faltam", "Faltam")}
            {segBtn("pegos", "Pegos")}
          </div>
        </div>

        <div className="list">
          {semItens ? (
            <div className="empty-state">Nenhum item por aqui.</div>
          ) : (
            <>
              <ComponenteTabela
                titulo={CATEGORIA_ALIMENTOS}
                produtos={alimentosVisiveis}
                onInc={onInc}
                onDec={onDec}
                onToggleCheck={onToggleCheck}
                onChangePreco={onChangePreco}
                onClickEditProduto={editarProdutoNaoPadrao}
                onClickRemoverProduto={onClickExcluir}
                linhaFmt={linhaFmt}
              />
              <ComponenteTabela
                titulo={CATEGORIA_LIMPEZA}
                produtos={limpezaVisiveis}
                onInc={onInc}
                onDec={onDec}
                onToggleCheck={onToggleCheck}
                onChangePreco={onChangePreco}
                onClickEditProduto={editarProdutoNaoPadrao}
                onClickRemoverProduto={onClickExcluir}
                linhaFmt={linhaFmt}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
