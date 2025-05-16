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
  const [activeTab, setActiveTab] = useState('clients');
  const [notification, setNotification] = useState(null);
  // Estados para el modal de detalles
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  // Estado para forzar actualización de datos
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Función para refrescar datos
  const refreshData = () => {
    console.log('Forzando actualización de datos...');
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
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
        setLoading(false);
      }
    };
    
    fetchData();
  }, [refreshTrigger]);

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
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>FitnessGym</h2>
        </div>
        
        <div className="admin-nav">
          <button className="admin-nav-button active">Dashboard</button>
          <button className="admin-nav-button" onClick={() => navigate('/coach/rutinas')}>Rutinas</button>
          <button className="admin-nav-button" onClick={() => navigate('/coach/perfil')}>Mi Perfil</button>
          <button className="admin-nav-button" onClick={logout}>Cerrar sesión</button>
        </div>
      </div>
      
      <div className="admin-content">
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
        
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
        
        <div className="content-wrapper">
          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando datos...</p>
            </div>
          )}

          <div className="user-card">
            <div className="user-avatar">
              <img src="/src/assets/icons/usuario.png" alt="Avatar" width="50" height="50" />
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'Entrenador'}</div>
              <div className="membership-details">
                <span>Entrenador Profesional</span>
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
            {/* Estadísticas del entrenador */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <h3>Total Clientes</h3>
                </div>
                <p className="stat-value">{clients.length}</p>
                <p className="stat-description">
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
              
              <div className="stat-card">
                <div className="stat-header">
                  <h3>Solicitudes Pendientes</h3>
                </div>
                <p className="stat-value">{pendingRequests.length}</p>
                <p className="stat-description">
                  Solicitudes esperando respuesta
                </p>
                <div className="stat-progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${pendingRequests.length > 0 ? 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <h3>Rutinas Activas</h3>
                </div>
                <p className="stat-value">0</p>
                <p className="stat-description">
                  Rutinas asignadas a clientes
                </p>
                <div className="stat-progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: '0%' 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <h3>Sesiones Completadas</h3>
                </div>
                <p className="stat-value">0</p>
                <p className="stat-description">
                  Total de sesiones de entrenamiento
                </p>
                <div className="stat-progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: '0%'
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Pestañas de navegación */}
            <div className="stats-timeframe-selector">
              <div className="coach-tabs">
                <button 
                  className={`coach-tab ${activeTab === 'clients' ? 'active' : ''}`}
                  onClick={() => setActiveTab('clients')}
                >
                  Mis Clientes ({clients.length})
                </button>
                <button 
                  className={`coach-tab ${activeTab === 'requests' ? 'active' : ''}`}
                  onClick={() => setActiveTab('requests')}
                >
                  Solicitudes Pendientes 
                  {pendingRequests.length > 0 && (
                    <span className="notification-badge">{pendingRequests.length}</span>
                  )}
                </button>
              </div>
            </div>
            
            {/* Contenido basado en la pestaña activa */}
            <div className="admin-cards-row">
              {activeTab === 'clients' && (
                <div className="admin-card">
                  <div className="card-header-with-actions">
                    <h3>Mis Clientes</h3>
                  </div>
                  
                  {loading ? (
                    <div className="loading-container">
                      <div className="spinner"></div>
                      <p>Cargando clientes...</p>
                    </div>
                  ) : clients.length === 0 ? (
                    <div className="empty-state">
                      <p>No tienes clientes asignados actualmente.</p>
                    </div>
                  ) : (
                    <div className="client-cards">
                      {clients.map(client => (
                        <div key={client.id_usuario} className="client-card">
                          <div className="client-info">
                            <div className="client-avatar">
                              <img src="/src/assets/icons/usuario.png" alt="Avatar" width="50" height="50" />
                            </div>
                            <div className="client-details">
                              <h3>{client.nombre}</h3>
                              <p>{client.email}</p>
                              <p className="assignment-date">
                                <small>Asignado desde: {new Date(client.fecha_asignacion).toLocaleDateString()}</small>
                              </p>
                            </div>
                          </div>
                          <div className="client-actions">
                            <button 
                              className="coach-button primary" 
                              onClick={() => handleViewDetails(client)}
                            >
                              Ver detalles
                            </button>
                            <button 
                              className="coach-button secondary" 
                              onClick={() => navigate(`/coach/rutina/${client.id_usuario}`)}
                            >
                              Asignar rutina
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'requests' && (
                <div className="admin-card">
                  <div className="card-header-with-actions">
                    <h3>Solicitudes Pendientes</h3>
                  </div>
                  
                  {loading ? (
                    <div className="loading-container">
                      <div className="spinner"></div>
                      <p>Cargando solicitudes...</p>
                    </div>
                  ) : pendingRequests.length === 0 ? (
                    <div className="empty-state">
                      <p>No hay solicitudes pendientes en este momento.</p>
                    </div>
                  ) : (
                    <div className="request-table-container">
                      <table className="coach-table">
                        <thead>
                          <tr>
                            <th>Cliente</th>
                            <th>Email</th>
                            <th>Fecha solicitud</th>
                            <th>Tipo membresía</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingRequests.map(request => (
                            <tr key={request.id_asignacion}>
                              <td>{request.nombre}</td>
                              <td>{request.email}</td>
                              <td>{new Date(request.fecha_asignacion).toLocaleDateString()}</td>
                              <td>{request.tipo_membresia || 'No especificado'}</td>
                              <td>
                                <div className="table-actions">
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
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Acciones Rápidas */}
            <div className="admin-cards-row">
              <div className="admin-card">
                <h3>Acciones Rápidas</h3>
                
                <div className="quick-actions">
                  <button className="quick-action-button" onClick={() => navigate('/coach/rutinas/plantillas')}>
                    <div className="quick-action-icon"></div>
                    <span>Plantillas de Rutinas</span>
                  </button>
                  
                  <button className="quick-action-button" onClick={() => navigate('/coach/calendario')}>
                    <div className="quick-action-icon"></div>
                    <span>Calendario de Citas</span>
                  </button>
                  
                  <button className="quick-action-button" onClick={() => navigate('/coach/medidas/registrar')}>
                    <div className="quick-action-icon"></div>
                    <span>Registrar Medidas</span>
                  </button>
                  
                  <button className="quick-action-button" onClick={() => navigate('/coach/perfil')}>
                    <div className="quick-action-icon"></div>
                    <span>Actualizar Perfil</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;