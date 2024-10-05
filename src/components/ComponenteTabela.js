const ComponenteTabela = ({
  titulo,
  produtos,
  onChange,
  onClickEditProduto,
  onClickRemoverProduto,
  estiloDisplay,
  ativarEdicaoItem,
  estilo,
  calcularTotal,
}) => {
  const onChangeCampo = (valor, produto, idCampo) => {
    onChange(valor, produto, idCampo);
  };

  const setCursosrFinal = (id) => {
    let input = document.getElementById(id);
    input.setSelectionRange(input.value.length, input.value.length);
  };

  const setStyle = (prod) => {
    let result = {};
    if (prod.qte === 0) {
      result = estiloDisplay;
      if (prod.selected) {
        result = { ...result, ...estilo };
      }
    } else if (prod.selected) {
      result = estilo;
    }
    return result;
  };

  return (
    <div>
      <h2>{titulo}</h2>
      <table>
        <thead>
          <tr>
            <th style={{ width: "45px" }}>M1</th>
            <th style={{ width: "45px" }}>M2</th>
            <th style={{ width: "5px" }}>Qtd.</th>
            <th style={{ width: "250px" }}>Produto</th>
            <th style={{ width: "50px" }}>Preço</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((prod) => (
            <tr style={setStyle(prod)} key={prod.produto}>
              <td>
                <input
                  type="checkbox"
                  id="m1"
                  name="m1"
                  checked={prod.m1}
                  onChange={(e) => onChangeCampo(e.target.checked, prod, "m1")}
                  disabled={prod.qte === 0}
                  style={{ transform: "scale(1.5)" }}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  id="m2"
                  name="m2"
                  checked={prod.m2}
                  onChange={(e) => onChangeCampo(e.target.checked, prod, "m2")}
                  disabled={prod.qte === 0}
                  style={{ transform: "scale(1.5)" }}
                />
              </td>
              <td
                className="tdQte"
                style={{ display: "flex", justifyContent: "center" }}
                onClick={() => ativarEdicaoItem(prod)}
              >
                <label>{prod.qte}</label>
              </td>
              <td
                style={{
                  color:
                    prod.qte === 0
                      ? "#e61919"
                      : !prod.m1 && !prod.m2
                      ? "orange"
                      : "",
                }}
              >
                <span
                  style={{ fontSize: "24px", display: "block", width: "100%" }}
                  onClick={() => ativarEdicaoItem(prod)}
                >
                  {prod.produto}
                </span>
                {prod.isAdicional && (
                  <>
                    <button
                      onClick={() => onClickEditProduto(prod.produto)}
                      className="button-reset"
                    >
                      <i className="bi bi-pen" style={{ fontSize: "16px" }}></i>
                    </button>
                    <button
                      onClick={() => onClickRemoverProduto(prod.produto)}
                      className="button-reset"
                    >
                      <i
                        className="bi bi-trash3"
                        style={{ fontSize: "16px" }}
                      ></i>
                    </button>
                  </>
                )}
              </td>
              <td onClick={() => ativarEdicaoItem(prod)}>
                <div>
                  {prod.selected && (
                    <input
                      type="tel"
                      id={`preco-${prod.produto}`}
                      name="preco"
                      value={prod.preco}
                      onChange={(e) =>
                        onChangeCampo(e.target.value, prod, "preco")
                      }
                      disabled={prod.qte === 0}
                      style={{ width: "70px" }}
                      onClick={() => setCursosrFinal(`preco-${prod.produto}`)}
                      onBlur={() => calcularTotal()}
                    />
                  )}
                  {!prod.selected && (
                    <p style={{ width: "70px" }}>{prod.preco}</p>
                  )}
                </div>
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
                <i className="bi bi-emoji-smile-upside-down"></i>
              </td>
            )}
        </tbody>
      </table>
    </div>
  );
};

export default ComponenteTabela;
