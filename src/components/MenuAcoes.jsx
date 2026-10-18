import Modal from "./Modal";

// Menu "mais ações": agrupa o que não cabe na barra do topo.
const MenuAcoes = ({ show, onClose, itens }) => (
  <Modal
    show={show}
    onClose={onClose}
    title="Mais ações"
    className="modal-card--menu"
  >
    <ul className="menu-lista">
      {itens.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            className={`menu-item button-reset${item.perigo ? " is-perigo" : ""}`}
            disabled={item.desabilitado}
            onClick={() => {
              onClose();
              item.onClick();
            }}
          >
            <i className={`bi ${item.icone}`} aria-hidden="true"></i>
            <span className="menu-item-texto">
              {item.texto}
              {item.detalhe && <small>{item.detalhe}</small>}
            </span>
          </button>
        </li>
      ))}
    </ul>
  </Modal>
);

export default MenuAcoes;
