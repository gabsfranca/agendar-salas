import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Use Routes em vez de Switch
import Home from './pages/Home';
import AgendamentoMajor from './pages/AgendamentoMajor';
import './App.css';
import AgendamentoAlagoas from './pages/AgendamentoAlagos';
import ProtectedRoute from './components/protected-route/protected-route';

function App() {
  return (
   <Router>
    <Routes>
      <Route
        path="/"
        exact element={
          <ProtectedRoute>
            <Home/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agendamento/major"
        element={
          <ProtectedRoute>
            <AgendamentoMajor/>
          </ProtectedRoute>
          }
        />
      <Route
        path="/agendamento/alagoas"
        element={
          <ProtectedRoute>
            <AgendamentoAlagoas/>
          </ProtectedRoute>
        }
      />
    </Routes>
   </Router>
  );
}

export default App;


