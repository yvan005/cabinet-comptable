import Icon from "./Icon";
import { ic } from "../lib/icons";
import { S } from "../styles";

// Boîte de dialogue générique utilisée par tous les formulaires (ajout/édition) de l'app.
const Modal = ({ title, onClose, children }) => (
  <div style={S.overlay}>
    <div style={S.modal}>
      <div style={S.modalHeader}>
        <span style={S.modalTitle}>{title}</span>
        <button onClick={onClose} style={S.iconBtn}><Icon d={ic.close} size={18} stroke="#4a6d8c" /></button>
      </div>
      {children}
    </div>
  </div>
);

export default Modal;
