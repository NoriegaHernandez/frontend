// client/src/pages/coach/AssignRoutine.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './CoachStyles.css';

const AssignRoutine = () => {
  const { user } = useAuth();
  const { clientId } = useParams();
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [notification, setNotification] = useState(null);
  
  // Formulario para nueva rutina
  const [routineForm, setRoutineForm] = useState({
    nombre: '',
    descripcion: '',
    objetivo: '',
    nivel_dificultad: 'principiante',
    duracion_estimada: 60
  });
  
  // Ejercicios seleccionados
  const [selectedExercises, setSelectedExercises] = useState([]);
  
  // Cargar datos del cliente
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener datos del cliente
        const clientResponse = await api.getClientById(clientId);
        setClient(clientResponse.data);
        
        // Obtener rutinas existentes
        const routinesResponse = await api.getClientRoutines(clientId);
        setRoutines(routinesResponse.data || []);
        
        // Obtener ejercicios disponibles
        const exercisesResponse = await api.getExercises();
        setExercises(exercisesResponse.data || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos. Por favor, intenta nuevamente.');
        setLoading(false);
      }
    };
    
    fetchClientData();
  }, [clientId]);
  
  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setRoutineForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Agregar ejercicio a la rutina
  const addExercise = (exercise) => {
    const newExercise = {
      ...exercise,
      orden: selectedExercises.length + 1,
      series: 3,
      repeticiones: '12',
      descanso_segundos: 60,
      notas: ''
    };
    
    setSelectedExercises(prev => [...prev, newExercise]);
  };
  
  // Remover ejercicio de la rutina
  const removeExercise = (exerciseId) => {
    setSelectedExercises(prev => 
      prev.filter(ex => ex.id_ejercicio !== exerciseId)
          .map((ex, index) => ({ ...ex, orden: index + 1 }))
    );
  };
  
  // Actualizar datos de un ejercicio
  const updateExerciseDetails = (exerciseId, field, value) => {
    setSelectedExercises(prev => 
      prev.map(ex => 
        ex.id_ejercicio === exerciseId 
          ? { ...ex, [field]: value } 
          : ex
      )
    );
  };
  
  // Mover ejercicio arriba/abajo en la lista
  const moveExercise = (exerciseId, direction) => {
    const currentIndex = selectedExercises.findIndex(ex => ex.id_ejercicio === exerciseId);
    if (
      (direction === 'up' && currentIndex > 0) || 
      (direction === 'down' && currentIndex < selectedExercises.length - 1)
    ) {
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const newExercises = [...selectedExercises];
      
      // Intercambiar elementos
      [newExercises[currentIndex], newExercises[newIndex]] = 
      [newExercises[newIndex], newExercises[currentIndex]];
      
      // Actualizar orden
      const updatedExercises = newExercises.map((ex, idx) => ({
        ...ex,
        orden: idx + 1
      }));
      
      setSelectedExercises(updatedExercises);
    }
  };
  
  // Guardar la rutina
  const saveRoutine = async () => {
    // Validaciones básicas
    if (!routineForm.nombre.trim()) {
      setNotification({
        type: 'error',
        message: 'Debes asignar un nombre a la rutina'
      });
      return;
    }
    
    if (selectedExercises.length === 0) {
      setNotification({
        type: 'error',
        message: 'La rutina debe contener al menos un ejercicio'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Preparar datos de la rutina
      const routineData = {
        ...routineForm,
        ejercicios: selectedExercises.map(ex => ({
          id_ejercicio: ex.id_ejercicio,
          orden: ex.orden,
          series: ex.series,
          repeticiones: ex.repeticiones,
          descanso_segundos: ex.descanso_segundos,
          notas: ex.notas
        }))
      };
      
      // Enviar rutina al servidor
      await api.saveClientRoutine(clientId, routineData);
      
      setNotification({
        type: 'success',
        message: 'Rutina asignada correctamente'
      });
      
      // Después de 2 segundos, redirigir al dashboard
      setTimeout(() => {
        navigate('/coach');
      }, 2000);
      
    } catch (error) {
      console.error('Error al guardar rutina:', error);
      setNotification({
        type: 'error',
        message: 'Error al guardar la rutina. Por favor, intenta nuevamente.'
      });
      setLoading(false);
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
          <button className="menu-button" onClick={() => navigate('/coach')}>Dashboard</button>
          <button className="menu-button active">Rutinas</button>
          <button className="menu-button" onClick={() => navigate('/coach/perfil')}>Mi Perfil</button>
          <button className="menu-button" onClick={() => navigate('/logout')}>Cerrar sesión</button>
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
              <p>Cargando datos...</p>
            </div>
          ) : (
            <>
              <div className="page-header">
                <h1>Asignar Rutina</h1>
                <div className="client-info">
                  <span>Cliente: </span>
                  <strong>{client?.nombre || 'Cliente'}</strong>
                </div>
                <div className="action-buttons">
                  <button 
                    className="coach-button secondary"
                    onClick={() => navigate('/coach')}
                  >
                    Volver
                  </button>
                </div>
              </div>
              
              <div className="routine-container">
                <div className="routine-form">
                  <h3>Información de la Rutina</h3>
                  
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre de la Rutina</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={routineForm.nombre}
                      onChange={handleFormChange}
                      placeholder="Ej. Rutina Full Body"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="objetivo">Objetivo</label>
                    <input
                      type="text"
                      id="objetivo"
                      name="objetivo"
                      value={routineForm.objetivo}
                      onChange={handleFormChange}
                      placeholder="Ej. Pérdida de peso"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="nivel_dificultad">Nivel de Dificultad</label>
                      <select
                        id="nivel_dificultad"
                        name="nivel_dificultad"
                        value={routineForm.nivel_dificultad}
                        onChange={handleFormChange}
                      >
                        <option value="principiante">Principiante</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="avanzado">Avanzado</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="duracion_estimada">Duración (minutos)</label>
                      <input
                        type="number"
                        id="duracion_estimada"
                        name="duracion_estimada"
                        value={routineForm.duracion_estimada}
                        onChange={handleFormChange}
                        min="15"
                        max="180"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="descripcion">Descripción</label>
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      value={routineForm.descripcion}
                      onChange={handleFormChange}
                      placeholder="Describe brevemente esta rutina"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
                
                <div className="exercises-container">
                  <div className="exercises-list">
                    <h3>Ejercicios Disponibles</h3>
                    
                    <div className="exercises-grid">
                      {exercises.map(exercise => (
                        <div key={exercise.id_ejercicio} className="exercise-card">
                          <h4>{exercise.nombre}</h4>
                          <p>{exercise.grupos_musculares}</p>
                          <button 
                            className="add-exercise-btn"
                            onClick={() => addExercise(exercise)}
                            disabled={selectedExercises.some(ex => ex.id_ejercicio === exercise.id_ejercicio)}
                          >
                            Agregar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="selected-exercises">
                    <h3>Ejercicios Seleccionados</h3>
                    
                    {selectedExercises.length === 0 ? (
                      <div className="empty-exercises">
                        <p>No hay ejercicios seleccionados</p>
                        <p>Agrega ejercicios de la lista disponible</p>
                      </div>
                    ) : (
                      <div className="selected-exercises-list">
                        {selectedExercises.map((exercise, index) => (
                          <div key={exercise.id_ejercicio} className="selected-exercise-item">
                            <div className="exercise-header">
                              <div className="exercise-order">{exercise.orden}</div>
                              <h4>{exercise.nombre}</h4>
                              <div className="exercise-actions">
                                <button 
                                  className="move-btn"
                                  onClick={() => moveExercise(exercise.id_ejercicio, 'up')}
                                  disabled={index === 0}
                                >
                                  ▲
                                </button>
                                <button 
                                  className="move-btn"
                                  onClick={() => moveExercise(exercise.id_ejercicio, 'down')}
                                  disabled={index === selectedExercises.length - 1}
                                >
                                  ▼
                                </button>
                                <button 
                                  className="remove-btn"
                                  onClick={() => removeExercise(exercise.id_ejercicio)}
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                            
                            <div className="exercise-details">
                              <div className="detail-row">
                                <div className="detail-item">
                                  <label>Series:</label>
                                  <input
                                    type="number"
                                    value={exercise.series}
                                    onChange={(e) => updateExerciseDetails(
                                      exercise.id_ejercicio, 
                                      'series', 
                                      parseInt(e.target.value)
                                    )}
                                    min="1"
                                    max="10"
                                  />
                                </div>
                                
                                <div className="detail-item">
                                  <label>Repeticiones:</label>
                                  <input
                                    type="text"
                                    value={exercise.repeticiones}
                                    onChange={(e) => updateExerciseDetails(
                                      exercise.id_ejercicio, 
                                      'repeticiones', 
                                      e.target.value
                                    )}
                                  />
                                </div>
                                
                                <div className="detail-item">
                                  <label>Descanso (seg):</label>
                                  <input
                                    type="number"
                                    value={exercise.descanso_segundos}
                                    onChange={(e) => updateExerciseDetails(
                                      exercise.id_ejercicio, 
                                      'descanso_segundos', 
                                      parseInt(e.target.value)
                                    )}
                                    min="0"
                                    max="300"
                                  />
                                </div>
                              </div>
                              
                              <div className="detail-item full-width">
                                <label>Notas:</label>
                                <input
                                  type="text"
                                  value={exercise.notas || ''}
                                  onChange={(e) => updateExerciseDetails(
                                    exercise.id_ejercicio, 
                                    'notas', 
                                    e.target.value
                                  )}
                                  placeholder="Instrucciones específicas"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    className="coach-button secondary"
                    onClick={() => navigate('/coach')}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="coach-button primary"
                    onClick={saveRoutine}
                    disabled={selectedExercises.length === 0 || !routineForm.nombre.trim()}
                  >
                    Guardar Rutina
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignRoutine;