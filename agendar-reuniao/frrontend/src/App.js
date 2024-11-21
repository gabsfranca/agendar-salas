import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Use Routes em vez de Switch
import Home from './pages/Home';
import AgendamentoMajor from './pages/AgendamentoMajor';
import './App.css';
import AgendamentoAlagoas from './pages/AgendamentoAlagos';

function App() {
  return (
   <Router>
    <Routes>
      <Route path="/" exact element={<Home />} />
      <Route path="/agendamento/major" element={<AgendamentoMajor />} />
      <Route path="/agendamento/alagoas" element={<AgendamentoAlagoas />} />
    </Routes>
   </Router>
  );
}

export default App;
