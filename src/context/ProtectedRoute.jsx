// client/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute = ({ 
  allowedRoles = null, // Roles permitidos (array)
  redirectPath = '/login' // Ruta a redirigir si no está autenticado
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  console.log("ProtectedRoute - Verificando acceso:");
  console.log("- Usuario autenticado:", isAuthenticated);
  console.log("- Usuario:", user);
  console.log("- Roles permitidos:", allowedRoles);
  console.log("- URL actual:", window.location.pathname);
  
  // Determinar el tipo de usuario, verificando ambas propiedades posibles
  const userType = user ? (user.tipo_usuario || user.type) : null;
  console.log("- Tipo de usuario detectado:", userType);
  
  // Mostrar indicador de carga mientras se verifica la autenticación
  if (loading) {
    return <div className="loading-container">Cargando...</div>;
  }
  
  // Verificar autenticación
  if (!isAuthenticated) {
    console.log("- Acceso denegado: No autenticado");
    return <Navigate to={redirectPath} replace />;
  }
  
  // Verificar roles (si se especificaron)
  if (allowedRoles && userType && !allowedRoles.includes(userType)) {
    console.log("- Acceso denegado: Rol no permitido");
    console.log("- Rol del usuario:", userType);
    
    // Redirigir a la página adecuada según el tipo de usuario
    switch (userType) {
      case 'cliente':
        return <Navigate to="/cliente/dashboard" replace />;
      case 'coach':
        return <Navigate to="/coach/dashboard" replace />;
      case 'administrador':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }
  
  console.log("- Acceso concedido");
  // Si está autenticado y tiene el rol adecuado (o no se especificaron roles)
  return <Outlet />;
};

export default ProtectedRoute;