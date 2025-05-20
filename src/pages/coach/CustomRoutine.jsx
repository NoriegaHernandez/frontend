// client/src/pages/coach/CustomRoutine.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './CoachStyles.css';

const CustomRoutine = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [client, setClient] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [routineData, setRoutineData] = useState({
    nombre: '',
    descripcion: '',
    objetivo: '',
    nivel_dificultad: 'intermedio',
    duracion_estimada: 60
  });

const CustomRoutine = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingClient, setLoadingClient] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [client, setClient] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [routineData, setRoutineData] = useState({
    nombre: '',
    descripcion: '',
    objetivo: '',
    nivel_dificultad: 'intermedio',
    duracion_estimada: 60
  });
  
  // Determinar si es una rutina nueva sin cliente específico
  const isNewRoutine = !clientId || clientId === 'new' || clientId === 'undefined';
  
  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar ejercicios
        setLoadingExercises(true);
        try {
          console.log('Intentando cargar ejercicios...');
          const exercisesResponse = await api.getExercises();
          console.log('Respuesta de ejercicios:', exercisesResponse);
          setExercises(exercisesResponse?.data || []);
        } catch (exerciseError) {
          console.error('Error al cargar ejercicios:', exerciseError);
          setError('No se pudieron cargar los ejercicios disponibles');
        } finally {
          setLoadingExercises(false);
        }
        
        // Si hay un ID de cliente válido, cargar datos del cliente
        if (!isNewRoutine) {
          setLoadingClient(true);
          try {
            console.log(`Intentando cargar datos del cliente con ID: ${clientId}`);
            const clientResponse = await api.getClientById(clientId);
            console.log('Respuesta de cliente:', clientResponse);
            setClient(clientResponse?.data || null);
          } catch (clientError) {
            console.error('Error al cargar datos del cliente:', clientError);
            setError('No se pudo cargar la información del cliente');
          } finally {
            setLoadingClient(false);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error general al cargar datos:', error);
        setError('Error al cargar datos necesarios para crear la rutina');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [clientId, isNewRoutine]);
  
  // Manejar cambios en el formulario principal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoutineData({
      ...routineData,
      [name]: value
    });
  };
  
  // Agregar un ejercicio a la rutina
  const handleAddExercise = (exerciseId) => {
    // Verificar que el ejercicio existe
    const exercise = exercises.find(ex => ex.id_ejercicio === parseInt(exerciseId));
    
    if (!exercise) {
      console.warn('Ejercicio no encontrado:', exerciseId);
      return;
    }
    
    // Crear un nuevo ejercicio para la rutina con valores por defecto
    const newRoutineExercise = {
      id_ejercicio: exercise.id_ejercicio,
      nombre: exercise.nombre,
      series: 3,
      repeticiones: '12',
      descanso_segundos: 60,
      orden: selectedExercises.length + 1,
      notas: ''
    };
    
    setSelectedExercises([...selectedExercises, newRoutineExercise]);
  };
  
  // Remover un ejercicio de la rutina
  const handleRemoveExercise = (index) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises.splice(index, 1);
    
    // Actualizar el orden de los ejercicios restantes
    const reorderedExercises = updatedExercises.map((ex, idx) => ({
      ...ex,
      orden: idx + 1
    }));
    
    setSelectedExercises(reorderedExercises);
  };
  
  // Manejar cambios en los detalles de un ejercicio
  const handleExerciseDetailChange = (index, field, value) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    };
    
    setSelectedExercises(updatedExercises);
  };
  
  // Manejar el movimiento de ejercicios (cambio de orden)
  const handleMoveExercise = (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === selectedExercises.length - 1)
    ) {
      return; // No hacer nada si intentamos mover más allá de los límites
    }
    
    const updatedExercises = [...selectedExercises];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Intercambiar elementos
    [updatedExercises[index], updatedExercises[targetIndex]] = 
    [updatedExercises[targetIndex], updatedExercises[index]];
    
    // Actualizar el orden
    const reorderedExercises = updatedExercises.map((ex, idx) => ({
      ...ex,
      orden: idx + 1
    }));
    
    setSelectedExercises(reorderedExercises);
  };
  
  // Guardar rutina
  const handleSaveRoutine = async () => {
    try {
      // Validar que hay al menos un ejercicio
      if (selectedExercises.length === 0) {
        setNotification({
          type: 'error',
          message: 'Debes agregar al menos un ejercicio a la rutina'
        });
        return;
      }
      
      // Validar que la rutina tiene nombre
      if (!routineData.nombre.trim()) {
        setNotification({
          type: 'error',
          message: 'Debes asignar un nombre a la rutina'
        });
        return;
      }
      
      setLoading(true);
      
      // Preparar datos para enviar al servidor
      const routinePayload = {
        ...routineData,
        ejercicios: selectedExercises
      };
      
      // Si es para un cliente específico, incluir su ID
      if (!isNewRoutine && clientId) {
        routinePayload.id_cliente = parseInt(clientId);
      }
      
      console.log('Enviando datos de rutina:', routinePayload);
      
      try {
        // Llamar al endpoint correcto según si es para un cliente o una plantilla
        let response;
        if (isNewRoutine) {
          // Si es una rutina genérica (sin cliente específico)
          response = await api.createRoutineTemplate(routinePayload);
          setNotification({
            type: 'success',
            message: 'Plantilla de rutina creada correctamente'
          });
        } else {
          // Si es para un cliente específico
          response = await api.createCustomRoutine(routinePayload);
          setNotification({
            type: 'success',
            message: 'Rutina creada y asignada correctamente'
          });
        }
        
        console.log('Respuesta del servidor:', response);
        
        // Redirigir después de un breve retraso
        setTimeout(() => {
          navigate('/coach/InformacionCoach');
        }, 2000);
      } catch (apiError) {
        console.error('Error al guardar rutina:', apiError);
        setNotification({
          type: 'error',
          message: 'Error al guardar la rutina: ' + (apiError.response?.data?.message || apiError.message)
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error general en handleSaveRoutine:', error);
      setNotification({
        type: 'error',
        message: 'Error inesperado al guardar la rutina'
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
            <button className="menu-button" onClick={() => navigate('/coach/dashboard')}>Dashboard</button>
            <button className="menu-button" onClick={() => navigate('/coach/InformacionCoach')}>Rutinas</button>
            <button className="menu-button" onClick={() => navigate('/coach/data')}>Mi Perfil</button>
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

            {loading && !client ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando datos...</p>
              </div>
            ) : (
              <>
                <div className="page-header">
                  <div className="header-title">
                    <h1 className="page-title">Crear Rutina Personalizada</h1>
                    <p className="page-subtitle">
                      Cliente: <strong>{client?.nombre || 'Cargando...'}</strong>
                    </p>
                  </div>
                  <div className="header-actions">
                    <button
                      className="back-button"
                      onClick={() => navigate('/coach/dashboard')}
                    >
                      Volver al Dashboard
                    </button>
                  </div>
                </div>

                <div className="routine-creation-container">
                  {/* Sección de información general de la rutina */}
                  <div className="routine-section">
                    <h2 className="section-title">Información de la Rutina</h2>

                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="nombre">Nombre de la Rutina *</label>
                        <input
                          type="text"
                          id="nombre"
                          name="nombre"
                          value={routineData.nombre}
                          onChange={handleInputChange}
                          placeholder="Ej: Hipertrofia Avanzada"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="objetivo">Objetivo Principal</label>
                        <select
                          id="objetivo"
                          name="objetivo"
                          value={routineData.objetivo}
                          onChange={handleInputChange}
                        >
                          <option value="">Seleccionar objetivo</option>
                          <option value="Pérdida de peso">Pérdida de peso</option>
                          <option value="Hipertrofia">Hipertrofia</option>
                          <option value="Fuerza">Fuerza</option>
                          <option value="Resistencia">Resistencia</option>
                          <option value="Flexibilidad">Flexibilidad</option>
                          <option value="General">Acondicionamiento general</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="nivel_dificultad">Nivel de Dificultad</label>
                        <select
                          id="nivel_dificultad"
                          name="nivel_dificultad"
                          value={routineData.nivel_dificultad}
                          onChange={handleInputChange}
                        >
                          <option value="principiante">Principiante</option>
                          <option value="intermedio">Intermedio</option>
                          <option value="avanzado">Avanzado</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="duracion_estimada">Duración Estimada (minutos)</label>
                        <input
                          type="number"
                          id="duracion_estimada"
                          name="duracion_estimada"
                          value={routineData.duracion_estimada}
                          onChange={handleInputChange}
                          min="10"
                          max="240"
                        />
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="descripcion">Descripción</label>
                      <textarea
                        id="descripcion"
                        name="descripcion"
                        value={routineData.descripcion}
                        onChange={handleInputChange}
                        placeholder="Describe el propósito y beneficios de esta rutina..."
                        rows="3"
                      ></textarea>
                    </div>
                  </div>

                  {/* Sección de selección de ejercicios */}
                  <div className="routine-section">
                    <h2 className="section-title">Ejercicios de la Rutina</h2>

                    <div className="exercise-selector">
                      <label htmlFor="exercise-search">Agregar ejercicio a la rutina</label>
                      <div className="exercise-search-container">
                        <select
                          id="exercise-search"
                          className="exercise-search"
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddExercise(e.target.value);
                              e.target.value = ""; // Resetear después de agregar
                            }
                          }}
                        >
                          <option value="">Seleccionar ejercicio</option>
                          {exercises.map(exercise => (
                            <option key={exercise.id_ejercicio} value={exercise.id_ejercicio}>
                              {exercise.nombre}
                            </option>
                          ))}
                        </select>
                        <div className="exercise-count">
                          {selectedExercises.length} ejercicios seleccionados
                        </div>
                      </div>
                    </div>

                    {/* Lista de ejercicios seleccionados */}
                    <div className="selected-exercises">
                      {selectedExercises.length === 0 ? (
                        <div className="no-exercises">
                          <p>No has seleccionado ningún ejercicio todavía.</p>
                          <p>Usa el menú de arriba para añadir ejercicios a la rutina.</p>
                        </div>
                      ) : (
                        <div className="exercise-list">
                          {selectedExercises.map((exercise, index) => (
                            <div key={`${exercise.id_ejercicio}-${index}`} className="exercise-item">
                              <div className="exercise-header">
                                <div className="exercise-order">
                                  <span>{index + 1}</span>
                                  <div className="order-buttons">
                                    <button
                                      type="button"
                                      className="order-button"
                                      onClick={() => handleMoveExercise(index, 'up')}
                                      disabled={index === 0}
                                    >
                                      ↑
                                    </button>
                                    <button
                                      type="button"
                                      className="order-button"
                                      onClick={() => handleMoveExercise(index, 'down')}
                                      disabled={index === selectedExercises.length - 1}
                                    >
                                      ↓
                                    </button>
                                  </div>
                                </div>
                                <h3 className="exercise-name">{exercise.nombre}</h3>
                                <button
                                  type="button"
                                  className="remove-exercise"
                                  onClick={() => handleRemoveExercise(index)}
                                >
                                  ×
                                </button>
                              </div>

                              <div className="exercise-details">
                                <div className="detail-group">
                                  <label>Series</label>
                                  <input
                                    type="number"
                                    value={exercise.series}
                                    onChange={(e) => handleExerciseDetailChange(index, 'series', parseInt(e.target.value))}
                                    min="1"
                                    max="20"
                                  />
                                </div>

                                <div className="detail-group">
                                  <label>Repeticiones</label>
                                  <input
                                    type="text"
                                    value={exercise.repeticiones}
                                    onChange={(e) => handleExerciseDetailChange(index, 'repeticiones', e.target.value)}
                                    placeholder="Ej: 12 o 8-12"
                                  />
                                </div>

                                <div className="detail-group">
                                  <label>Descanso (seg)</label>
                                  <input
                                    type="number"
                                    value={exercise.descanso_segundos}
                                    onChange={(e) => handleExerciseDetailChange(index, 'descanso_segundos', parseInt(e.target.value))}
                                    min="0"
                                    max="300"
                                  />
                                </div>
                              </div>

                              <div className="exercise-notes">
                                <label>Notas específicas para este ejercicio</label>
                                <textarea
                                  value={exercise.notas || ''}
                                  onChange={(e) => handleExerciseDetailChange(index, 'notas', e.target.value)}
                                  placeholder="Instrucciones especiales, modificaciones, etc."
                                  rows="2"
                                ></textarea>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="action-buttons">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de cancelar? Se perderán todos los cambios.')) {
                          navigate('/coach/dashboard');
                        }
                      }}
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      className="save-button"
                      onClick={handleSaveRoutine}
                      disabled={loading || selectedExercises.length === 0 || !routineData.nombre}
                    >
                      {loading ? 'Guardando...' : 'Guardar y Asignar Rutina'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default CustomRoutine;