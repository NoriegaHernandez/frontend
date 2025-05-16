// client/src/pages/coach/AsignarRutina.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './CoachStyles.css';
// En AsignarRutina.jsx
import { useParams } from 'react-router-dom';


const AsignarRutina = () => {
 const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Obtener clienteId de los parámetros o localStorage
  const clienteId = clienteIdParam || localStorage.getItem('selectedClientId');
  
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeDay, setActiveDay] = useState('Lunes');
  const [rutinas, setRutinas] = useState({
    Lunes: [],
    Martes: [],
    Miercoles: [],
    Jueves: [],
    Viernes: [],
    Sabado: [],
    Domingo: []
  });
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState([]);
  const [nuevoEjercicio, setNuevoEjercicio] = useState({
    nombre: '',
    series: 4,
    repeticiones: '8-12',
    descanso: 60
  });
  const [editandoEjercicio, setEditandoEjercicio] = useState(null);
  const [grupoMuscular, setGrupoMuscular] = useState('Pecho, hombro y trícep');

  console.log("Componente AsignarRutina montado");
  console.log("Cliente ID en parámetros:", clienteIdParam);
  console.log("Cliente ID usado:", clienteId);

  // Cargar información del cliente y rutinas existentes
  useEffect(() => {
    if (!clienteId) {
      console.error("No se pudo obtener el ID del cliente");
      setError("No se pudo obtener el ID del cliente. Vuelve al dashboard e intenta nuevamente.");
      setLoading(false);
      return;
    }
    
    const cargarDatos = async () => {
      try {
        setLoading(true);
        console.log("Cargando datos para cliente ID:", clienteId);
        
        // Obtener información del cliente
        const clienteResponse = await api.getClientById(clienteId);
        console.log("Datos del cliente recibidos:", clienteResponse.data);
        setCliente(clienteResponse.data);
        
        // Intentar obtener rutinas existentes del cliente
        try {
          const rutinasResponse = await api.getClientRoutines(clienteId);
          if (rutinasResponse.data && Object.keys(rutinasResponse.data).length > 0) {
            console.log("Rutinas existentes recibidas:", rutinasResponse.data);
            setRutinas(rutinasResponse.data);
          }
        } catch (err) {
          console.log('No hay rutinas previas para este cliente');
        }
        
        // Obtener ejercicios disponibles
        try {
          const ejerciciosResponse = await api.getAvailableExercises();
          setEjerciciosDisponibles(ejerciciosResponse.data || []);
        } catch (err) {
          console.log('No se pudieron cargar ejercicios predefinidos');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar la información. Por favor, inténtalo de nuevo.');
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [clienteId]);

  // Función para guardar la rutina completa
  const guardarRutina = async () => {
    if (!clienteId) {
      setNotification({
        type: 'error',
        message: 'No se puede identificar al cliente'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    
    try {
      setLoading(true);
      
      await api.saveClientRoutine(clienteId, rutinas);
      
      setNotification({
        type: 'success',
        message: 'Rutina guardada exitosamente'
      });
      
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      setLoading(false);
    } catch (error) {
      console.error('Error al guardar rutina:', error);
      
      setNotification({
        type: 'error',
        message: 'Error al guardar la rutina'
      });
      
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      setLoading(false);
    }
  };

  // Función para abrir modal de añadir ejercicio
  const abrirModalEjercicio = () => {
    setNuevoEjercicio({
      nombre: '',
      series: 4,
      repeticiones: '8-12',
      descanso: 60
    });
    setEditandoEjercicio(null);
    setShowAddExerciseModal(true);
  };

  // Función para editar ejercicio existente
  const editarEjercicio = (ejercicio, index) => {
    setNuevoEjercicio({...ejercicio});
    setEditandoEjercicio(index);
    setShowAddExerciseModal(true);
  };

  // Función para guardar el ejercicio (nuevo o editado)
  const guardarEjercicio = () => {
    if (!nuevoEjercicio.nombre) {
      alert('Por favor, ingresa el nombre del ejercicio');
      return;
    }
    
    const rutinaActualizada = {...rutinas};
    
    if (editandoEjercicio !== null) {
      // Editar ejercicio existente
      rutinaActualizada[activeDay][editandoEjercicio] = nuevoEjercicio;
    } else {
      // Añadir nuevo ejercicio
      if (!rutinaActualizada[activeDay]) {
        rutinaActualizada[activeDay] = [];
      }
      rutinaActualizada[activeDay].push({
        ...nuevoEjercicio,
        grupoMuscular
      });
    }
    
    setRutinas(rutinaActualizada);
    setShowAddExerciseModal(false);
  };

  // Función para eliminar ejercicio
  const eliminarEjercicio = (index) => {
    const confirmar = window.confirm('¿Estás seguro de eliminar este ejercicio?');
    
    if (confirmar) {
      const rutinaActualizada = {...rutinas};
      rutinaActualizada[activeDay].splice(index, 1);
      setRutinas(rutinaActualizada);
    }
  };

  // Obtener los grupos musculares únicos para mostrar en la página
  const getGruposMusculares = () => {
    if (!rutinas[activeDay] || rutinas[activeDay].length === 0) {
      return ['Pecho, hombro y trícep'];
    }
    
    const grupos = rutinas[activeDay].map(ejercicio => 
      ejercicio.grupoMuscular || 'Pecho, hombro y trícep'
    );
    
    return [...new Set(grupos)];
  };

  // Si hay un error crítico, mostrar mensaje y opción de volver
  if (error && !clienteId) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={() => navigate('/coach/dashboard')}>Volver al Dashboard</button>
      </div>
    );
  }

  return (
    <div className="coach-container">
      <div className="coach-sidebar">
        <div className="coach-logo">
          <div className="logo-circle">
            <img src="/src/assets/icons/logo.png" alt="Logo Gimnasio" width="60" height="60" />
          </div>
        </div>
        
        <nav className="coach-nav">
          <button className="coach-nav-button" onClick={() => navigate('/coach/dashboard')}>Dashboard</button>
          <button className="coach-nav-button active">Rutinas</button>
          <button className="coach-nav-button" onClick={() => navigate('/coach/perfil')}>Mi Perfil</button>
          <button className="coach-nav-button" onClick={() => navigate('/logout')}>Cerrar sesión</button>
        </nav>
      </div>
      
      <div className="coach-content">
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
        
        <div className="coach-header">
          <div className="breadcrumb">
            <button className="back-button" onClick={() => navigate('/coach/dashboard')}>
              &larr; Volver
            </button>
            <h1>Asignar Rutina</h1>
          </div>
          
          <button className="save-button" onClick={guardarRutina} disabled={loading}>
            Guardar Rutina
          </button>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando información...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Reintentar</button>
          </div>
        ) : (
          <div className="routine-container">
            {cliente && (
              <div className="client-info-card">
                <div className="client-avatar">
                  <img src="/src/assets/icons/usuario.png" alt="Avatar" width="80" height="80" />
                </div>
                <div className="client-info-details">
                  <h2>{cliente.nombre}</h2>
                  <div className="client-subinfo">
                    <p>{cliente.edad || 25} años - Ingreso: {new Date(cliente.fecha_ingreso || Date.now()).toLocaleDateString()}</p>
                    <p>Objetivo: {cliente.objetivo || 'Hipertrofia'} - Asistencia {cliente.asistencia || '100%'}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="days-tabs">
              {Object.keys(rutinas).map(day => (
                <button 
                  key={day}
                  className={`day-tab ${activeDay === day ? 'active' : ''}`}
                  onClick={() => setActiveDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>
            
            <div className="routine-content">
              {getGruposMusculares().map((grupo, grupoIndex) => (
                <div className="muscle-group-section" key={grupoIndex}>
                  <h3 className="muscle-group-title">{grupo}</h3>
                  
                  {rutinas[activeDay]
                    .filter(ejercicio => (ejercicio.grupoMuscular || 'Pecho, hombro y trícep') === grupo)
                    .map((ejercicio, index) => (
                      <div className="exercise-item" key={index}>
                        <div className="exercise-number">{index + 1}.</div>
                        <div className="exercise-name">{ejercicio.nombre}</div>
                        <div className="exercise-details">
                          <div className="detail-box">
                            <span className="detail-label">SERIES</span>
                            <span className="detail-value">{ejercicio.series}</span>
                          </div>
                          <div className="detail-box">
                            <span className="detail-label">REPS</span>
                            <span className="detail-value">{ejercicio.repeticiones}</span>
                          </div>
                          <div className="detail-box">
                            <span className="detail-label">DESCANSO</span>
                            <span className="detail-value">{ejercicio.descanso}s</span>
                          </div>
                          <div className="exercise-progress">
                            <div className="progress-bar"></div>
                          </div>
                          <button 
                            className="exercise-action-btn"
                            onClick={() => editarEjercicio(ejercicio, rutinas[activeDay].indexOf(ejercicio))}
                          >
                            <span className="edit-icon">✎</span>
                          </button>
                          <button 
                            className="exercise-action-btn delete"
                            onClick={() => eliminarEjercicio(rutinas[activeDay].indexOf(ejercicio))}
                          >
                            <span className="delete-icon">×</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
              
              <button className="add-exercise-btn" onClick={abrirModalEjercicio}>
                Agregar ejercicio +
              </button>
            </div>
          </div>
        )}
        
        {/* Modal para añadir o editar ejercicio */}
        {showAddExerciseModal && (
          <div className="modal-overlay">
            <div className="exercise-modal">
              <div className="modal-header">
                <h3>{editandoEjercicio !== null ? 'Editar ejercicio' : 'Añadir ejercicio'}</h3>
                <button 
                  className="close-modal-btn"
                  onClick={() => setShowAddExerciseModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-group">
                  <label>Grupo Muscular</label>
                  <select 
                    value={grupoMuscular}
                    onChange={(e) => setGrupoMuscular(e.target.value)}
                  >
                    <option value="Pecho, hombro y trícep">Pecho, hombro y trícep</option>
                    <option value="Espalda y bíceps">Espalda y bíceps</option>
                    <option value="Pierna y glúteos">Pierna y glúteos</option>
                    <option value="Core y abdominales">Core y abdominales</option>
                    <option value="Cardio">Cardio</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Nombre del ejercicio</label>
                  <input 
                    type="text" 
                    value={nuevoEjercicio.nombre}
                    onChange={(e) => setNuevoEjercicio({...nuevoEjercicio, nombre: e.target.value})}
                    placeholder="Ej: Press de banca plano"
                    list="ejercicios-list"
                  />
                  <datalist id="ejercicios-list">
                    {ejerciciosDisponibles.map((ej, i) => (
                      <option key={i} value={ej.nombre} />
                    ))}
                  </datalist>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Series</label>
                    <input 
                      type="number" 
                      value={nuevoEjercicio.series}
                      onChange={(e) => setNuevoEjercicio({...nuevoEjercicio, series: parseInt(e.target.value) || 0})}
                      min="1"
                      max="10"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Repeticiones</label>
                    <input 
                      type="text" 
                      value={nuevoEjercicio.repeticiones}
                      onChange={(e) => setNuevoEjercicio({...nuevoEjercicio, repeticiones: e.target.value})}
                      placeholder="Ej: 8-12"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Descanso (seg)</label>
                    <input 
                      type="number" 
                      value={nuevoEjercicio.descanso}
                      onChange={(e) => setNuevoEjercicio({...nuevoEjercicio, descanso: parseInt(e.target.value) || 0})}
                      min="0"
                      max="300"
                      step="5"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowAddExerciseModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="save-btn"
                  onClick={guardarEjercicio}
                >
                  {editandoEjercicio !== null ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AsignarRutina;