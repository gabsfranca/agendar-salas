import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import HorariosComponent from '../horarios/index';
import ModalComponent from '../popup-agendamento/index';
import './styles.css';
import ModalConvidar from '../modal-convite';

const AgendamentoPage = ({ filial }) => {
    
    const [date, setDate] = useState(new Date());
    const [horarioSelecionado, setHorario] = useState([]);
    const [horariosOcupados, setHorariosOcupados] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [horarioModal, setHorarioModal] = useState('');
    const [modalContent, setModalContent] = useState({ title: '', name: '', topic: '' });
    const [userData, setUserData] = useState(null);
    const [ehsupervisor, setEhSupervisor] = useState(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [meetingDetails, setMeetingDetails] = useState({
        subject: '',
        description: '',
        startTime: '',
        attendees: []
    });
    const [formData, setFormData] = useState({
        name: '',
        topic:'',
        sede:'major'
    });
    const horariosDisponiveis = [
        '08:00','08:30',
        '09:00','09:30',
        '10:00','10:30',
        '11:00','11:30',
        '13:30',
        '14:00','14:30',
        '15:00','15:30',
        '16:00','16:30',
        '17:00','17:30',
    ]

    useEffect(() => {

        const fetchUsersData = async () => {
            try {
                const response = await fetch('https://192.168.0.178:4000/auth/check-auth', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                console.log('response: ',response.body);

                if (response.ok) {
                    const data = await response.json();
                    console.log('pego a resposta: ', data);
                    if (data.user) {
                        setFormData(prevData => ({
                            ...prevData,
                            name: data.user.email,
                            ehsupervisor: data.user.ehsupervisor
                        }));
                        setEhSupervisor(data.user.ehsupervisor)
                        console.log('é sup? ', data.user.ehsupervisor);
                        console.log('email: ', data.user.email);
                        setUserData(data);
                    }
                    console.log('dados usuario: ', data);
                } 
            }catch (error) {
                console.error('erro fetchando os dados: ', error);
                
            }
        };  
        fetchUsersData();

        

        const fetchHorariosOcupados = async () => {
            try {
                const response = await fetch(
                    `https://192.168.0.178:4000/scheduling/horarios?date=${date.toISOString().split('T')[0]}&sede=${filial}`
                );
                const data = await response.json();
                setHorariosOcupados(data);
            } catch (error) {
                console.error('Erro ao buscar horários ocupados:', error);
            }
        };

        fetchHorariosOcupados();

        const intervalId = setInterval(() => {
            fetchHorariosOcupados();
            console.log('atualizado');
        }, 5000);

        return () => clearInterval(intervalId);

    }, [date, filial]);

    const handleDateChange = (newDate) => {
        setDate(newDate);
        setHorario([]);
        console.log('data selecionada: ', newDate);
    };

    

    const handleClickHorario = (horario) => {
        const horarioOcupado = horariosOcupados.find((h) => h.time === horario);

        if (horarioOcupado) {
            setModalContent({
                title: 'Horário Ocupado',
                name: horarioOcupado.name,
                topic: horarioOcupado.topic,
            });
            console.log('modalContent.name:', modalContent.name);
            console.log('userData:', userData);
            console.log('Comparação:', modalContent.name === userData?.user?.email);
            console.log('Comparando: ', modalContent.name, userData);
            console.log(typeof modalContent.name, typeof userData);
            setHorarioModal(horario);
            setIsModalOpen(true);
        } else {
            setHorario((prev) => {
                if (prev.includes(horario)) {
                    return prev.filter(h => h !== horario);
                } else if (prev.length === 0 || isConsecutive(horario, prev)) {
                    return [...prev, horario].sort();
                } else {
                    alert('Cada reunião só pode conter horários consecutivos!');
                    return prev
                }
            });
            console.log('Horários selecionados após atualização:', horario); // Log individual
        console.log('Estado atualizado (horario):', horario);
        }
    };

    const isConsecutive = (novoHorario, horariosAtuais) => {
        const todosHorarios = [...horariosAtuais, novoHorario].sort();
        const indices = todosHorarios.map(h => horariosDisponiveis.indexOf(h));

        return indices.every((index, i) => 
            i === 0 || index === indices[i - 1] + 1
        )
    }

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        await submitAgendamento();
    }

    const submitAgendamento = async () => {

        if (horarioSelecionado.length === 0 || !ehsupervisor) {
            alert(horarioSelecionado.length === 0 ? 'selecione pelo menos um horário!!' : 'Apenas supervisores!');
            return;
        }

        console.log('deu boa?', userData);

        const [startHour, startMinute] = horarioSelecionado[0].split(':').map(Number);

        const startDate = new Date(date);
        startDate.setHours(startHour, startMinute, 0, 0);

        const endDate = new Date(date);

        const [endHour, endMinute] = horarioSelecionado[horarioSelecionado.length - 1].split(':').map(Number);
        
        endDate.setHours(endHour, endMinute + 30, 0, 0);

        const formatDateTime = (date) => {
            const pad = (n) => String(n).padStart(2, '0');
            return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
        };        

        const meetingData = {
            subject: formData.topic,
            startTime: formatDateTime(startDate),
            endTime: formatDateTime(endDate),
            description: formData.description || 'teste',
            attendees: selectedUsers.length > 0 
                ? selectedUsers : ['luiz.eduardo@similar.ind.br'],
            sede: filial
        };

        console.log('meetingData: ', meetingData);

        try {
            const response = await fetch('https://192.168.0.178:4000/email/createMeeting', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify(meetingData),
            });

            if (!response.ok) throw new Error('Falha ao criar reunião no Outlook');

            console.log('meetingData: ', meetingData);

            if (response.ok){
                alert('cpmvotes enviados!'); 
            }
        } catch (error) {
            console.error('Erro: ', error)
            console.log('meetingData: ', meetingData);
        }

        console.log('formdata: ', formData);

        const agendamentoData = {
            ...formData,
            name: userData?.user?.email,
            ehsupervisor: userData?.user?.ehsupervisor,
            date: date.toISOString().split('T')[0],
            time: horarioSelecionado,
            sede: filial,
        };

        

        try{
            const response = await fetch('https://192.168.0.178:4000/scheduling/agendar', {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json',
                },
                body: JSON.stringify(agendamentoData),
            });


            console.log(response);


            if (!ehsupervisor) {
                alert('Apenas supervisores podem realizar agendamentos: ', ehsupervisor);
                return;
            }

            const [startHour, startMinute] = horarioSelecionado[0].split(':').map(Number);
            const [endHour, endMinute] = horarioSelecionado[horarioSelecionado.length - 1].split(':').map(Number)

            const startDate = new Date(date);
            startDate.setHours(startHour, startMinute, 0, 0);

            const endDate = new Date(date);
            endDate.setHours(endHour, endMinute + 30, 0, 0)

            const formatDateTime = (date) => date.toISOString().slice(0, 16);

            const meetingData = {
                subject: formData.topic || 'oii',
                startTime: formatDateTime(startDate) || '14:00',
                endTime: formatDateTime(endDate) || '15:00',
                description: formData.description || 'Reuniao agendada',
                attendees: selectedUsers.length > 0 ? selectedUsers : ['luiz.eduardo@similar.ind.br'],
                sede: filial
            }

            console.log('meetingDataReal: ', meetingData);

            try {
                const meetingResponse = await fetch('https://192.168.0.178:4000/email/createMeeting', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(meetingData)
                });

                if (!meetingResponse.ok) throw new Error("falha ao criar reuniao");

                const agendamentoData = {
                    name: userData?.user?.email,
                    topic: formData.topic,
                    date: date.toISOString().split('T')[0],
                    time: horarioSelecionado,
                    sede: filial
                };

                const agendamentoResponse = await fetch('https://192.168.0.178:4000/scheduling/agendar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: userData?.user?.email,
                        date: date.toISOString().split('T')[0],
                        time: horarioSelecionado,
                        sede: filial,
                        topic: formData.topic
                    })
                });
                
                if (!agendamentoResponse.ok) throw new Error('falha ao salvar agendamento');

                alert('agendamento efetuado com sucesso')
                setFormData({ topic: '', description: '' });
                setHorario([]);
                setSelectedUsers([]);
            } catch (error) {
                console.error('erro: ', error);
                alert(error.message);
            }

            if (response.ok) {
                console.log('enviado: ', response);
                alert('agendamento efetuado com sucesso!');
            }else{
                console.log('erro ao realizar agendamento: ', response.statusText);
                alert('erro ao realizar agendamento, fale com o gabriel');
            }
        }catch (error) {
            console.log('erro na requisicao: ', error);
            alert('erro ao realizar agendamento, fale com o gabriel');
        }
        
        setFormData({name: '', topic:'', sede:'major'});
        setHorario([]);

        };

    

    const handleDeleteAgendamento = async () => {
        console.log('botao apagar clicado');
        const agendamentoData = {
            name: userData?.user?.email,
            date: date.toISOString().split('T')[0],
            time: horarioModal,
            sede: filial
        };

        console.log('agendamento data: ', agendamentoData);

        try {
            const response = await fetch('https://192.168.0.178:4000/scheduling/agendar', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(agendamentoData),
            });

            if (response.ok) {
                alert('Agendamento excluído!');
                setIsModalOpen(false);
                setHorario([]);
                setHorariosOcupados(prev => prev.filter(h => h.time !== horarioSelecionado));
            } else {
                alert('erro ao excluir agendamneto, fale com o gabriel');
            }
        } catch (error) {
            console.error('erro ao excluir agendamento: ', error);
            alert('erro ao excluir agendamento')
        }
    }

    const fetchUsers = async () => {
        try {
            console.log('buscando usuarios...');
            const response = await fetch('https://192.168.0.178:4000/email/users');
            if (response.ok) {
                const data = await response.json();
                console.log('usuarios buscados: ', data);
                setUsers(data);
            } else {
                console.error('erro ao buscar usuarios: ', response.statusText);
            }
        } catch (error) {
            console.error('erro ao buscar usuarios: ', error);
        }
    };
    

    const toggleUserSelection = (userEmail) => {
        setSelectedUsers((prev) => 
            prev.includes(userEmail) 
                ? prev.filter(email => email !== userEmail) 
                : [...prev, userEmail]
        );
    };

    const openInviteModal = () => {
        fetchUsers();
        setIsInviteModalOpen(true);
    };

    const closeInviteModal = () => {
        setIsInviteModalOpen(false);
    };

    return (
        <div className="agendamento">
            <div className="esquerdinha" id='esquerda'>
                <h1>Selecione o dia</h1>
                <div className='calendar-container'>
                    <Calendar
                        className='calendario'
                        onChange={handleDateChange}
                        value={date}
                    />
                </div>
            </div>
            <div className="meinho">
                <h1>Horários disponíveis:</h1>
                <HorariosComponent
                    horariosDisponiveis={horariosDisponiveis}
                    horariosOcupados={horariosOcupados}
                    horarioSelecionado={horarioSelecionado}
                    handleClickHorario={handleClickHorario}
                />
                <ModalComponent
                    isModalOpen={isModalOpen}
                    modalContent={modalContent}
                    horarioModal={horarioModal}
                    userData={userData}
                    handleDeleteAgendamento={handleDeleteAgendamento}
                    closeModal={() => setIsModalOpen(false)}
                />
            </div>

            <div className='direitinha' id='direita'>
                <h1>Reserva</h1>

                <form onSubmit={handleSubmit} className='reserva-form'>
                    <label>
                        Tema da reuniao:
                        <input
                            type='text'
                            name='topic'
                            value={formData.topic}
                            onChange={handleInputChange}
                            required
                        />
                    </label>

                    <label>
                        Descicao: 
                        <textarea
                            name='description'
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </label>


                    <ModalConvidar
                        isOpen={isInviteModalOpen}
                        users={users}
                        selectedUsers={selectedUsers}
                        toggleUserSelection={toggleUserSelection}
                        closeModal={closeInviteModal}
                        onSchedule={handleSubmit}
                    />
                    <button
                        type='button'
                        disabled={horarioSelecionado.length === 0}
                        onClick={openInviteModal}
                    >
                        Convidar
                    </button>

                    <button type='submit'>Agendar</button>

                </form>
            </div>
        </div>
    );
};

export default AgendamentoPage;