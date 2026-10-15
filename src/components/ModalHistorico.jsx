import { useMemo, useState } from "react";
import Modal from "./Modal";
import { formatarCentavos } from "../utils/dinheiro";
import {
  formatarData,
  gastoPorMes,
  ordenarComprasRecentes,
  variacaoDePrecos,
} from "../utils/historico";

const ABAS = [
  { id: "compras", texto: "Compras" },
  { id: "meses", texto: "Por mês" },
  { id: "precos", texto: "Preços" },
];

const fmtPct = (n) =>
  `${n > 0 ? "+" : ""}${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

const Compras = ({ historico, onExcluirCompra }) => {
  const [aberta, setAberta] = useState(null);
  return (
    <ul className="hist-lista">
      {ordenarComprasRecentes(historico).map((compra) => (
        <li key={compra.id} className="hist-compra">
          <button
            type="button"
            className="hist-compra-topo button-reset"
            onClick={() => setAberta(aberta === compra.id ? null : compra.id)}
            aria-expanded={aberta === compra.id}
          >
            <span>
              <strong>{formatarData(compra.data)}</strong>
              <small>{compra.itens.length} itens</small>
            </span>
            <span className="hist-valor">{formatarCentavos(compra.total)}</span>
            <i
              className={`bi ${aberta === compra.id ? "bi-chevron-up" : "bi-chevron-down"}`}
              aria-hidden="true"
            ></i>
          </button>
          {aberta === compra.id && (
            <div className="hist-detalhe">
              <ul>
                {compra.itens.map((item, i) => (
                  <li key={`${item.nome}-${i}`}>
                    <span>
                      {item.nome} ×{item.qte}
                    </span>
                    <span>{formatarCentavos(item.qte * item.preco)}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="hist-excluir button-reset"
                onClick={() => onExcluirCompra(compra)}
              >
                <i className="bi bi-trash3" aria-hidden="true"></i> Excluir esta
                compra
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

// Barras horizontais de uma série só: o rótulo do mês e o valor ficam escritos
// ao lado de cada barra, então não há legenda nem dependência de cor.
const Meses = ({ historico }) => {
  const meses = gastoPorMes(historico);
  const maior = Math.max(...meses.map((m) => m.total), 1);
  return (
    <table className="hist-meses">
      <caption className="sr-only">Gasto total por mês</caption>
      <thead className="sr-only">
        <tr>
          <th scope="col">Mês</th>
          <th scope="col">Gasto</th>
          <th scope="col">Total</th>
        </tr>
      </thead>
      <tbody>
        {meses.map((mes) => (
          <tr key={mes.chave} title={`${mes.compras} compra(s)`}>
            <th scope="row">{mes.rotulo}</th>
            <td className="hist-barra-celula" aria-hidden="true">
              <div
                className="hist-barra"
                style={{ width: `${(mes.total / maior) * 100}%` }}
              ></div>
            </td>
            <td className="hist-valor">{formatarCentavos(mes.total)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const Precos = ({ historico }) => {
  const precos = variacaoDePrecos(historico);
  return (
    <table className="hist-precos">
      <thead>
        <tr>
          <th scope="col">Produto</th>
          <th scope="col">Último</th>
          <th scope="col">Variação</th>
        </tr>
      </thead>
      <tbody>
        {precos.map((p) => (
          <tr key={p.nome}>
            <td>{p.nome}</td>
            <td>{formatarCentavos(p.ultimo)}</td>
            <td>
              {p.variacaoPct === null ? (
                <span className="hist-neutro">—</span>
              ) : (
                <span
                  className={
                    p.variacaoPct > 0
                      ? "hist-subiu"
                      : p.variacaoPct < 0
                        ? "hist-caiu"
                        : "hist-neutro"
                  }
                  title={`Antes: ${formatarCentavos(p.anterior)}`}
                >
                  {p.variacaoPct > 0 ? "▲ " : p.variacaoPct < 0 ? "▼ " : ""}
                  {fmtPct(p.variacaoPct)}
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ModalHistorico = ({ show, onClose, historico, onExcluirCompra }) => {
  const [aba, setAba] = useState("compras");
  const totalGeral = useMemo(
    () => historico.reduce((s, c) => s + c.total, 0),
    [historico]
  );

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Histórico de compras"
      className="modal-card--largo"
    >
      {historico.length === 0 ? (
        <p className="modal-text">
          Nenhuma compra finalizada ainda. Quando terminar uma compra, use{" "}
          <strong>Finalizar compra</strong> no menu para guardar os itens pegos
          e os preços pagos.
        </p>
      ) : (
        <>
          <div className="hist-resumo">
            {historico.length} compra(s) · {formatarCentavos(totalGeral)} no
            total
          </div>
          <div className="segmented segmented--compacto" role="tablist">
            {ABAS.map((a) => (
              <button
                key={a.id}
                type="button"
                role="tab"
                aria-selected={aba === a.id}
                className={`seg-btn${aba === a.id ? " is-active" : ""}`}
                onClick={() => setAba(a.id)}
              >
                {a.texto}
              </button>
            ))}
          </div>
          <div className="hist-conteudo" role="tabpanel">
            {aba === "compras" && (
              <Compras
                historico={historico}
                onExcluirCompra={onExcluirCompra}
              />
            )}
            {aba === "meses" && <Meses historico={historico} />}
            {aba === "precos" && <Precos historico={historico} />}
          </div>
        </>
      )}
    </Modal>
  );
};

export default ModalHistorico;
