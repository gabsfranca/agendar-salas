import React from 'react';
import './styles.css';

const HorariosComponent = ({
    horariosDisponiveis, 
    horariosOcupados, 
    horarioSelecionado,
    handleClickHorario,
}) => {
    return (
        <div className='container-horarios'>
            {horariosDisponiveis.map((horario) => {
                const ocupado = horariosOcupados.some((h) => h.time === horario);
                return(
                    <button
                        key={horario}
                        className={`horario-btn ${ocupado ? 'ocupado' : ''} ${
                            horarioSelecionado.includes(horario) ? 'selecionado' : ''
                        }`}
                        onClick={() => handleClickHorario(horario)}
                        >
                            {horario}
                    </button>
                );
            })}
        </div>
    )
}

export default HorariosComponent;