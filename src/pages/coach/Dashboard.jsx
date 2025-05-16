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
  // Nuevos estados para el modal de detalles
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDetails, setShowClientDetails] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener clientes asignados
        const clientsResponse = await api.getCoachClients();
        console.log("Clientes obtenidos:", clientsResponse.data); // Para depurar
        
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
  }, []);

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

  // Nueva función para mostrar detalles del cliente
  const handleViewDetails = (client) => {
    console.log("Cliente seleccionado:", client); // Para debuggear
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
    console.log("Cerrando modal"); // Para debuggear
    setShowClientDetails(false);
    setSelectedClient(null); // También limpiar el cliente seleccionado
  };

  return (
    <div className="coach-container">
      <div className="coach-sidebar">
        <div className="coach-logo">
          <div className="logo-circle">
            <img src="/src/assets/icons/logo.png" alt="Logo Gimnasio" width="60" height="60" />
          </div>
        </div>
        
        <nav className="coach-nav">
          <button className="coach-nav-button active">Dashboard</button>
          <button className="coach-nav-button" onClick={() => navigate('/coach/rutinas')}>Rutinas</button>
          <button className="coach-nav-button" onClick={() => navigate('/coach/perfil')}>Mi Perfil</button>
          <button className="coach-nav-button" onClick={logout}>Cerrar sesión</button>
        </nav>
      </div>
      
      <div className="coach-content">
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
        
        <div className="coach-header">
          <h1>Dashboard de Entrenador</h1>
          <div className="coach-profile">
            <span>{user?.name || 'Entrenador'}</span>
            <div className="coach-avatar">
              <img src="/src/assets/icons/usuario.png" alt="Avatar" width="40" height="40" />
            </div>
          </div>
        </div>
        
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
        
        {activeTab === 'clients' && (
          <div className="coach-section">
            <h2>Mis Clientes</h2>
            
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
          <div className="coach-section">
            <h2>Solicitudes Pendientes</h2>
            
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
    </div>
  );
};

export default CoachDashboard;