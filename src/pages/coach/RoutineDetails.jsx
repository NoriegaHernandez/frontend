// client/src/pages/coach/RoutineDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './CoachStyles.css';

const RoutineDetails = () => {
  const { routineId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estado para datos de la rutina
  const [routine, setRoutine] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [clients, setClients] = useState([]);
  const [assignedClients, setAssignedClients] = useState([]);

  // Estado para UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Estado para edición
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nombre: '',
    descripcion: '',
    objetivo: '',
    nivel_dificultad: '',
    duracion_estimada: 0
  });

  // Cargar datos iniciales
  useEffect(() => {
    const fetchRoutineDetails = async () => {
      try {
        setLoading(true);
        setError(null);


        const assignedResponse = await api.getRoutineAssignments(routineId);
        if (assignedResponse.data) {
          setAssignedClients(assignedResponse.data);
        }
        // Obtener detalles de la rutina
        const routineResponse = await api.getRoutineDetails(routineId);
        if (!routineResponse.data) {
          throw new Error('No se pudieron cargar los detalles de la rutina');
        }

        // Cargar clientes que ya tienen asignada esta rutina
        try {
          const assignedResponse = await api.getRoutineAssignments(routineId);
          if (assignedResponse.data) {
            // Obtener los días de entrenamiento para cada asignación
            const clientsWithDays = await Promise.all(
              assignedResponse.data.map(async (client) => {
                try {
                  const daysResponse = await api.getAssignmentDays(client.id_asignacion_rutina);
                  return {
                    ...client,
                    dias_entrenamiento: daysResponse.data || []
                  };
                } catch (err) {
                  console.warn(`No se pudieron cargar los días para el cliente ${client.id_usuario}:`, err);
                  return {
                    ...client,
                    dias_entrenamiento: []
                  };
                }
              })
            );

            setAssignedClients(clientsWithDays);
          }
        } catch (err) {
          console.warn('No se pudieron cargar las asignaciones:', err);
          setAssignedClients([]);
        }
        setRoutine(routineResponse.data);

        // Inicializar datos de edición
        setEditFormData({
          nombre: routineResponse.data.nombre || '',
          descripcion: routineResponse.data.descripcion || '',
          objetivo: routineResponse.data.objetivo || '',
          nivel_dificultad: routineResponse.data.nivel_dificultad || 'intermedio',
          duracion_estimada: routineResponse.data.duracion_estimada || 45
        });

        // Si hay ejercicios en la respuesta, establecerlos
        if (routineResponse.data.ejercicios && Array.isArray(routineResponse.data.ejercicios)) {
          setExercises(routineResponse.data.ejercicios);
        }

        // Cargar clientes a los que se puede asignar la rutina
        const clientsResponse = await api.getCoachClients();
        if (clientsResponse.data) {
          setClients(clientsResponse.data);
        }

        // Cargar clientes que ya tienen asignada esta rutina
        // Esta llamada podría necesitar desarrollarse en el backend
        try {
          const assignedResponse = await api.getRoutineAssignments(routineId);
          if (assignedResponse.data) {
            setAssignedClients(assignedResponse.data);
          }
        } catch (err) {
          console.warn('No se pudieron cargar las asignaciones:', err);
          // No es un error crítico, así que continuamos
          setAssignedClients([]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error al cargar detalles de la rutina:', error);
        setError('Error al cargar los detalles de la rutina. Por favor, intenta nuevamente.');
        setLoading(false);
      }
    };

    fetchRoutineDetails();
  }, [routineId]);

  // Manejar cambios en el formulario de edición
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Guardar cambios de edición
  const handleSaveChanges = async () => {
    try {
      setIsAssigning(true); // Reutilizamos esta variable para indicar carga

      // Llamada a la API para actualizar la rutina
      await api.updateRoutine(routineId, editFormData);

      // Actualizar el estado local
      setRoutine({
        ...routine,
        ...editFormData
      });

      setIsEditing(false);
      setNotification({
        type: 'success',
        message: 'Rutina actualizada correctamente'
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error al actualizar la rutina:', error);
      setNotification({
        type: 'error',
        message: 'Error al actualizar la rutina'
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Asignar rutina a un cliente
  const handleAssignRoutine = async () => {
    if (!selectedClientId) {
      setNotification({
        type: 'error',
        message: 'Selecciona un cliente'
      });
      return;
    }

    try {
      setIsAssigning(true);

      await api.assignRoutineToClient(selectedClientId, routineId);

      // Actualizar la lista de clientes asignados
      const client = clients.find(c => c.id_usuario.toString() === selectedClientId);

      if (client) {
        setAssignedClients([...assignedClients, {
          ...client,
          fecha_asignacion: new Date().toISOString()
        }]);
      }

      setShowAssignModal(false);
      setSelectedClientId('');
      setNotification({
        type: 'success',
        message: 'Rutina asignada correctamente'
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error al asignar rutina:', error);
      setNotification({
        type: 'error',
        message: 'Error al asignar la rutina'
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    // Restaurar valores originales
    setEditFormData({
      nombre: routine.nombre || '',
      descripcion: routine.descripcion || '',
      objetivo: routine.objetivo || '',
      nivel_dificultad: routine.nivel_dificultad || 'intermedio',
      duracion_estimada: routine.duracion_estimada || 45
    });

    setIsEditing(false);
  };

  // Duplicar rutina
  const handleDuplicateRoutine = async () => {
    try {
      setIsAssigning(true);

      // Crear una copia de la rutina con los ejercicios
      const duplicatedRoutine = {
        nombre: `Copia de ${routine.nombre}`,
        descripcion: routine.descripcion,
        objetivo: routine.objetivo,
        nivel_dificultad: routine.nivel_dificultad,
        duracion_estimada: routine.duracion_estimada,
        ejercicios: exercises.map(ex => ({
          id_ejercicio: ex.id_ejercicio,
          series: ex.series,
          repeticiones: ex.repeticiones,
          descanso_segundos: ex.descanso_segundos,
          notas: ex.notas,
          orden: ex.orden
        }))
      };

      // Llamar a la API para crear la nueva rutina
      const response = await api.createCustomRoutine(duplicatedRoutine);

      setNotification({
        type: 'success',
        message: 'Rutina duplicada correctamente'
      });

      // Después de 2 segundos, redirigir a la nueva rutina
      setTimeout(() => {
        navigate(`/coach/routine/${response.data.id_rutina}`);
      }, 2000);
    } catch (error) {
      console.error('Error al duplicar rutina:', error);
      setNotification({
        type: 'error',
        message: 'Error al duplicar la rutina'
      });
      setIsAssigning(false);
    }
  };

  // Eliminar rutina
  const handleDeleteRoutine = async () => {
    // Confirmación
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta rutina? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsAssigning(true);

      // Llamar a la API para eliminar la rutina
      await api.deleteRoutine(routineId);

      setNotification({
        type: 'success',
        message: 'Rutina eliminada correctamente'
      });

      // Después de 2 segundos, redirigir a la lista de rutinas
      setTimeout(() => {
        navigate('/coach/routines');
      }, 2000);
    } catch (error) {
      console.error('Error al eliminar rutina:', error);
      setNotification({
        type: 'error',
        message: 'Error al eliminar la rutina'
      });
      setIsAssigning(false);
    }
  };

  // Filtrar clientes que no tienen la rutina asignada
  const availableClients = clients.filter(client =>
    !assignedClients.some(assigned => assigned.id_usuario === client.id_usuario)
  );

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

          <div className="page-header">
            <div className="header-title">
              <h1 className="page-title">Detalle de Rutina</h1>
              <button
                className="back-button"
                onClick={() => navigate('/coach/routines')}
              >
                ← Volver a Rutinas
              </button>
            </div>

            <div className="header-actions">
              <button
                className="duplicate-button"
                onClick={handleDuplicateRoutine}
                disabled={loading || isAssigning}
              >
                Duplicar Rutina
              </button>

              <button
                className="assign-button"
                onClick={() => setShowAssignModal(true)}
                disabled={loading || isAssigning || availableClients.length === 0}
              >
                Asignar a Cliente
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando detalles de la rutina...</p>
            </div>
          ) : (
            <div className="routine-details-container">
              {/* Información de la rutina */}
              <div className="routine-info-card">
                <div className="card-header">
                  <h2>Información de la Rutina</h2>
                  {isEditing ? (
                    <div className="edit-actions">
                      <button
                        className="cancel-edit-button"
                        onClick={handleCancelEdit}
                      >
                        Cancelar
                      </button>
                      <button
                        className="save-button"
                        onClick={handleSaveChanges}
                        disabled={isAssigning}
                      >
                        {isAssigning ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  ) : (
                    <div className="card-actions">
                      <button
                        className="edit-button"
                        onClick={() => setIsEditing(true)}
                      >
                        Editar
                      </button>
                      <button
                        className="delete-button"
                        onClick={handleDeleteRoutine}
                        disabled={isAssigning}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="edit-routine-form">
                    <div className="form-group">
                      <label htmlFor="nombre">Nombre de la Rutina</label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={editFormData.nombre}
                        onChange={handleEditInputChange}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="objetivo">Objetivo</label>
                        <input
                          type="text"
                          id="objetivo"
                          name="objetivo"
                          value={editFormData.objetivo || ''}
                          onChange={handleEditInputChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="nivel_dificultad">Nivel de Dificultad</label>
                        <select
                          id="nivel_dificultad"
                          name="nivel_dificultad"
                          value={editFormData.nivel_dificultad || 'intermedio'}
                          onChange={handleEditInputChange}
                        >
                          <option value="principiante">Principiante</option>
                          <option value="intermedio">Intermedio</option>
                          <option value="avanzado">Avanzado</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="duracion_estimada">Duración (min)</label>
                        <input
                          type="number"
                          id="duracion_estimada"
                          name="duracion_estimada"
                          min="5"
                          max="180"
                          value={editFormData.duracion_estimada || 45}
                          onChange={handleEditInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="descripcion">Descripción</label>
                      <textarea
                        id="descripcion"
                        name="descripcion"
                        value={editFormData.descripcion || ''}
                        onChange={handleEditInputChange}
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
                ) : (
                  <div className="routine-info">
                    <h3 className="routine-name">{routine?.nombre || 'Sin nombre'}</h3>

                    <div className="routine-meta">
                      <div className="meta-item">
                        <span className="meta-label">Nivel:</span>
                        <span className={`difficulty-badge ${routine?.nivel_dificultad || 'intermedio'}`}>
                          {routine?.nivel_dificultad || 'Intermedio'}
                        </span>
                      </div>

                      <div className="meta-item">
                        <span className="meta-label">Objetivo:</span>
                        <span className="meta-value">{routine?.objetivo || 'General'}</span>
                      </div>

                      <div className="meta-item">
                        <span className="meta-label">Duración:</span>
                        <span className="meta-value">{routine?.duracion_estimada || '45'} minutos</span>
                      </div>

                      <div className="meta-item">
                        <span className="meta-label">Creada:</span>
                        <span className="meta-value">
                          {routine?.fecha_creacion
                            ? new Date(routine.fecha_creacion).toLocaleDateString()
                            : 'Fecha desconocida'}
                        </span>
                      </div>
                    </div>

                    {routine?.descripcion && (
                      <div className="routine-description">
                        <h4>Descripción</h4>
                        <p>{routine.descripcion}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Ejercicios de la rutina */}
              <div className="exercises-section">
                <div className="section-header">
                  <h2>Ejercicios ({exercises.length})</h2>
                  {/* <button
                    className="edit-exercises-button"
                    onClick={() => navigate(`/coach/routine/${routineId}/edit-exercises`)}
                  >
                    Editar Ejercicios
                  </button> */}
                  <button
                    className="edit-exercises-button"
                    onClick={() => navigate(`/coach/routine/${routineId}/edit-exercises`)}
                  >
                    Editar Ejercicios
                  </button>
                </div>

                {exercises.length === 0 ? (
                  <div className="empty-message">
                    <p>Esta rutina no tiene ejercicios asignados.</p>
                    <button
                      className="action-button"
                      onClick={() => navigate(`/coach/routine/${routineId}/edit-exercises`)}
                    >
                      Agregar Ejercicios
                    </button>
                  </div>
                ) : (
                  <div className="exercises-list">
                    {exercises.map((exercise, index) => (
                      <div key={index} className="exercise-card">
                        <div className="exercise-card-header">
                          <span className="exercise-number">{exercise.orden || index + 1}</span>
                          <h3 className="exercise-name">{exercise.nombre || exercise.nombre_ejercicio}</h3>
                        </div>

                        <div className="exercise-details">
                          <div className="exercise-detail">
                            <span className="detail-label">Series:</span>
                            <span className="detail-value">{exercise.series}</span>
                          </div>

                          <div className="exercise-detail">
                            <span className="detail-label">Repeticiones:</span>
                            <span className="detail-value">{exercise.repeticiones}</span>
                          </div>

                          <div className="exercise-detail">
                            <span className="detail-label">Descanso:</span>
                            <span className="detail-value">{exercise.descanso_segundos} segundos</span>
                          </div>
                        </div>

                        {exercise.notas && (
                          <div className="exercise-notes">
                            <span className="notes-label">Notas:</span>
                            <p className="notes-text">{exercise.notas}</p>
                          </div>
                        )}

                        {(exercise.descripcion_ejercicio || exercise.ejercicio_descripcion) && (
                          <div className="exercise-description">
                            <p>{exercise.descripcion_ejercicio || exercise.ejercicio_descripcion}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Clientes asignados */}
              <div className="assigned-clients-section">
                <div className="section-header">
                  <h2>Clientes Asignados ({assignedClients.length})</h2>
                </div>

                {/* {assignedClients.length === 0 ? (
                  <div className="empty-message">
                    <p>Esta rutina no está asignada a ningún cliente.</p>
                    {availableClients.length > 0 && (
                      <button
                        className="action-button"
                        onClick={() => setShowAssignModal(true)}
                      >
                        Asignar a Cliente
                      </button>
                    )}
                  </div>
                ) : ( */}
                {assignedClients.length === 0 ? (
                  <div className="empty-message">
                    <p>Esta rutina no está asignada a ningún cliente.</p>
                    {availableClients.length > 0 && (
                      <button
                        className="action-button"
                        onClick={() => setShowAssignModal(true)}
                      >
                        Asignar a Cliente
                      </button>
                    )}
                  </div>
                ) : (
                  // <div className="clients-list">
                  //   {assignedClients.map((client) => (
                  //     <div key={client.id_usuario} className="client-card">
                  //       <div className="client-info">
                  //         <h3 className="client-name">{client.nombre}</h3>
                  //         <p className="client-email">{client.email}</p>
                  //       </div>

                  //       <div className="assignment-info">
                  //         <span className="assignment-date">
                  //           Asignada: {new Date(client.fecha_asignacion).toLocaleDateString()}
                  //         </span>
                  <div className="clients-list">
                    {assignedClients.map((client) => (
                      <div key={client.id_usuario} className="client-card">
                        <div className="client-info">
                          <h3 className="client-name">{client.nombre}</h3>
                          <p className="client-email">{client.email}</p>
                        </div>

                        <div className="assignment-info">
                          <span className="assignment-date">
                            Asignada: {new Date(client.fecha_asignacion).toLocaleDateString()}
                          </span>
                          {/* Mostrar días de entrenamiento */}
                          {client.dias_entrenamiento && client.dias_entrenamiento.length > 0 && (
                            <div className="training-days">
                              <span className="days-label">Días:</span>
                              <span className="days-value">
                                {client.dias_entrenamiento
                                  .map(day => day.dia_semana)
                                  .sort((a, b) => {
                                    const order = { 'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'domingo': 7 };
                                    return order[a] - order[b];
                                  })
                                  .join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal para asignar rutina */}
          {showAssignModal && (
            <div className="modal-overlay">
              <div className="assign-modal">
                <div className="modal-header">
                  <h2>Asignar Rutina a Cliente</h2>
                  <button
                    className="close-button"
                    onClick={() => setShowAssignModal(false)}
                  >×</button>
                </div>

                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="client-select">Seleccionar Cliente</label>
                    <select
                      id="client-select"
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                    >
                      <option value="">Seleccionar cliente...</option>
                      {availableClients.map(client => (
                        <option key={client.id_usuario} value={client.id_usuario}>
                          {client.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="modal-info">
                    <p>La nueva rutina reemplazará cualquier rutina activa que tenga el cliente.</p>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="cancel-button"
                    onClick={() => setShowAssignModal(false)}
                  >
                    Cancelar
                  </button>

                  <button
                    className="assign-button"
                    onClick={handleAssignRoutine}
                    disabled={!selectedClientId || isAssigning}
                  >
                    {isAssigning ? 'Asignando...' : 'Asignar Rutina'}
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

export default RoutineDetails;