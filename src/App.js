import { useEffect, useState } from "react";
import "./App.css";
import {
  produtosIniciaisAlimentos,
  produtosIniciaisLimpeza,
} from "./utils/ProdutosIniciais";
import ComponenteTabela from "./components/ComponenteTabela";

const CHAVE_LOCAL_STORAGE_ALIMENTOS = "produtosAlimentosLocalStorage";
const CHAVE_LOCAL_STORAGE_LIMPEZA = "produtosLimpezaLocalStorage";

function App() {
  const [produtosAlimentos, setProdutosAlimentos] = useState(
    produtosIniciaisAlimentos
  );
  const [produtosLimpeza, setProdutosLimpeza] = useState(
    produtosIniciaisLimpeza
  );

  const [showInpuNovoProd, setShowInpuNovoProd] = useState(false);
  const [produtoNovo, setProdutoNovo] = useState("");
  const [produtoEditado, setProdutoEditado] = useState("");
  const [estiloDisplay, setEstiloDisplay] = useState({});
  const [isOcultar, setIsOcultar] = useState(false);

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

    // return () => {
    //   atualizarLocalStorage();
    // };
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
    valor = idCampo === "preco" ? formatPreco(valor, idCampo) : valor;
    listaProdutos = atualizarLista(valor, produto, idCampo, listaProdutos);

    setProdutosLimpeza(listaProdutos);
    atualizarLocalStorage(produtosAlimentos, listaProdutos);
  };

  const formatPreco = (preco, idCampo) => {
    let precoFmt = preco.replace(/\D/g, "");
    precoFmt = (parseFloat(precoFmt) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return precoFmt.includes("NaN") ? "R$ 0" : precoFmt;
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
      jaPegou: false,
      qte: 0,
      produto: produtoNovo,
      preco: "R$ 0,00",
      isAdicional: true,
    };
    const novaLista = produtosLimpeza;
    novaLista.push(newProduto);
    atualizarStates(novaLista, setProdutoNovo);
  };

  const cancelarAdicionar = () => {
    setShowInpuNovoProd(false);
    setProdutoNovo("");
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
  };

  const ocultaDesocultarProdutos = () => {
    setEstiloDisplay(!isOcultar ? { display: "none" } : {});
    setIsOcultar(!isOcultar);
  };

  const reset = () => {
    setProdutosAlimentos(produtosIniciaisAlimentos);
    setProdutosLimpeza(produtosIniciaisLimpeza);
    atualizarLocalStorage(produtosIniciaisAlimentos, produtosIniciaisLimpeza);
    setEstiloDisplay({});
    setIsOcultar(true);
  };

  return (
    <div>
      <h1>Lista de compras</h1>
      <div className="container">
        <ComponenteTabela
          titulo={"Alimentos"}
          produtos={produtosAlimentos}
          onChange={onChangeAlimentos}
          onClickEditProduto={editarProdutoNaoPadrao}
          onClickRemoverProduto={excluirProdutoNaoPadrao}
          estiloDisplay={estiloDisplay}
        />
        <ComponenteTabela
          titulo={"Limpeza"}
          produtos={produtosLimpeza}
          onChange={onChangeLimpeza}
          onClickEditProduto={editarProdutoNaoPadrao}
          onClickRemoverProduto={excluirProdutoNaoPadrao}
          estiloDisplay={estiloDisplay}
        />
        <div className="acoes">
          <button onClick={adicionarProduto} className="button-reset">
            <div>
              <i class="bi bi-plus-square" style={{ fontSize: "24px" }}></i>
            </div>
          </button>
          {showInpuNovoProd && (
            <>
              <input
                type="text"
                id="novoProduto"
                name="novoProduto"
                onChange={(e) => setProdutoNovo(e.target.value)}
                value={produtoNovo}
                style={{ position: "relative", bottom: "5px" }}
              />
              {produtoEditado.length <= 0 && (
                <>
                  <button onClick={cancelarAdicionar} className="button-reset">
                    <i class="bi bi-x-circle" style={{ fontSize: "24px" }}></i>
                  </button>
                  <button
                    onClick={adicionarProdutoNaoPadrao}
                    className="button-reset"
                  >
                    <i
                      class="bi bi-arrow-right-square"
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
                    class="bi bi-arrow-right-square"
                    style={{ fontSize: "24px" }}
                  ></i>
                </button>
              )}
            </>
          )}
          {!showInpuNovoProd && (
            <>
              <button
                onClick={ocultaDesocultarProdutos}
                className="button-reset"
              >
                <i class={classOcultar} style={{ fontSize: "24px" }}></i>
              </button>
              <button onClick={reset} className="button-reset">
                <i
                  class="bi bi-arrow-clockwise"
                  style={{ fontSize: "24px" }}
                ></i>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
