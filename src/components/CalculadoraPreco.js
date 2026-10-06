import { useState } from "react";
import Modal from "./Modal";
import {
  UNIDADES,
  compararOpcoes,
  formatPrecoMascara,
} from "../utils/CalculadoraPreco";

const OPCAO_VAZIA = { quantidade: "", unidade: "kg", preco: "" };

const CalculadoraPreco = ({ show, onClose }) => {
  const [opcoes, setOpcoes] = useState({ A: OPCAO_VAZIA, B: OPCAO_VAZIA });

  const atualizarOpcao = (chave, campo, valor) => {
    setOpcoes((atual) => ({
      ...atual,
      [chave]: {
        ...atual[chave],
        [campo]: campo === "preco" ? formatPrecoMascara(valor) : valor,
      },
    }));
  };

  const limpar = () => setOpcoes({ A: OPCAO_VAZIA, B: OPCAO_VAZIA });

  const resultado = compararOpcoes(opcoes.A, opcoes.B);

  const cardOpcao = (chave) => {
    const opcao = opcoes[chave];
    const vencedora =
      resultado?.tipo === "vencedora" && resultado.vencedora === chave;
    return (
      <div className={`calc-opcao${vencedora ? " is-vencedora" : ""}`}>
        <div className="calc-opcao-titulo">
          Opção {chave}
          {vencedora && <span className="calc-selo">Compensa</span>}
        </div>
        <div className="calc-linha">
          <input
            className="field-input calc-quantidade"
            type="text"
            inputMode="decimal"
            placeholder="Qtd."
            aria-label={`Quantidade da opção ${chave}`}
            value={opcao.quantidade}
            onChange={(e) => atualizarOpcao(chave, "quantidade", e.target.value)}
            autoComplete="off"
          />
          <select
            className="field-input calc-unidade"
            aria-label={`Unidade da opção ${chave}`}
            value={opcao.unidade}
            onChange={(e) => atualizarOpcao(chave, "unidade", e.target.value)}
          >
            {Object.keys(UNIDADES).map((unidade) => (
              <option key={unidade} value={unidade}>
                {unidade}
              </option>
            ))}
          </select>
        </div>
        <input
          className="field-input"
          type="text"
          inputMode="numeric"
          placeholder="R$ 0,00"
          aria-label={`Preço da opção ${chave}`}
          value={opcao.preco}
          onChange={(e) => atualizarOpcao(chave, "preco", e.target.value)}
          autoComplete="off"
        />
        {resultado?.porUnidade && (
          <div className="calc-por-unidade">{resultado.porUnidade[chave]}</div>
        )}
      </div>
    );
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Qual compensa mais?"
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={limpar}>
            Limpar
          </button>
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Fechar
          </button>
        </>
      }
    >
      <div className="calc-opcoes">
        {cardOpcao("A")}
        {cardOpcao("B")}
      </div>
      <div
        className={`calc-resultado${
          resultado?.tipo === "incompativel" ? " is-erro" : ""
        }`}
        aria-live="polite"
      >
        {resultado
          ? resultado.explicacao
          : "Informe a quantidade e o preço das duas opções para comparar pelo preço por kg, L ou unidade."}
      </div>
    </Modal>
  );
};

export default CalculadoraPreco;
