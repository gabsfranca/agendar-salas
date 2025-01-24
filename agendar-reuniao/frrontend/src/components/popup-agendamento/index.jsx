// Modal.js
import React from 'react';
import './styles.css'; // Você pode criar estilos separados para o modal.

const popupHorarioOcupado = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{content}</p>
        <button className="close-button" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
};

export default popupHorarioOcupado;
