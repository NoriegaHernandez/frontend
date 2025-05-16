// client/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';  // Añadí useEffect aquí
import { Link, useNavigate, useLocation } from 'react-router-dom';  // Moví useLocation aquí
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Auth.css';
import '../styles/LoginFix.css';

const renderIcon = (iconType) => {
  try {
    const iconPaths = {
      usuario: '/Usuario.png',
      contraseña: '/contra.png',
    };
    
    return <img className="icon" src={iconPaths[iconType]} alt={iconType} />;
  } catch (e) {
    switch(iconType) {
      case 'usuario': return <span className="icon emoji-icon">👤</span>;
      case 'contraseña': return <span className="icon emoji-icon">🔒</span>;
      default: return <div className="icon"></div>;
    }
  }
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);
  const [customMessage, setCustomMessage] = useState(null);  // Añadí este estado
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();  // Moví esto aquí

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Moví esta lógica fuera de handleChange
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const isVerified = queryParams.get('verified') === 'true';
    const verificationError = queryParams.get('verificationError') === 'true';
    const verificationMessage = queryParams.get('message');
    const alreadyVerified = queryParams.get('alreadyVerified') === 'true';
    
    if (isVerified) {
      // Mostrar mensaje de verificación exitosa
      setCustomMessage({
        type: 'success',
        text: 'Tu cuenta ha sido verificada correctamente. Ahora puedes iniciar sesión.'
      });
    } else if (alreadyVerified) {
      // Mostrar mensaje de que la cuenta ya estaba verificada
      setCustomMessage({
        type: 'info',
        text: 'Tu cuenta ya ha sido verificada anteriormente. Puedes iniciar sesión.'
      });
    } else if (verificationError) {
      // Mostrar mensaje de error de verificación
      setCustomMessage({
        type: 'error',
        text: verificationMessage || 'Hubo un problema al verificar tu cuenta. Por favor, intenta registrarte nuevamente.'
      });
    }
  }, [location.search]); // Cambié las dependencias para usar location.search directamente

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const user = await login(formData.email, formData.password);
      
      // Redireccionar según el tipo de usuario
      switch (user.type) {
        case 'cliente':
          navigate('/cliente/dashboard');
          break;
        case 'coach':
          navigate('/coach/dashboard');
          break;
        case 'administrador':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      // Verificar si el error es por falta de verificación de email
      if (err.response?.data?.requiresVerification) {
        setVerificationNeeded(true);
        setVerificationEmail(err.response.data.email || formData.email);
      }
      console.error('Error en el formulario de login:', err);
    }
  };

  // Función para reenviar el correo de verificación
  const handleResendVerification = async () => {
    try {
      setResendLoading(true);
      setResendMessage(null);
      
      await api.resendVerification(verificationEmail);
      
      setResendMessage({
        type: 'success',
        text: 'Se ha enviado un nuevo correo de verificación. Por favor, revisa tu bandeja de entrada.'
      });
    } catch (error) {
      console.error('Error al reenviar verificación:', error);
      
      setResendMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al enviar el correo de verificación. Por favor, intenta nuevamente más tarde.'
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="titulo">INICIAR SESIÓN</h2>
        <p className="auth-subtitle">ACCEDE A TU CUENTA DE FITNESS GYM</p>
        
        {customMessage && (
          <div className={`auth-message ${customMessage.type}`}>
            {customMessage.text}
          </div>
        )}
        
        {error && !verificationNeeded && (
          <div className="auth-error">
            {error}
          </div>
        )}
        
        {verificationNeeded ? (
          <div className="verification-message">
            <div className="auth-error">
              Tu cuenta aún no ha sido verificada. Por favor, verifica tu correo electrónico antes de iniciar sesión.
            </div>
            <p>Hemos enviado un correo a <strong>{verificationEmail}</strong> con un enlace de verificación.</p>
            
            {resendMessage && (
              <div className={`resend-message ${resendMessage.type}`}>
                {resendMessage.text}
              </div>
            )}
            
            <button 
              className="verification-btn"
              onClick={handleResendVerification}
              disabled={resendLoading}
            >
              {resendLoading ? "Enviando..." : "Reenviar correo de verificación"}
            </button>
            
            <p>
              <a href="#" onClick={(e) => {
                e.preventDefault(); // Añadí esto para evitar el comportamiento predeterminado del enlace
                setVerificationNeeded(false);
                setResendMessage(null);
              }}>
                Volver al inicio de sesión
              </a>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-container">
              {renderIcon('usuario')}
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Correo electrónico"
              />
            </div>
            
            <div className="input-container">
              {renderIcon('contraseña')}
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Contraseña"
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            
            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>
        )}
        
        <div className="auth-links">
          <p>
            ¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link>
          </p>
          <p>
            ¿Olvidaste tu contraseña? <Link to="/recuperar-password">Recuperar contraseña</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;