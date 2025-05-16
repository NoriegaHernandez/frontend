// client/src/pages/coach/InformacionCoach.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './CoachStyles.css'; // Usando los mismos estilos que el Dashboard

const InformacionCoach = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [coachData, setCoachData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para el modo de edición
  const [isEditing, setIsEditing] = useState(false);
  // Estado para el formulario de edición
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    especialidad: '',
    certificaciones: '',
    biografia: '',
    horario_disponible: '',
    experiencia: ''
  });
  // Estado para mensajes de éxito o error en la edición
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });
  // Estado para el proceso de guardado
  const [isSaving, setSaving] = useState(false);
  
  // Cargar datos del entrenador
  useEffect(() => {
    const fetchCoachData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No hay token de autenticación');
          setError('No se ha iniciado sesión');
          setLoading(false);
          return;
        }
        
        console.log('Intentando cargar datos del entrenador...');
        try {
          const response = await api.getCoachProfile();
          console.log('Respuesta del servidor:', response);
          
          if (response) {
            setCoachData(response);
            setFormData({
              nombre: response.nombre || '',
              email: response.email || '',
              telefono: response.telefono || '',
              especialidad: response.especialidad || '',
              certificaciones: response.certificaciones || '',
              biografia: response.biografia || '',
              horario_disponible: response.horario_disponible || '',
              experiencia: response.experiencia || ''
            });
          } else {
            throw new Error('No se recibieron datos del entrenador');
          }
        } catch (apiError) {
          console.error('Error en la API:', apiError);
          
          if (user) {
            const fallbackData = {
              id_coach: user.id,
              nombre: user.name || user.nombre || 'Entrenador',
              email: user.email || '',
              tipo_usuario: 'entrenador',
              estado: user.estado || 'activo'
            };
            setCoachData(fallbackData);
            setFormData({
              nombre: fallbackData.nombre || '',
              email: fallbackData.email || '',
              telefono: '',
              especialidad: '',
              certificaciones: '',
              biografia: '',
              horario_disponible: '',
              experiencia: ''
            });
          } else {
            throw new Error('No se pudieron obtener datos del entrenador');
          }
        }
      } catch (error) {
        console.error('Error al cargar datos del entrenador:', error);
        setError('No se pudieron cargar los datos del perfil. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCoachData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setUpdateMessage({ type: '', text: '' });
      
      const updateData = {
        id_coach: coachData.id_coach,
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono || null,
        especialidad: formData.especialidad || null,
        certificaciones: formData.certificaciones || null,
        biografia: formData.biografia || null,
        horario_disponible: formData.horario_disponible || null,
        experiencia: formData.experiencia || null
      };
      
      console.log('Enviando datos actualizados:', updateData);
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/coaches/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Perfil actualizado correctamente:', data);
        
        setCoachData({
          ...coachData,
          ...updateData
        });
        
        setUpdateMessage({ 
          type: 'success', 
          text: 'Perfil actualizado con éxito' 
        });
        
        setIsEditing(false);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}: No se pudo actualizar el perfil`);
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      setUpdateMessage({ 
        type: 'error', 
        text: `Error: ${error.message}` 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setUpdateMessage({ type: '', text: '' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUpdateMessage({ type: '', text: '' });
    setFormData({
      nombre: coachData.nombre || '',
      email: coachData.email || '',
      telefono: coachData.telefono || '',
      especialidad: coachData.especialidad || '',
      certificaciones: coachData.certificaciones || '',
      biografia: coachData.biografia || '',
      horario_disponible: coachData.horario_disponible || '',
      experiencia: coachData.experiencia || ''
    });
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
          <button className="coach-nav-button" onClick={() => navigate('/coach/dashboard')}>Dashboard</button>
          <button className="coach-nav-button" onClick={() => navigate('/coach/rutinas')}>Rutinas</button>
          <button className="coach-nav-button active">Mi Perfil</button>
          <button className="coach-nav-button" onClick={handleLogout}>Cerrar sesión</button>
        </nav>
      </div>
      
      <div className="coach-content">
        <div className="coach-header">
          <h1>Mi Perfil de Entrenador</h1>
          <div className="coach-profile">
            <span>{user?.name || 'Entrenador'}</span>
            <div className="coach-avatar">
              <img src="/src/assets/icons/usuario.png" alt="Avatar" width="40" height="40" />
            </div>
          </div>
        </div>
        
        {error && (
          <div className="notification error">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando información del entrenador...</p>
          </div>
        ) : (
          <div className="coach-section">
            <h2>Mi Perfil</h2>
            
            {updateMessage.text && (
              <div className={`notification ${updateMessage.type}`}>
                {updateMessage.text}
              </div>
            )}
            
            {!isEditing ? (
              <div className="profile-card">
                <div className="coach-card-header">
                  <h3>Información Personal</h3>
                  <button className="coach-button secondary" onClick={handleEdit}>
                    <span className="edit-icon">✏️</span> Editar
                  </button>
                </div>
                
                <div className="profile-avatar">
                  <div className="avatar-placeholder">
                    {coachData.nombre ? coachData.nombre.charAt(0).toUpperCase() : 'E'}
                  </div>
                </div>
                
                <div className="profile-info">
                  <h3>{coachData.nombre || 'Entrenador'}</h3>
                  <p className="email">{coachData.email || ''}</p>
                  
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Teléfono:</span>
                      <span className="value">{coachData.telefono || 'No especificado'}</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="label">Especialidad:</span>
                      <span className="value">{coachData.especialidad || 'No especificada'}</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="label">Certificaciones:</span>
                      <span className="value">{coachData.certificaciones || 'No especificadas'}</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="label">Años de experiencia:</span>
                      <span className="value">{coachData.experiencia || 'No especificado'}</span>
                    </div>
                    
                    <div className="info-item coach-biography">
                      <span className="label">Biografía:</span>
                      <span className="value">{coachData.biografia || 'No has agregado tu biografía todavía.'}</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="label">Horario disponible:</span>
                      <span className="value">{coachData.horario_disponible || 'No especificado'}</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="label">Tipo de Usuario:</span>
                      <span className="value">Entrenador</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="label">Estado:</span>
                      <span className="value">Activo</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="profile-card edit-mode">
                <div className="coach-card-header">
                  <h3>Editar Información Personal</h3>
                </div>
                
                <div className="edit-form-container">
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="nombre">Nombre:</label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email:</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="telefono">Teléfono:</label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="Ej: 5551234567"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="especialidad">Especialidad:</label>
                      <input
                        type="text"
                        id="especialidad"
                        name="especialidad"
                        value={formData.especialidad}
                        onChange={handleChange}
                        placeholder="Ej: Entrenamiento funcional, Fuerza, etc."
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="certificaciones">Certificaciones:</label>
                      <input
                        type="text"
                        id="certificaciones"
                        name="certificaciones"
                        value={formData.certificaciones}
                        onChange={handleChange}
                        placeholder="Ej: ACE, NASM, etc."
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="experiencia">Años de experiencia:</label>
                      <input
                        type="text"
                        id="experiencia"
                        name="experiencia"
                        value={formData.experiencia}
                        onChange={handleChange}
                        placeholder="Ej: 5 años"
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label htmlFor="horario_disponible">Horario disponible:</label>
                      <input
                        type="text"
                        id="horario_disponible"
                        name="horario_disponible"
                        value={formData.horario_disponible}
                        onChange={handleChange}
                        placeholder="Ej: Lunes a Viernes de 9:00 a 17:00"
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label htmlFor="biografia">Biografía:</label>
                      <textarea
                        id="biografia"
                        name="biografia"
                        value={formData.biografia}
                        onChange={handleChange}
                        rows="5"
                        placeholder="Escribe una breve descripción sobre ti, tu enfoque de entrenamiento y tu experiencia..."
                      />
                    </div>
                    
                    <div className="form-buttons">
                      <button 
                        type="button" 
                        className="coach-button secondary" 
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="coach-button primary"
                        disabled={isSaving}
                      >
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InformacionCoach;