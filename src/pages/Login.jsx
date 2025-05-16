// client/src/pages/Login.jsx - Versión simplificada para depuración
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    
    console.log('Intentando iniciar sesión con:', { email });
    
    try {
      // Agregar un log antes del login
      console.log('Llamando a la función login...');
      
      const user = await login(email, password);
      
      // Agregar un log después del login exitoso
      console.log('Login exitoso, usuario:', user);
      
      // Redireccionar según el tipo de usuario
      if (user && user.type) {
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
      } else {
        console.error('Usuario no tiene tipo definido:', user);
        setLoginError('Error en la respuesta del servidor. Contacte al administrador.');
      }
    } catch (err) {
      console.error('Error en el formulario de login:', err);
      
      // Mostrar mensaje de error apropiado
      if (err.response?.data?.message) {
        setLoginError(err.response.data.message);
      } else if (err.message) {
        setLoginError(err.message);
      } else {
        setLoginError('Error al iniciar sesión. Por favor, verifica tus credenciales.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="titulo">INICIAR SESIÓN</h2>
        <p className="auth-subtitle">ACCEDE A TU CUENTA DE FITNESS GYM</p>
        
        {loginError && (
          <div className="auth-error">
            {loginError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            {renderIcon('usuario')}
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
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
              value={password}
              onChange={handlePasswordChange}
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
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>
        
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