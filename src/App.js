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

  const [produtoNovo, setProdutoNovo] = useState("");
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
    setModalIsOpenIncuir(true);
  };

  const adicionarProdutoNaoPadrao = () => {
    const newProduto = {
      m1: false,
      qte: 1,
      produto: produtoNovo,
      preco: "R$ 0,00",
      isAdicional: true,
      selected: true,
    };
    const novaLista = produtosLimpeza.map((it) => it);
    novaLista.push(newProduto);
    toast.success("Produto incluido com sucesso");
    atualizarStates(novaLista, setProdutoNovo);
    ativarEdicaoItem(newProduto, novaLista);
    setModalIsOpenIncuir(false);
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  const cancelarAdicionar = () => {
    setModalIsOpenIncuir(false);
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
    setModalIsOpenIncuir(false);
    funcaoSetState("");
  };

  const editarProdutoNaoPadrao = (prod) => {
    setModalIsOpenIncuir(true);
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
    produtoExcluindo.current = null;
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
            style={{ display: "flex", justifyContent: "center", gap: "5px" }}
          >
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelarAdicionar}>
            Cancelar
          </Button>
          {produtoEditado.length <= 0 && (
            <Button variant="primary" onClick={adicionarProdutoNaoPadrao}>
              Adicionar
            </Button>
          )}
          {produtoEditado.length > 0 && (
            <Button variant="primary" onClick={atualizarProdutoNaoPadrao}>
              Atualizar
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );

  const ativarEdicaoItem = (produto, listaLimpeza = produtosLimpeza) => {
    if (
      produtosAlimentos &&
      listaLimpeza &&
      produto &&
      produtoExcluindo.current !== produto.produto
    ) {
      const listaZeradaAlimentos = produtosAlimentos.map((it) => {
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
        {msgProdutoExistente.length > 0 && (
          <div className="produtoJaExiste">{msgProdutoExistente}</div>
        )}
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
