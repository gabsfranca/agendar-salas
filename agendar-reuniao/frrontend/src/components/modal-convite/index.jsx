import React from 'react';
import './styles.css';

const ModalConvidar = ({
    isOpen,
    users,
    selectedUsers,
    toggleUserSelection,
    closeModal,
    onSchedule
}) => {
    if (!isOpen) return null;


    const handleAgendar = () => {
        onSchedule();
        closeModal();
    }

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Convidar Participantes</h2>
                <ul className="user-list">
                    {users.map((user) => (
                        <li key={user.id}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user.email)}
                                    onChange={() => toggleUserSelection(user.email)}
                                />
                                {user?.email}
                            </label>
                        </li>
                    ))}
                </ul>
                <div className="modal-buttons">
                    <button onClick={closeModal}>Fechar</button>
                    <button onClick={handleAgendar}>Agendar</button>
                </div>
            </div>
        </div>
    );
};

export default ModalConvidar;