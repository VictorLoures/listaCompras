import { useEffect, useState } from "react";
import "./App.css";
import {
  produtosIniciaisAlimentos,
  produtosIniciaisLimpeza,
} from "./utils/ProdutosIniciais";

const CHAVE_LOCAL_STORAGE_ALIMENTOS = "produtosAlimentosLocalStorage";
const CHAVE_LOCAL_STORAGE_LIMPEZA = "produtosLimpezaLocalStorage";

function App() {
  const [produtosAlimentos, setProdutosAlimentos] = useState(
    produtosIniciaisAlimentos
  );
  const [produtosLimpeza, setProdutosLimpeza] = useState(
    produtosIniciaisLimpeza
  );

  useEffect(() => {
    const produtosAlimentosLocalStorage = localStorage.getItem(
      CHAVE_LOCAL_STORAGE_ALIMENTOS
    );
    const produtosLimpezaLocalStorage = localStorage.getItem(
      CHAVE_LOCAL_STORAGE_LIMPEZA
    );

    if (produtosAlimentosLocalStorage && produtosLimpezaLocalStorage) {
      setProdutosAlimentos(produtosAlimentosLocalStorage);
      setProdutosLimpeza(produtosAlimentosLocalStorage);
    }

    return () => atualizarLocalStorage();
  });

  const atualizarLocalStorage = () => {
    localStorage.removeItem(CHAVE_LOCAL_STORAGE_ALIMENTOS);
    localStorage.removeItem(CHAVE_LOCAL_STORAGE_LIMPEZA);

    localStorage.setItem(CHAVE_LOCAL_STORAGE_ALIMENTOS, produtosAlimentos);
    localStorage.setItem(CHAVE_LOCAL_STORAGE_LIMPEZA, produtosLimpeza);
  };

  return (
    <div>
      <h1>Lista de compras</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "500px",
          justifyContent: "center",
        }}
      >
        <div>
          <h2>Alimentos</h2>
          <table>
            <thead>
              <tr>
                <th>Ja pegou?</th>
                <th>Quantidade</th>
                <th>Produto</th>
                <th>Preço</th>
              </tr>
            </thead>
            <tbody>
              {produtosAlimentos.map((prod) => (
                <tr>
                  <td>
                    <input
                      type="checkbox"
                      id="jaPegou"
                      name="jaPegou"
                      checked={prod.jaPegou}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      id="qte"
                      name="qte"
                      min="0"
                      max="99"
                      value={prod.qte}
                    />
                  </td>
                  <td>{prod.produto}</td>
                  <td>
                    <input
                      type="number"
                      id="preco"
                      name="preco"
                      value={prod.preco}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total:</td>
                <td>100</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div>
          <h2>Limpeza</h2>
          <table>
            <thead>
              <tr>
                <th>Ja pegou?</th>
                <th>Quantidade</th>
                <th>Produto</th>
                <th>Preço</th>
              </tr>
            </thead>
            <tbody>
              {produtosLimpeza.map((prod) => (
                <tr>
                  <td>
                    <input
                      type="checkbox"
                      id="jaPegou"
                      name="jaPegou"
                      checked={prod.jaPegou}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      id="qte"
                      name="qte"
                      min="0"
                      max="99"
                      value={prod.qte}
                    />
                  </td>
                  <td>{prod.produto}</td>
                  <td>
                    <input
                      type="number"
                      id="preco"
                      name="preco"
                      value={prod.preco}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total:</td>
                <td>100</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
