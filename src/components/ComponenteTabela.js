import { useEffect, useState } from "react";

const ComponenteTabela = ({ titulo, produtos, onChange }) => {
  const onChangeCampo = (valor, produto, idCampo) => {
    onChange(valor, produto, idCampo);
  };

  return (
    <div>
      <h2>{titulo}</h2>
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
          {produtos.map((prod) => (
            <tr>
              <td>
                <input
                  type="checkbox"
                  id="jaPegou"
                  name="jaPegou"
                  checked={prod.jaPegou}
                  onChange={(e) =>
                    onChangeCampo(e.target.value === "on", prod, "jaPegou")
                  }
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
                  onChange={(e) => onChangeCampo(e.target.value, prod, "qte")}
                />
              </td>
              <td>{prod.produto}</td>
              <td>
                <input
                  type="number"
                  id="preco"
                  name="preco"
                  value={prod.preco}
                  onChange={(e) => onChangeCampo(e.target.value, prod, "preco")}
                />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>
              Valor total:{" "}
              {produtos
                .map((it) => Number(it.preco))
                .reduce((v1, v2) => v1 + v2)
                .toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default ComponenteTabela;
