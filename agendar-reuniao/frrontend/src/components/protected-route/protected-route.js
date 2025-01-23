import React, { useState, useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch('https://192.168.0.178:4000/auth/check-auth', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });

        console.log('response status: ', response.status);
        console.log('response: ', response);

        if (response.ok) {
          const data = await response.json();
          console.log('auth check data: ', data);
          setIsAuthenticated(true);
        } else {
          console.error('nao autenticado: ', response.status)
          window.location.href = 'https://192.168.0.178:4000/auth/login';
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // window.location.href = 'https://localhost:4000/auth/error';
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;