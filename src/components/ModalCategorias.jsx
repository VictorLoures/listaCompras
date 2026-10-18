import { useState } from "react";
import Modal from "./Modal";
import { normalizarTexto } from "../utils/texto";

// As categorias são fixas; aqui só é possível renomeá-las.
const ModalCategorias = ({ show, onClose, categorias, produtos, acoes }) => {
  const [editando, setEditando] = useState(null);
  const [nomeEditado, setNomeEditado] = useState("");

  const duplicado =
    editando !== null &&
    categorias.some(
      (c) =>
        c.id !== editando &&
        normalizarTexto(c.nome) === normalizarTexto(nomeEditado)
    );
  const podeSalvar = normalizarTexto(nomeEditado) && !duplicado;

  const contagem = (id) => produtos.filter((p) => p.categoria === id).length;

  const salvarEdicao = (e) => {
    e.preventDefault();
    if (!podeSalvar) return;
    acoes.renomearCategoria(editando, nomeEditado);
    setEditando(null);
  };

  return (
    <Modal show={show} onClose={onClose} title="Categorias">
      <ul className="cat-gerenciar">
        {categorias.map((c) => (
          <li key={c.id}>
            {editando === c.id ? (
              <form className="cat-gerenciar-form" onSubmit={salvarEdicao}>
                <input
                  className={`field-input${duplicado ? " is-invalid" : ""}`}
                  value={nomeEditado}
                  onChange={(e) => setNomeEditado(e.target.value)}
                  aria-label={`Novo nome para ${c.nome}`}
                  autoFocus
                  maxLength={30}
                />
                <button
                  type="submit"
                  className="btn btn--primary btn--sm"
                  disabled={!podeSalvar}
                >
                  OK
                </button>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => setEditando(null)}
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <>
                <span className="cat-gerenciar-nome">
                  {c.nome}
                  <small>{contagem(c.id)} produto(s)</small>
                </span>
                <div className="cat-gerenciar-acoes">
                  <button
                    type="button"
                    className="button-reset"
                    onClick={() => {
                      setEditando(c.id);
                      setNomeEditado(c.nome);
                    }}
                    aria-label={`Renomear ${c.nome}`}
                  >
                    <i className="bi bi-pen"></i>
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {duplicado && (
        <div className="field-erro" role="alert">
          Já existe uma categoria com esse nome.
        </div>
      )}
    </Modal>
  );
};

export default ModalCategorias;
