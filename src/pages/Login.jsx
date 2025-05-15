

// // client/src/pages/Login.jsx
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import api from '../services/api';
// import '../styles/Auth.css';
// import '../styles/LoginFix.css';

// const renderIcon = (iconType) => {
//   try {
//     const iconPaths = {
//       usuario: '/Usuario.png',
//       contraseña: '/contra.png',
//     };
    
//     return <img className="icon" src={iconPaths[iconType]} alt={iconType} />;
//   } catch (e) {

//     switch(iconType) {
//       case 'usuario': return <span className="icon emoji-icon">👤</span>;
//       case 'contraseña': return <span className="icon emoji-icon">🔒</span>;
//       default: return <div className="icon"></div>;
//     }
//   }
// };

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [verificationNeeded, setVerificationNeeded] = useState(false);
//   const [verificationEmail, setVerificationEmail] = useState('');
//   const [resendLoading, setResendLoading] = useState(false);
//   const [resendMessage, setResendMessage] = useState(null);
//   const { login, loading, error } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     try {
//       const user = await login(formData.email, formData.password);
      
//       // Redireccionar según el tipo de usuario
//       switch (user.type) {
//         case 'cliente':
//           navigate('/cliente/dashboard');
//           break;
//         case 'coach':
//           navigate('/coach/dashboard');
//           break;
//         case 'administrador':
//           navigate('/admin/dashboard');
//           break;
//         default:
//           navigate('/');
//       }
//     } catch (err) {
//       // Verificar si el error es por falta de verificación de email
//       if (err.response?.data?.requiresVerification) {
//         setVerificationNeeded(true);
//         setVerificationEmail(err.response.data.email || formData.email);
//       }
//       console.error('Error en el formulario de login:', err);
//     }
//   };

//   // Función para reenviar el correo de verificación
//   const handleResendVerification = async () => {
//     try {
//       setResendLoading(true);
//       setResendMessage(null);
      
//       await api.resendVerification(verificationEmail);
      
//       setResendMessage({
//         type: 'success',
//         text: 'Se ha enviado un nuevo correo de verificación. Por favor, revisa tu bandeja de entrada.'
//       });
//     } catch (error) {
//       console.error('Error al reenviar verificación:', error);
      
//       setResendMessage({
//         type: 'error',
//         text: error.response?.data?.message || 'Error al enviar el correo de verificación. Por favor, intenta nuevamente más tarde.'
//       });
//     } finally {
//       setResendLoading(false);
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-box">

//         <h2 className="titulo">INICIAR SESIÓN 2</h2>
//         <p className="auth-subtitle">ACCEDE A TU CUENTA DE FITNESS GYM</p>
        
//         {error && !verificationNeeded && (
//           <div className="auth-error">
//             {error}
//           </div>
//         )}
        
//         {verificationNeeded ? (
//           <div className="verification-message">
//             <div className="auth-error">
//               Tu cuenta aún no ha sido verificada. Por favor, verifica tu correo electrónico antes de iniciar sesión.
//             </div>
//             <p>Hemos enviado un correo a <strong>{verificationEmail}</strong> con un enlace de verificación.</p>
            
//             {resendMessage && (
//               <div className={`resend-message ${resendMessage.type}`}>
//                 {resendMessage.text}
//               </div>
//             )}
            
//             <button 
//               className="verification-btn"
//               onClick={handleResendVerification}
//               disabled={resendLoading}
//             >
//               {resendLoading ? "Enviando..." : "Reenviar correo de verificación"}
//             </button>
            
//             <p>
//               <a href="#" onClick={() => {
//                 setVerificationNeeded(false);
//                 setResendMessage(null);
//               }}>
//                 Volver al inicio de sesión
//               </a>
//             </p>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit}>
//             <div className="input-container">
//               {renderIcon('usuario')}
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//                 placeholder="Correo electrónico"
//               />
//             </div>
            
//             <div className="input-container">
//               {renderIcon('contraseña')}
//               <input
//                 type={showPassword ? "text" : "password"}
//                 id="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//                 placeholder="Contraseña"
//               />
//               <button 
//                 type="button" 
//                 className="toggle-password"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? "Ocultar" : "Mostrar"}
//               </button>
//             </div>
            
//             <button 
//               type="submit" 
//               className="login-btn"
//               disabled={loading}
//             >
//               {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
//             </button>
//           </form>
//         )}
        
//         <div className="auth-links">
//           <p>
//             ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
//           </p>
//           <p>
//             ¿Olvidaste tu contraseña? <Link to="/recuperar-password">Recuperar contraseña</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;


// client/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Auth.css';

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  
  // Función para verificar parámetros de URL relacionados con la verificación
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Verificar si hay mensajes de verificación en la URL
    if (params.get('verified') === 'true') {
      setVerificationStatus('success');
      setVerificationMessage('¡Tu cuenta ha sido verificada correctamente! Ahora puedes iniciar sesión.');
    } else if (params.get('alreadyVerified') === 'true') {
      setVerificationStatus('info');
      setVerificationMessage('Tu cuenta ya había sido verificada anteriormente. Puedes iniciar sesión.');
    } else if (params.get('verificationError') === 'true') {
      setVerificationStatus('error');
      setVerificationMessage(params.get('message') || 'Hubo un problema al verificar tu cuenta. Por favor, intenta de nuevo.');
    }
  }, [location]);
  
  // Redirigir si el usuario ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      const userType = user.type || localStorage.getItem('userType');
      const redirectPath = userType === 'admin' ? '/admin/dashboard' : 
                           userType === 'coach' ? '/coach/dashboard' : 
                           '/cliente/dashboard';
      navigate(redirectPath);
    }
  }, [isAuthenticated, user, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar errores al modificar campos
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      // Validaciones básicas
      let formErrors = {};
      
      if (!formData.email.trim()) {
        formErrors.email = 'El email es obligatorio';
      }
      
      if (!formData.password) {
        formErrors.password = 'La contraseña es obligatoria';
      }
      
      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        setLoading(false);
        return;
      }
      
      // Intentar iniciar sesión
      await login(formData.email, formData.password);
      
      // Si llega aquí, el login fue exitoso
      setLoading(false);
      
    } catch (error) {
      setLoading(false);
      
      console.error('Error en login:', error);
      
      // Detectar error específico de verificación
      if (error.response?.data?.requiresVerification) {
        setErrors({
          general: 'Tu cuenta aún no ha sido verificada. Por favor, verifica tu correo electrónico para activar tu cuenta.',
          requiresVerification: true,
          email: error.response.data.email
        });
        
        // Guardar el email para reenvío de verificación
        localStorage.setItem('pendingVerificationEmail', error.response.data.email);
      } else if (error.response?.data?.message) {
        setErrors({
          general: error.response.data.message
        });
      } else {
        setErrors({
          general: 'Error al iniciar sesión. Por favor, verifica tus credenciales e intenta de nuevo.'
        });
      }
    }
  };
  
  const handleResendVerification = async () => {
    if (!errors.email && !formData.email) {
      setErrors({ resend: 'Se requiere un correo electrónico válido' });
      return;
    }
    
    try {
      setLoading(true);
      
      const email = errors.email || formData.email;
      const response = await api.resendVerification(email);
      
      setVerificationStatus('info');
      setVerificationMessage(response.message || 'Se ha enviado un nuevo enlace de verificación a tu correo electrónico.');
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error al reenviar verificación:', error);
      
      setErrors({
        resend: 'Error al reenviar el correo de verificación. Por favor, intenta de nuevo más tarde.'
      });
    }
  };
  
  // Mostrar mensaje de verificación si existe
  const renderVerificationAlert = () => {
    if (!verificationStatus) return null;
    
    const alertClass = 
      verificationStatus === 'success' ? 'verification-alert success' :
      verificationStatus === 'error' ? 'verification-alert error' :
      'verification-alert info';
    
    return (
      <div className={alertClass}>
        <span className="alert-icon">
          {verificationStatus === 'success' ? '✓' : 
           verificationStatus === 'error' ? '⚠️' : 'ℹ️'}
        </span>
        <p>{verificationMessage}</p>
      </div>
    );
  };
  
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Iniciar Sesión</h2>
        
        {/* Alerta de verificación */}
        {renderVerificationAlert()}
        
        {/* Mensaje de error general */}
        {errors.general && (
          <div className="error-message">
            <p>{errors.general}</p>
            
            {/* Opción para reenviar verificación si es necesario */}
            {errors.requiresVerification && (
              <button 
                onClick={handleResendVerification}
                className="resend-verification-btn"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Reenviar correo de verificación'}
              </button>
            )}
            
            {errors.resend && <p className="resend-error">{errors.resend}</p>}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          
          <div className="forgot-password">
            <Link to="/recuperar-password">¿Olvidaste tu contraseña?</Link>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
          
          <div className="register-link">
            ¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;