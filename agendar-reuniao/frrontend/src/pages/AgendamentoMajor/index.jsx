import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Importar o estilo do calendário
import './styles.css'

const AgendamentoMajor = () => {
    
    const [date, setDate] = useState(new Date());
    const [horarioSelecionado, setHorario] = useState([]);
    const [formData, setFormData] = useState({
        name:'',
        topic:''
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

    const handleDateChange = (newDate) => {
        setDate(newDate);
        setHorario([]);
        console.log('data selecionada: ', newDate);
    };

    const handleClickHorario = (horario) => {
        setHorario((prev) => 
            prev.includes(horario)
                ? prev.filter((h) => h !== horario)
                : [...prev, horario]
        );
        console.log(`horario selecionado: ${horario}`);
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handeFormSubmit = (e) => {
        if (horarioSelecionado.length === 0) {
            alert('selecione um horário!!')
        }else{
            e.preventDefault();
            console.log('enviado: ', {
                ...formData,
                date: date.toDateString(),
                time: horarioSelecionado
            });
            alert(`Data: ${date.toDateString()}\nHorários: ${horarioSelecionado.join(', ')}`);
        } 
        setFormData({name: '', topic: ''})
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
                    {horariosDisponiveis.map((horario) => (

                            <button
                                key = {horario}
                                className={`horario-btn ${horarioSelecionado.includes(horario) ? 'selecionado' : ''}`}
                                onClick={() => handleClickHorario(horario)}
                            >
                                {horario}
                            </button>

                    ))}
                </div>
                {horarioSelecionado && (
                    <p>
                        horario selecionado: {horarioSelecionado}
                    </p>
                )}
            </div>

            <div className='direitinha' id='direita'>
                <h1>Reserva</h1>

                <form onSubmit={handeFormSubmit} className='reserva-form'>
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
                        disabled={!horarioSelecionado}
                    >
                        reservar
                    </button>
                </form>
            </div>
        </div>

    );
};

export default AgendamentoMajor;