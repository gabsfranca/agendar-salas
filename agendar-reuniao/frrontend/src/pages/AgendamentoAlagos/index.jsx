import React, { useEffect, useState, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Importar o estilo do calendário
import './styles.css'

const filial = 'alagoas';

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

const AgendamentoAlagoas = () => {
    
    const [date, setDate] = useState(new Date());
    const [horarioSelecionado, setHorario] = useState([]);
    const [horariosOcupados, setHorariosOcupados] = useState([]);
    const [formData, setFormData] = useState({
        name:'',
        topic:'',
        sede:'alagoas'
    });



    useEffect(() => {
        const fetchHorariosOcupados = async () => {
            try {
                const response = await fetch(
                    `http://192.168.0.178:4000/horarios?date=${date.toISOString().split('T')[0]}&sede=${filial}`
                );
                const data = await response.json();
                console.log("Horários Ocupados Retornados:", data);
                setHorariosOcupados(data);
                console.log('Horários ocupados retornados da API:', data);
            } catch (error) {
                console.log('erro nos horarios: ', error);
            }
        };

        fetchHorariosOcupados();

        const intervalId = setInterval (() => {
            fetchHorariosOcupados();
            console.log('atualizado!');
        }, 5000);

        return () => clearInterval(intervalId);
    }, [date, filial]);

    const handleDateChange = async (newDate) => {
        setDate(newDate);
        setHorario([]);
        console.log('data selecionada: ', newDate);
    };

    const handleClickHorario = (horario) => {
        const horarioOcupado = horariosOcupados.find((h) => String(h.time.trim()) === String(horario.trim()));

        console.log("Horário clicado:", horario);
        console.log("Horários Ocupados:", horariosOcupados);


        if (horarioOcupado) {
            alert(`Horário ocupado por: ${horarioOcupado.name}\nTema: ${horarioOcupado.topic}`);
        }else {
            setHorario((prev) => 
                prev.includes(horario) ? prev.filter((h) => h !== horario) : [...prev, horario]
            );
            console.log(`horario selecionado: ${horario}`);
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
            date: date.toISOString().split('T')[0],
            time: horarioSelecionado,
            sede: filial,
        };

        try{
            const response = await fetch('http://192.168.0.178:4000/agendar', {
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
        
        setFormData({name: '', topic:'', sede:'alagoas'});
        setHorario([]);

        };

        
    return(

        <div className='agendamento'>
            <div className='esquerdinha' id='esquerda'>
                <h1>Selecione o dia</h1>
                <div className='calendar-container'>
                    <Calendar
                        className='calendario'
                        onChange={handleDateChange}
                        value={date}
                    />
                </div>
                <p>agendamento: {date.toDateString()}</p>
            </div>

            <div className='meinho'>
                <h1>Horários disponiveis:</h1>
                <div className='container-horarios'>
                    {horariosDisponiveis.map((horario) =>{

                    const ocupado = horariosOcupados.some((h) => h.time === horario); 
                    
                    return(
                        
                            <button
                                key = {horario}
                                className={`horario-btn ${ocupado ? 'ocupado' : ''} ${
                                        horarioSelecionado.includes(horario) ? 'selecionado' : ''
                                    }`}
                                onClick={() => handleClickHorario(horario)}
                                // disabled = {ocupado}
                            >
                                {horario}
                            </button>
                        );
                    })}
                </div>
                {horarioSelecionado.length > 0 && (
                    <p>
                        horarios selecionados: {horarioSelecionado.join(', ')}
                    </p>
                )}
            </div>
{/* dsa */}
            <div className='direitinha' id='direita'>
                <h1>Reserva</h1>

                <form onSubmit={handleFormSubmit} className='reserva-form'>
                    <label>
                        Nome:
                        <input
                            type='text'
                            name='name'
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
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

export default AgendamentoAlagoas;