// // client/src/pages/coach/CustomRoutine.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import api from '../../services/api';
// import './CoachStyles.css';

// const CustomRoutine = () => {
//   const { clientId } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [notification, setNotification] = useState(null);
//   const [client, setClient] = useState(null);
//   const [exercises, setExercises] = useState([]);
//   const [selectedExercises, setSelectedExercises] = useState([]);
//   const [routineData, setRoutineData] = useState({
//     nombre: '',
//     descripcion: '',
//     objetivo: '',
//     nivel_dificultad: 'intermedio',
//     duracion_estimada: 60
//   });

// const CustomRoutine = () => {
//   const { clientId } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [loadingClient, setLoadingClient] = useState(false);
//   const [loadingExercises, setLoadingExercises] = useState(false);
//   const [error, setError] = useState(null);
//   const [notification, setNotification] = useState(null);
//   const [client, setClient] = useState(null);
//   const [exercises, setExercises] = useState([]);
//   const [selectedExercises, setSelectedExercises] = useState([]);
//   const [routineData, setRoutineData] = useState({
//     nombre: '',
//     descripcion: '',
//     objetivo: '',
//     nivel_dificultad: 'intermedio',
//     duracion_estimada: 60
//   });
  
//   // Determinar si es una rutina nueva sin cliente específico
//   const isNewRoutine = !clientId || clientId === 'new' || clientId === 'undefined';
  
//   // Cargar datos iniciales
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         // Cargar ejercicios
//         setLoadingExercises(true);
//         try {
//           console.log('Intentando cargar ejercicios...');
//           const exercisesResponse = await api.getExercises();
//           console.log('Respuesta de ejercicios:', exercisesResponse);
//           setExercises(exercisesResponse?.data || []);
//         } catch (exerciseError) {
//           console.error('Error al cargar ejercicios:', exerciseError);
//           setError('No se pudieron cargar los ejercicios disponibles');
//         } finally {
//           setLoadingExercises(false);
//         }
        
//         // Si hay un ID de cliente válido, cargar datos del cliente
//         if (!isNewRoutine) {
//           setLoadingClient(true);
//           try {
//             console.log(`Intentando cargar datos del cliente con ID: ${clientId}`);
//             const clientResponse = await api.getClientById(clientId);
//             console.log('Respuesta de cliente:', clientResponse);
//             setClient(clientResponse?.data || null);
//           } catch (clientError) {
//             console.error('Error al cargar datos del cliente:', clientError);
//             setError('No se pudo cargar la información del cliente');
//           } finally {
//             setLoadingClient(false);
//           }
//         }
        
//         setLoading(false);
//       } catch (error) {
//         console.error('Error general al cargar datos:', error);
//         setError('Error al cargar datos necesarios para crear la rutina');
//         setLoading(false);
//       }
//     };
    
//     fetchData();
//   }, [clientId, isNewRoutine]);
  
//   // Manejar cambios en el formulario principal
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setRoutineData({
//       ...routineData,
//       [name]: value
//     });
//   };
  
//   // Agregar un ejercicio a la rutina
//   const handleAddExercise = (exerciseId) => {
//     // Verificar que el ejercicio existe
//     const exercise = exercises.find(ex => ex.id_ejercicio === parseInt(exerciseId));
    
//     if (!exercise) {
//       console.warn('Ejercicio no encontrado:', exerciseId);
//       return;
//     }
    
//     // Crear un nuevo ejercicio para la rutina con valores por defecto
//     const newRoutineExercise = {
//       id_ejercicio: exercise.id_ejercicio,
//       nombre: exercise.nombre,
//       series: 3,
//       repeticiones: '12',
//       descanso_segundos: 60,
//       orden: selectedExercises.length + 1,
//       notas: ''
//     };
    
//     setSelectedExercises([...selectedExercises, newRoutineExercise]);
//   };
  
//   // Remover un ejercicio de la rutina
//   const handleRemoveExercise = (index) => {
//     const updatedExercises = [...selectedExercises];
//     updatedExercises.splice(index, 1);
    
//     // Actualizar el orden de los ejercicios restantes
//     const reorderedExercises = updatedExercises.map((ex, idx) => ({
//       ...ex,
//       orden: idx + 1
//     }));
    
//     setSelectedExercises(reorderedExercises);
//   };
  
//   // Manejar cambios en los detalles de un ejercicio
//   const handleExerciseDetailChange = (index, field, value) => {
//     const updatedExercises = [...selectedExercises];
//     updatedExercises[index] = {
//       ...updatedExercises[index],
//       [field]: value
//     };
    
//     setSelectedExercises(updatedExercises);
//   };
  
//   // Manejar el movimiento de ejercicios (cambio de orden)
//   const handleMoveExercise = (index, direction) => {
//     if (
//       (direction === 'up' && index === 0) || 
//       (direction === 'down' && index === selectedExercises.length - 1)
//     ) {
//       return; // No hacer nada si intentamos mover más allá de los límites
//     }
    
//     const updatedExercises = [...selectedExercises];
//     const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
//     // Intercambiar elementos
//     [updatedExercises[index], updatedExercises[targetIndex]] = 
//     [updatedExercises[targetIndex], updatedExercises[index]];
    
//     // Actualizar el orden
//     const reorderedExercises = updatedExercises.map((ex, idx) => ({
//       ...ex,
//       orden: idx + 1
//     }));
    
//     setSelectedExercises(reorderedExercises);
//   };
  
//   // Guardar rutina
//   const handleSaveRoutine = async () => {
//     try {
//       // Validar que hay al menos un ejercicio
//       if (selectedExercises.length === 0) {
//         setNotification({
//           type: 'error',
//           message: 'Debes agregar al menos un ejercicio a la rutina'
//         });
//         return;
//       }
      
//       // Validar que la rutina tiene nombre
//       if (!routineData.nombre.trim()) {
//         setNotification({
//           type: 'error',
//           message: 'Debes asignar un nombre a la rutina'
//         });
//         return;
//       }
      
//       setLoading(true);
      
//       // Preparar datos para enviar al servidor
//       const routinePayload = {
//         ...routineData,
//         ejercicios: selectedExercises
//       };
      
//       // Si es para un cliente específico, incluir su ID
//       if (!isNewRoutine && clientId) {
//         routinePayload.id_cliente = parseInt(clientId);
//       }
      
//       console.log('Enviando datos de rutina:', routinePayload);
      
//       try {
//         // Llamar al endpoint correcto según si es para un cliente o una plantilla
//         let response;
//         if (isNewRoutine) {
//           // Si es una rutina genérica (sin cliente específico)
//           response = await api.createRoutineTemplate(routinePayload);
//           setNotification({
//             type: 'success',
//             message: 'Plantilla de rutina creada correctamente'
//           });
//         } else {
//           // Si es para un cliente específico
//           response = await api.createCustomRoutine(routinePayload);
//           setNotification({
//             type: 'success',
//             message: 'Rutina creada y asignada correctamente'
//           });
//         }
        
//         console.log('Respuesta del servidor:', response);
        
//         // Redirigir después de un breve retraso
//         setTimeout(() => {
//           navigate('/coach/InformacionCoach');
//         }, 2000);
//       } catch (apiError) {
//         console.error('Error al guardar rutina:', apiError);
//         setNotification({
//           type: 'error',
//           message: 'Error al guardar la rutina: ' + (apiError.response?.data?.message || apiError.message)
//         });
//         setLoading(false);
//       }
//     } catch (error) {
//       console.error('Error general en handleSaveRoutine:', error);
//       setNotification({
//         type: 'error',
//         message: 'Error inesperado al guardar la rutina'
//       });
//       setLoading(false);
//     }
//   };

//     return (
//       <div className="container">
//         <div className="sidebar">
//           <div className="logo">
//             <div className="logo-circle">
//               <img src="/logo.png" alt="Logo Gimnasio" className='logo-img' />
//             </div>
//           </div>

//           <div className="menu-buttons">
//             <button className="menu-button" onClick={() => navigate('/coach/dashboard')}>Dashboard</button>
//             <button className="menu-button" onClick={() => navigate('/coach/InformacionCoach')}>Rutinas</button>
//             <button className="menu-button" onClick={() => navigate('/coach/data')}>Mi Perfil</button>
//           </div>
//         </div>

//         <div className="main-content">
//           <div className="content-wrapper">
//             {/* Mensaje de error si existe */}
//             {error && (
//               <div className="error-message">
//                 {error}
//                 <button className="error-close" onClick={() => setError(null)}>×</button>
//               </div>
//             )}

//             {notification && (
//               <div className={`notification ${notification.type}`}>
//                 {notification.message}
//               </div>
//             )}

//             {loading && !client ? (
//               <div className="loading-container">
//                 <div className="spinner"></div>
//                 <p>Cargando datos...</p>
//               </div>
//             ) : (
//               <>
//                 <div className="page-header">
//                   <div className="header-title">
//                     <h1 className="page-title">Crear Rutina Personalizada</h1>
//                     <p className="page-subtitle">
//                       Cliente: <strong>{client?.nombre || 'Cargando...'}</strong>
//                     </p>
//                   </div>
//                   <div className="header-actions">
//                     <button
//                       className="back-button"
//                       onClick={() => navigate('/coach/dashboard')}
//                     >
//                       Volver al Dashboard
//                     </button>
//                   </div>
//                 </div>

//                 <div className="routine-creation-container">
//                   {/* Sección de información general de la rutina */}
//                   <div className="routine-section">
//                     <h2 className="section-title">Información de la Rutina</h2>

//                     <div className="form-grid">
//                       <div className="form-group">
//                         <label htmlFor="nombre">Nombre de la Rutina *</label>
//                         <input
//                           type="text"
//                           id="nombre"
//                           name="nombre"
//                           value={routineData.nombre}
//                           onChange={handleInputChange}
//                           placeholder="Ej: Hipertrofia Avanzada"
//                           required
//                         />
//                       </div>

//                       <div className="form-group">
//                         <label htmlFor="objetivo">Objetivo Principal</label>
//                         <select
//                           id="objetivo"
//                           name="objetivo"
//                           value={routineData.objetivo}
//                           onChange={handleInputChange}
//                         >
//                           <option value="">Seleccionar objetivo</option>
//                           <option value="Pérdida de peso">Pérdida de peso</option>
//                           <option value="Hipertrofia">Hipertrofia</option>
//                           <option value="Fuerza">Fuerza</option>
//                           <option value="Resistencia">Resistencia</option>
//                           <option value="Flexibilidad">Flexibilidad</option>
//                           <option value="General">Acondicionamiento general</option>
//                         </select>
//                       </div>

//                       <div className="form-group">
//                         <label htmlFor="nivel_dificultad">Nivel de Dificultad</label>
//                         <select
//                           id="nivel_dificultad"
//                           name="nivel_dificultad"
//                           value={routineData.nivel_dificultad}
//                           onChange={handleInputChange}
//                         >
//                           <option value="principiante">Principiante</option>
//                           <option value="intermedio">Intermedio</option>
//                           <option value="avanzado">Avanzado</option>
//                         </select>
//                       </div>

//                       <div className="form-group">
//                         <label htmlFor="duracion_estimada">Duración Estimada (minutos)</label>
//                         <input
//                           type="number"
//                           id="duracion_estimada"
//                           name="duracion_estimada"
//                           value={routineData.duracion_estimada}
//                           onChange={handleInputChange}
//                           min="10"
//                           max="240"
//                         />
//                       </div>
//                     </div>

//                     <div className="form-group full-width">
//                       <label htmlFor="descripcion">Descripción</label>
//                       <textarea
//                         id="descripcion"
//                         name="descripcion"
//                         value={routineData.descripcion}
//                         onChange={handleInputChange}
//                         placeholder="Describe el propósito y beneficios de esta rutina..."
//                         rows="3"
//                       ></textarea>
//                     </div>
//                   </div>

//                   {/* Sección de selección de ejercicios */}
//                   <div className="routine-section">
//                     <h2 className="section-title">Ejercicios de la Rutina</h2>

//                     <div className="exercise-selector">
//                       <label htmlFor="exercise-search">Agregar ejercicio a la rutina</label>
//                       <div className="exercise-search-container">
//                         <select
//                           id="exercise-search"
//                           className="exercise-search"
//                           onChange={(e) => {
//                             if (e.target.value) {
//                               handleAddExercise(e.target.value);
//                               e.target.value = ""; // Resetear después de agregar
//                             }
//                           }}
//                         >
//                           <option value="">Seleccionar ejercicio</option>
//                           {exercises.map(exercise => (
//                             <option key={exercise.id_ejercicio} value={exercise.id_ejercicio}>
//                               {exercise.nombre}
//                             </option>
//                           ))}
//                         </select>
//                         <div className="exercise-count">
//                           {selectedExercises.length} ejercicios seleccionados
//                         </div>
//                       </div>
//                     </div>

//                     {/* Lista de ejercicios seleccionados */}
//                     <div className="selected-exercises">
//                       {selectedExercises.length === 0 ? (
//                         <div className="no-exercises">
//                           <p>No has seleccionado ningún ejercicio todavía.</p>
//                           <p>Usa el menú de arriba para añadir ejercicios a la rutina.</p>
//                         </div>
//                       ) : (
//                         <div className="exercise-list">
//                           {selectedExercises.map((exercise, index) => (
//                             <div key={`${exercise.id_ejercicio}-${index}`} className="exercise-item">
//                               <div className="exercise-header">
//                                 <div className="exercise-order">
//                                   <span>{index + 1}</span>
//                                   <div className="order-buttons">
//                                     <button
//                                       type="button"
//                                       className="order-button"
//                                       onClick={() => handleMoveExercise(index, 'up')}
//                                       disabled={index === 0}
//                                     >
//                                       ↑
//                                     </button>
//                                     <button
//                                       type="button"
//                                       className="order-button"
//                                       onClick={() => handleMoveExercise(index, 'down')}
//                                       disabled={index === selectedExercises.length - 1}
//                                     >
//                                       ↓
//                                     </button>
//                                   </div>
//                                 </div>
//                                 <h3 className="exercise-name">{exercise.nombre}</h3>
//                                 <button
//                                   type="button"
//                                   className="remove-exercise"
//                                   onClick={() => handleRemoveExercise(index)}
//                                 >
//                                   ×
//                                 </button>
//                               </div>

//                               <div className="exercise-details">
//                                 <div className="detail-group">
//                                   <label>Series</label>
//                                   <input
//                                     type="number"
//                                     value={exercise.series}
//                                     onChange={(e) => handleExerciseDetailChange(index, 'series', parseInt(e.target.value))}
//                                     min="1"
//                                     max="20"
//                                   />
//                                 </div>

//                                 <div className="detail-group">
//                                   <label>Repeticiones</label>
//                                   <input
//                                     type="text"
//                                     value={exercise.repeticiones}
//                                     onChange={(e) => handleExerciseDetailChange(index, 'repeticiones', e.target.value)}
//                                     placeholder="Ej: 12 o 8-12"
//                                   />
//                                 </div>

//                                 <div className="detail-group">
//                                   <label>Descanso (seg)</label>
//                                   <input
//                                     type="number"
//                                     value={exercise.descanso_segundos}
//                                     onChange={(e) => handleExerciseDetailChange(index, 'descanso_segundos', parseInt(e.target.value))}
//                                     min="0"
//                                     max="300"
//                                   />
//                                 </div>
//                               </div>

//                               <div className="exercise-notes">
//                                 <label>Notas específicas para este ejercicio</label>
//                                 <textarea
//                                   value={exercise.notas || ''}
//                                   onChange={(e) => handleExerciseDetailChange(index, 'notas', e.target.value)}
//                                   placeholder="Instrucciones especiales, modificaciones, etc."
//                                   rows="2"
//                                 ></textarea>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Botones de acción */}
//                   <div className="action-buttons">
//                     <button
//                       type="button"
//                       className="cancel-button"
//                       onClick={() => {
//                         if (window.confirm('¿Estás seguro de cancelar? Se perderán todos los cambios.')) {
//                           navigate('/coach/dashboard');
//                         }
//                       }}
//                     >
//                       Cancelar
//                     </button>

//                     <button
//                       type="button"
//                       className="save-button"
//                       onClick={handleSaveRoutine}
//                       disabled={loading || selectedExercises.length === 0 || !routineData.nombre}
//                     >
//                       {loading ? 'Guardando...' : 'Guardar y Asignar Rutina'}
//                     </button>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }
// };

// export default CustomRoutine;

// client/src/pages/coach/CustomRoutineForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './CoachStyles.css';

const CustomRoutineForm = () => {
  const { clientId = 'new' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

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

        // Cargar ejercicios disponibles
        const exercisesResponse = await api.getExercises();
        setAvailableExercises(exercisesResponse.data || []);

        // Cargar clientes del entrenador
        const clientsResponse = await api.getCoachClients();
        setClients(clientsResponse.data || []);

        // Si hay un ID de cliente específico, buscar ese cliente
        if (clientId !== 'new') {
          const client = clientsResponse.data.find(c => c.id_usuario.toString() === clientId);
          if (client) {
            setSelectedClient(client);
          } else {
            // Si no se encuentra, mostrar error
            setError('Cliente no encontrado o no asignado a este entrenador');
          }
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
    if (isForSpecificClient && !selectedClient) {
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

      // Preparar datos para la API
      const routineData = {
        ...formData,
        // Si es para un cliente específico, incluir el ID del cliente
        id_cliente: isForSpecificClient ? (selectedClient?.id_usuario || null) : null,
        ejercicios: exercises.map(ex => ({
          ...ex,
          id_ejercicio: parseInt(ex.id_ejercicio),
          series: parseInt(ex.series),
          descanso_segundos: parseInt(ex.descanso_segundos)
        }))
      };

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

                {isForSpecificClient && (
                  <div className="form-group">
                    <label htmlFor="client_id">Cliente</label>
                    <select
                      id="client_id"
                      value={selectedClient?.id_usuario || ''}
                      onChange={(e) => {
                        const client = clients.find(c => c.id_usuario.toString() === e.target.value);
                        setSelectedClient(client || null);
                      }}
                      disabled={clientId !== 'new'} // Deshabilitar si ya se eligió un cliente en la URL
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
                  disabled={submitting}
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