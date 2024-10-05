import { useEffect, useRef, useState } from "react";
import "./App.css";
import {
  sortArray,
  produtosIniciaisAlimentos,
  produtosIniciaisLimpeza,
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

  const [showInpuNovoProd, setShowInpuNovoProd] = useState(false);
  const [produtoNovo, setProdutoNovo] = useState("");
  const [produtoEditado, setProdutoEditado] = useState("");
  const [estiloDisplay, setEstiloDisplay] = useState({});
  const [isOcultar, setIsOcultar] = useState(false);
  const [msgProdutoExistente, setMsgProdutoExistente] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [totalPagarM1, setTotalPagarM1] = useState(0);
  const [totalPagarM2, setTotalPagarM2] = useState(0);
  const [totalPagar, setTotalPagar] = useState(0);

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
    calcularTotal(
      JSON.parse(produtosAlimentosLocalStorage),
      JSON.parse(produtosLimpezaLocalStorage)
    );
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
    alterarCheckMercados(valor, produto, idCampo);
    let listaProdutos = [...produtosAlimentos];
    valor = idCampo === "preco" ? formatPreco(valor, idCampo) : valor;
    listaProdutos = atualizarLista(valor, produto, idCampo, listaProdutos);

    setProdutosAlimentos(listaProdutos);
    atualizarLocalStorage(listaProdutos, produtosLimpeza);
    if (idCampo === "m1" || idCampo === "m2") {
      calcularTotal(listaProdutos, produtosLimpeza);
    }
  };

  const onChangeLimpeza = (valor, produto, idCampo) => {
    alterarCheckMercados(valor, produto, idCampo);
    let listaProdutos = [...produtosLimpeza];
    valor = idCampo === "preco" ? formatPreco(valor) : valor;
    listaProdutos = atualizarLista(valor, produto, idCampo, listaProdutos);

    setProdutosLimpeza(listaProdutos);
    atualizarLocalStorage(produtosAlimentos, listaProdutos);
    if (idCampo === "m1" || idCampo === "m2") {
      calcularTotal(produtosAlimentos, listaProdutos);
    }
  };

  const alterarCheckMercados = (valor, produto, idCampo) => {
    if (idCampo === "m1" && valor) {
      produto.m2 = false;
    }
    if (idCampo === "m2" && valor) {
      produto.m1 = false;
    }
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
    setShowInpuNovoProd(true);
  };

  const adicionarProdutoNaoPadrao = () => {
    const newProduto = {
      m1: false,
      m2: false,
      qte: 1,
      produto: produtoNovo,
      preco: "R$ 0,00",
      isAdicional: true,
      selected: true,
    };
    const novaLista = produtosLimpeza;
    novaLista.push(newProduto);
    toast.success("Produto incluido com sucesso");
    atualizarStates(novaLista, setProdutoNovo);
    ativarEdicaoItem(newProduto);
  };

  const cancelarAdicionar = () => {
    setShowInpuNovoProd(false);
    setProdutoNovo("");
    setMsgProdutoExistente("");
  };

  const atualizarProdutoNaoPadrao = () => {
    const novaLista = produtosLimpeza.map((it) => {
      if (it.produto === produtoEditado) {
        it.produto = produtoNovo;
      }
      return it;
    });
    atualizarStates(novaLista, setProdutoEditado);
  };

  const atualizarStates = (lista, funcaoSetState) => {
    setProdutosLimpeza(lista);
    atualizarLocalStorage(produtosAlimentos, lista);
    setShowInpuNovoProd(false);
    funcaoSetState("");
  };

  const editarProdutoNaoPadrao = (prod) => {
    setShowInpuNovoProd(true);
    setProdutoNovo(prod);
    setProdutoEditado(prod);
  };

  const excluirProdutoNaoPadrao = (produto) => {
    const novaLista = produtosLimpeza.filter((it) => it.produto !== produto);
    setProdutosLimpeza(novaLista);
    atualizarLocalStorage(produtosAlimentos, novaLista);
    setMsgProdutoExistente("");
    produtoExcluindo.current = produto;
  };

  const ocultaDesocultarProdutos = (ocultar) => {
    setEstiloDisplay(ocultar ? { display: "none" } : {});
    localStorage.setItem("ocultar", JSON.stringify(ocultar));
    setIsOcultar(ocultar);
  };

  const reset = () => {
    setProdutosAlimentos(produtosIniciaisAlimentos);
    setProdutosLimpeza(produtosIniciaisLimpeza);
    atualizarLocalStorage(produtosIniciaisAlimentos, produtosIniciaisLimpeza);
    setEstiloDisplay({});
    ocultaDesocultarProdutos(false);
    setMsgProdutoExistente("");
    setModalIsOpen(false);
    calcularTotal(produtosIniciaisAlimentos, produtosIniciaisLimpeza);
    toast.success("Lista resetada com sucesso!");
  };

  const onChangeProdutoNovo = (e) => {
    const produto = e.target.value;
    const listaProdutosGeral = produtosAlimentos
      .map((it) => ({ ...it, secao: "Alimentos" }))
      .concat(produtosLimpeza.map((it) => ({ ...it, secao: "Limpeza" })));
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

  const modal = (
    <div>
      <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Resetar produtos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja resetar todos os produtos?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalIsOpen(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={reset}>
            Resetar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );

  const ativarEdicaoItem = (produto) => {
    if (
      produtosAlimentos &&
      produtosLimpeza &&
      produto &&
      produtoExcluindo.current !== produto.produto
    ) {
      const listaZeradaAlimentos = produtosAlimentos.map((it) => {
        it.selected = it === produto;
        return it;
      });

      const listaZeradaLimpeza = produtosLimpeza.map((it) => {
        it.selected = it === produto;
        return it;
      });

      changeEstilo(produto);

      setProdutosAlimentos(listaZeradaAlimentos);
      setProdutosLimpeza(listaZeradaLimpeza);
      atualizarLocalStorage(listaZeradaAlimentos, listaZeradaLimpeza);

      setTimeout(() => {
        const campo = document.getElementById(`preco-${produto.produto}`);
        campo.focus();
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

  const calcularTotal = (
    produtosAlimen = produtosAlimentos,
    produtosLimp = produtosLimpeza
  ) => {
    const fmtValor = (valor) => {
      return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    };

    const extractValor = (valor) => {
      return Number(valor.substring(3).replace(",", "."));
    };

    const todosProdutos = produtosAlimen.concat(produtosLimp);

    const pordutosJaPegosM1 = todosProdutos.filter((it) => it.m1);
    const pordutosJaPegosM2 = todosProdutos.filter((it) => it.m2);

    let totalM1 = 0;
    if (pordutosJaPegosM1 && pordutosJaPegosM1.length > 0) {
      const valores = pordutosJaPegosM1.map((it) => extractValor(it.preco));
      totalM1 = valores.reduce((preco1, preco2) => preco1 + preco2);
      setTotalPagarM1(fmtValor(totalM1));
    } else {
      setTotalPagarM1(fmtValor(0));
    }

    let totalM2 = 0;
    if (pordutosJaPegosM2 && pordutosJaPegosM2.length > 0) {
      const valores = pordutosJaPegosM2.map((it) => extractValor(it.preco));
      totalM2 = valores.reduce((preco1, preco2) => preco1 + preco2);
      setTotalPagarM2(fmtValor(totalM2));
    } else {
      setTotalPagarM2(fmtValor(0));
    }

    setTotalPagar(fmtValor(totalM1 + totalM2));
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
          calcularTotal={calcularTotal}
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
          calcularTotal={calcularTotal}
        />
        {msgProdutoExistente.length > 0 && (
          <div className="produtoJaExiste">{msgProdutoExistente}</div>
        )}
        <div className="acoes">
          <button onClick={adicionarProduto} className="button-reset">
            <div>
              <i className="bi bi-plus-square" style={{ fontSize: "24px" }}></i>
            </div>
          </button>
          {showInpuNovoProd && (
            <>
              <input
                type="text"
                id="novoProduto"
                name="novoProduto"
                onChange={onChangeProdutoNovo}
                value={produtoNovo}
                style={{ position: "relative", bottom: "5px" }}
                autocomplete="off"
              />
              {produtoEditado.length <= 0 && (
                <>
                  <button
                    onClick={cancelarAdicionar}
                    className="button-reset"
                    style={{ margin: "3px" }}
                  >
                    <i
                      className="bi bi-x-circle"
                      style={{ fontSize: "24px" }}
                    ></i>
                  </button>
                  <button
                    onClick={adicionarProdutoNaoPadrao}
                    className="button-reset"
                    style={{
                      margin: "3px",
                      padding: "0px",
                    }}
                    disabled={msgProdutoExistente.length > 0}
                  >
                    <i
                      className="bi bi-arrow-right-square"
                      style={{ fontSize: "24px" }}
                    ></i>
                  </button>
                </>
              )}
              {produtoEditado.length > 0 && (
                <button
                  onClick={atualizarProdutoNaoPadrao}
                  className="button-reset"
                >
                  <i
                    className="bi bi-arrow-right-square"
                    style={{ fontSize: "24px" }}
                  ></i>
                </button>
              )}
            </>
          )}
          {modal}
          {!showInpuNovoProd && (
            <>
              <button
                onClick={() => ocultaDesocultarProdutos(!isOcultar)}
                className="button-reset"
              >
                <i className={classOcultar} style={{ fontSize: "24px" }}></i>
              </button>
              <button
                onClick={() => setModalIsOpen(true)}
                className="button-reset"
              >
                <i
                  className="bi bi-arrow-clockwise"
                  style={{ fontSize: "24px" }}
                ></i>
              </button>
            </>
          )}
          <div
            style={{
              position: "fixed",
              bottom: "0",
              left: "0",
              width: "100%",
              height: "100px",
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
            <div>
              <span>M1: {totalPagarM1} / </span>
              <span>M2: {totalPagarM2} / </span>
              <span> M1 + M2: {totalPagar}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
