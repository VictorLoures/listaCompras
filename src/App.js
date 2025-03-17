import { useEffect, useRef, useState } from "react";
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
import { Button, Modal } from "react-bootstrap";
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
  const [estiloDisplay, setEstiloDisplay] = useState({});
  const [isOcultar, setIsOcultar] = useState(false);
  const [msgProdutoExistente, setMsgProdutoExistente] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalIsOpenIncluir, setModalIsOpenIncuir] = useState(false);

  const [estilo, setEstilo] = useState({});

  const produtoExcluindo = useRef();

  const classOcultar = !isOcultar ? "bi bi-eye-slash" : "bi bi-eye";

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
    ocultaDesocultarProdutos(ocultar);
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
    valor = idCampo === "preco" ? formatPreco(valor, idCampo) : valor;
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

  const formatPreco = (preco) => {
    let precoFmt = preco.replace(/\D/g, "");
    precoFmt = (parseFloat(precoFmt) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return precoFmt.includes("NaN") ? "R$ 0,00" : precoFmt;
  };

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
        selected: true,
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
      ativarEdicaoItem(
        newProduto,
        isAlimentos ? novaLista : produtosAlimentos,
        !isAlimentos ? novaLista : produtosLimpeza
      );
      setModalIsOpenIncuir(false);
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
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

  const excluirProdutoNaoPadrao = (produto) => {
    const isAlimentos = produto.categoria === CATEGORIA_ALIMENTOS;
    const novaLista = isAlimentos
      ? produtosAlimentos.filter((it) => it.produto !== produto.produto)
      : produtosLimpeza.filter((it) => it.produto !== produto);

    if (isAlimentos) {
      setProdutosAlimentos(novaLista);
      atualizarLocalStorage(novaLista, produtosLimpeza);
    } else {
      setProdutosLimpeza(novaLista);
      atualizarLocalStorage(produtosAlimentos, novaLista);
    }
    setMsgProdutoExistente("");
    produtoExcluindo.current = produto;
  };

  const ocultaDesocultarProdutos = (ocultar) => {
    setEstiloDisplay(ocultar ? { display: "none" } : {});
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

    setProdutosAlimentos(pordutosAlimentosJoin);
    setProdutosLimpeza(pordutosLimpezaJoin);
    atualizarLocalStorage(pordutosAlimentosJoin, pordutosLimpezaJoin);
    setEstiloDisplay({});
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
    produtoExcluindo.current = null;
    toast.success("Lista resetada com sucesso!");
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
    <div>
      <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Resetar produtos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja resetar todos os produtos?
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <input
              type="checkbox"
              id="resetarListaOriginal"
              name="resetarListaOriginal"
              onChange={(e) => setResetarListaOriginal(e.target.checked)}
              checked={resetarListaOriginal}
              style={{ marginRight: "5px", transform: "scale(2)" }}
              autocomplete="off"
            />

            <label for="resetarListaOriginal">
              Resetar para lista original?{" "}
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelReset}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={reset}>
            Resetar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
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
    <div>
      <Modal
        show={modalIsOpenIncluir}
        onHide={() => setModalIsOpenIncuir(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Incluir novo produto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "5px",
            }}
          >
            <div>
              <span>Produto: </span>
              <input
                type="text"
                id="novoProduto"
                name="novoProduto"
                onChange={onChangeProdutoNovo}
                value={produtoNovo}
                style={{ position: "relative", bottom: "5px" }}
                autocomplete="off"
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <input
                type="checkbox"
                id="incluirPadrao"
                name="incluirPadrao"
                onChange={(e) => setIncluirPadrao(e.target.checked)}
                checked={incluirPadrao}
                style={{ marginRight: "5px", transform: "scale(2)" }}
                autocomplete="off"
              />
              <label for="incluirPadrao">Incluir produto como padrão? </label>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                gap: "5px",
              }}
            >
              <input
                type="checkbox"
                id={CATEGORIA_ALIMENTOS}
                name={CATEGORIA_ALIMENTOS}
                onChange={onChangeCategoria}
                checked={checkAlimentos}
                style={{ marginRight: "10px", transform: "scale(2)" }}
                autocomplete="off"
              />
              <label for={CATEGORIA_ALIMENTOS} style={{ marginRight: "20px" }}>
                Alimentos
              </label>
              <input
                type="checkbox"
                id={CATEGORIA_LIMPEZA}
                name={CATEGORIA_LIMPEZA}
                onChange={onChangeCategoria}
                checked={checkLimpeza}
                style={{ marginRight: "10px", transform: "scale(2)" }}
                autocomplete="off"
              />
              <label for={CATEGORIA_LIMPEZA}>Limpeza</label>
            </div>

            {msgProdutoExistente.length > 0 && (
              <div className="produtoJaExiste">{msgProdutoExistente}</div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelarAdicionar}>
            Cancelar
          </Button>
          {produtoEditado.length <= 0 && (
            <Button
              variant="primary"
              onClick={adicionarProdutoNaoPadrao}
              disabled={msgProdutoExistente.length > 0}
            >
              Adicionar
            </Button>
          )}
          {produtoEditado.length > 0 && (
            <Button
              variant="primary"
              onClick={atualizarProdutoNaoPadrao}
              disabled={msgProdutoExistente.length > 0}
            >
              Atualizar
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );

  const ativarEdicaoItem = (
    produto,
    listaAlimentos = produtosAlimentos,
    listaLimpeza = produtosLimpeza
  ) => {
    if (
      listaAlimentos &&
      listaLimpeza &&
      produto &&
      produtoExcluindo.current !== produto.produto
    ) {
      const listaZeradaAlimentos = listaAlimentos.map((it) => {
        it.selected = it === produto;
        return it;
      });

      const listaZeradaLimpeza = listaLimpeza.map((it) => {
        it.selected = it === produto;
        return it;
      });

      changeEstilo(produto);

      setProdutosAlimentos(listaZeradaAlimentos);
      setProdutosLimpeza(listaZeradaLimpeza);
      atualizarLocalStorage(listaZeradaAlimentos, listaZeradaLimpeza);

      setTimeout(() => {
        const campo = document.getElementById(`preco-${produto.produto}`);
        if (campo) {
          campo.focus();
        }
      }, 200);
    } else {
      setEstilo({});
      produtoExcluindo.current = false;
    }
  };

  const changeEstilo = (produto) => {
    let result = {};
    if (produto.selected) {
      result = { backgroundColor: "#f0f0f0" };
    }
    setEstilo(result);
  };

  const adicionarDiminuirQte = (adicionar) => {
    const produtoAtivo = produtosAlimentos
      .concat(produtosLimpeza)
      .find((it) => it.selected);

    if (produtoAtivo) {
      const isAlimento = produtosAlimentos.includes(produtoAtivo);

      const qte = adicionar
        ? produtoAtivo.qte + 1
        : produtoAtivo.qte === 0
        ? 0
        : produtoAtivo.qte - 1;
      if (isAlimento) {
        onChangeAlimentos(qte, produtoAtivo, "qte");
      } else {
        onChangeLimpeza(qte, produtoAtivo, "qte");
      }
    } else {
      toast.warn("Selecione um produto!");
    }
  };

  return (
    <div>
      <ToastContainer autoClose={3000} />
      <h1>Lista de compras</h1>
      <div className="container">
        <ComponenteTabela
          titulo={"Alimentos"}
          produtos={produtosAlimentos}
          onChange={onChangeAlimentos}
          onClickEditProduto={editarProdutoNaoPadrao}
          onClickRemoverProduto={excluirProdutoNaoPadrao}
          estiloDisplay={estiloDisplay}
          ativarEdicaoItem={ativarEdicaoItem}
          estilo={estilo}
        />
        <ComponenteTabela
          titulo={"Limpeza"}
          produtos={produtosLimpeza}
          onChange={onChangeLimpeza}
          onClickEditProduto={editarProdutoNaoPadrao}
          onClickRemoverProduto={excluirProdutoNaoPadrao}
          estiloDisplay={estiloDisplay}
          ativarEdicaoItem={ativarEdicaoItem}
          estilo={estilo}
        />
        <div className="acoes">
          {modal}
          {modalIncluirProduto}
          <div
            style={{
              position: "fixed",
              bottom: "0",
              left: "0",
              width: "100%",
              height: "60px",
              backgroundColor: "#333",
              textAlign: "center",
              color: "white",
            }}
          >
            <button
              onClick={() => adicionarDiminuirQte(false)}
              className={"button-reset"}
              style={{ color: "white" }}
            >
              <i className="bi bi-bag-x-fill" style={{ fontSize: "20px" }}></i>
            </button>
            <button
              onClick={() => adicionarDiminuirQte(true)}
              className={"button-reset"}
              style={{ color: "white" }}
            >
              <i
                className="bi bi-bag-plus-fill"
                style={{ fontSize: "20px" }}
              ></i>
            </button>
            <button
              onClick={adicionarProduto}
              className="button-reset"
              style={{ color: "white" }}
            >
              <div>
                <i
                  className="bi bi-plus-square"
                  style={{ fontSize: "24px" }}
                ></i>
              </div>
            </button>
            <button
              onClick={() => ocultaDesocultarProdutos(!isOcultar)}
              className="button-reset"
              style={{ color: "white" }}
            >
              <i className={classOcultar} style={{ fontSize: "24px" }}></i>
            </button>
            <button
              onClick={() => setModalIsOpen(true)}
              className="button-reset"
              style={{ color: "white" }}
            >
              <i
                className="bi bi-arrow-clockwise"
                style={{ fontSize: "24px" }}
              ></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
