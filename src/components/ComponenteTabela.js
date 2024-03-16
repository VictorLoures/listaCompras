import { useEffect, useState } from "react";

const ComponenteTabela = ({
  titulo,
  produtos,
  onChange,
  onClickEditProduto,
  onClickRemoverProduto,
  estiloDisplay,
}) => {
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
            <tr style={prod.qte == 0 ? estiloDisplay : {}}>
              <td>
                <input
                  type="checkbox"
                  id="jaPegou"
                  name="jaPegou"
                  checked={prod.jaPegou}
                  onChange={(e) =>
                    onChangeCampo(e.target.checked, prod, "jaPegou")
                  }
                />
              </td>
              <td>
                <button
                  onClick={() => onChangeCampo(prod.qte - 1, prod, "qte")}
                  disabled={prod.qte < 1}
                >
                  -
                </button>
                <label>{prod.qte}</label>
                <button
                  onClick={() => onChangeCampo(prod.qte + 1, prod, "qte")}
                >
                  +
                </button>
              </td>
              <td style={{ color: prod.qte == 0 ? "#e61919" : "" }}>
                {prod.produto}
              </td>
              <td>
                <input
                  type="tel"
                  id="preco"
                  name="preco"
                  value={prod.preco}
                  onChange={(e) => onChangeCampo(e.target.value, prod, "preco")}
                />
                {prod.isAdicional && (
                  <>
                    <button onClick={() => onClickEditProduto(prod.produto)}>
                      Editar
                    </button>
                    <button onClick={() => onClickRemoverProduto(prod.produto)}>
                      Remover
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComponenteTabela;
