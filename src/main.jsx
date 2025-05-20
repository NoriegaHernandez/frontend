
import React from 'react'
import ReactDOM from 'react-dom/client'
//import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Register from './pages/Register'
import Login from './pages/Login'
import GestionUsuarios from './pages/admin/GestionUsuarios';


// Páginas del cliente
import ClienteDashboard from './pages/cliente/Dashboard'
import Informacion from './pages/cliente/Informacion'
import Membresia from './pages/cliente/Membresia'
import Entrenadores from './pages/cliente/Entrenadores'


// Páginas del coach
import CoachDashboard from './pages/coach/Dashboard'
import CoachPerfil from './pages/coach/InformacionCoach'
import PerfilCoach from './pages/coach/PerfilCoach'
import CustomRoutine from './pages/coach/CustomRoutine'; // Importado correctamente
import RoutinesManagement from './pages/coach/RoutinesManagement';
import CustomRoutineForm from './pages/coach/CustomRoutineForm'; 
import RoutineDetails from './pages/coach/RoutineDetails'
import ExerciseEditor from './pages/coach/ExerciseEditor';
// Páginas del administrador

import GestionCoaches from './pages/admin/GestionCoaches'
import VerifyEmail from './pages/VerifyEmail';

// Otras páginas
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import './index.css'
import ClientRoutines from './pages/cliente/ClientRoutines'
// import RoutineView from './pages/cliente/RoutineView'


// Componente para verificar el rol del usuario y redirigir
const RoleRoute = ({ allowedRoles, children }) => {
  const userType = localStorage.getItem('userType');

  if (!userType) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.includes(userType)) {
    return children;
  }

  // Redirigir según el rol
  switch (userType) {
    case 'cliente':
      return <Navigate to="/cliente/dashboard" replace />;
    case 'coach':
      return <Navigate to="/coach/dashboard" replace />;
    case 'administrador':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          {/* Redirige la ruta raíz según el rol del usuario */}
          <Route path="/" element={
            localStorage.getItem('token') ? (
              (() => {
                const userType = localStorage.getItem('userType');
                switch (userType) {
                  case 'cliente':
                    return <Navigate to="/cliente/dashboard" replace />;
                  case 'coach':
                    return <Navigate to="/coach/dashboard" replace />;
                  case 'administrador':
                    return <Navigate to="/admin/dashboard" replace />;
                  default:
                    return <Navigate to="/login" replace />;
                }
              })()
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          {/* Rutas de autenticación */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas para recuperación de contraseña */}
          <Route path="/recuperar-password" element={<ForgotPassword />} />
          <Route path="/restablecer-password/:token" element={<ResetPassword />} />

          {/* Rutas del cliente */}
          <Route path="/cliente/dashboard" element={
            <RoleRoute allowedRoles={['cliente']}>
              <ClienteDashboard />
            </RoleRoute>
          } />
          <Route path="/cliente/entrenadores" element={
            <RoleRoute allowedRoles={['cliente']}>
              <Entrenadores />
            </RoleRoute>
          } />
          <Route path="/cliente/informacion" element={
            <RoleRoute allowedRoles={['cliente']}>
              <Informacion />
            </RoleRoute>
          } />

          <Route path="/cliente/membresia" element={
            <RoleRoute allowedRoles={['cliente']}>
              <Membresia />
            </RoleRoute>
          } />

          {/* <Route path="/cliente/routine/:routineId" element={
            <RoleRoute allowedRoles={['cliente']}>
              <RoutineView />
            </RoleRoute>
          } /> */}

          <Route path="/cliente/routines" element={
            <RoleRoute allowedRoles={['cliente']}>
              <ClientRoutines />
            </RoleRoute>
          } />


          <Route path="/cliente/entrenadores" element={
            <RoleRoute allowedRoles={['cliente']}>
              <Entrenadores />
            </RoleRoute>
          } />

<Route path="/coach/routine/:routineId" element={
  <RoleRoute allowedRoles={['coach']}>
    <RoutineDetails />
  </RoleRoute>
} />

<Route path="/coach/routines" element={
  <RoleRoute allowedRoles={['coach']}>
    <RoutinesManagement />
  </RoleRoute>
} />

<Route path="/coach/routine/:routineId/edit-exercises" element={
  <RoleRoute allowedRoles={['coach']}>
    <ExerciseEditor />
  </RoleRoute>
} />

          {/* Rutas del coach */}
          <Route path="/coach/dashboard" element={
            <RoleRoute allowedRoles={['coach']}>
              <CoachDashboard />
            </RoleRoute>

          } />
          <Route path="/coach/InformacionCoach/:clientId" element={
            <RoleRoute allowedRoles={['coach']}>
              <CoachPerfil />
            </RoleRoute>
          } />
          <Route path="/coach/data" element={
            <RoleRoute allowedRoles={['coach']}>
              <PerfilCoach />
            </RoleRoute>
          } />
          <Route path="/coach/InformacionCoach" element={
            <RoleRoute allowedRoles={['coach']}>
              <RoutinesManagement />
            </RoleRoute>
          } />

          <Route path="/coach/InformacionCoach" element={
            <RoleRoute allowedRoles={['coach']}>
              <RoutinesManagement />
            </RoleRoute>
          } />

          {/* Ruta para CustomRoutine - AGREGADA
          <Route path="/coach/custom-routine/:clienteId" element={
            <RoleRoute allowedRoles={['coach']}>
              <CustomRoutine />
            </RoleRoute>}/> */}
          <Route path="/coach/custom-routine/:clienteId" element={
            <RoleRoute allowedRoles={['coach']}>
              <CustomRoutine />
            </RoleRoute>} />

          {/* <Route path="/coach/custom-routine/:new" element={
            <RoleRoute allowedRoles={['coach']}>
              <CustomRoutineForm />
            </RoleRoute>} /> */}
            <Route path="/coach/custom-routine/:new" element={
  <RoleRoute allowedRoles={['coach']}>
    <CustomRoutineForm />
  </RoleRoute>}/>

          {/* <Route path="/coach/custom-routine/:clientId" element={
            <RoleRoute allowedRoles={['coach']}>
              <CustomRoutineForm />
            </RoleRoute>} /> */}

            {/* Rutas para gestión de rutinas */}
<Route path="/coach/routines" element={
  <RoleRoute allowedRoles={['coach']}>
    <RoutinesManagement />
  </RoleRoute>
}/>

{/* Ruta para crear nueva rutina */}
<Route path="/coach/custom-routine/new" element={
  <RoleRoute allowedRoles={['coach']}>
    <CustomRoutineForm />
  </RoleRoute>
}/>
 <Route path="/coach/custom-routine/:clientId" element={
            <RoleRoute allowedRoles={['coach']}>
              <CustomRoutineForm />
            </RoleRoute>
          } />


          {/* Rutas del administrador */}
          <Route path="/admin/dashboard" element={
            <RoleRoute allowedRoles={['administrador']}>
              <GestionCoaches />
            </RoleRoute>
          } />
          <Route path="/admin/coaches" element={
            <RoleRoute allowedRoles={['administrador']}>
              <GestionCoaches />
            </RoleRoute>
          } />
          <Route path="/admin/dashboard" element={
            <RoleRoute allowedRoles={['administrador']}>
              <GestionCoaches />
            </RoleRoute>
          } />
          <Route path="/admin/coaches" element={
            <RoleRoute allowedRoles={['administrador']}>
              <GestionCoaches />
            </RoleRoute>
          } />
          <Route path="/admin/usuarios" element={
            <RoleRoute allowedRoles={['administrador']}>
              <GestionUsuarios />
            </RoleRoute>
          } />

          {/* Rutas adicionales como términos y privacidad */}
          <Route path="/terminos" element={<div>Términos de Servicio</div>} />
          <Route path="/privacidad" element={<div>Política de Privacidad</div>} />
          <Route path="/verificar-email/:token" element={<VerifyEmail />} />
          {/* Ruta para manejar rutas no encontradas */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
)