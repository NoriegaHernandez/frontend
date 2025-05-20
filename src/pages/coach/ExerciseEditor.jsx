// client/src/pages/coach/ExerciseEditor.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './CoachStyles.css';

const ExerciseEditor = () => {
  const { routineId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estado para datos de la rutina
  const [routine, setRoutine] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  
  // Estado para UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showAddExerciseForm, setShowAddExerciseForm] = useState(false);
  const [draggedExerciseIndex, setDraggedExerciseIndex] = useState(null);
  
  // Estado para nuevo ejercicio
  const [newExercise, setNewExercise] = useState({
    id_ejercicio: '',
    series: 3,
    repeticiones: '12',
    descanso_segundos: 60,
    notas: ''
  });
  
  // Estado para ejercicio en edición
  const [editingExerciseIndex, setEditingExerciseIndex] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);
  
  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener detalles de la rutina
        const routineResponse = await api.getRoutineDetails(routineId);
        if (!routineResponse.data) {
          throw new Error('No se pudieron cargar los detalles de la rutina');
        }
        
        setRoutine(routineResponse.data);
        
        // Si hay ejercicios en la respuesta, establecerlos
        if (routineResponse.data.ejercicios && Array.isArray(routineResponse.data.ejercicios)) {
          setExercises(routineResponse.data.ejercicios);
        }
        
        // Cargar ejercicios disponibles
        const exercisesResponse = await api.getExercises();
        if (exercisesResponse.data) {
          setAvailableExercises(exercisesResponse.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        setError('Error al cargar los datos. Por favor, intenta nuevamente.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [routineId]);
  
  // Manejar cambios en el formulario de nuevo ejercicio
  const handleNewExerciseChange = (e) => {
    const { name, value } = e.target;
    setNewExercise({
      ...newExercise,
      [name]: value
    });
  };
  
  // Manejar cambios en el formulario de edición de ejercicio
  const handleEditingExerciseChange = (e) => {
    const { name, value } = e.target;
    setEditingExercise({
      ...editingExercise,
      [name]: value
    });
  };
  
  // Agregar nuevo ejercicio
  const handleAddExercise = () => {
    if (!newExercise.id_ejercicio) {
      setNotification({
        type: 'error',
        message: 'Debes seleccionar un ejercicio'
      });
      return;
    }
    
    // Encontrar el ejercicio en la lista de disponibles para obtener su nombre
    const exerciseDetails = availableExercises.find(
      ex => ex.id_ejercicio.toString() === newExercise.id_ejercicio.toString()
    );
    
    if (!exerciseDetails) {
      setNotification({
        type: 'error',
        message: 'Ejercicio no encontrado'
      });
      return;
    }
    
    // Crear nuevo ejercicio con los datos completos
    const exerciseToAdd = {
      ...newExercise,
      nombre: exerciseDetails.nombre,
      ejercicio_descripcion: exerciseDetails.descripcion,
      grupos_musculares: exerciseDetails.grupos_musculares,
      orden: exercises.length + 1
    };
    
    // Agregar al estado
    setExercises([...exercises, exerciseToAdd]);
    
    // Limpiar formulario
    setNewExercise({
      id_ejercicio: '',
      series: 3,
      repeticiones: '12',
      descanso_segundos: 60,
      notas: ''
    });
    
    setShowAddExerciseForm(false);
    
    setNotification({
      type: 'success',
      message: 'Ejercicio agregado a la rutina'
    });
    
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Editar ejercicio existente
  const handleEditExercise = () => {
    if (editingExerciseIndex === null || !editingExercise) {
      return;
    }
    
    // Actualizar el ejercicio en la lista
    const updatedExercises = [...exercises];
    updatedExercises[editingExerciseIndex] = editingExercise;
    
    setExercises(updatedExercises);
    setEditingExerciseIndex(null);
    setEditingExercise(null);
    
    setNotification({
      type: 'success',
      message: 'Ejercicio actualizado'
    });
    
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Comenzar a editar un ejercicio
  const startEditingExercise = (index) => {
    setEditingExerciseIndex(index);
    setEditingExercise({ ...exercises[index] });
  };
  
  // Cancelar edición
  const cancelEditingExercise = () => {
    setEditingExerciseIndex(null);
    setEditingExercise(null);
  };
  
  // Eliminar ejercicio
  const handleRemoveExercise = (index) => {
    const updatedExercises = exercises.filter((_, i) => i !== index);
    
    // Actualizar el orden de los ejercicios restantes
    updatedExercises.forEach((ex, i) => {
      ex.orden = i + 1;
    });
    
    setExercises(updatedExercises);
    
    setNotification({
      type: 'success',
      message: 'Ejercicio eliminado de la rutina'
    });
    
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Mover ejercicio hacia arriba
  const moveExerciseUp = (index) => {
    if (index <= 0) return;
    
    const updatedExercises = [...exercises];
    const temp = updatedExercises[index];
    
    // Intercambiar posiciones
    updatedExercises[index] = updatedExercises[index - 1];
    updatedExercises[index - 1] = temp;
    
    // Actualizar órdenes
    updatedExercises.forEach((ex, i) => {
      ex.orden = i + 1;
    });
    
    setExercises(updatedExercises);
  };
  
  // Mover ejercicio hacia abajo
  const moveExerciseDown = (index) => {
    if (index >= exercises.length - 1) return;
    
    const updatedExercises = [...exercises];
    const temp = updatedExercises[index];
    
    // Intercambiar posiciones
    updatedExercises[index] = updatedExercises[index + 1];
    updatedExercises[index + 1] = temp;
    
    // Actualizar órdenes
    updatedExercises.forEach((ex, i) => {
      ex.orden = i + 1;
    });
    
    setExercises(updatedExercises);
  };
  
  // Guardar todos los cambios
  const handleSaveChanges = async () => {
    if (exercises.length === 0) {
      setNotification({
        type: 'error',
        message: 'La rutina debe tener al menos un ejercicio'
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // Preparar datos para enviar al servidor
      const exercisesData = exercises.map((ex, index) => ({
        id_ejercicio: ex.id_ejercicio,
        series: parseInt(ex.series),
        repeticiones: ex.repeticiones,
        descanso_segundos: parseInt(ex.descanso_segundos),
        notas: ex.notas || null,
        orden: index + 1
      }));
      
      // Llamar a la API para actualizar los ejercicios
      await api.updateRoutineExercises(routineId, exercisesData);
      
      setNotification({
        type: 'success',
        message: 'Ejercicios guardados correctamente'
      });
      
      // Después de 2 segundos, redirigir a la página de detalles de la rutina
      setTimeout(() => {
        navigate(`/coach/routine/${routineId}`);
      }, 2000);
    } catch (error) {
      console.error('Error al guardar ejercicios:', error);
      setNotification({
        type: 'error',
        message: 'Error al guardar los ejercicios'
      });
      setSaving(false);
    }
  };
  
  // Cancelar cambios
  const handleCancel = () => {
    navigate(`/coach/routine/${routineId}`);
  };
  
  // Handlers para arrastrar y soltar ejercicios
  const handleDragStart = (index) => {
    setDraggedExerciseIndex(index);
  };
  
  const handleDragOver = (e, index) => {
    e.preventDefault();
    
    // No hacer nada si es el mismo índice
    if (draggedExerciseIndex === index) return;
    
    // Obtener el elemento que se está arrastrando
    const draggedExercise = exercises[draggedExerciseIndex];
    
    // Crear una copia de la lista de ejercicios
    const updatedExercises = [...exercises];
    
    // Eliminar el ejercicio de su posición original
    updatedExercises.splice(draggedExerciseIndex, 1);
    
    // Insertar el ejercicio en la nueva posición
    updatedExercises.splice(index, 0, draggedExercise);
    
    // Actualizar órdenes
    updatedExercises.forEach((ex, i) => {
      ex.orden = i + 1;
    });
    
    // Actualizar el estado
    setExercises(updatedExercises);
    setDraggedExerciseIndex(index);
  };
  
  const handleDragEnd = () => {
    setDraggedExerciseIndex(null);
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
          <button className="menu-button" onClick={() => navigate('/coach/dashboard')}>Dashboard</button>
          <button className="menu-button active">Rutinas</button>
          <button className="menu-button" onClick={() => navigate('/coach/data')}>Mi Perfil</button>
                    <button className="menu-button" onClick={logout}>Cerrar sesión</button>

        </div>
      </div>
      
      <div className="main-content">
        <div className="content-wrapper">
          {/* Mensajes y notificaciones */}
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
          
          <div className="page-header">
            <div className="header-title">
              <h1 className="page-title">Editar Ejercicios</h1>
              <button 
                className="back-button"
                onClick={() => navigate(`/coach/routine/${routineId}`)}
              >
                ← Volver a Detalles de Rutina
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando ejercicios...</p>
            </div>
          ) : (
            <div className="exercise-editor-container">
              {/* Información de la rutina */}
              <div className="routine-summary-card">
                <h2>{routine?.nombre || 'Rutina'}</h2>
                <div className="routine-meta-simple">
                  <span className={`difficulty-badge ${routine?.nivel_dificultad || 'intermedio'}`}>
                    {routine?.nivel_dificultad || 'Intermedio'}
                  </span>
                  <span className="meta-separator">•</span>
                  <span className="routine-objective">{routine?.objetivo || 'General'}</span>
                  <span className="meta-separator">•</span>
                  <span className="routine-duration">{routine?.duracion_estimada || '45'} minutos</span>
                </div>
              </div>
              
              {/* Lista de ejercicios */}
              <div className="exercises-editor-section">
                <div className="section-header">
                  <h2>Ejercicios ({exercises.length})</h2>
                  <button
                    className="add-exercise-button"
                    onClick={() => setShowAddExerciseForm(true)}
                  >
                    + Agregar Ejercicio
                  </button>
                </div>
                
                {exercises.length === 0 ? (
                  <div className="empty-message">
                    <p>Esta rutina no tiene ejercicios asignados.</p>
                    <button
                      className="action-button"
                      onClick={() => setShowAddExerciseForm(true)}
                    >
                      Agregar Ejercicio
                    </button>
                  </div>
                ) : (
                  <div className="exercises-edit-list">
                    {exercises.map((exercise, index) => (
                      <div 
                        key={`exercise-${index}`}
                        className={`exercise-edit-item ${editingExerciseIndex === index ? 'editing' : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        {editingExerciseIndex === index ? (
                          /* Formulario de edición */
                          <div className="exercise-edit-form">
                            <div className="form-header">
                              <h3>Editar Ejercicio</h3>
                              <button
                                className="cancel-edit-button"
                                onClick={cancelEditingExercise}
                              >
                                Cancelar
                              </button>
                            </div>
                            
                            <div className="form-body">
                              <div className="form-row">
                                <div className="form-group">
                                  <label htmlFor="edit-exercise-type">Ejercicio</label>
                                  <select
                                    id="edit-exercise-type"
                                    name="id_ejercicio"
                                    value={editingExercise?.id_ejercicio || ''}
                                    onChange={handleEditingExerciseChange}
                                    disabled // No permitir cambiar el ejercicio, solo sus parámetros
                                  >
                                    <option value="">Seleccionar ejercicio...</option>
                                    {availableExercises.map(ex => (
                                      <option key={ex.id_ejercicio} value={ex.id_ejercicio}>
                                        {ex.nombre}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              
                              <div className="form-row three-columns">
                                <div className="form-group">
                                  <label htmlFor="edit-exercise-series">Series</label>
                                  <input
                                    type="number"
                                    id="edit-exercise-series"
                                    name="series"
                                    min="1"
                                    max="10"
                                    value={editingExercise?.series || 3}
                                    onChange={handleEditingExerciseChange}
                                  />
                                </div>
                                
                                <div className="form-group">
                                  <label htmlFor="edit-exercise-repeticiones">Repeticiones</label>
                                  <input
                                    type="text"
                                    id="edit-exercise-repeticiones"
                                    name="repeticiones"
                                    value={editingExercise?.repeticiones || '12'}
                                    onChange={handleEditingExerciseChange}
                                    placeholder="Ej: 12, 10-12, 8/10/12"
                                  />
                                </div>
                                
                                <div className="form-group">
                                  <label htmlFor="edit-exercise-descanso">Descanso (seg)</label>
                                  <input
                                    type="number"
                                    id="edit-exercise-descanso"
                                    name="descanso_segundos"
                                    min="10"
                                    max="300"
                                    value={editingExercise?.descanso_segundos || 60}
                                    onChange={handleEditingExerciseChange}
                                  />
                                </div>
                              </div>
                              
                              <div className="form-group">
                                <label htmlFor="edit-exercise-notas">Notas o instrucciones específicas</label>
                                <textarea
                                  id="edit-exercise-notas"
                                  name="notas"
                                  value={editingExercise?.notas || ''}
                                  onChange={handleEditingExerciseChange}
                                  placeholder="Instrucciones específicas para este ejercicio"
                                  rows="2"
                                ></textarea>
                              </div>
                            </div>
                            
                            <div className="form-actions">
                              <button
                                className="save-button"
                                onClick={handleEditExercise}
                              >
                                Guardar Cambios
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Vista normal */
                          <>
                            <div className="exercise-drag-handle" title="Arrastrar para reordenar">
                              <span className="drag-icon">⠿</span>
                            </div>
                            
                            <div className="exercise-number">{exercise.orden || index + 1}</div>
                            
                            <div className="exercise-info">
                              <h3 className="exercise-name">{exercise.nombre || exercise.nombre_ejercicio}</h3>
                              
                              <div className="exercise-params">
                                <span className="exercise-param">
                                  <span className="param-label">Series:</span>
                                  <span className="param-value">{exercise.series}</span>
                                </span>
                                
                                <span className="param-separator">•</span>
                                
                                <span className="exercise-param">
                                  <span className="param-label">Repeticiones:</span>
                                  <span className="param-value">{exercise.repeticiones}</span>
                                </span>
                                
                                <span className="param-separator">•</span>
                                
                                <span className="exercise-param">
                                  <span className="param-label">Descanso:</span>
                                  <span className="param-value">{exercise.descanso_segundos}s</span>
                                </span>
                              </div>
                              
                              {exercise.notas && (
                                <div className="exercise-notes-preview">
                                  <span className="notes-label">Notas:</span>
                                  <span className="notes-text">{exercise.notas}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="exercise-actions">
                              <button
                                className="edit-ex-button"
                                onClick={() => startEditingExercise(index)}
                                title="Editar ejercicio"
                              >
                                <span className="icon">✏️</span>
                              </button>
                              
                              <button
                                className="move-up-button"
                                onClick={() => moveExerciseUp(index)}
                                disabled={index === 0}
                                title="Mover arriba"
                              >
                                <span className="icon">↑</span>
                              </button>
                              
                              <button
                                className="move-down-button"
                                onClick={() => moveExerciseDown(index)}
                                disabled={index === exercises.length - 1}
                                title="Mover abajo"
                              >
                                <span className="icon">↓</span>
                              </button>
                              
                              <button
                                className="remove-ex-button"
                                onClick={() => handleRemoveExercise(index)}
                                title="Eliminar ejercicio"
                              >
                                <span className="icon">×</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Formulario para agregar nuevo ejercicio */}
                {showAddExerciseForm && (
                  <div className="add-exercise-form">
                    <div className="form-header">
                      <h3>Agregar Nuevo Ejercicio</h3>
                      <button
                        className="close-form-button"
                        onClick={() => setShowAddExerciseForm(false)}
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="form-body">
                      <div className="form-group">
                        <label htmlFor="new-exercise-type">Ejercicio *</label>
                        <select
                          id="new-exercise-type"
                          name="id_ejercicio"
                          value={newExercise.id_ejercicio}
                          onChange={handleNewExerciseChange}
                          required
                        >
                          <option value="">Seleccionar ejercicio...</option>
                          {availableExercises.map(exercise => (
                            <option key={exercise.id_ejercicio} value={exercise.id_ejercicio}>
                              {exercise.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-row three-columns">
                        <div className="form-group">
                          <label htmlFor="new-exercise-series">Series</label>
                          <input
                            type="number"
                            id="new-exercise-series"
                            name="series"
                            min="1"
                            max="10"
                            value={newExercise.series}
                            onChange={handleNewExerciseChange}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="new-exercise-repeticiones">Repeticiones</label>
                          <input
                            type="text"
                            id="new-exercise-repeticiones"
                            name="repeticiones"
                            value={newExercise.repeticiones}
                            onChange={handleNewExerciseChange}
                            placeholder="Ej: 12, 10-12, 8/10/12"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="new-exercise-descanso">Descanso (seg)</label>
                          <input
                            type="number"
                            id="new-exercise-descanso"
                            name="descanso_segundos"
                            min="10"
                            max="300"
                            value={newExercise.descanso_segundos}
                            onChange={handleNewExerciseChange}
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="new-exercise-notas">Notas o instrucciones específicas</label>
                        <textarea
                          id="new-exercise-notas"
                          name="notas"
                          value={newExercise.notas}
                          onChange={handleNewExerciseChange}
                          placeholder="Instrucciones específicas para este ejercicio"
                          rows="2"
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button
                        className="cancel-button"
                        onClick={() => setShowAddExerciseForm(false)}
                      >
                        Cancelar
                      </button>
                      
                      <button
                        className="add-button"
                        onClick={handleAddExercise}
                        disabled={!newExercise.id_ejercicio}
                      >
                        Agregar Ejercicio
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Botones de acción principales */}
              <div className="main-actions">
                <button
                  className="cancel-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancelar
                </button>
                
                <button
                  className="save-all-button"
                  onClick={handleSaveChanges}
                  disabled={saving || exercises.length === 0}
                >
                  {saving ? 'Guardando...' : 'Guardar Todos los Cambios'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseEditor;