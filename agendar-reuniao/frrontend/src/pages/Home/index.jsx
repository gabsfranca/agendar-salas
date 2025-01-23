import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css'

const Home = () => {

    const [salaSelecionada, setSalaSelecionada] = useState(null);
    const [isLogged, setIsLogged] = useState(false);
    
    const navigate = useNavigate();

    const handleClick = (sala) => {
        setSalaSelecionada(sala);
        navigate(`/agendamento/${sala}`)
    };



    return(
        <div className="container">
            <div className="half" id="left"  onClick={() => handleClick('major')}>Agendar reunião na Major</div>
            <div className="half" id="right" onClick={() => handleClick('alagoas')}>Agendar reunião na Alagoas</div>
        </div>
    );
}

export default Home;