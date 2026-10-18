import { formatarCentavos } from "../utils/dinheiro";

const ResumoTotal = ({ resumo }) => {
  const { total, noCarrinho, pct, usaEstimativa } = resumo;

  return (
    <div className="total-card">
      <div className="total-info">
        <div className="total-label">
          Total estimado
          {usaEstimativa && (
            <span
              className="total-hint"
              title="Inclui itens sem preço digitado, calculados pelo último preço pago"
            >
              {" "}
              · c/ últimos preços
            </span>
          )}
        </div>
        <div className="total-value" data-testid="total-estimado">
          {formatarCentavos(total)}
        </div>
        <div className="total-done">
          {formatarCentavos(noCarrinho)} já no carrinho
        </div>
      </div>
      <div
        className="progress-ring"
        role="img"
        aria-label={`${pct}% dos itens pegos`}
        style={{
          background: `conic-gradient(var(--ring-fill) ${pct}%, var(--ring-track) ${pct}%)`,
        }}
      >
        <div className="progress-ring-inner">
          <span className="progress-ring-pct">{pct}%</span>
          <span className="progress-ring-caption">pego</span>
        </div>
      </div>
    </div>
  );
};

export default ResumoTotal;
