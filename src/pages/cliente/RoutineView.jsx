// client/src/pages/client/RoutineView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './ClientStyles.css';

const RoutineView = () => {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  
  // Cargar detalles de la rutina
  useEffect(() => {
    const fetchRoutineDetails = async () => {
      try {
        setLoading(true);
        
        const response = await api.getClientRoutineDetails(routineId);
        setRoutine(response.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar detalles de la rutina:', error);
        setError('Error al cargar los detalles de la rutina');
        setLoading(false);
      }
    };
    
    fetchRoutineDetails();
  }, [routineId]);
  
  // Marcar rutina como completada
  const handleCompleteRoutine = async () => {
    try {
      setMarkingComplete(true);
      
      await api.completeRoutine(routineId);
      
      // Actualizar datos de la rutina
      const updatedResponse = await api.getClientRoutineDetails(routineId);
      setRoutine(updatedResponse.data);
      
      setNotification({
        type: 'success',
        message: '¡Felicidades! Rutina marcada como completada'
      });
      
      setConfirmComplete(false);
      
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('Error al marcar rutina como completada:', error);
      
      setNotification({
        type: 'error',
        message: 'Error al marcar la rutina como completada'
      });
    } finally {
      setMarkingComplete(false);
    }
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
          <button className="menu-button active" onClick={() => navigate('/client/routines')}>Mis Rutinas</button>
          <button className="menu-button" onClick={() => navigate('/client/profile')}>Mi Perfil</button>
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
          
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando detalles de la rutina...</p>
            </div>
          ) : routine ? (
            <>
              <div className="page-header">
                <div className="header-title">
                  <button 
                    className="back-button"
                    onClick={() => navigate('/client/routines')}
                  >
                    ← Volver a mis rutinas
                  </button>
                  <h1 className="page-title">{routine.nombre}</h1>
                  {routine.objetivo && (
                    <p className="page-subtitle">
                      Objetivo: <strong>{routine.objetivo}</strong>
                    </p>
                  )}
                </div>
                
                {routine.estado === 'activa' && (
                  <div className="header-actions">
                    <button 
                      className="complete-button"
                      onClick={() => setConfirmComplete(true)}
                    >
                      Marcar como Completada
                    </button>
                  </div>
                )}
              </div>
              
              <div className="routine-status-bar">
                <div className={`status-indicator ${routine.estado}`}>
                  <span className="status-text">
                    {routine.estado === 'activa' ? 'Rutina Activa' : 'Rutina Completada'}
                  </span>
                </div>
                
                <div className="routine-meta">
                  <div className="meta-item">
                    <span className="meta-label">Entrenador:</span>
                    <span className="meta-value">{routine.nombre_coach}</span>
                  </div>
                  
                  <div className="meta-item">
                    <span className="meta-label">Asignada el:</span>
                    <span className="meta-value">
                      {new Date(routine.fecha_asignacion).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="client-routine-details">
                {/* Información general */}
                <div className="routine-info-card">
                  <h2 className="section-title">Información de la Rutina</h2>
                  
                  <div className="info-flex">
                    <div className="info-item">
                      <span className="info-label">Nivel de dificultad</span>
                      <span className={`difficulty-badge large ${routine.nivel_dificultad}`}>
                        {routine.nivel_dificultad === 'principiante' ? 'Principiante' :
                         routine.nivel_dificultad === 'intermedio' ? 'Intermedio' : 'Avanzado'}
                      </span>
                    </div>
                    
                    <div className="info-item">
                      <span className="info-label">Duración estimada</span>
                      <span className="info-value">{routine.duracion_estimada || '60'} minutos</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="info-label">Ejercicios</span>
                      <span className="info-value">{routine.ejercicios?.length || 0}</span>
                    </div>
                  </div>
                  
                  {routine.descripcion && (
                    <div className="routine-description-box">
                      <h3>Descripción</h3>
                      <p>{routine.descripcion}</p>
                    </div>
                  )}
                </div>
                
                {/* Lista de ejercicios */}
                <div className="exercises-list-card">
                  <h2 className="section-title">Ejercicios a Realizar</h2>
                  
                  {routine.ejercicios?.length === 0 ? (
                    <div className="no-exercises">
                      <p>Esta rutina no tiene ejercicios asignados.</p>
                    </div>
                  ) : (
                    <div className="client-exercises-list">
                      {routine.ejercicios?.map((exercise, index) => (
                        <div key={exercise.id_detalle} className="client-exercise-item">
                          <div className="exercise-order-number">{exercise.orden || index + 1}</div>
                          
                          <div className="exercise-content">
                            <h3 className="exercise-title">{exercise.nombre}</h3>
                            
                            <div className="exercise-training-params">
                              <div className="training-param">
                                <span className="param-value">{exercise.series}</span>
                                <span className="param-label">series</span>
                              </div>
                              
                              <div className="training-param">
                                <span className="param-value">{exercise.repeticiones}</span>
                                <span className="param-label">repeticiones</span>
                              </div>
                              
                              <div className="training-param">
                                <span className="param-value">{exercise.descanso_segundos}</span>
                                <span className="param-label">seg. descanso</span>
                              </div>
                            </div>
                            
                            {exercise.ejercicio_descripcion && (
                              <div className="exercise-instructions">
                                <h4>Instrucciones:</h4>
                                <p>{exercise.ejercicio_descripcion}</p>
                              </div>
                            )}
                            
                            {exercise.grupos_musculares && (
                              <div className="exercise-muscle-groups">
                                <span className="groups-label">Grupos musculares:</span>
                                <span className="groups-value">{exercise.grupos_musculares}</span>
                              </div>
                            )}
                            
                            {exercise.notas && (
                              <div className="exercise-coach-notes">
                                <h4>Notas del entrenador:</h4>
                                <p>{exercise.notas}</p>
                              </div>
                            )}
                            
                            {exercise.equipo_necesario && (
                              <div className="exercise-equipment">
                                <span className="equipment-label">Equipo necesario:</span>
                                <span className="equipment-value">{exercise.equipo_necesario}</span>
                              </div>
                            )}
                            
                            {exercise.imagen_url && (
                              <div className="exercise-image">
                                <img src={exercise.imagen_url} alt={`Imagen de ${exercise.nombre}`} />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="error-container">
              <p>No se encontró la rutina solicitada.</p>
              <button 
                className="back-button"
                onClick={() => navigate('/client/routines')}
              >
                Volver a mis rutinas
              </button>
            </div>
          )}
          
         // client/src/pages/client/RoutineView.jsx (continuación)
          
          {/* Modal de confirmación para marcar como completada */}
          {confirmComplete && (
            <div className="modal-overlay">
              <div className="confirm-modal">
                <div className="modal-header">
                  <h2>Marcar Rutina como Completada</h2>
                  <button className="close-button" onClick={() => setConfirmComplete(false)}>×</button>
                </div>
                
                <div className="modal-body">
                  <p>¿Estás seguro de que quieres marcar esta rutina como completada?</p>
                  <p>Esto indicará a tu entrenador que has finalizado con esta rutina.</p>
                </div>
                
                <div className="modal-footer">
                  <button 
                    className="cancel-button"
                    onClick={() => setConfirmComplete(false)}
                  >
                    Cancelar
                  </button>
                  
                  <button 
                    className="confirm-button"
                    onClick={handleCompleteRoutine}
                    disabled={markingComplete}
                  >
                    {markingComplete ? 'Procesando...' : 'Confirmar Completada'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutineView;