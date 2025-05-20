
// client/src/pages/coach/CustomRoutineForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './CoachStyles.css';

const CustomRoutineForm = () => {
  const { clientId } = useParams(); // Get clientId from URL params
  const { user } = useAuth();
  const navigate = useNavigate();
  
  console.log("Component loaded with clientId param:", clientId);

  // Estado para formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    objetivo: '',
    nivel_dificultad: 'intermedio',
    duracion_estimada: 45,
  });

  // Estado para los ejercicios de la rutina
  const [exercises, setExercises] = useState([
    { id_ejercicio: '', series: 3, repeticiones: '12', descanso_segundos: 60, notas: '', orden: 1 }
  ]);

  // Estado para lista de clientes y ejercicios disponibles
  const [clients, setClients] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  // Estado para UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isForSpecificClient, setIsForSpecificClient] = useState(clientId !== 'new');

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching initial data...");
        console.log("clientId from URL:", clientId);

        // Cargar ejercicios disponibles
        const exercisesResponse = await api.getExercises();
        if (exercisesResponse && exercisesResponse.data) {
          console.log(`Loaded ${exercisesResponse.data.length} exercises`);
          setAvailableExercises(exercisesResponse.data);
        } else {
          console.warn("No exercises data received");
          setAvailableExercises([]);
        }

        // Cargar clientes del entrenador
        const clientsResponse = await api.getCoachClients();
        if (clientsResponse && clientsResponse.data) {
          console.log(`Loaded ${clientsResponse.data.length} clients`);
          setClients(clientsResponse.data);
          
          // Si hay un ID de cliente específico, buscar ese cliente
          if (clientId !== 'new') {
            const clientIdStr = clientId.toString();
            console.log("Looking for client with ID:", clientIdStr);
            
            const foundClient = clientsResponse.data.find(c => c.id_usuario.toString() === clientIdStr);
            
            if (foundClient) {
              console.log("Found client:", foundClient.nombre);
              setSelectedClient(foundClient);
              setIsForSpecificClient(true);
            } else {
              console.error("Client not found in coach's clients");
              setError('Cliente no encontrado o no asignado a este entrenador');
            }
          }
        } else {
          console.warn("No clients data received");
          setClients([]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        setError('Error al cargar ejercicios y clientes. Por favor, intenta nuevamente.');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [clientId]);

  // Manejar cambios en el formulario principal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Manejar cambios en los ejercicios
  const handleExerciseChange = (index, field, value) => {
    const updatedExercises = [...exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setExercises(updatedExercises);
  };

  // Agregar un nuevo ejercicio
  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        id_ejercicio: '',
        series: 3,
        repeticiones: '12',
        descanso_segundos: 60,
        notas: '',
        orden: exercises.length + 1
      }
    ]);
  };

  // Eliminar un ejercicio
  const removeExercise = (index) => {
    if (exercises.length > 1) {
      const updatedExercises = exercises.filter((_, i) => i !== index);
      // Actualizar el orden de los ejercicios restantes
      updatedExercises.forEach((ex, i) => {
        ex.orden = i + 1;
      });
      setExercises(updatedExercises);
    } else {
      setNotification({
        type: 'error',
        message: 'La rutina debe tener al menos un ejercicio'
      });
    }
  };

  // Mover ejercicio hacia arriba en la lista
  const moveExerciseUp = (index) => {
    if (index > 0) {
      const updatedExercises = [...exercises];
      [updatedExercises[index - 1], updatedExercises[index]] = [updatedExercises[index], updatedExercises[index - 1]];
      // Actualizar el orden
      updatedExercises.forEach((ex, i) => {
        ex.orden = i + 1;
      });
      setExercises(updatedExercises);
    }
  };

  // Mover ejercicio hacia abajo en la lista
  const moveExerciseDown = (index) => {
    if (index < exercises.length - 1) {
      const updatedExercises = [...exercises];
      [updatedExercises[index], updatedExercises[index + 1]] = [updatedExercises[index + 1], updatedExercises[index]];
      // Actualizar el orden
      updatedExercises.forEach((ex, i) => {
        ex.orden = i + 1;
      });
      setExercises(updatedExercises);
    }
  };

  // Validar el formulario antes de enviar
  const validateForm = () => {
    // Validar datos básicos de la rutina
    if (!formData.nombre.trim()) {
      setNotification({
        type: 'error',
        message: 'El nombre de la rutina es obligatorio'
      });
      return false;
    }

    // Validar que todos los ejercicios tengan un ID de ejercicio
    const hasInvalidExercises = exercises.some(ex => !ex.id_ejercicio);
    if (hasInvalidExercises) {
      setNotification({
        type: 'error',
        message: 'Todos los ejercicios deben tener un ejercicio seleccionado'
      });
      return false;
    }

    // Validar que si es para un cliente específico, haya un cliente seleccionado
    if (isForSpecificClient && !selectedClient && clientId === 'new') {
      setNotification({
        type: 'error',
        message: 'Debes seleccionar un cliente para esta rutina personalizada'
      });
      return false;
    }

    return true;
  };

  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      // Determinar el ID del cliente
      let finalClientId = null;
      
      if (clientId !== 'new') {
        // Si hay un ID en la URL y no es 'new', usar ese
        finalClientId = parseInt(clientId);
        console.log("Using client ID from URL:", finalClientId);
      } else if (isForSpecificClient && selectedClient) {
        // Si es para un cliente específico seleccionado en el dropdown
        finalClientId = parseInt(selectedClient.id_usuario);
        console.log("Using client ID from selection:", finalClientId);
      }

      // Preparar datos para la API
      const routineData = {
        ...formData,
        id_cliente: finalClientId,
        ejercicios: exercises.map(ex => ({
          ...ex,
          id_ejercicio: parseInt(ex.id_ejercicio),
          series: parseInt(ex.series),
          descanso_segundos: parseInt(ex.descanso_segundos)
        }))
      };
      
      console.log("Submitting routine data:", {
        ...routineData,
        ejercicios: `${routineData.ejercicios.length} exercises`
      });

      // Llamar a la API para crear la rutina
      const response = await api.createCustomRoutine(routineData);

      setNotification({
        type: 'success',
        message: 'Rutina creada correctamente'
      });

      // Después de 2 segundos, redirigir a la página de rutinas
      setTimeout(() => {
        navigate('/coach/routines');
      }, 2000);
    } catch (error) {
      console.error('Error al crear rutina:', error);
      setNotification({
        type: 'error',
        message: `Error al crear rutina: ${error.response?.data?.message || error.message}`
      });
      setSubmitting(false);
    }
  };

  // Manejar cancelación del formulario
  const handleCancel = () => {
    navigate('/coach/routines');
  };

  // Si hay un error crítico que impide cargar la página
  if (error && !loading) {
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
          </div>
        </div>

        <div className="main-content">
          <div className="content-wrapper">
            <div className="error-container">
              <h2>Error</h2>
              <p>{error}</p>
              <button 
                className="primary-button" 
                onClick={() => navigate('/coach/routines')}
              >
                Volver a Rutinas
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        </div>
      </div>

      <div className="main-content">
        <div className="content-wrapper">
          {notification && (
            <div className={`notification ${notification.type}`}>
              {notification.message}
            </div>
          )}

          <div className="page-header">
            <div className="header-title">
              <h1 className="page-title">
                {clientId !== 'new' ? 'Crear Rutina Personalizada' : 'Crear Nueva Rutina'}
              </h1>
              <p className="page-subtitle">
                {clientId !== 'new' 
                  ? 'Diseña una rutina específica para tu cliente'
                  : 'Diseña una rutina que podrás asignar a tus clientes'
                }
              </p>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando datos...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="routine-form">
              <div className="form-section">
                <h2>Información de la Rutina</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre de la Rutina *</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      placeholder="Ej: Rutina de fuerza para principiantes"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="objetivo">Objetivo</label>
                    <input
                      type="text"
                      id="objetivo"
                      name="objetivo"
                      value={formData.objetivo}
                      onChange={handleInputChange}
                      placeholder="Ej: Ganar masa muscular, Tonificar, etc."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="nivel_dificultad">Nivel de Dificultad</label>
                    <select
                      id="nivel_dificultad"
                      name="nivel_dificultad"
                      value={formData.nivel_dificultad}
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
                      min="5"
                      max="180"
                      value={formData.duracion_estimada}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="descripcion">Descripción</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    placeholder="Describe el propósito de esta rutina y cualquier instrucción especial"
                    rows="3"
                  ></textarea>
                </div>

                {clientId === 'new' && (
                  <div className="form-group checkbox-group">
                    <input
                      type="checkbox"
                      id="isForSpecificClient"
                      checked={isForSpecificClient}
                      onChange={(e) => setIsForSpecificClient(e.target.checked)}
                    />
                    <label htmlFor="isForSpecificClient">Asignar a un cliente específico</label>
                  </div>
                )}

                {(isForSpecificClient && clientId === 'new') && (
                  <div className="form-group">
                    <label htmlFor="client_id">Cliente</label>
                    <select
                      id="client_id"
                      value={selectedClient?.id_usuario || ''}
                      onChange={(e) => {
                        const client = clients.find(c => c.id_usuario.toString() === e.target.value);
                        setSelectedClient(client || null);
                      }}
                    >
                      <option value="">Seleccionar cliente...</option>
                      {clients.map(client => (
                        <option key={client.id_usuario} value={client.id_usuario}>
                          {client.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(isForSpecificClient && clientId !== 'new' && selectedClient) && (
                  <div className="form-group">
                    <label>Cliente Seleccionado</label>
                    <div className="selected-client-info">
                      <strong>{selectedClient.nombre}</strong>
                      <p>{selectedClient.email}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-section">
                <div className="section-header">
                  <h2>Ejercicios de la Rutina</h2>
                  <button
                    type="button"
                    className="add-exercise-button"
                    onClick={addExercise}
                  >
                    + Agregar Ejercicio
                  </button>
                </div>

                {availableExercises.length === 0 ? (
                  <div className="empty-exercises">
                    <p>No hay ejercicios disponibles. Por favor, contacta al administrador.</p>
                  </div>
                ) : (
                  <div className="exercises-list">
                    {exercises.map((exercise, index) => (
                      <div key={index} className="exercise-item">
                        <div className="exercise-header">
                          <h3>Ejercicio #{index + 1}</h3>
                          <div className="exercise-actions">
                            <button
                              type="button"
                              className="move-button"
                              onClick={() => moveExerciseUp(index)}
                              disabled={index === 0}
                              title="Mover arriba"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="move-button"
                              onClick={() => moveExerciseDown(index)}
                              disabled={index === exercises.length - 1}
                              title="Mover abajo"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              className="remove-button"
                              onClick={() => removeExercise(index)}
                              title="Eliminar ejercicio"
                            >
                              ×
                            </button>
                          </div>
                        </div>

                        <div className="exercise-form-grid">
                          <div className="form-group">
                            <label htmlFor={`exercise-${index}-type`}>Ejercicio *</label>
                            <select
                              id={`exercise-${index}-type`}
                              value={exercise.id_ejercicio}
                              onChange={(e) => handleExerciseChange(index, 'id_ejercicio', e.target.value)}
                              required
                            >
                              <option value="">Seleccionar ejercicio...</option>
                              {availableExercises.map(ex => (
                                <option key={ex.id_ejercicio} value={ex.id_ejercicio}>
                                  {ex.nombre}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="form-group">
                            <label htmlFor={`exercise-${index}-series`}>Series</label>
                            <input
                              type="number"
                              id={`exercise-${index}-series`}
                              min="1"
                              max="10"
                              value={exercise.series}
                              onChange={(e) => handleExerciseChange(index, 'series', e.target.value)}
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor={`exercise-${index}-repeticiones`}>Repeticiones</label>
                            <input
                              type="text"
                              id={`exercise-${index}-repeticiones`}
                              value={exercise.repeticiones}
                              onChange={(e) => handleExerciseChange(index, 'repeticiones', e.target.value)}
                              placeholder="Ej: 12, 10-12, 8/10/12"
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor={`exercise-${index}-descanso`}>Descanso (seg)</label>
                            <input
                              type="number"
                              id={`exercise-${index}-descanso`}
                              min="10"
                              max="300"
                              value={exercise.descanso_segundos}
                              onChange={(e) => handleExerciseChange(index, 'descanso_segundos', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor={`exercise-${index}-notas`}>Notas o instrucciones específicas</label>
                          <textarea
                            id={`exercise-${index}-notas`}
                            value={exercise.notas}
                            onChange={(e) => handleExerciseChange(index, 'notas', e.target.value)}
                            placeholder="Instrucciones específicas para este ejercicio"
                            rows="2"
                          ></textarea>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={submitting || availableExercises.length === 0}
                >
                  {submitting ? 'Guardando...' : 'Guardar Rutina'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomRoutineForm;