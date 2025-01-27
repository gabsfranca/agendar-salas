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

    console.log('userdata:', userData);
    console.log('email: ', userData.user.email);
    console.log('modalcontentname: ',  modalContent.name);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{modalContent.title}</h2>
                <p>Horário ocupado por: {modalContent.name}</p>
                <p>Tema da reunião: {modalContent.topic}</p>
                <div className="modal-buttons">
                    <button
                        onClick={handleDeleteAgendamento}
                        disabled={modalContent.name !== userData.user.email}
                        className={`delete-btn ${modalContent.name === userData.user.email ? '' : 'disabled'}`}
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
