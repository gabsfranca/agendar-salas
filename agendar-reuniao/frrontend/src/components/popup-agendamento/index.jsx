import React from 'react';
import './styles.css';

const ModalComponent = ({
    isModalOpen,
    modalContent,
    userData,
    handleDeleteAgendamento,
    closeModal,

    
}) => {
    if (!isModalOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{modalContent.title}</h2>
                <p>Horário ocupado por: {modalContent.name}</p>
                <p>Tema da reunião: {modalContent.topic}</p>
                <div className="modal-buttons">
                    <button
                        onClick={handleDeleteAgendamento}
                        disabled={modalContent.name !== userData}
                        className={`delete-btn ${modalContent.name === userData ? '' : 'disabled'}`}
                    >
                        Excluir
                    </button>
                    <button onClick={closeModal}>Fechar</button>
                </div>
            </div>
        </div>
    );
};

export default ModalComponent;
