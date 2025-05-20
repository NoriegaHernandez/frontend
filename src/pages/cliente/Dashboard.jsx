
// // client/src/pages/cliente/Dashboard.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import api from '../../services/api';
// import './ClientStyles.css';

// const ClienteDashboard = () => {
//     const { user } = useAuth();
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [activeRoutine, setActiveRoutine] = useState(null);
//     const [trainingDays, setTrainingDays] = useState([]);
//     const [exercises, setExercises] = useState([]);
//     const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
//     const [selectedDay, setSelectedDay] = useState(null);

//     useEffect(() => {
//         const fetchActiveRoutine = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);

//                 // Obtener la rutina activa para el día actual por defecto
//                 const routineResponse = await api.getClientActiveRoutine();

//                 if (routineResponse.data && routineResponse.data.data) {
//                     setActiveRoutine(routineResponse.data.data);

//                     // Obtener los días de entrenamiento
//                     const daysResponse = await api.getRoutineTrainingDays(routineResponse.data.data.id_asignacion_rutina);
//                     setTrainingDays(daysResponse.data || []);

//                     // Obtener los ejercicios de la rutina
//                     const exercisesResponse = await api.getRoutineExercises(routineResponse.data.data.id_rutina);
//                     setExercises(exercisesResponse.data || []);

//                     // Determinar día seleccionado
//                     const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
//                     const today = days[new Date().getDay()];

//                     const todayTraining = daysResponse.data?.find(
//                         day => day.dia_semana.toLowerCase() === today
//                     );

//                     if (todayTraining) {
//                         setSelectedDay(today);
//                     } else if (daysResponse.data && daysResponse.data.length > 0) {
//                         setSelectedDay(daysResponse.data[0].dia_semana);
//                     }
//                 } else {
//                     // Obtener todas las rutinas del cliente para listar los días de entrenamiento
//                     const allRoutinesResponse = await api.getClientRoutines();
//                     if (allRoutinesResponse.data && allRoutinesResponse.data.length > 0) {
//                         // Recopilamos todos los días de entrenamiento de todas las rutinas
//                         const allDays = [];

//                         for (const routine of allRoutinesResponse.data) {
//                             const daysResponse = await api.getRoutineTrainingDays(routine.id_asignacion_rutina);
//                             if (daysResponse.data && daysResponse.data.length > 0) {
//                                 for (const day of daysResponse.data) {
//                                     allDays.push({
//                                         ...day,
//                                         id_asignacion_rutina: routine.id_asignacion_rutina,
//                                         id_rutina: routine.id_rutina
//                                     });
//                                 }
//                             }
//                         }

//                         setTrainingDays(allDays);

//                         // Si hay días disponibles, seleccionar el día actual o el primero
//                         if (allDays.length > 0) {
//                             const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
//                             const today = days[new Date().getDay()];

//                             const todayTraining = allDays.find(
//                                 day => day.dia_semana.toLowerCase() === today
//                             );

//                             if (todayTraining) {
//                                 setSelectedDay(today);
//                                 // Cargar la rutina del día seleccionado
//                                 await loadRoutineForDay(today);
//                             } else if (allDays.length > 0) {
//                                 setSelectedDay(allDays[0].dia_semana);
//                                 // Cargar la rutina del primer día disponible
//                                 await loadRoutineForDay(allDays[0].dia_semana);
//                             }
//                         }
//                     }
//                 }

//                 setLoading(false);
//             } catch (error) {
//                 console.error('Error al cargar la rutina activa:', error);
//                 setError('No se pudo cargar tu rutina actual. Por favor, intenta nuevamente.');
//                 setLoading(false);
//             }
//         };

//         fetchActiveRoutine();
//     }, []);
//     // Agregar una función para cargar la rutina de un día específico
//     const loadRoutineForDay = async (day) => {
//         try {
//             setLoading(true);

//             // Buscar la asignación de rutina para el día seleccionado
//             const dayAssignment = trainingDays.find(d => d.dia_semana.toLowerCase() === day.toLowerCase());

//             if (dayAssignment) {
//                 // Obtener la rutina específica para ese día
//                 const routineResponse = await api.getClientActiveRoutine(day);

//                 if (routineResponse.data && routineResponse.data.data) {
//                     setActiveRoutine(routineResponse.data.data);

//                     // Obtener los ejercicios de la rutina
//                     const exercisesResponse = await api.getRoutineExercises(routineResponse.data.data.id_rutina);
//                     setExercises(exercisesResponse.data || []);
//                     setCurrentExerciseIndex(0); // Reiniciar el índice de ejercicios
//                 }
//             } else {
//                 setActiveRoutine(null);
//                 setExercises([]);
//             }

//             setLoading(false);
//         } catch (error) {
//             console.error(`Error al cargar la rutina para el día ${day}:`, error);
//             setLoading(false);
//         }
//     };
//     // Modificar el manejador de selección de día
//     const handleDaySelect = async (day) => {
//         setSelectedDay(day);
//         await loadRoutineForDay(day);
//     };
//     // Función para navegar entre ejercicios
//     const changeExercise = (direction) => {
//         if (!exercises || exercises.length === 0) return;

//         if (direction === 'next') {
//             setCurrentExerciseIndex(prevIndex =>
//                 prevIndex < exercises.length - 1 ? prevIndex + 1 : 0
//             );
//         } else {
//             setCurrentExerciseIndex(prevIndex =>
//                 prevIndex > 0 ? prevIndex - 1 : exercises.length - 1
//             );
//         }
//     };

//     // Formatear días para mostrar con primera letra mayúscula
//     const formatDayName = (day) => {
//         return day.charAt(0).toUpperCase() + day.slice(1);
//     };

//     // Verificar si hoy es día de entrenamiento
//     const isTodayTrainingDay = () => {
//         const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
//         const today = days[new Date().getDay()];
//         return trainingDays.some(day => day.dia_semana.toLowerCase() === today);
//     };

//     // Ordenar días de la semana según su orden natural
//     const orderDays = (days) => {
//         const daysOrder = { 'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'domingo': 7 };

//         return [...days].sort((a, b) =>
//             daysOrder[a.dia_semana.toLowerCase()] - daysOrder[b.dia_semana.toLowerCase()]
//         );
//     };

//     if (loading) {
//         return (
//             <div className="loading-container">
//                 <div className="spinner"></div>
//                 <p>Cargando tu rutina...</p>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="error-message">
//                 <h3>Error</h3>
//                 <p>{error}</p>
//                 <button onClick={() => window.location.reload()} className="retry-button">
//                     Intentar nuevamente
//                 </button>
//             </div>
//         );
//     }

//     if (!activeRoutine) {
//         return (
//             <div className="container">
//                 <div className="sidebar">
//                     <div className="logo">
//                         <div className="logo-circle">
//                             <img src="/logo.png" alt="Logo Gimnasio" className='logo-img' />
//                         </div>
//                     </div>
//                     <div className="menu-buttons">
//                         <button className="menu-button" onClick={() => navigate('/cliente/dashboard')}>Inicio</button>
//                         <button className="menu-button" onClick={() => navigate('/cliente/informacion')}>Información</button>
//                         <button className="menu-button active">Mi Rutina</button>
//                         <button className="menu-button" onClick={() => navigate('/cliente/membresia')}>Membresía</button>
//                         <button className="menu-button" onClick={() => navigate('/cliente/entrenadores')}>Entrenadores</button>
//                     </div>
//                 </div>

//                 <div className="main-content">
//                     <div className="no-routine-container">
//                         <div className="no-routine-icon">
//                             <i className="fas fa-dumbbell"></i>
//                         </div>
//                         <h2>No tienes una rutina asignada</h2>
//                         <p>Tu entrenador aún no te ha asignado una rutina. Contacta con él para obtener tu plan de entrenamiento.</p>
//                         <button
//                             className="primary-button"
//                             onClick={() => navigate('/cliente/entrenadores')}
//                         >
//                             Ver entrenadores disponibles
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="container">
//             <div className="sidebar">
//                 <div className="logo">
//                     <div className="logo-circle">
//                         <img src="/logo.png" alt="Logo Gimnasio" className='logo-img' />
//                     </div>
//                 </div>
//                 <div className="menu-buttons">
//                     <button className="menu-button" onClick={() => navigate('/cliente/dashboard')}>Inicio</button>
//                     <button className="menu-button" onClick={() => navigate('/cliente/informacion')}>Información</button>
//                     <button className="menu-button active">Mi Rutina</button>
//                     <button className="menu-button" onClick={() => navigate('/cliente/membresia')}>Membresía</button>
//                     <button className="menu-button" onClick={() => navigate('/cliente/entrenadores')}>Entrenadores</button>
//                 </div>
//             </div>

//             <div className="main-content">
//                 <div className="content-wrapper">
//                     <div className="routine-header">
//                         <h1>{activeRoutine.nombre_rutina}</h1>
//                         <div className="routine-meta">
//                             <span className={`difficulty-badge ${activeRoutine.nivel_dificultad}`}>
//                                 {activeRoutine.nivel_dificultad}
//                             </span>
//                             <span className="routine-duration">
//                                 <i className="far fa-clock"></i> {activeRoutine.duracion_estimada || '?'} min
//                             </span>
//                         </div>

//                         {activeRoutine.objetivo && (
//                             <div className="routine-objective">
//                                 <strong>Objetivo:</strong> {activeRoutine.objetivo}
//                             </div>
//                         )}
//                     </div>

//                     {isTodayTrainingDay() && (
//                         <div className="today-is-training-day">
//                             <div className="training-badge">¡HOY TOCA ENTRENAR!</div>
//                             <p>Hoy es día de realizar esta rutina. ¡A por ello!</p>
//                         </div>
//                     )}

//                     <div className="training-days-container">
//                         <h2>Días de entrenamiento</h2>
//                         {/* En la sección de los días de entrenamiento */}
//                         <div className="days-tabs">
//                             {orderDays(trainingDays).map(day => (
//                                 <button
//                                     key={day.dia_semana}
//                                     className={`day-tab ${selectedDay === day.dia_semana ? 'active' : ''}`}
//                                     onClick={() => handleDaySelect(day.dia_semana)}
//                                 >
//                                     {formatDayName(day.dia_semana)}
//                                     {day.dia_semana.toLowerCase() === new Date().toLocaleDateString('es-ES', { weekday: 'long' }) && (
//                                         <span className="today-indicator">Hoy</span>
//                                     )}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>

//                     {exercises.length > 0 ? (
//                         <div className="exercises-display">
//                             <div className="exercise-container">
//                                 <div className="exercise-header">
//                                     <h3>Ejercicio {currentExerciseIndex + 1} de {exercises.length}</h3>
//                                     <div className="exercise-name">{exercises[currentExerciseIndex].nombre}</div>
//                                 </div>

//                                 <div className="exercise-content">
//                                     <div className="exercise-image">
//                                         <img
//                                             src={exercises[currentExerciseIndex].imagen_url || "/src/assets/images/workout-placeholder.png"}
//                                             alt={exercises[currentExerciseIndex].nombre}
//                                         />
//                                     </div>

//                                     <div className="exercise-details">
//                                         <div className="exercise-stats">
//                                             <div className="stat">
//                                                 <div className="stat-value">{exercises[currentExerciseIndex].series}</div>
//                                                 <div className="stat-label">Series</div>
//                                             </div>
//                                             <div className="stat">
//                                                 <div className="stat-value">{exercises[currentExerciseIndex].repeticiones}</div>
//                                                 <div className="stat-label">Reps</div>
//                                             </div>
//                                             {exercises[currentExerciseIndex].descanso_segundos && (
//                                                 <div className="stat">
//                                                     <div className="stat-value">{Math.floor(exercises[currentExerciseIndex].descanso_segundos / 60)}:{(exercises[currentExerciseIndex].descanso_segundos % 60).toString().padStart(2, '0')}</div>
//                                                     <div className="stat-label">Descanso</div>
//                                                 </div>
//                                             )}
//                                         </div>

//                                         <div className="exercise-instructions">
//                                             {exercises[currentExerciseIndex].instrucciones ||
//                                                 exercises[currentExerciseIndex].descripcion ||
//                                                 "No hay instrucciones disponibles para este ejercicio."}
//                                         </div>

//                                         {exercises[currentExerciseIndex].notas && (
//                                             <div className="exercise-notes">
//                                                 <strong>Notas:</strong> {exercises[currentExerciseIndex].notas}
//                                             </div>
//                                         )}

//                                         <div className="exercise-muscles">
//                                             <strong>Grupos musculares:</strong> {exercises[currentExerciseIndex].grupos_musculares || 'No especificado'}
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="navigation-buttons">
//                                     <button className="nav-button" onClick={() => changeExercise('prev')}>
//                                         Anterior
//                                     </button>
//                                     <button className="nav-button" onClick={() => changeExercise('next')}>
//                                         Siguiente
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="no-exercises">
//                             <p>No hay ejercicios definidos para esta rutina.</p>
//                         </div>
//                     )}

//                     <div className="routine-footer">
//                         <p>
//                             <strong>Asignada por:</strong> {activeRoutine.nombre_coach}<br />
//                             <strong>Fecha de inicio:</strong> {new Date(activeRoutine.fecha_inicio).toLocaleDateString()}<br />
//                             {activeRoutine.fecha_fin && (
//                                 <><strong>Fecha de fin:</strong> {new Date(activeRoutine.fecha_fin).toLocaleDateString()}</>
//                             )}
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ClienteDashboard;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './ClientStyles.css';

const ClienteDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeRoutine, setActiveRoutine] = useState(null);
    const [allRoutines, setAllRoutines] = useState([]);
    const [trainingDays, setTrainingDays] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [selectedDay, setSelectedDay] = useState(null);

    // Función para cargar la rutina de un día específico
    const loadRoutineForDay = async (day) => {
        try {
            setLoading(true);

            // Buscar si ya tenemos la rutina para este día en nuestras rutinas cargadas
            let foundRoutine = null;
            
            // Buscar en allRoutines si alguna tiene este día asignado
            for (const routine of allRoutines) {
                if (routine.dias_entrenamiento && routine.dias_entrenamiento.some(d => d.dia_semana.toLowerCase() === day.toLowerCase())) {
                    foundRoutine = routine;
                    break;
                }
            }

            // Si encontramos una rutina, establecerla como activa
            if (foundRoutine) {
                setActiveRoutine(foundRoutine);
                
                // Obtener los ejercicios de la rutina
                const exercisesResponse = await api.getRoutineExercises(foundRoutine.id_rutina);
                if (exercisesResponse.data) {
                    setExercises(exercisesResponse.data);
                    setCurrentExerciseIndex(0); // Reiniciar el índice de ejercicios
                }
            } else {
                // Si no encontramos, intentar cargarla desde el servidor
                const routineResponse = await api.getClientActiveRoutine(day);
                
                if (routineResponse.data && routineResponse.data.data) {
                    setActiveRoutine(routineResponse.data.data);
                    
                    // Obtener los ejercicios de la rutina
                    const exercisesResponse = await api.getRoutineExercises(routineResponse.data.data.id_rutina);
                    if (exercisesResponse.data) {
                        setExercises(exercisesResponse.data);
                        setCurrentExerciseIndex(0); // Reiniciar el índice de ejercicios
                    }
                } else {
                    console.log(`No hay rutina para el día ${day}`);
                    // Si no hay rutina para este día, mantener la rutina actual pero mostrar mensaje
                    // o se podría establecer a null para mostrar un mensaje de "No hay rutina"
                }
            }
            
            setLoading(false);
        } catch (error) {
            console.error(`Error al cargar la rutina para el día ${day}:`, error);
            setLoading(false);
        }
    };

    // Carga inicial de datos
    useEffect(() => {
        const fetchRoutineData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Obtener la rutina activa y todas las rutinas
                const routineResponse = await api.getClientActiveRoutine();
                
                if (routineResponse.data) {
                    // Si hay una rutina activa
                    if (routineResponse.data.data) {
                        setActiveRoutine(routineResponse.data.data);
                        
                        // Si también tenemos todas las rutinas
                        if (routineResponse.data.all_routines) {
                            setAllRoutines(routineResponse.data.all_routines);
                            
                            // Recopilar todos los días de todas las rutinas
                            const allDays = [];
                            routineResponse.data.all_routines.forEach(routine => {
                                if (routine.dias_entrenamiento) {
                                    routine.dias_entrenamiento.forEach(day => {
                                        allDays.push({
                                            ...day,
                                            id_asignacion_rutina: routine.id_asignacion_rutina,
                                            id_rutina: routine.id_rutina,
                                            routine_name: routine.nombre_rutina
                                        });
                                    });
                                }
                            });
                            
                            setTrainingDays(allDays);
                        } else {
                            // Si solo tenemos la rutina activa, obtener sus días
                            const daysResponse = await api.getRoutineTrainingDays(routineResponse.data.data.id_asignacion_rutina);
                            if (daysResponse.data) {
                                setTrainingDays(daysResponse.data.map(day => ({
                                    ...day,
                                    id_asignacion_rutina: routineResponse.data.data.id_asignacion_rutina,
                                    id_rutina: routineResponse.data.data.id_rutina,
                                    routine_name: routineResponse.data.data.nombre_rutina
                                })));
                            }
                        }
                        
                        // Obtener los ejercicios de la rutina activa
                        const exercisesResponse = await api.getRoutineExercises(routineResponse.data.data.id_rutina);
                        if (exercisesResponse.data) {
                            setExercises(exercisesResponse.data);
                        }
                        
                        // Determinar el día seleccionado (hoy o el primer día disponible)
                        const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
                        const today = days[new Date().getDay()];
                        
                        // Ver si la rutina actual tiene este día asignado
                        const hasToday = routineResponse.data.data.dias_entrenamiento && 
                                        routineResponse.data.data.dias_entrenamiento.some(
                                            day => day.dia_semana.toLowerCase() === today
                                        );
                        
                        if (hasToday) {
                            setSelectedDay(today);
                        } else if (routineResponse.data.data.dias_entrenamiento && 
                                  routineResponse.data.data.dias_entrenamiento.length > 0) {
                            setSelectedDay(routineResponse.data.data.dias_entrenamiento[0].dia_semana);
                        } else if (trainingDays.length > 0) {
                            setSelectedDay(trainingDays[0].dia_semana);
                        }
                    } else {
                        // No hay rutina activa
                        console.log('No hay rutina activa asignada');
                    }
                }
                
                setLoading(false);
            } catch (error) {
                console.error('Error al cargar los datos de rutina:', error);
                setError('No se pudieron cargar tus rutinas. Por favor, intenta nuevamente.');
                setLoading(false);
            }
        };

        fetchRoutineData();
    }, []);

    // Manejar la selección de un día
    const handleDaySelect = async (day) => {
        setSelectedDay(day);
        await loadRoutineForDay(day);
    };

    // Función para navegar entre ejercicios
    const changeExercise = (direction) => {
        if (!exercises || exercises.length === 0) return;
        
        if (direction === 'next') {
            setCurrentExerciseIndex(prevIndex => 
                prevIndex < exercises.length - 1 ? prevIndex + 1 : 0
            );
        } else {
            setCurrentExerciseIndex(prevIndex => 
                prevIndex > 0 ? prevIndex - 1 : exercises.length - 1
            );
        }
    };

    // Formatear días para mostrar con primera letra mayúscula
    const formatDayName = (day) => {
        return day.charAt(0).toUpperCase() + day.slice(1);
    };

    // Verificar si hoy es día de entrenamiento
    const isTodayTrainingDay = () => {
        const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const today = days[new Date().getDay()];
        return trainingDays.some(day => day.dia_semana.toLowerCase() === today);
    };

    // Ordenar días de la semana según su orden natural
    const orderDays = (days) => {
        const daysOrder = { 'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'domingo': 7 };
        
        return [...days].sort((a, b) => 
            daysOrder[a.dia_semana.toLowerCase()] - daysOrder[b.dia_semana.toLowerCase()]
        );
    };

    // Agrupar días por rutina (para mostrar etiquetas)
    const groupDaysByRoutine = (days) => {
        const routineMap = new Map();
        
        days.forEach(day => {
            if (!routineMap.has(day.id_rutina)) {
                routineMap.set(day.id_rutina, {
                    id_rutina: day.id_rutina,
                    nombre_rutina: day.routine_name,
                    dias: []
                });
            }
            
            routineMap.get(day.id_rutina).dias.push(day);
        });
        
        return Array.from(routineMap.values());
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando tu rutina...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message">
                <h3>Error</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="retry-button">
                    Intentar nuevamente
                </button>
            </div>
        );
    }

    if (!activeRoutine) {
        return (
            <div className="container">
                <div className="sidebar">
                    <div className="logo">
                        <div className="logo-circle">
                            <img src="/logo.png" alt="Logo Gimnasio" className='logo-img' />
                        </div>
                    </div>
                    <div className="menu-buttons">
                        <button className="menu-button" onClick={() => navigate('/cliente/dashboard')}>Inicio</button>
                        <button className="menu-button" onClick={() => navigate('/cliente/informacion')}>Información</button>
                        <button className="menu-button active">Mi Rutina</button>
                        <button className="menu-button" onClick={() => navigate('/cliente/membresia')}>Membresía</button>
                        <button className="menu-button" onClick={() => navigate('/cliente/entrenadores')}>Entrenadores</button>
                                  <button className="menu-button" onClick={handleLogout}>Cerrar sesión</button>

                    </div>
                </div>

                <div className="main-content">
                    <div className="no-routine-container">
                        <div className="no-routine-icon">
                            <i className="fas fa-dumbbell"></i>
                        </div>
                        <h2>No tienes una rutina asignada</h2>
                        <p>Tu entrenador aún no te ha asignado una rutina. Contacta con él para obtener tu plan de entrenamiento.</p>
                        <button 
                            className="primary-button"
                            onClick={() => navigate('/cliente/entrenadores')}
                        >
                            Ver entrenadores disponibles
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Agrupar días por rutina para mostrar etiquetas
    const routineGroups = groupDaysByRoutine(trainingDays);

    return (
        <div className="container">
            <div className="sidebar">
                <div className="logo">
                    <div className="logo-circle">
                        <img src="/logo.png" alt="Logo Gimnasio" className='logo-img' />
                    </div>
                </div>
                <div className="menu-buttons">
                    <button className="menu-button" onClick={() => navigate('/cliente/dashboard')}>Inicio</button>
                    <button className="menu-button" onClick={() => navigate('/cliente/informacion')}>Información</button>
                    <button className="menu-button active">Mi Rutina</button>
                    <button className="menu-button" onClick={() => navigate('/cliente/membresia')}>Membresía</button>
                    <button className="menu-button" onClick={() => navigate('/cliente/entrenadores')}>Entrenadores</button>
                </div>
            </div>

            <div className="main-content">
                <div className="content-wrapper">
                    <div className="routine-header">
                        <h1>{activeRoutine.nombre_rutina}</h1>
                        <div className="routine-meta">
                            <span className={`difficulty-badge ${activeRoutine.nivel_dificultad}`}>
                                {activeRoutine.nivel_dificultad}
                            </span>
                            <span className="routine-duration">
                                <i className="far fa-clock"></i> {activeRoutine.duracion_estimada || '?'} min
                            </span>
                        </div>
                        
                        {activeRoutine.objetivo && (
                            <div className="routine-objective">
                                <strong>Objetivo:</strong> {activeRoutine.objetivo}
                            </div>
                        )}
                    </div>

                    {isTodayTrainingDay() && (
                        <div className="today-is-training-day">
                            <div className="training-badge">¡HOY TOCA ENTRENAR!</div>
                            <p>Hoy es día de realizar esta rutina. ¡A por ello!</p>
                        </div>
                    )}

                    <div className="training-days-container">
                        <h2>Tu plan de entrenamiento semanal</h2>
                        
                        {/* Mostrar etiquetas por rutina */}
                        {routineGroups.length > 1 && (
                            <div className="routine-groups">
                                {routineGroups.map(group => (
                                    <div key={group.id_rutina} className="routine-group">
                                        <div className="routine-group-header">
                                            <span className="routine-name">{group.nombre_rutina}</span>
                                            <div className="routine-days-pills">
                                                {orderDays(group.dias).map(day => (
                                                    <span key={day.id_dia_entrenamiento} className="day-pill">
                                                        {formatDayName(day.dia_semana).substring(0, 3)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="days-tabs">
                            {orderDays(trainingDays).map(day => {
                                // Determinar si este día corresponde a la rutina activa
                                const isFromActiveRoutine = day.id_rutina === activeRoutine.id_rutina;
                                
                                return (
                                    <button 
                                        key={day.id_dia_entrenamiento}
                                        className={`day-tab ${selectedDay === day.dia_semana ? 'active' : ''} ${isFromActiveRoutine ? 'current-routine' : 'other-routine'}`}
                                        onClick={() => handleDaySelect(day.dia_semana)}
                                    >
                                        {formatDayName(day.dia_semana)}
                                        {day.dia_semana.toLowerCase() === new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase() && (
                                            <span className="today-indicator">Hoy</span>
                                        )}
                                        {routineGroups.length > 1 && (
                                            <span className="routine-indicator" title={day.routine_name}></span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {exercises.length > 0 ? (
                        <div className="exercises-display">
                            <div className="exercise-container">
                                <div className="exercise-header">
                                    <h3>Ejercicio {currentExerciseIndex + 1} de {exercises.length}</h3>
                                    <div className="exercise-name">{exercises[currentExerciseIndex].nombre}</div>
                                </div>
                                
                                <div className="exercise-content">
                                    {/* <div className="exercise-image">
                                        <img 
                                            src={exercises[currentExerciseIndex].imagen_url || "/src/assets/images/workout-placeholder.png"} 
                                            alt={exercises[currentExerciseIndex].nombre} 
                                        />
                                    </div> */}
                                    
                                    <div className="exercise-details">
                                        <div className="exercise-stats">
                                            <div className="stat">
                                                <div className="stat-value">{exercises[currentExerciseIndex].series}</div>
                                                <div className="stat-label">Series</div>
                                            </div>
                                            <div className="stat">
                                                <div className="stat-value">{exercises[currentExerciseIndex].repeticiones}</div>
                                                <div className="stat-label">Reps</div>
                                            </div>
                                            {exercises[currentExerciseIndex].descanso_segundos && (
                                                <div className="stat">
                                                    <div className="stat-value">{Math.floor(exercises[currentExerciseIndex].descanso_segundos / 60)}:{(exercises[currentExerciseIndex].descanso_segundos % 60).toString().padStart(2, '0')}</div>
                                                    <div className="stat-label">Descanso</div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="exercise-instructions">
                                            {exercises[currentExerciseIndex].instrucciones || 
                                             exercises[currentExerciseIndex].descripcion || 
                                             "No hay instrucciones disponibles para este ejercicio."}
                                        </div>
                                        
                                        {exercises[currentExerciseIndex].notas && (
                                            <div className="exercise-notes">
                                                <strong>Notas:</strong> {exercises[currentExerciseIndex].notas}
                                            </div>
                                        )}

                                        <div className="exercise-muscles">
                                            <strong>Grupos musculares:</strong> {exercises[currentExerciseIndex].grupos_musculares || 'No especificado'}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="navigation-buttons">
                                    <button className="nav-button" onClick={() => changeExercise('prev')}>
                                        Anterior
                                    </button>
                                    <button className="nav-button" onClick={() => changeExercise('next')}>
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="no-exercises">
                            <p>No hay ejercicios definidos para esta rutina.</p>
                        </div>
                    )}

                    <div className="routine-footer">
                        <p>
                            <strong>Asignada por:</strong> {activeRoutine.nombre_coach}<br />
                            <strong>Fecha de inicio:</strong> {new Date(activeRoutine.fecha_inicio).toLocaleDateString()}<br />
                            {activeRoutine.fecha_fin && (
                                <><strong>Fecha de fin:</strong> {new Date(activeRoutine.fecha_fin).toLocaleDateString()}</>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClienteDashboard;