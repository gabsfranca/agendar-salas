import React, { useState } from 'react';
import './styles.css';

const ModalConvidar = ({
    isOpen,
    users,
    selectedUsers,
    toggleUserSelection,
    closeModal
}) => {
    const [subject, setSubject] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;
    
    const getSelectedEmails = () => {
        return selectedUsers
            .map((id) => users.find((user) => user.id === id) ?.email)
            .filter((email) => email);
    };

    const handleCreateMeeting = async () => {
        const attendees = getSelectedEmails();

        try {
            const response = await fetch('https://192.168.0.178:4000/email/createMeeting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject,
                    startTime, 
                    endTime, 
                    attendees,
                    description    
                })
            });

            if (response.ok) {
                alert('convite enviado com sucesso!');
                closeModal();
            } else {
                alert('erro ao enviar convites!');
            }


        } catch (error) {
            console.error('erro ao enviar emails: ', error)
            alert('erro ao agendar reuniao')
        }
    };

    console.log('usuarios captados: ',users);
    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Convidar Usuários</h2>
                <ul className="user-list">
                    {users.map((user) => (
                        <li key={user.id}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user.id)}
                                    onChange={() => toggleUserSelection(user.id)}
                                />
                                {user.email}
                            </label>
                        </li>
                    ))}
                </ul>
                <div className="modal-buttons">
                    <button onClick={closeModal}>Fechar</button>
                    <button onClick={handleCreateMeeting}>
                        Agendar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalConvidar;
