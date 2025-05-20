// client/src/pages/client/ClientRoutines.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './ClientStyles.css';

const ClientRoutines = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // Cargar rutinas del cliente
  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        setLoading(true);
        
        const response = await api.getClientRoutines();
        setRoutines(response.data || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar rutinas:', error);
        setError('Error al cargar tus rutinas. Por favor, intenta nuevamente.');
        setLoading(false);
      }
    };
    
    fetchRoutines();
  }, []);
  
  // Filtrar rutinas activas y completadas
  const activeRoutines = routines.filter(routine => routine.estado === 'activa');
  const completedRoutines = routines.filter(routine => routine.estado === 'completada');
  
  // Ver detalles de una rutina
  const handleViewRoutine = (routineId) => {
    navigate(`/client/routine/${routineId}`);
  };
  
  return (
    <div className="container">
      <div className="sidebar">
        <div className="logo">
          <div className="logo-circle">
            <img src="/logo.png" alt="Logo Gimnasio" className='logo-img' />
          </div>
        </div>
        
        <div className="menu-buttons">
          <button className="menu-button" onClick={() => navigate('/client/dashboard')}>Dashboard</button>
          <button className="menu-button active">Mis Rutinas</button>
          <button className="menu-button" onClick={() => navigate('/client/profile')}>Mi Perfil</button>
                    <button className="menu-button" onClick={handleLogout}>Cerrar sesión</button>

        </div>
      </div>
      
      <div className="main-content">
        <div className="content-wrapper">
          {/* Mensaje de error si existe */}
          {error && (
            <div className="error-message">
              {error}
              <button className="error-close" onClick={() => setError(null)}>×</button>
            </div>
          )}
          
          {notification && (
            <div className={`notification ${notification.type}`}>
              {notification.message}
            </div>
          )}
          
          <h1 className="page-title">Mis Rutinas de Entrenamiento</h1>
          
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando tus rutinas...</p>
            </div>
          ) : (
            <div className="routines-container">
              {/* Rutinas Activas */}
              <div className="routines-section">
                <h2 className="section-title">Rutinas Activas</h2>
                
                {activeRoutines.length === 0 ? (
                  <div className="empty-routines">
                    <p>No tienes rutinas activas en este momento.</p>
                    <p>Tu entrenador te asignará rutinas que aparecerán aquí.</p>
                  </div>
                ) : (
                  <div className="client-routines-grid">
                    {activeRoutines.map(routine => (
                      <div key={routine.id_rutina} className="client-routine-card">
                        <div className="routine-card-header">
                          <h3 className="routine-name">{routine.nombre}</h3>
                          <span className={`difficulty-badge ${routine.nivel_dificultad}`}>
                            {routine.nivel_dificultad === 'principiante' ? 'Principiante' :
                             routine.nivel_dificultad === 'intermedio' ? 'Intermedio' : 'Avanzado'}
                          </span>
                        </div>
                        
                        <div className="routine-card-body">
                          {routine.objetivo && (
                            <div className="routine-objective">
                              <strong>Objetivo:</strong> {routine.objetivo}
                            </div>
                          )}
                          
                          <div className="routine-stats">
                            <div className="stat">
                              <span className="stat-value">{routine.duracion_estimada || '?'}</span>
                              <span className="stat-label">min</span>
                            </div>
                            
                            <div className="stat">
                              <span className="stat-value">{routine.num_ejercicios || '?'}</span>
                              <span className="stat-label">ejercicios</span>
                            </div>
                          </div>
                          
                          <div className="coach-info">
                            <span className="coach-label">Entrenador:</span>
                            <span className="coach-name">{routine.nombre_coach}</span>
                          </div>
                          
                          <div className="assigned-date">
                            Asignada: {new Date(routine.fecha_asignacion).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="routine-card-footer">
                          <button 
                            className="view-button"
                            onClick={() => handleViewRoutine(routine.id_rutina)}
                          >
                            Ver detalles
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Rutinas Completadas */}
              {completedRoutines.length > 0 && (
                <div className="routines-section completed-section">
                  <h2 className="section-title">Rutinas Completadas</h2>
                  
                  <div className="client-routines-grid">
                    {completedRoutines.map(routine => (
                      <div key={routine.id_rutina} className="client-routine-card completed">
                        <div className="routine-card-header">
                          <h3 className="routine-name">{routine.nombre}</h3>
                          <span className="completed-badge">Completada</span>
                        </div>
                        
                        <div className="routine-card-body">
                          {routine.objetivo && (
                            <div className="routine-objective">
                              <strong>Objetivo:</strong> {routine.objetivo}
                            </div>
                          )}
                          
                          <div className="routine-stats">
                            <div className="stat">
                              <span className="stat-value">{routine.num_ejercicios || '?'}</span>
                              <span className="stat-label">ejercicios</span>
                            </div>
                          </div>
                          
                          <div className="coach-info">
                            <span className="coach-label">Entrenador:</span>
                            <span className="coach-name">{routine.nombre_coach}</span>
                          </div>
                        </div>
                        
                        <div className="routine-card-footer">
                          <button 
                            className="view-button secondary"
                            onClick={() => handleViewRoutine(routine.id_rutina)}
                          >
                            Ver historial
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientRoutines;