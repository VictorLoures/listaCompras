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
            <th style={{ width: "90px" }}>Ja pegou?</th>
            <th style={{ width: "90px" }}>Qtd.</th>
            <th style={{ width: "165px" }}>Produto</th>
            <th style={{ width: "50px" }}>Preço</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((prod) => (
            <tr style={prod.qte === 0 ? estiloDisplay : {}}>
              <td>
                <input
                  type="checkbox"
                  id="jaPegou"
                  name="jaPegou"
                  checked={prod.jaPegou}
                  onChange={(e) =>
                    onChangeCampo(e.target.checked, prod, "jaPegou")
                  }
                  disabled={prod.qte === 0}
                />
              </td>
              <td className="tdQte">
                <button
                  onClick={() => onChangeCampo(prod.qte - 1, prod, "qte")}
                  disabled={prod.qte < 1}
                  className={"button-reset"}
                >
                  <i class="bi bi-bag-x-fill" style={{ fontSize: "20px" }}></i>
                </button>
                <label>{prod.qte}</label>
                <button
                  onClick={() => onChangeCampo(prod.qte + 1, prod, "qte")}
                  className={"button-reset"}
                >
                  <i class="bi bi-bag-plus" style={{ fontSize: "20px" }}></i>
                </button>
              </td>
              <td style={{ color: prod.qte === 0 ? "#e61919" : "" }}>
                {prod.produto}
                {prod.isAdicional && (
                  <>
                    <button
                      onClick={() => onClickEditProduto(prod.produto)}
                      className="button-reset"
                    >
                      <i class="bi bi-pen" style={{ fontSize: "16px" }}></i>
                    </button>
                    <button
                      onClick={() => onClickRemoverProduto(prod.produto)}
                      className="button-reset"
                    >
                      <i class="bi bi-trash3" style={{ fontSize: "16px" }}></i>
                    </button>
                  </>
                )}
              </td>
              <td>
                <input
                  type="tel"
                  id="preco"
                  name="preco"
                  value={prod.preco}
                  onChange={(e) => onChangeCampo(e.target.value, prod, "preco")}
                  disabled={prod.qte === 0}
                  style={{ width: "70px" }}
                />
              </td>
            </tr>
          ))}
          {estiloDisplay.display !== undefined &&
            produtos &&
            produtos.map((it) => it.qte).reduce((qte1, qte2) => qte1 + qte2) ===
              0 && (
              <td
                colSpan="4"
                style={{
                  textAlign: "center",
                  padding: "10px",
                  fontWeight: "bold",
                }}
              >
                <span style={{ marginRight: "10px" }}>
                  Você não selecionou nenhum produto!
                </span>
                <i class="bi bi-emoji-smile-upside-down"></i>
              </td>
            )}
        </tbody>
      </table>
    </div>
  );
};

export default ComponenteTabela;
