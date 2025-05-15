// // client/src/pages/VerifyEmail.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import api from '../services/api';
// import '../styles/Auth.css';


// const VerifyEmail = () => {
//   const { token } = useParams();
//   const [verificationStatus, setVerificationStatus] = useState('verifying'); 
//   const [message, setMessage] = useState('Verificando tu correo electrónico...');
//   const { setUser } = useAuth();
  
//   const navigate = useNavigate();

//   useEffect(() => {
//     const verifyEmail = async () => {
//       try {
//         // Llamar a la API para verificar el token
//         const response = await api.verifyEmail(token);
        
//         // Actualizar el estado de autenticación
//         if (response.token) {
//           localStorage.setItem('token', response.token);
//           localStorage.setItem('userId', response.user.id);
//           localStorage.setItem('userType', response.user.type);
//           setUser(response.user);
//         }
        
//         setVerificationStatus('success');
//         setMessage('¡Tu correo electrónico ha sido verificado correctamente!');
        
//         // Redireccionar al dashboard después de 3 segundos
//         setTimeout(() => {
//           navigate('/cliente/dashboard');
//         }, 3000);
        
//       } catch (error) {
//         console.error('Error al verificar email:', error);
        
//         if (error.response?.status === 400) {
//           if (error.response.data.message.includes('expirado')) {
//             setVerificationStatus('expired');
//             setMessage('El enlace de verificación ha expirado. Por favor, solicita un nuevo enlace.');
//           } else {
//             setVerificationStatus('invalid');
//             setMessage('Verificando tu cuenta, por favor espera un momento...');
//           }
//         } else {
//           setVerificationStatus('error');
//           setMessage('Ha ocurrido un error al verificar tu correo electrónico. Por favor, inténtalo de nuevo más tarde.');
//         }
//       }
//     };
    
//     if (token) {
//       verifyEmail();
//     } else {
//       setVerificationStatus('invalid');
//       setMessage('El enlace de verificación no es válido.');
//     }
//   }, [token, navigate, setUser]);

//   // Función para solicitar un nuevo enlace
//   const handleResendVerification = async () => {
//     try {
//       // Obtener el email del almacenamiento local (si lo guardamos durante el registro)
//       const email = localStorage.getItem('pendingVerificationEmail');
      
//       if (!email) {
//         setMessage('No se pudo determinar tu correo electrónico. Por favor, intenta registrarte de nuevo.');
//         return;
//       }
      
//       await api.resendVerification(email);
//       setMessage('Se ha enviado un nuevo enlace de verificación a tu correo electrónico.');
      
//     } catch (error) {
//       console.error('Error al reenviar verificación:', error);
//       setMessage('Ha ocurrido un error al enviar el enlace de verificación. Por favor, inténtalo de nuevo más tarde.');
//     }
//   };

//   // Renderizar diferentes mensajes según el estado
//   const renderContent = () => {
//     switch (verificationStatus) {
//       case 'verifying':
//         return (
//           <div className="verification-loading">
//             <div className="spinner"></div>
//             <p>{message}</p>
//           </div>
//         );
        
//       case 'success':
//         return (
//           <div className="verification-success">
//             <div className="success-icon">✓</div>
//             <h3>¡Verificación Exitosa!</h3>
//             <p>{message}</p>
//             <p>Redireccionando al dashboard...</p>
//           </div>
//         );
        
//       case 'expired':
//         return (
//           <div className="verification-expired">
//             <div className="expired-icon">⚠️</div>
//             <h3>Enlace Expirado</h3>
//             <p>{message}</p>
//             <button onClick={handleResendVerification} className="verification-btn">
//               Enviar Nuevo Enlace
//             </button>
//           </div>
//         );
        
//       case 'invalid':
//       case 'error':
//       default:
//         return (
//           <div className="verification-error">
//             <div className="error-icon" src="C:\Users\norie\gym-app\client\images\cargando.webn"></div>
//             <h3>Verificando...</h3>
//             <p>{message}</p>
//             <div className="verification-links">
//               <Link to="/registro" className="verification-link">Volver a Registrarse</Link>
//               <Link to="/login" className="verification-link">Iniciar Sesión</Link>
//             </div>
//           </div>
//         );
//     }
//   };

//   return (
//     <div className="old-auth-container">
//       <div className="verification-box">
//         <h2 className="titulo">Verificación de Correo</h2>
//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default VerifyEmail;

// client/src/pages/VerifyEmail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Auth.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); 
  const [message, setMessage] = useState('Verificando tu correo electrónico...');
  const { setUser } = useAuth();
  const [showDebug, setShowDebug] = useState(false);
  const [debug, setDebug] = useState({
    token: token ? token.substring(0, 10) + '...' : 'No token',
    apiUrl: import.meta.env.VITE_API_URL || 'No API URL env variable',
    fullUrl: window.location.href,
    attempts: 0,
    lastError: null
  });
  
  const navigate = useNavigate();

  // Función mejorada para verificar el email
  const verifyEmail = async () => {
    if (!token) {
      console.log("No hay token en la URL");
      setVerificationStatus('invalid');
      setMessage('El enlace de verificación no es válido.');
      return;
    }

    try {
      console.log("VerifyEmail - Llamando a api.verifyEmail con token:", token.substring(0, 10) + "...");
      console.log("URL completa:", window.location.href);
      
      // Incrementar contador de intentos en debug
      setDebug(prev => ({...prev, attempts: prev.attempts + 1}));
      
      // Llamar a la API para verificar el token
      const response = await api.verifyEmail(token);
      console.log("Verificación exitosa, respuesta:", response);
      
      // Actualizar el estado de autenticación si la respuesta tiene un token
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        if (response.user && response.user.id) {
          localStorage.setItem('userId', response.user.id);
          localStorage.setItem('userType', response.user.type || 'cliente');
          setUser(response.user);
        }
      }
      
      setVerificationStatus('success');
      setMessage(response.message || '¡Tu correo electrónico ha sido verificado correctamente!');
      
      // Redireccionar al dashboard o login después de 3 segundos
      setTimeout(() => {
        if (response && response.token) {
          navigate('/cliente/dashboard');
        } else {
          navigate('/login');
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error completo al verificar email:', error);
      
      // Actualizar información de debug
      setDebug(prev => ({
        ...prev, 
        lastError: error.message || 'Error desconocido'
      }));
      
      // Si ha habido 2 o más intentos, ofrecer la verificación directa
      if (debug.attempts >= 2) {
        setVerificationStatus('offering-direct');
        setMessage('Estamos teniendo problemas para verificar tu correo. ¿Quieres intentar la verificación directa?');
        return;
      }
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        console.log('Respuesta de error:', error.response.data);
        
        if (error.response.status === 400) {
          if (error.response.data.message && error.response.data.message.includes('expirado')) {
            setVerificationStatus('expired');
            setMessage('El enlace de verificación ha expirado. Por favor, solicita un nuevo enlace.');
          } else {
            setVerificationStatus('invalid');
            setMessage('El enlace de verificación no es válido o ya ha sido utilizado.');
          }
        } else if (error.response.status === 404) {
          setVerificationStatus('invalid');
          setMessage('El enlace de verificación no es válido.');
        } else {
          setVerificationStatus('error');
          setMessage('Ha ocurrido un error al verificar tu correo electrónico. Por favor, inténtalo de nuevo más tarde.');
        }
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        setVerificationStatus('error');
        setMessage('No se pudo conectar con el servidor. Verifica tu conexión a internet e inténtalo de nuevo.');
      } else {
        // Error en la configuración de la solicitud
        setVerificationStatus('error');
        setMessage('Ha ocurrido un error en la aplicación. Por favor, inténtalo de nuevo más tarde.');
      }
    }
  };

  // Nueva función para hacer verificación directa (fallback)
  const handleDirectVerification = async () => {
    try {
      setVerificationStatus('redirecting');
      setMessage('Redirigiendo para verificación directa...');
      
      // Usar el método de verificación directa que redirige al usuario
      await api.verifyEmailDirect(token);
      
      // No deberíamos llegar aquí ya que verifyEmailDirect redirige al usuario
    } catch (error) {
      console.error('Error al intentar verificación directa:', error);
      setVerificationStatus('error');
      setMessage('Error al intentar la verificación directa. Por favor, contacta a soporte.');
    }
  };

  useEffect(() => {
    console.log("VerifyEmail - Componente montado");
    console.log("Token recibido:", token);
    
    // Iniciar proceso de verificación
    verifyEmail();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Función para solicitar un nuevo enlace
  const handleResendVerification = async () => {
    try {
      // Obtener el email del almacenamiento local
      const email = localStorage.getItem('pendingVerificationEmail');
      
      if (!email) {
        setMessage('No se pudo determinar tu correo electrónico. Por favor, intenta registrarte de nuevo.');
        return;
      }
      
      const response = await api.resendVerification(email);
      setMessage(response.message || 'Se ha enviado un nuevo enlace de verificación a tu correo electrónico.');
      
    } catch (error) {
      console.error('Error al reenviar verificación:', error);
      setMessage('Ha ocurrido un error al enviar el enlace de verificación. Por favor, inténtalo de nuevo más tarde.');
    }
  };

  // Función para mostrar información de depuración
  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  // Renderizar diferentes mensajes según el estado
  const renderContent = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <div className="verification-loading">
            <div className="spinner"></div>
            <p>{message}</p>
          </div>
        );
        
      case 'success':
        return (
          <div className="verification-success">
            <div className="success-icon">✓</div>
            <h3>¡Verificación Exitosa!</h3>
            <p>{message}</p>
            <p>Redireccionando...</p>
          </div>
        );
        
// Continuación de VerifyEmail.jsx
      case 'expired':
        return (
          <div className="verification-expired">
            <div className="expired-icon">⚠️</div>
            <h3>Enlace Expirado</h3>
            <p>{message}</p>
            <button onClick={handleResendVerification} className="verification-btn">
              Enviar Nuevo Enlace
            </button>
          </div>
        );
        
      case 'offering-direct':
        return (
          <div className="verification-direct-offer">
            <div className="question-icon">❓</div>
            <h3>Problemas con la Verificación</h3>
            <p>{message}</p>
            <div className="verification-actions">
              <button onClick={handleDirectVerification} className="verification-btn primary">
                Intentar Verificación Directa
              </button>
              <button onClick={verifyEmail} className="verification-btn secondary">
                Reintentar Verificación Normal
              </button>
            </div>
          </div>
        );
        
      case 'redirecting':
        return (
          <div className="verification-loading">
            <div className="spinner"></div>
            <p>{message}</p>
          </div>
        );
        
      case 'invalid':
      case 'error':
      default:
        return (
          <div className="verification-error">
            <div className="error-icon">⚠️</div>
            <h3>Error de Verificación</h3>
            <p>{message}</p>
            <div className="verification-links">
              <Link to="/registro" className="verification-link">Volver a Registrarse</Link>
              <Link to="/login" className="verification-link">Iniciar Sesión</Link>
            </div>
            
            {/* Sección de depuración */}
            <div className="debug-section">
              <button onClick={toggleDebug} className="debug-button">
                {showDebug ? 'Ocultar detalles técnicos' : 'Mostrar detalles técnicos'}
              </button>
              
              {showDebug && (
                <div className="debug-info">
                  <h4>Información de depuración:</h4>
                  <ul>
                    <li>Token: {debug.token}</li>
                    <li>API URL: {debug.apiUrl}</li>
                    <li>URL completa: {debug.fullUrl}</li>
                    <li>Intentos: {debug.attempts}</li>
                    <li>Último error: {debug.lastError}</li>
                  </ul>
                  
                  <div className="debug-actions">
                    <button 
                      onClick={() => verifyEmail()} 
                      className="debug-retry-btn"
                    >
                      Reintentar verificación
                    </button>
                    
                    <button 
                      onClick={handleDirectVerification} 
                      className="debug-direct-btn"
                    >
                      Verificación directa (fallback)
                    </button>
                    
                    <a 
                      href={`${debug.apiUrl}/api/auth/verify-email/${token}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="debug-direct-link"
                    >
                      Verificar directamente con API
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="old-auth-container">
      <div className="verification-box">
        <h2 className="titulo">Verificación de Correo</h2>
        {renderContent()}
      </div>
    </div>
  );
};

export default VerifyEmail;
            