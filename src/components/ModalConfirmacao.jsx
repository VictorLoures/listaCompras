import Modal from "./Modal";

const ModalConfirmacao = ({
  show,
  titulo,
  textoConfirmar,
  perigo = false,
  onConfirmar,
  onClose,
  children,
}) => (
  <Modal
    show={show}
    onClose={onClose}
    title={titulo}
    footer={
      <>
        <button type="button" className="btn btn--secondary" onClick={onClose}>
          Cancelar
        </button>
        <button
          type="button"
          className={`btn ${perigo ? "btn--danger" : "btn--primary"}`}
          onClick={onConfirmar}
        >
          {textoConfirmar}
        </button>
      </>
    }
  >
    {children}
  </Modal>
);

export default ModalConfirmacao;
