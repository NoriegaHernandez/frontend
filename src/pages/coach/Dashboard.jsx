
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
  
  // Función para refrescar datos
  const refreshData = () => {
    console.log('Forzando actualización de datos...');
    setRefreshTrigger(prev => prev + 1);
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
  const handleViewDetails = (client) => {
    console.log("Cliente seleccionado:", client);
    if (!client) {
      console.error("Cliente es null o undefined");
      return;
    }
    // Crear una copia limpia del objeto cliente
    const clientCopy = JSON.parse(JSON.stringify(client));
    setSelectedClient(clientCopy);
    setShowClientDetails(true);
  };

  // Función para cerrar el modal de detalles
  const handleCloseDetails = () => {
    console.log("Cerrando modal");
    setShowClientDetails(false);
    setSelectedClient(null);
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
          <button className="menu-button" onClick={() => navigate('/coach/rutinas')}>Rutinas</button>
          <button className="menu-button" onClick={() => navigate('/coach/perfil')}>Mi Perfil</button>
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
                
                {/* Actividad Reciente y Acciones Rápidas */}
                <div className="admin-cards-row">
                  {/* Actividad Reciente - Lista de clientes o solicitudes */}
                  <div className="admin-card">
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
                  
                  {/* Acciones Rápidas */}
                  <div className="admin-card">
                    <h3>Acciones Rápidas</h3>
                    
                    <div className="quick-actions">
                      <div className="quick-action-button" onClick={() => navigate('/coach/perfil')}>
                        <div className="quick-action-icon user"></div>
                        <span>Mi Perfil</span>
                      </div>
                      
                      <div className="quick-action-button" onClick={() => navigate('/coach/rutinas/crear')}>
                        <div className="quick-action-icon coach"></div>
                        <span>Crear Rutina</span>
                      </div>
                      
                      <div className="quick-action-button" onClick={() => navigate('/coach/calendario')}>
                        <div className="quick-action-icon subscription"></div>
                        <span>Calendario</span>
                      </div>
                      
                      <div className="quick-action-button" onClick={() => navigate('/coach/solicitudes')}>
                        <div className="quick-action-icon verify"></div>
                        <span>Solicitudes Pendientes ({pendingRequests.length})</span>
                      </div>
                    </div>
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
                        <div className="empty-physical-info">
                          <p>No hay información física registrada para este cliente.</p>
                          <p>Esta funcionalidad estará disponible próximamente.</p>
                        </div>
                        
                        <div className="physical-data-placeholder">
                          <div className="client-data-grid">
                            <div className="client-data-item">
                              <span className="data-label">Altura:</span>
                              <span className="data-value">--</span>
                            </div>
                            <div className="client-data-item">
                              <span className="data-label">Peso:</span>
                              <span className="data-value">--</span>
                            </div>
                            <div className="client-data-item">
                              <span className="data-label">IMC:</span>
                              <span className="data-value">--</span>
                            </div>
                            <div className="client-data-item">
                              <span className="data-label">% Grasa corporal:</span>
                              <span className="data-value">--</span>
                            </div>
                            <div className="client-data-item">
                              <span className="data-label">Masa muscular:</span>
                              <span className="data-value">--</span>
                            </div>
                            <div className="client-data-item">
                              <span className="data-label">Última actualización:</span>
                              <span className="data-value">--</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Botones de acción */}
                      <div className="modal-actions">
                        <button 
                          className="coach-button primary"
                          onClick={() => navigate(`/coach/rutina/${selectedClient.id_usuario}`)}
                        >
                          Asignar rutina
                        </button>
                        <button className="coach-button secondary">
                          Registrar medidas
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