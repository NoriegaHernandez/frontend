// client/src/pages/coach/RoutinesManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './CoachStyles.css';

const RoutinesManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedRoutineId, setSelectedRoutineId] = useState('');
    const [assigningRoutine, setAssigningRoutine] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [filterValue, setFilterValue] = useState('');

    // Cargar rutinas
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Obtener rutinas del coach
                const routinesResponse = await api.getCoachRoutines();
                setRoutines(routinesResponse.data || []);

                // Obtener clientes asignados
                const clientsResponse = await api.getCoachClients();
                setClients(clientsResponse.data || []);

                setLoading(false);
            } catch (error) {
                console.error('Error al cargar datos:', error);
                setError('Error al cargar las rutinas. Por favor, intenta nuevamente.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filtrar rutinas
    const filteredRoutines = routines.filter(routine =>
        routine.nombre.toLowerCase().includes(filterValue.toLowerCase()) ||
        (routine.objetivo && routine.objetivo.toLowerCase().includes(filterValue.toLowerCase()))
    );


    // Update this function in RoutinesManagement.jsx
    const handleAssignRoutine = async () => {
        if (!selectedClientId || !selectedRoutineId) {
            setNotification({
                type: 'error',
                message: 'Debes seleccionar un cliente y una rutina'
            });
            return;
        }

        try {
            setAssigningRoutine(true);

            // Log values for debugging
            console.log('Selección de cliente:', {
                selectedClientId: selectedClientId,
                tipo: typeof selectedClientId
            });
            console.log('Selección de rutina:', {
                selectedRoutineId: selectedRoutineId,
                tipo: typeof selectedRoutineId
            });

            // Asegurarnos de que los valores son números, si es necesario
            const clientId = parseInt(selectedClientId);
            const routineId = parseInt(selectedRoutineId);

            console.log("Valores convertidos a enviar:");
            console.log("clientId:", clientId, typeof clientId);
            console.log("routineId:", routineId, typeof routineId);

            // Verificar que los valores son números válidos
            if (isNaN(clientId) || isNaN(routineId)) {
                throw new Error('ID de cliente o rutina no válido');
            }

            await api.assignRoutineToClient(clientId, routineId);

            setNotification({
                type: 'success',
                message: 'Rutina asignada correctamente'
            });

            // Limpiar selección y cerrar modal
            setSelectedClientId('');
            setSelectedRoutineId('');
            setShowAssignModal(false);

            setTimeout(() => {
                setNotification(null);
            }, 3000);
        } catch (error) {
            console.error('Error al asignar rutina:', error);

            // Extraer detalles del error para mejor diagnóstico
            console.error('Mensaje de error:', error.response?.data?.message || error.message);
            console.error('Datos de la respuesta:', error.response?.data);

            setNotification({
                type: 'error',
                message: 'Error al asignar rutina: ' + (error.response?.data?.message || error.message)
            });
        } finally {
            setAssigningRoutine(false);
        }
    };

    // // Ver detalles de rutina
    // const handleViewRoutine = (routineId) => {
    //     navigate(`/coach/routine/${routineId}`);
    // };
// Replace this function:
const handleViewRoutine = (routineId) => {
  navigate(`/coach/routine/${routineId}`);
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
                            <h1 className="page-title">Administración de Rutinas</h1>
                            <p className="page-subtitle">
                                Gestiona, crea y asigna rutinas a tus clientes
                            </p>
                        </div>
                        <div className="header-actions">
                            {/* <button 
  className="create-routine-button" 
  onClick={() => navigate('/coach/custom-routine/new')}
>
  Crear Nueva Rutina
</button> */}

                            <button
                                className="assign-button"
                                onClick={() => setShowAssignModal(true)}
                                disabled={routines.length === 0 || clients.length === 0}
                            >
                                Asignar Rutina
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>Cargando rutinas...</p>
                        </div>
                    ) : (
                        <>
                            <div className="routines-filter">
                                <input
                                    type="text"
                                    placeholder="Buscar rutinas por nombre u objetivo..."
                                    value={filterValue}
                                    onChange={(e) => setFilterValue(e.target.value)}
                                    className="filter-input"
                                />
                            </div>

                            {routines.length === 0 ? (
                                <div className="empty-routines">
                                    <p>No has creado ninguna rutina todavía.</p>
                                    <p>Crea tu primera rutina para poder asignarla a tus clientes.</p>
                                    <button
                                        className="create-routine-button"
                                        onClick={() => navigate('/coach/custom-routine/new')}
                                    >
                                        Crear Primera Rutina
                                    </button>
                                </div>
                            ) : (
                                <div className="routines-grid">
                                    {filteredRoutines.map(routine => (
                                        <div key={routine.id_rutina} className="routine-card">
                                            <div className="routine-card-header">
                                                <h3 className="routine-name">{routine.nombre}</h3>
                                                <span className={`difficulty-badge ${routine.nivel_dificultad}`}>
                                                    {routine.nivel_dificultad}
                                                </span>
                                            </div>

                                            <div className="routine-card-body">
                                                {routine.objetivo && (
                                                    <div className="routine-objective">
                                                        <strong>Objetivo:</strong> {routine.objetivo}
                                                    </div>
                                                )}

                                                <div className="routine-stats">
                                                    <div className="stat">
                                                        <span className="stat-value">{routine.duracion_estimada || '?'}</span>
                                                        <span className="stat-label">min</span>
                                                    </div>

                                                    <div className="stat">
                                                        <span className="stat-value">{routine.num_ejercicios || '?'}</span>
                                                        <span className="stat-label">ejercicios</span>
                                                    </div>
                                                </div>

                                                {routine.descripcion && (
                                                    <p className="routine-description">
                                                        {routine.descripcion.length > 100
                                                            ? routine.descripcion.substring(0, 100) + '...'
                                                            : routine.descripcion
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div className="routine-card-footer">
                                                {/* <button
                                                    className="view-button"
                                                    onClick={() => handleViewRoutine(routine.id_rutina)}
                                                >
                                                    Ver detalles
                                                </button> */}

                                                <button
                                                    className="view-button"
                                                    onClick={() => handleViewRoutine(routine.id_rutina)}
                                                >
                                                    Ver detalles
                                                </button>

                                                <button
                                                    className="assign-small-button"
                                                    onClick={() => {
                                                        setSelectedRoutineId(routine.id_rutina);
                                                        setShowAssignModal(true);
                                                    }}
                                                    disabled={clients.length === 0}
                                                >
                                                    Asignar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Modal para asignar rutina */}
                    {showAssignModal && (
                        <div className="modal-overlay">
                            <div className="assign-modal">
                                <div className="modal-header">
                                    <h2>Asignar Rutina a Cliente</h2>
                                    <button className="close-button" onClick={() => setShowAssignModal(false)}>×</button>
                                </div>

                                <div className="modal-body">
                                    <div className="form-group">
                                        <label htmlFor="client-select">Seleccionar Cliente</label>
                                        <select
                                            id="client-select"
                                            value={selectedClientId}
                                            onChange={(e) => {
                                                console.log('Valor seleccionado de cliente:', e.target.value);
                                                setSelectedClientId(e.target.value);
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

                                    <div className="form-group">
                                        <label htmlFor="routine-select">Seleccionar Rutina</label>
                                        <select
                                            id="routine-select"
                                            value={selectedRoutineId}
                                            onChange={(e) => {
                                                console.log('Valor seleccionado de rutina:', e.target.value);
                                                setSelectedRoutineId(e.target.value);
                                            }}
                                        >
                                            <option value="">Seleccionar rutina...</option>
                                            {routines.map(routine => (
                                                <option key={routine.id_rutina} value={routine.id_rutina}>
                                                    {routine.nombre} - {routine.objetivo || 'General'}
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
                                        disabled={!selectedClientId || !selectedRoutineId || assigningRoutine}
                                    >
                                        {assigningRoutine ? 'Asignando...' : 'Asignar Rutina'}
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

export default RoutinesManagement;