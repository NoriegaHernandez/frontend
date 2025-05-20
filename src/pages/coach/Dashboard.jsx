// client/src/pages/coach/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './CoachStyles.css';

const CoachDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('clients');
  const [notification, setNotification] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [statsTimeframe, setStatsTimeframe] = useState('month');
  const [availableRoutines, setAvailableRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [assigningRoutine, setAssigningRoutine] = useState(false);
  const [routineSuccess, setRoutineSuccess] = useState(false);
  const [clientMeasurements, setClientMeasurements] = useState([]);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);
  // Función para refrescar datos
  const refreshData = () => {
    console.log('Forzando actualización de datos...');
    setRefreshTrigger(prev => prev + 1);
  };

  // Función para cargar rutinas disponibles
  const loadAvailableRoutines = async () => {
    try {
      const response = await api.getCoachRoutines();
      setAvailableRoutines(response.data || []);
    } catch (error) {
      console.error('Error al cargar rutinas disponibles:', error);
      setError('Error al cargar rutinas');
    }
  };

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener clientes asignados
        const clientsResponse = await api.getCoachClients();
        console.log("Clientes obtenidos:", clientsResponse.data);

        // Verificar que los datos son correctos antes de asignarlos
        if (Array.isArray(clientsResponse.data)) {
          setClients(clientsResponse.data || []);
        } else {
          console.error("Respuesta de clientes no es un array:", clientsResponse);
          setClients([]);
        }

        // Obtener solicitudes pendientes
        const requestsResponse = await api.getCoachPendingRequests();
        setPendingRequests(requestsResponse.data || []);

        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos. Por favor, intenta nuevamente.');
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger, statsTimeframe]);

  // Manejar cambio de período de tiempo
  const handleStatsTimeframeChange = (timeframe) => {
    setStatsTimeframe(timeframe);
  };

  // Función para aceptar solicitud de cliente
  const handleAcceptRequest = async (requestId) => {
    try {
      setLoading(true);

      await api.acceptClientRequest(requestId);

      // Mostrar notificación de éxito
      setNotification({
        type: 'success',
        message: 'Solicitud aceptada correctamente'
      });

      // Actualizar listas después de aceptar
      const clientsResponse = await api.getCoachClients();
      setClients(clientsResponse.data || []);

      const requestsResponse = await api.getCoachPendingRequests();
      setPendingRequests(requestsResponse.data || []);

      setLoading(false);

      // Limpiar notificación después de 3 segundos
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('Error al aceptar solicitud:', error);

      setNotification({
        type: 'error',
        message: 'Error al aceptar solicitud'
      });

      setLoading(false);

      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  // Función para rechazar solicitud de cliente
  const handleRejectRequest = async (requestId) => {
    try {
      setLoading(true);

      await api.rejectClientRequest(requestId);

      // Mostrar notificación de éxito
      setNotification({
        type: 'success',
        message: 'Solicitud rechazada correctamente'
      });

      // Actualizar lista de solicitudes
      const requestsResponse = await api.getCoachPendingRequests();
      setPendingRequests(requestsResponse.data || []);

      setLoading(false);

      // Limpiar notificación después de 3 segundos
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);

      setNotification({
        type: 'error',
        message: 'Error al rechazar solicitud'
      });

      setLoading(false);

      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  // Función para mostrar detalles del cliente
  // const handleViewDetails = async (client) => {
  //   console.log("Cliente seleccionado:", client);
  //   if (!client) {
  //     console.error("Cliente es null o undefined");
  //     return;
  //   }

  //   // Crear una copia limpia del objeto cliente
  //   const clientCopy = JSON.parse(JSON.stringify(client));
  //   setSelectedClient(clientCopy);
  //   setShowClientDetails(true);

  //   // Cargar rutinas disponibles cuando se abre el modal
  //   await loadAvailableRoutines();
  // };
  const handleViewDetails = async (client) => {
    console.log("Cliente seleccionado:", client);
    if (!client) {
      console.error("Cliente es null o undefined");
      return;
    }

    // Crear una copia limpia del objeto cliente
    const clientCopy = JSON.parse(JSON.stringify(client));
    setSelectedClient(clientCopy);
    setShowClientDetails(true);

    // Iniciar carga de datos adicionales
    setLoadingMeasurements(true);

    try {
      // Cargar rutinas disponibles cuando se abre el modal
      await loadAvailableRoutines();

      // Intentar cargar las medidas físicas del cliente
      const measurements = await api.getClientMeasurements(client.id_usuario);
      console.log("Medidas físicas obtenidas:", measurements);
      setClientMeasurements(measurements || []);
    } catch (error) {
      console.error("Error al cargar datos del cliente:", error);
      setClientMeasurements([]);
    } finally {
      setLoadingMeasurements(false);
    }
  };
  // Update this function in Dashboard.jsx
  const handleAssignRoutine = async () => {
    if (!selectedClient || !selectedRoutine) {
      setNotification({
        type: 'error',
        message: 'Por favor selecciona una rutina'
      });
      return;
    }

    try {
      setAssigningRoutine(true);

      // Log values for debugging
      console.log('Cliente seleccionado:', {
        id: selectedClient.id_usuario,
        nombre: selectedClient.nombre,
        tipo: typeof selectedClient.id_usuario
      });

      console.log('Rutina seleccionada:', {
        id: selectedRoutine,
        tipo: typeof selectedRoutine
      });

      // Ensure we're passing proper integers
      const clientId = parseInt(selectedClient.id_usuario);
      const routineId = parseInt(selectedRoutine);

      console.log("Valores convertidos a enviar:");
      console.log("clientId:", clientId, typeof clientId);
      console.log("routineId:", routineId, typeof routineId);

      // Verify they are valid numbers
      if (isNaN(clientId) || isNaN(routineId)) {
        throw new Error('ID de cliente o rutina no válido');
      }

      await api.assignRoutineToClient(clientId, routineId);

      setRoutineSuccess(true);
      setNotification({
        type: 'success',
        message: 'Rutina asignada correctamente'
      });

      // Limpiar selección después de asignar
      setSelectedRoutine(null);

      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('Error al asignar rutina:', error);
      console.error('Detalles del error:', {
        mensaje: error.response?.data?.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setNotification({
        type: 'error',
        message: 'Error al asignar rutina: ' + (error.response?.data?.message || error.message)
      });
    } finally {
      setAssigningRoutine(false);
    }
  };
  // Agregar un nuevo estado para controlar cuando se está registrando medidas
  const [registeringMeasurements, setRegisteringMeasurements] = useState(false);
  const [newMeasurements, setNewMeasurements] = useState({
    peso: '',
    altura: '',
    porcentaje_grasa: '',
    masa_muscular: '',
    medida_pecho: '',
    medida_brazo_izq: '',
    medida_brazo_der: '',
    medida_pierna_izq: '',
    medida_pierna_der: '',
    medida_cintura: '',
    medida_cadera: '',
    notas: ''
  });

  // Función para manejar cambios en el formulario de medidas
  const handleMeasurementChange = (e) => {
    const { name, value } = e.target;
    setNewMeasurements(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para registrar nuevas medidas
  const handleRegisterMeasurements = async () => {
    if (!selectedClient) return;

    try {
      setAssigningRoutine(true); // Reutilizar este estado para mostrar progreso

      // Crear objeto de medidas incluyendo el ID del cliente
      const measurementData = {
        ...newMeasurements,
        id_usuario: selectedClient.id_usuario
      };

      // Hacer la petición al backend (necesitas crear esta función en el API)
      await api.registerClientMeasurements(measurementData);

      // Actualizar la lista de medidas
      const updatedMeasurements = await api.getClientMeasurements(selectedClient.id_usuario);
      setClientMeasurements(updatedMeasurements || []);

      // Mostrar mensaje de éxito
      setNotification({
        type: 'success',
        message: 'Medidas registradas correctamente'
      });

      // Ocultar formulario
      setRegisteringMeasurements(false);

      // Limpiar formulario
      setNewMeasurements({
        peso: '',
        altura: '',
        porcentaje_grasa: '',
        masa_muscular: '',
        medida_pecho: '',
        medida_brazo_izq: '',
        medida_brazo_der: '',
        medida_pierna_izq: '',
        medida_pierna_der: '',
        medida_cintura: '',
        medida_cadera: '',
        notas: ''
      });
    } catch (error) {
      console.error('Error al registrar medidas:', error);
      setNotification({
        type: 'error',
        message: 'Error al registrar medidas'
      });
    } finally {
      setAssigningRoutine(false);
    }
  };
  // Función para cerrar el modal de detalles
  const handleCloseDetails = () => {
    console.log("Cerrando modal");
    setShowClientDetails(false);
    setSelectedClient(null);
    setSelectedRoutine(null);
    setRoutineSuccess(false);
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
          <button className="menu-button active">Dashboard</button>
          <button className="menu-button" onClick={() => navigate('/coach/InformacionCoach')}>Rutinas</button>
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

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando datos del dashboard...</p>
            </div>
          ) : (
            <>
              {/* Header con información del usuario y botón de actualizar */}
              <div className="user-card">
                <div className="user-avatar">
                  <img src="/src/assets/icons/usuario.png" alt="Avatar" width="50" height="50" />
                </div>
                <div className="user-info">
                  <div className="user-name">{user?.name || 'Entrenador'}</div>
                  <div className="membership-details">
                    <span>Entrenador del Sistema</span>
                    <span>Panel de Control</span>
                  </div>
                </div>
                <button
                  className="refresh-button"
                  onClick={refreshData}
                  title="Actualizar datos"
                >
                  🔄 Actualizar
                </button>
              </div>

              <h1 className="page-title">Dashboard de Entrenador</h1>

              <div className="dashboard-container">
                {/* Selector de período de tiempo */}
                <div className="stats-timeframe-selector">
                  <span>Ver estadísticas comparadas con: </span>
                  <div className="timeframe-buttons">
                    <button
                      className={`timeframe-button ${statsTimeframe === 'week' ? 'active' : ''}`}
                      onClick={() => handleStatsTimeframeChange('week')}
                    >
                      Semana
                    </button>
                    <button
                      className={`timeframe-button ${statsTimeframe === 'month' ? 'active' : ''}`}
                      onClick={() => handleStatsTimeframeChange('month')}
                    >
                      Mes
                    </button>
                    <button
                      className={`timeframe-button ${statsTimeframe === 'year' ? 'active' : ''}`}
                      onClick={() => handleStatsTimeframeChange('year')}
                    >
                      Año
                    </button>
                  </div>
                </div>

                {/* Tarjetas de estadísticas */}
                <div className="stats-grid">
                  <div className="stat-card interactive">
                    <div className="stat-header">
                      <h3>Total Clientes</h3>
                      <div className="trend-indicator neutral">
                        <span className="trend-arrow">→</span>
                        <span className="trend-percent">0%</span>
                      </div>
                    </div>
                    <p className="stat-value">{clients.length}</p>
                    <p className="stat-description">
                      <span className="stat-comparison">
                        0 en el mes anterior
                      </span>
                      <br />
                      Clientes asignados actualmente
                    </p>
                    <div className="stat-progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: '100%'
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="stat-card interactive">
                    <div className="stat-header">
                      <h3>Clientes Activos</h3>
                      <div className="trend-indicator neutral">
                        <span className="trend-arrow">→</span>
                        <span className="trend-percent">0%</span>
                      </div>
                    </div>
                    <p className="stat-value">{clients.filter(c => c.activo).length || 0}</p>
                    <p className="stat-description">
                      <span className="stat-comparison">
                        0 en el mes anterior
                      </span>
                      <br />
                      {clients.length > 0 ? Math.round((clients.filter(c => c.activo).length / clients.length) * 100) : 0}% del total de clientes
                    </p>
                    <div className="stat-progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: clients.length > 0 ? `${(clients.filter(c => c.activo).length / clients.length) * 100}%` : '0%'
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="stat-card interactive">
                    <div className="stat-header">
                      <h3>Entrenadores</h3>
                      <div className="trend-indicator neutral">
                        <span className="trend-arrow">→</span>
                        <span className="trend-percent">0%</span>
                      </div>
                    </div>
                    <p className="stat-value">1</p>
                    <p className="stat-description">
                      <span className="stat-comparison">
                        0 en el mes anterior
                      </span>
                      <br />
                      Entrenadores en la plataforma
                    </p>
                    <div className="stat-progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: '100%'
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="stat-card interactive">
                    <div className="stat-header">
                      <h3>Solicitudes Pendientes</h3>
                      <div className="trend-indicator neutral">
                        <span className="trend-arrow">→</span>
                        <span className="trend-percent">0%</span>
                      </div>
                    </div>
                    <p className="stat-value">{pendingRequests.length}</p>
                    <p className="stat-description">
                      <span className="stat-comparison">
                        0 en el mes anterior
                      </span>
                      <br />
                      Solicitudes en espera de aprobación
                    </p>
                    <div className="stat-progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: pendingRequests.length > 0 ? '100%' : '0%'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Panel único de Actividad Reciente - SIN la sección de Acciones Rápidas */}
                <div className="admin-card" style={{ marginTop: '30px' }}>
                  <div className="card-header-with-actions">
                    <h3>Actividad Reciente</h3>
                    <div className="activity-filters">
                      <select
                        className="activity-filter-select"
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value)}
                      >
                        <option value="clients">Todos los clientes</option>
                        <option value="requests">Solicitudes pendientes</option>
                      </select>
                    </div>
                  </div>

                  <div className="activity-list">
                    {activeTab === 'clients' ? (
                      clients.length === 0 ? (
                        <div className="empty-activity">
                          <p>No hay clientes asignados actualmente.</p>
                          <p>Las asignaciones de clientes aparecerán automáticamente cuando un cliente solicite un entrenador.</p>
                          <button
                            className="secondary-button"
                            onClick={refreshData}
                            style={{ marginTop: '10px' }}
                          >
                            Verificar nuevamente
                          </button>
                        </div>
                      ) : (
                        clients.map(client => (
                          <div key={client.id_usuario} className="activity-item">
                            <div className="activity-icon new_user"></div>
                            <div className="activity-details">
                              <p className="activity-description">{client.nombre}</p>
                              <p className="activity-date">Asignado desde: {new Date(client.fecha_asignacion).toLocaleDateString()}</p>
                            </div>
                            <button
                              className="view-details-button"
                              onClick={() => handleViewDetails(client)}
                            >
                              Ver detalles
                            </button>
                          </div>
                        ))
                      )
                    ) : (
                      pendingRequests.length === 0 ? (
                        <div className="empty-activity">
                          <p>No hay solicitudes pendientes en este momento.</p>
                          <p>Las solicitudes aparecerán aquí cuando un cliente solicite tus servicios como entrenador.</p>
                          <button
                            className="secondary-button"
                            onClick={refreshData}
                            style={{ marginTop: '10px' }}
                          >
                            Verificar nuevamente
                          </button>
                        </div>
                      ) : (
                        pendingRequests.map(request => (
                          <div key={request.id_asignacion} className="activity-item">
                            <div className="activity-icon subscription_renewal"></div>
                            <div className="activity-details">
                              <p className="activity-description">{request.nombre} ha solicitado tus servicios</p>
                              <p className="activity-date">Fecha solicitud: {new Date(request.fecha_asignacion).toLocaleDateString()}</p>
                            </div>
                            <div className="activity-actions">
                              <button
                                className="action-button accept"
                                onClick={() => handleAcceptRequest(request.id_asignacion)}
                              >
                                Aceptar
                              </button>
                              <button
                                className="action-button reject"
                                onClick={() => handleRejectRequest(request.id_asignacion)}
                              >
                                Rechazar
                              </button>
                            </div>
                          </div>
                        ))
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Modal de detalles del cliente */}
              {showClientDetails && selectedClient && (
                <div className="client-details-modal">
                  <div className="client-details-content">
                    <div className="client-details-header">
                      <h2>Detalles del Cliente</h2>
                      <button className="close-button close-modal-button" onClick={handleCloseDetails}>×</button>
                    </div>

                    <div className="client-details-body">
                      {/* Sección de Información Básica */}
                      <div className="client-details-section">
                        <h3>Información Básica</h3>
                        <div className="client-data-grid">
                          <div className="client-data-item">
                            <span className="data-label">Nombre:</span>
                            <span className="data-value">{selectedClient.nombre || 'No disponible'}</span>
                          </div>
                          <div className="client-data-item">
                            <span className="data-label">Email:</span>
                            <span className="data-value">{selectedClient.email || 'No disponible'}</span>
                          </div>
                          <div className="client-data-item">
                            <span className="data-label">Teléfono:</span>
                            <span className="data-value">{selectedClient.telefono || 'No registrado'}</span>
                          </div>
                          <div className="client-data-item">
                            <span className="data-label">Fecha de asignación:</span>
                            <span className="data-value">
                              {selectedClient.fecha_asignacion ? new Date(selectedClient.fecha_asignacion).toLocaleDateString() : 'No disponible'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Sección de Información Física */}
                      <div className="client-details-section physical-section">
                        <h3>Información Física</h3>
                        {loadingMeasurements ? (
                          <div className="loading-measurements">
                            <div className="spinner small"></div>
                            <p>Cargando medidas físicas...</p>
                          </div>
                        ) : clientMeasurements.length === 0 ? (
                          <div className="empty-physical-info">
                            <p>No hay información física registrada para este cliente.</p>
                            <p>El cliente debe registrar sus medidas físicas.</p>
                          </div>
                        ) : (
                          <>
                            {/* Mostrar la medida más reciente */}
                            <div className="physical-data">
                              <div className="client-data-grid">
                                <div className="client-data-item">
                                  <span className="data-label">Altura:</span>
                                  <span className="data-value">
                                    {clientMeasurements[0].altura ? `${clientMeasurements[0].altura} cm` : '--'}
                                  </span>
                                </div>
                                <div className="client-data-item">
                                  <span className="data-label">Peso:</span>
                                  <span className="data-value">
                                    {clientMeasurements[0].peso ? `${clientMeasurements[0].peso} kg` : '--'}
                                  </span>
                                </div>
                                <div className="client-data-item">
                                  <span className="data-label">IMC:</span>
                                  <span className="data-value">
                                    {clientMeasurements[0].altura && clientMeasurements[0].peso
                                      ? (clientMeasurements[0].peso / Math.pow(clientMeasurements[0].altura / 100, 2)).toFixed(2)
                                      : '--'}
                                  </span>
                                </div>
                                <div className="client-data-item">
                                  <span className="data-label">% Grasa corporal:</span>
                                  <span className="data-value">
                                    {clientMeasurements[0].porcentaje_grasa ? `${clientMeasurements[0].porcentaje_grasa}%` : '--'}
                                  </span>
                                </div>
                                <div className="client-data-item">
                                  <span className="data-label">Masa muscular:</span>
                                  <span className="data-value">
                                    {clientMeasurements[0].masa_muscular ? `${clientMeasurements[0].masa_muscular} kg` : '--'}
                                  </span>
                                </div>
                                <div className="client-data-item">
                                  <span className="data-label">Medida Pecho:</span>
                                  <span className="data-value">
                                    {clientMeasurements[0].medida_pecho ? `${clientMeasurements[0].medida_pecho} cm` : '--'}
                                  </span>
                                </div>
                                <div className="client-data-item">
                                  <span className="data-label">Medida Cintura:</span>
                                  <span className="data-value">
                                    {clientMeasurements[0].medida_cintura ? `${clientMeasurements[0].medida_cintura} cm` : '--'}
                                  </span>
                                </div>
                                <div className="client-data-item">
                                  <span className="data-label">Medida Cadera:</span>
                                  <span className="data-value">
                                    {clientMeasurements[0].medida_cadera ? `${clientMeasurements[0].medida_cadera} cm` : '--'}
                                  </span>
                                </div>
                                <div className="client-data-item">
                                  <span className="data-label">Última actualización:</span>
                                  <span className="data-value">
                                    {clientMeasurements[0].fecha_registro
                                      ? new Date(clientMeasurements[0].fecha_registro).toLocaleDateString()
                                      : '--'}
                                  </span>
                                </div>
                              </div>

                              {clientMeasurements[0].notas && (
                                <div className="physical-notes">
                                  <span className="data-label">Notas:</span>
                                  <p className="data-value notes">{clientMeasurements[0].notas}</p>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      {/* Formulario para registrar medidas */}
                      {registeringMeasurements && (
                        <div className="measurements-form-overlay">
                          <div className="measurements-form-container">
                            <div className="measurements-form-header">
                              <h3>Registrar Medidas Físicas</h3>
                              <button
                                className="close-button"
                                onClick={() => setRegisteringMeasurements(false)}
                              >
                                ×
                              </button>
                            </div>

                            <form className="measurements-form">
                              <div className="form-grid">
                                <div className="form-group">
                                  <label htmlFor="peso">Peso (kg):</label>
                                  <input
                                    type="number"
                                    id="peso"
                                    name="peso"
                                    value={newMeasurements.peso}
                                    onChange={handleMeasurementChange}
                                    step="0.1"
                                    min="0"
                                    placeholder="Ej: 75.5"
                                  />
                                </div>

                                <div className="form-group">
                                  <label htmlFor="altura">Altura (cm):</label>
                                  <input
                                    type="number"
                                    id="altura"
                                    name="altura"
                                    value={newMeasurements.altura}
                                    onChange={handleMeasurementChange}
                                    step="0.1"
                                    min="0"
                                    placeholder="Ej: 175"
                                  />
                                </div>

                                <div className="form-group">
                                  <label htmlFor="porcentaje_grasa">% Grasa Corporal:</label>
                                  <input
                                    type="number"
                                    id="porcentaje_grasa"
                                    name="porcentaje_grasa"
                                    value={newMeasurements.porcentaje_grasa}
                                    onChange={handleMeasurementChange}
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    placeholder="Ej: 15.5"
                                  />
                                </div>

                                <div className="form-group">
                                  <label htmlFor="masa_muscular">Masa Muscular (kg):</label>
                                  <input
                                    type="number"
                                    id="masa_muscular"
                                    name="masa_muscular"
                                    value={newMeasurements.masa_muscular}
                                    onChange={handleMeasurementChange}
                                    step="0.1"
                                    min="0"
                                    placeholder="Ej: 35.2"
                                  />
                                </div>

                                {/* Agregar los demás campos de medidas */}
                                {/* ... */}
                              </div>

                              <div className="form-group full-width">
                                <label htmlFor="notas">Notas:</label>
                                <textarea
                                  id="notas"
                                  name="notas"
                                  value={newMeasurements.notas}
                                  onChange={handleMeasurementChange}
                                  rows="3"
                                  placeholder="Observaciones adicionales sobre las medidas"
                                />
                              </div>

                              <div className="form-buttons">
                                <button
                                  type="button"
                                  className="cancel-button"
                                  onClick={() => setRegisteringMeasurements(false)}
                                  disabled={assigningRoutine}
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  className="save-button"
                                  onClick={handleRegisterMeasurements}
                                  disabled={assigningRoutine}
                                >
                                  {assigningRoutine ? 'Guardando...' : 'Guardar Medidas'}
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}

                      {/* Sección para asignar rutina */}
                      <div className="client-details-section">
                        <h3>Asignar Rutina</h3>
                        <div className="routine-selector">
                          <select
                            className="routine-select"
                            value={selectedRoutine || ''}
                            onChange={(e) => setSelectedRoutine(e.target.value)}
                            disabled={assigningRoutine}
                          >
                            <option value="">Selecciona una rutina</option>
                            {availableRoutines.map(routine => (
                              <option key={routine.id_rutina} value={routine.id_rutina}>
                                {routine.nombre} - {routine.objetivo || 'General'} ({routine.nivel_dificultad || 'intermedio'})
                              </option>
                            ))}
                          </select>

                          <div className="routine-actions">
                            <button
                              className="coach-button primary"
                              onClick={handleAssignRoutine}
                              disabled={!selectedRoutine || assigningRoutine}
                            >
                              {assigningRoutine ? 'Asignando...' : 'Asignar rutina'}
                            </button>
                            {/* <button 
                              className="coach-button secondary"
                              onClick={() => {
                                // Cerrar el modal primero
                                handleCloseDetails();
                                // Luego navegar a la página de creación de rutina para este cliente
                                navigate(`/coach/InformacionCoach/${selectedClient.id_usuario}`);
                              }}
                            >
                              Crear rutina personalizada
                            </button> */}

                            {/* <button 
  className="coach-button secondary"
  onClick={() => {
    // Cerrar el modal primero
    handleCloseDetails();
    // Navegar a la página de creación de rutina personalizada para este cliente
    navigate(`/coach/custom-routine/${selectedClient.id_usuario}`);
  }}
>
  Crear rutina personalizada
</button> */}
                            <button
                              className="coach-button secondary"
                              onClick={() => {
                                // Cerrar el modal primero
                                handleCloseDetails();
                                // Navegar a la página de creación de rutina personalizada para este cliente
                                navigate(`/coach/custom-routine/${selectedClient.id_usuario}`);
                              }}
                            >
                              Crear rutina personalizada
                            </button>
                          </div>

                          {routineSuccess && (
                            <div className="routine-success">
                              <p>✅ Rutina asignada correctamente</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="modal-actions">
                        {/* <button className="coach-button secondary">
                          Registrar medidas
                        </button> */}
                        <button
                          className="coach-button close"
                          onClick={handleCloseDetails}
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>

          )}
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;