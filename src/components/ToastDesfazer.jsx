import { useState } from "react";
import { toast } from "react-toastify";

// Conteúdo de toast com botão "Desfazer". O `closeToast` é injetado pelo
// react-toastify quando o componente é passado como conteúdo do toast.
const ToastDesfazer = ({ mensagem, onDesfazer, closeToast }) => {
  // O toast continua visível durante a animação de saída; o botão não pode
  // desfazer duas vezes.
  const [usado, setUsado] = useState(false);
  return (
    <div className="toast-desfazer">
      <span>{mensagem}</span>
      <button
        type="button"
        className="toast-desfazer-btn button-reset"
        disabled={usado}
        onClick={() => {
          if (usado) return;
          setUsado(true);
          onDesfazer();
          closeToast?.();
        }}
      >
        Desfazer
      </button>
    </div>
  );
};

// Só o "desfazer" mais recente vale: desfazer uma ação antiga restauraria uma
// foto do estado anterior às ações mais novas também. Cada aviso recebe um
// token; o botão de um toast antigo (ainda visível na animação de saída) não
// faz nada. Dispensar um toast que já fechou não tem efeito.
let toastAnterior = null;
let tokenAtual = 0;

export const avisarComDesfazer = (mensagem, desfazer) => {
  if (toastAnterior !== null) {
    toast.dismiss(toastAnterior);
  }
  const token = ++tokenAtual;
  const desfazerSeAtual = () => {
    if (token === tokenAtual) {
      tokenAtual++;
      desfazer();
    }
  };
  toastAnterior = toast.success(
    <ToastDesfazer mensagem={mensagem} onDesfazer={desfazerSeAtual} />,
    { autoClose: 6000 }
  );
};

export default ToastDesfazer;
