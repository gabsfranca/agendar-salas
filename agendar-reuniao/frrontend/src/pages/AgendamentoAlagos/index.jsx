import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Importar o estilo do calendário
import './styles.css'

const AgendamentoAlagoas = () => {
    
    const [date, setDate] = useState(new Date());

    const handleDateChange = (newDate) => {
        setDate(newDate);
        console.log('data selecionada: ', newDate);
    };

    return(
        <div className='agendamento'>
            <h1>agendamento Alagoas</h1>
            <div className='calendar-container'>
                <Calendar
                    onChange={handleDateChange}
                    value={date}
                />
            </div>
            <p>data selecionada: {date.toDateString()}</p>
        </div>
    );
};

export default AgendamentoAlagoas;