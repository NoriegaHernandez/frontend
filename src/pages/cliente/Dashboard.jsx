// // client/src/pages/cliente/Dashboard.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import api from '../../services/api'; // Asegúrate de importar el servicio API
// import './Dashboard.css';

// const ClienteDashboard = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [currentExercise, setCurrentExercise] = useState(1);
//   const [hasCoach, setHasCoach] = useState(false);
//   const [isFirstLogin, setIsFirstLogin] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Nuevo estado para las rutinas
//   const [routines, setRoutines] = useState([]);
//   const [currentRoutineIndex, setCurrentRoutineIndex] = useState(0);
//   const [totalExercises, setTotalExercises] = useState(0);
  
//   // Efecto para cargar datos del usuario y verificar coach
//   useEffect(() => {
//     // Verificar si el usuario está autenticado
//     if (!user) {
//       navigate('/login');
//       return;
//     }
    
//     // Verificar si el usuario tiene un entrenador asignado
//     const checkCoachStatus = async () => {
//       try {
//         setLoading(true);
        
//         // Intentar obtener las rutinas asignadas
//         try {
//           const routinesResponse = await api.getClientRoutines();
          
//           // Si tiene rutinas asignadas, entonces tiene un coach
//           if (routinesResponse.data && routinesResponse.data.length > 0) {
//             setHasCoach(true);
//             setRoutines(routinesResponse.data);
//             setTotalExercises(routinesResponse.data[0].ejercicios?.length || 0);
//           } else {
//             // Si no tiene rutinas, verificar explícitamente si tiene coach
//             try {
//               const coachResponse = await api.getCoachStatus();
//               setHasCoach(coachResponse.data?.hasCoach || false);
//             } catch (coachError) {
//               console.error('Error al verificar estado del coach:', coachError);
//               setHasCoach(false);
//             }
//           }
//         } catch (routinesError) {
//           console.error('Error al obtener rutinas:', routinesError);
          
//           // Verificar si tiene coach a pesar del error con las rutinas
//           try {
//             const coachResponse = await api.getCoachStatus();
//             setHasCoach(coachResponse.data?.hasCoach || false);
//           } catch (coachError) {
//             console.error('Error al verificar estado del coach:', coachError);
//             setHasCoach(false);
//           }
//         }
        
//         // Verificar si es primera vez (esto debe venir idealmente de la API o localStorage)
//         const isFirstTime = localStorage.getItem('isFirstLogin') !== 'false';
//         setIsFirstLogin(isFirstTime);
        
//         if (isFirstTime) {
//           localStorage.setItem('isFirstLogin', 'false');
//         }
        
//         setLoading(false);
//       } catch (error) {
//         console.error('Error al verificar estado del entrenador:', error);
//         setError('Error al cargar datos. Por favor, intenta nuevamente.');
//         setLoading(false);
//       }
//     };
    
//     checkCoachStatus();
//   }, [user, navigate]);
  
//   // Función para cambiar entre ejercicios de la rutina activa
//   const changeExercise = (direction) => {
//     if (!routines.length || !routines[currentRoutineIndex]?.ejercicios?.length) {
//       return;
//     }
    
//     const exercises = routines[currentRoutineIndex].ejercicios;
//     const maxExercises = exercises.length;
    
//     if (direction === 'next') {
//       setCurrentExercise(currentExercise < maxExercises ? currentExercise + 1 : 1);
//     } else {
//       setCurrentExercise(currentExercise > 1 ? currentExercise - 1 : maxExercises);
//     }
//   };
  
//   // Función para cambiar entre rutinas
//   const changeRoutine = (direction) => {
//     if (!routines.length) {
//       return;
//     }
    
//     if (direction === 'next') {
//       setCurrentRoutineIndex((currentRoutineIndex + 1) % routines.length);
//     } else {
//       setCurrentRoutineIndex(currentRoutineIndex > 0 ? currentRoutineIndex - 1 : routines.length - 1);
//     }
    
//     // Resetear el ejercicio actual al cambiar de rutina
//     setCurrentExercise(1);
//     // Actualizar el total de ejercicios
//     setTotalExercises(routines[(currentRoutineIndex + 1) % routines.length]?.ejercicios?.length || 0);
//   };
  
//   // Manejar el cierre de sesión
//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };
  
//   // Renderizar los ejercicios de la rutina activa
//   const renderExercises = () => {
//     if (!hasCoach || !routines.length || !routines[currentRoutineIndex]?.ejercicios?.length) {
//       return (
//         <div className="no-exercises-message">
//           <p>No tienes ejercicios asignados actualmente.</p>
//           {!hasCoach && (
//             <button 
//               className="coach-button primary"
//               onClick={() => navigate('/cliente/entrenadores')}
//             >
//               Buscar un entrenador
//             </button>
//           )}
//         </div>
//       );
//     }
    
//     const currentRoutine = routines[currentRoutineIndex];
//     const exercises = currentRoutine.ejercicios;
    
//     return exercises.map((exercise, index) => {
//       const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
//       const dayIndex = index % 7; // Asignar día de la semana según el índice (esto es solo un ejemplo)
      
//       return (
//         <div 
//           key={exercise.id_ejercicio}
//           className="exercise-container" 
//           id={`exercise-${index + 1}`} 
//           style={{display: currentExercise === index + 1 ? 'block' : 'none'}}
//         >
//           <div className="day-heading">
//             <h2>{dayNames[dayIndex]}</h2>
//             <h2>Entrenamiento: <span>{exercise.grupos_musculares || 'General'}</span></h2>
//           </div>
          
//           <div className="exercise-content">
//             <div className="exercise-image">
//               <img 
//                 src={exercise.imagen_url || "/src/assets/images/workout-placeholder.png"} 
//                 alt={exercise.nombre} 
//                 width="250" 
//                 height="250" 
//               />
//             </div>
            
//             <div className="exercise-details" style={{textAlign: 'center'}}>
//               <h3 className="exercise-title">Ejercicio: {exercise.nombre}</h3>
//               <div className="exercise-description" style={{textAlign: 'center'}}>
//                 {exercise.instrucciones || exercise.descripcion || 
//                   `Para este ejercicio, haremos ${exercise.series} series a ${exercise.repeticiones} repeticiones.`}
//                 {exercise.descanso_segundos && 
//                   ` Descanso: ${exercise.descanso_segundos} segundos.`}
//               </div>
//               <div className="trainer-info" style={{textAlign: 'center'}}>
//                 <p>Entrenador: {currentRoutine.nombre_coach}</p>
//                 <p>Rutina: {currentRoutine.nombre}</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       );
//     });
//   };
  
//   return (
//     <div className="container">
//       <div className="sidebar">
//         <div className="logo">
//           <div className="logo-circle">
//             <img src="/logo.png" alt="Logo Gimnasio" width="60" height="60" />
//           </div>
//         </div>
        
//         <div className="menu-buttons">
//           <button className="menu-button disabled">Inicio</button>
//           <button className="menu-button" onClick={() => navigate('/cliente/informacion')}>Informacion</button>
//           <button className="menu-button" onClick={() => navigate('/cliente/membresia')}>Membresía</button>
//           <button className="menu-button" onClick={() => navigate('/cliente/entrenadores')}>Entrenadores</button>
//           <button className="menu-button" onClick={handleLogout}>Cerrar sesión</button>
//         </div>
//       </div>
      
//       <div className="main-content">
//         {loading ? (
//           <div className="loading-container">
//             <div className="spinner"></div>
//             <p>Cargando datos...</p>
//           </div>
//         ) : (
//           <>
//             {error && (
//               <div className="error-message">
//                 {error}
//                 <button className="error-close" onClick={() => setError(null)}>×</button>
//               </div>
//             )}
            
//             {!hasCoach && !isFirstLogin && (
//               <div className="coach-banner">
//                 <p>No tienes un entrenador asignado. ¡Asigna uno para personalizar tu experiencia!</p>
//                 <button 
//                   className="banner-button"
//                   onClick={() => navigate('/cliente/entrenadores')}
//                 >
//                   Ver entrenadores disponibles
//                 </button>
//               </div>
//             )}
            
//             <div className="user-card">
//               <div className="user-avatar">
//                 <img src="/src/assets/icons/usuario.png" alt="Avatar" width="50" height="50" />
//               </div>
//               <div className="user-info">
//                 <div className="user-name">{user?.name || 'Usuario'}</div>
//                 <div className="membership-details">
//                   <span>Estado de la membresía: Activa</span>
//                   <span>Fecha de vencimiento: 24 - Enero - 2026</span>
//                 </div>
//               </div>
//             </div>
            
//             {/* Selector de rutinas (solo visible si hay más de una rutina) */}
//             {routines.length > 1 && (
//               <div className="routine-selector">
//                 <div className="routine-navigation">
//                   <button className="routine-nav-button" onClick={() => changeRoutine('prev')}>
//                     &lt; Rutina anterior
//                   </button>
//                   <h3 className="current-routine-name">
//                     {routines[currentRoutineIndex]?.nombre || 'Rutina'}
//                   </h3>
//                   <button className="routine-nav-button" onClick={() => changeRoutine('next')}>
//                     Rutina siguiente &gt;
//                   </button>
//                 </div>
//               </div>
//             )}
            
//             {/* Visualizador de ejercicios */}
//             <div id="exercises-container">
//               {hasCoach ? renderExercises() : (
//                 <div className="no-coach-message">
//                   <h3>¡Bienvenido a tu dashboard de entrenamiento!</h3>
//                   <p>
//                     Para comenzar tu experiencia personalizada, necesitas asignar
//                     un entrenador que te guiará en tu camino fitness.
//                   </p>
//                   <button
//                     className="primary-button"
//                     onClick={() => navigate('/cliente/entrenadores')}
//                   >
//                     Seleccionar entrenador
//                   </button>
//                 </div>
//               )}
//             </div>
            
//             {/* Botones de navegación entre ejercicios (solo visibles si hay ejercicios) */}
//             {hasCoach && routines.length > 0 && routines[currentRoutineIndex]?.ejercicios?.length > 0 && (
//               <div className="navigation-buttons">
//                 <button className="nav-button" id="prev-button" onClick={() => changeExercise('prev')}>
//                   Anterior
//                 </button>
//                 <span className="exercise-counter">
//                   Ejercicio {currentExercise} de {totalExercises}
//                 </span>
//                 <button className="nav-button" id="next-button" onClick={() => changeExercise('next')}>
//                   Siguiente
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ClienteDashboard;


// client/src/pages/cliente/RoutineView.jsx
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
    const [trainingDays, setTrainingDays] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [selectedDay, setSelectedDay] = useState(null);

    useEffect(() => {
        const fetchActiveRoutine = async () => {
            try {
                setLoading(true);
                
                // Obtener la rutina activa
                const routineResponse = await api.getClientActiveRoutine();
                
                if (routineResponse.data) {
                    setActiveRoutine(routineResponse.data);
                    
                    // Obtener los días de entrenamiento
                    const daysResponse = await api.getRoutineTrainingDays(routineResponse.data.id_asignacion_rutina);
                    setTrainingDays(daysResponse.data || []);
                    
                    // Obtener los ejercicios de la rutina
                    const exercisesResponse = await api.getRoutineExercises(routineResponse.data.id_rutina);
                    setExercises(exercisesResponse.data || []);

                    // Determinar si hoy es día de entrenamiento y seleccionarlo automáticamente
                    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
                    const today = days[new Date().getDay()];
                    
                    const todayTraining = daysResponse.data?.find(
                        day => day.dia_semana.toLowerCase() === today
                    );
                    
                    if (todayTraining) {
                        setSelectedDay(today);
                    } else if (daysResponse.data && daysResponse.data.length > 0) {
                        setSelectedDay(daysResponse.data[0].dia_semana);
                    }
                }
                
                setLoading(false);
            } catch (error) {
                console.error('Error al cargar la rutina activa:', error);
                setError('No se pudo cargar tu rutina actual. Por favor, intenta nuevamente.');
                setLoading(false);
            }
        };

        fetchActiveRoutine();
    }, []);

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
                        <h2>Días de entrenamiento</h2>
                        <div className="days-tabs">
                            {orderDays(trainingDays).map(day => (
                                <button 
                                    key={day.dia_semana}
                                    className={`day-tab ${selectedDay === day.dia_semana ? 'active' : ''}`}
                                    onClick={() => setSelectedDay(day.dia_semana)}
                                >
                                    {formatDayName(day.dia_semana)}
                                    {day.dia_semana.toLowerCase() === new Date().toLocaleDateString('es-ES', { weekday: 'long' }) && (
                                        <span className="today-indicator">Hoy</span>
                                    )}
                                </button>
                            ))}
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
                                    <div className="exercise-image">
                                        <img 
                                            src={exercises[currentExerciseIndex].imagen_url || "/src/assets/images/workout-placeholder.png"} 
                                            alt={exercises[currentExerciseIndex].nombre} 
                                        />
                                    </div>
                                    
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