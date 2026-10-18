import { formatarCentavos } from "../utils/dinheiro";

// No modo compras mostra o total em reais; no modo viagem (sem preço), quantos
// itens há para levar e quantos já estão na mala.
const ResumoTotal = ({ resumo, comPreco = true }) => {
  const { total, noCarrinho, pct, usaEstimativa } = resumo;
  const { quantidadeItens, quantidadePegos } = resumo;
  const textoTotal = comPreco
    ? formatarCentavos(total)
    : `${quantidadeItens} ${quantidadeItens === 1 ? "item" : "itens"}`;

  return (
    <div className="total-card">
      <div className="total-info">
        <div className="total-label">
          {comPreco ? "Total estimado" : "Para levar"}
          {comPreco && usaEstimativa && (
            <span
              className="total-hint"
              title="Inclui itens sem preço digitado, calculados pelo último preço pago"
            >
              {" "}
              · c/ últimos preços
            </span>
          )}
        </div>
        {/* O CSS usa o número de caracteres para encolher a fonte e o valor
            caber ao lado do anel em qualquer largura de tela. */}
        <div
          className="total-value"
          data-testid="total-estimado"
          style={{ "--caracteres": textoTotal.length }}
        >
          {textoTotal}
        </div>
        <div className="total-done">
          {comPreco
            ? `${formatarCentavos(noCarrinho)} já no carrinho`
            : `${quantidadePegos} já na mala`}
        </div>
      </div>
      <div
        className="progress-ring"
        role="img"
        aria-label={`${pct}% dos itens ${comPreco ? "pegos" : "na mala"}`}
        style={{
          background: `conic-gradient(var(--ring-fill) ${pct}%, var(--ring-track) ${pct}%)`,
        }}
      >
        <div className="progress-ring-inner">
          <span className="progress-ring-pct">{pct}%</span>
          <span className="progress-ring-caption">
            {comPreco ? "pego" : "na mala"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResumoTotal;
