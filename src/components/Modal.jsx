import { useEffect, useId } from "react";

const Modal = ({ show, onClose, title, children, footer, className = "" }) => {
  const idTitulo = useId();

  useEffect(() => {
    if (!show) {
      return undefined;
    }
    const aoTeclar = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [show, onClose]);

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-card ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title" id={idTitulo}>
            {title}
          </div>
          <button
            type="button"
            className="modal-close button-reset"
            onClick={onClose}
            aria-label="Fechar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
