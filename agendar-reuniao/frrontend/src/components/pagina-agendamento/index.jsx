import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import HorariosComponent from '../horarios/index';
import ModalComponent from '../popup-agendamento/index';
import './styles.css';

const AgendamentoPage = ({ filial }) => {
    const [date, setDate] = useState(new Date());
    const [horarioSelecionado, setHorario] = useState([]);
    const [horariosOcupados, setHorariosOcupados] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [horarioModal, setHorarioModal] = useState('');
    const [modalContent, setModalContent] = useState({ title: '', name: '', topic: '' });
    const [userData, setUserData] = useState(null);
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

                if (response.ok) {
                    const data = await response.json();
                    console.log('pego a resposta: ', data);
                    setFormData(prevData => ({
                        ...prevData,
                        name: data.user.displayName || data.user.name || data.user
                    }));

                    setUserData(data.user);
                    console.log(userData);
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
            console.log('Comparação:', modalContent.name === userData);
            console.log('Comparando: ', modalContent.name, userData);
            console.log(typeof modalContent.name, typeof userData);
            setHorarioModal(horario);
            setIsModalOpen(true);
        } else {
            setHorario((prev) =>
                prev.includes(horario) ? prev.filter((h) => h !== horario) : [...prev, horario]
            );
            console.log('Horários selecionados após atualização:', horario); // Log individual
        console.log('Estado atualizado (horario):', horario);
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (horarioSelecionado.length === 0) {
            alert('selecione pelo menos um horário!!');
            return;
        }
        
        const agendamentoData = {
            ...formData,
            name:  userData,
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
            name: userData,
            date: date.toISOString().split('T')[0],
            time: horarioModal,
            sede: filial
        };

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

                <form onSubmit={handleFormSubmit} className='reserva-form'>
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
                    <button
                        type='submit'
                        disabled={horarioSelecionado.length === 0}
                    >
                        reservar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AgendamentoPage;