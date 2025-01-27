import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Use Routes em vez de Switch
import Home from './pages/Home';

import './App.css';

import ProtectedRoute from './components/protected-route/protected-route';
import AgendamentoPage from './components/pagina-agendamento';

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
            <AgendamentoPage filial={'major'}/>
          </ProtectedRoute>
          }
        />
      <Route
        path="/agendamento/alagoas"
        element={
          <ProtectedRoute>
            <AgendamentoPage filial={'alagoas'}/>
          </ProtectedRoute>
        }
      />
    </Routes>
   </Router>
  );
}

export default App;


