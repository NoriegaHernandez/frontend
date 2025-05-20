// client/src/pages/client/ClientRoutineView.jsx
// Componente para mostrar la rutina asignada al cliente con los días de entrenamiento

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './ClientStyles.css';

const ClientRoutineView = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeRoutine, setActiveRoutine] = useState(null);
    const [trainingDays, setTrainingDays] = useState([]);
    const [exercises, setExercises] = useState([]);

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

    // Función para determinar si hoy es día de entrenamiento
    const isTodayTrainingDay = () => {
        const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const today = days[new Date().getDay()];
        return trainingDays.some(day => day.dia_semana.toLowerCase() === today);
    };

    // Formatear días para mostrar
    const formatTrainingDays = () => {
        if (!trainingDays || trainingDays.length === 0) return "No hay días asignados";
        
        // Ordenar los días según su orden en la semana
        const daysOrder = { 'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'domingo': 7 };
        
        const orderedDays = [...trainingDays].sort((a, b) => 
            daysOrder[a.dia_semana.toLowerCase()] - daysOrder[b.dia_semana.toLowerCase()]
        );
        
        return orderedDays.map(day => day.dia_semana).join(', ');
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
                <button onClick={() => window.location.reload()}>Intentar nuevamente</button>
            </div>
        );
    }

    if (!activeRoutine) {
        return (
            <div className="no-routine-container">
                <div className="no-routine-icon">
                    <i className="fas fa-dumbbell"></i>
                </div>
                <h2>No tienes una rutina asignada</h2>
                <p>Tu entrenador aún no te ha asignado una rutina. Contacta con él para obtener tu plan de entrenamiento.</p>
            </div>
        );
    }

    return (
        <div className="client-routine-view">
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
            </div>

            <div className="training-days-section">
                <h2>Días de entrenamiento</h2>
                <div className="training-days-display">
                    {formatTrainingDays()}
                </div>
                
                {isTodayTrainingDay() && (
                    <div className="today-is-training-day">
                        <div className="training-badge">¡HOY TOCA ENTRENAR!</div>
                        <p>Hoy es día de realizar esta rutina. ¡A por ello!</p>
                    </div>
                )}
            </div>

            {activeRoutine.objetivo && (
                <div className="routine-objective-section">
                    <h2>Objetivo</h2>
                    <p>{activeRoutine.objetivo}</p>
                </div>
            )}

            <div className="exercises-section">
                <h2>Ejercicios</h2>
                {exercises.length === 0 ? (
                    <p className="no-exercises">No hay ejercicios en esta rutina todavía.</p>
                ) : (
                    <div className="exercises-list">
                        {exercises.map((exercise, index) => (
                            <div key={exercise.id_ejercicio} className="exercise-item">
                                <div className="exercise-number">{index + 1}</div>
                                <div className="exercise-content">
                                    <h3 className="exercise-name">{exercise.nombre}</h3>
                                    
                                    <div className="exercise-details">
                                        <div className="exercise-sets-reps">
                                            <span className="exercise-sets">{exercise.series} series</span>
                                            <span className="exercise-reps">{exercise.repeticiones}</span>
                                        </div>
                                        
                                        {exercise.descanso_segundos && (
                                            <div className="exercise-rest">
                                                <i className="fas fa-stopwatch"></i> {Math.floor(exercise.descanso_segundos / 60)}:{(exercise.descanso_segundos % 60).toString().padStart(2, '0')} min
                                            </div>
                                        )}
                                    </div>
                                    
                                    {exercise.notas && (
                                        <div className="exercise-notes">
                                            <i className="fas fa-info-circle"></i> {exercise.notas}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
    );
};

export default ClientRoutineView;