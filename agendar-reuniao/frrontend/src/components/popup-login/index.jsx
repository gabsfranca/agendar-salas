// import React, {useState}  from "react";
// import './styles.css'

// const LoginModal = ({show, onLogin}) => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');

//     if (!show) return null;

//     const handleLogin = async () => {
//         try {
//             const response = await fetch('http://192.168.0.178:4000/login', {
//                 method: 'POST',
//                 headers: {
//                     'content-type':'application/json',
//                 },
//                 body: JSON.stringify({ email, password }),
//             });

//             if (!response.ok) {
//                 throw new Error("erro no login");
//             }

//             const data = await response.json();
//             console.log('resposta do servidor: ', data);

//             onLogin(data);
//         } catch (error) {
//             console.log('erro ao fazer login: ', error);
//         }
//     // }

//     return(
//         <div className="modal-overlay">
//             <div className="modal">
//                 <h2>Login</h2>
//                 <input
//                  type="text"
//                  placeholder="Email"
//                  value={email}
//                  onChange={(e) => setEmail(e.target.value)}
//                  />
//                 <input
//                  type="password"
//                  placeholder="Senha"
//                  value={password}
//                  onChange={(e) => setPassword(e.target.value)}
//                  />
//                 <div className="modal-actions">
//                     <button onClick={handleLogin}>Entrar</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default LoginModal;