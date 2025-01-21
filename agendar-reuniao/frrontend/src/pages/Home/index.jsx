import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../../components/popup-login';
import './styles.css'

const Home = () => {

    const [salaSelecionada, setSalaSelecionada] = useState(null);
    const [isLogged, setIsLogged] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    
    const navigate = useNavigate();

    const handleClick = (sala) => {
        if (!isLogged) {
            setShowLogin(true);
            return
        }
        setSalaSelecionada(sala);
        navigate(`/agendamento/${sala}`)
    };

    const handleLogin = () => {
        setIsLogged(true);
        setShowLogin(false);
    };

    return(
        <div className="container">
            <LoginModal show={showLogin} onLogin={handleLogin} />
            <div className="half" id="left"  onClick={() => handleClick('major')}>Agendar reunião na Major</div>
            <div className="half" id="right" onClick={() => handleClick('alagoas')}>Agendar reunião na Alagoas</div>
        </div>
    );
}

export default Home;