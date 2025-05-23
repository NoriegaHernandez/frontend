// client/src/services/api.js
import axios from 'axios';

// URL base de la API
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';
// Crear instancia de axios con configuración común
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});
// Define the authHeader function
const authHeader = () => {
  const token = localStorage.getItem('token');
  return token 
    ? { 'x-auth-token': token, 'Content-Type': 'application/json' } 
    : { 'Content-Type': 'application/json' };
};

// Implement the handleApiError function
const handleApiError = (error) => {
  // Log the error for debugging
  console.error('API Error:', error);
  
  // You can handle specific error cases here
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response error:', error.response.data);
    console.error('Status:', error.response.status);
    
    // Handle token expiration or auth errors
    if (error.response.status === 401) {
      // Handle unauthorized error, e.g., clear token and redirect to login
      localStorage.removeItem('token');
      // You might want to redirect to login page here
      // window.location.href = '/login';
    }
  } else if (error.request) {
    // The request was made but no response was received
    console.error('Request error:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error message:', error.message);
  }
  
  // Return the error so it can be handled further if needed
  return error;
};

// Agregar interceptor para enviar el token en cada solicitud
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Servicios API
const api = {
  
  // Prueba de conexión
  testConnection: async () => {
    try {
      const response = await axiosInstance.get('/test');
      return response.data.message;
    } catch (error) {
      console.error('Error en la prueba de conexión:', error);
      throw error;
    }
  },
  getCoachRoutines: async () => {
  try {
    const response = await axiosInstance.get('/coach/routines');
    return response;
  } catch (error) {
    console.error('Error en getCoachRoutines:', error);
    throw error;
  }
},

// assignRoutineToClient: async (clientId, routineId) => {
//   try {
//     console.log('Asignando rutina:', {
//       userId: clientId,
//       routineId: routineId
//     });
    
//     const response = await axiosInstance.post('/coach/assign-routine', {
//       userId: clientId,
//       routineId: routineId
//     });
    
//     return response;
//   } catch (error) {
//     console.error('Error al asignar rutina a cliente:', error);
//     console.error('Detalles del error:', {
//       mensaje: error.response?.data?.message,
//       status: error.response?.status,
//       data: error.response?.data
//     });
//     throw error;
//   }
// },
assignRoutineToClient: async (clientId, routineId) => {
  try {
    // Log the input values for debugging
    console.log('Valores recibidos en assignRoutineToClient:');
    console.log('  clientId:', clientId, typeof clientId);
    console.log('  routineId:', routineId, typeof routineId);

    // Validar que haya un ID de cliente y rutina
    if (!clientId || !routineId) {
      console.error('Error: clientId o routineId están vacíos o son inválidos');
      throw new Error('Se requiere ID de usuario y rutina válidos');
    }
    
    // Convert to integers if they're strings
    const idCliente = typeof clientId === 'string' ? parseInt(clientId, 10) : clientId;
    const idRutina = typeof routineId === 'string' ? parseInt(routineId, 10) : routineId;
    
    console.log('Enviando solicitud con valores convertidos:');
    console.log('  id_cliente:', idCliente, typeof idCliente);
    console.log('  id_rutina:', idRutina, typeof idRutina);
    
    // Verificar que los enteros son válidos después de la conversión
    if (isNaN(idCliente) || isNaN(idRutina)) {
      console.error('Error: conversión a entero falló, valores inválidos');
      throw new Error('IDs deben ser valores numéricos válidos');
    }
    
    const requestBody = {
      id_cliente: idCliente,
      id_rutina: idRutina
    };
    
    console.log('Enviando datos al servidor:', JSON.stringify(requestBody));
    
    const response = await axiosInstance.post('/coach/assign-routine', requestBody);
    
    console.log('Respuesta del servidor:', response.status, response.data);
    
    return response;
  } catch (error) {
    console.error('Error al asignar rutina a cliente:', error);
    console.error('Detalles del error:', {
      mensaje: error.response?.data?.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
},
getClientRoutines: async () => {
  try {
    const response = await axiosInstance.get('/client/routines');
    return response;
  } catch (error) {
    console.error('Error en getClientRoutines:', error);
    throw error;
  }
},
  // Autenticación
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  },

testRegister: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/test-register', userData);
      return response.data;
    } catch (error) {
      console.error('Error en test-register:', error);
      throw error;
    }
  },

 verifyToken: async () => {
    try {
      const response = await axiosInstance.post('/auth/verify-token');
      return response.data;
    } catch (error) {
      console.error('Error al verificar token:', error);
      throw error;
    }
  },
  


  // getCurrentUser: async () => {
  //   try {
  //     console.log('Iniciando solicitud getCurrentUser');
      
  //     // Verificar si hay token en localStorage
  //     const token = localStorage.getItem('token');
  //     if (!token) {
  //       console.error('No hay token almacenado en localStorage');
  //       throw new Error('No hay token de autenticación');
  //     }
      
  //     console.log('Cabeceras de la solicitud:', {
  //       'Content-Type': 'application/json',
  //       'x-auth-token': token.substring(0, 10) + '...'
  //     });
      
  //     // Hacer la solicitud con manejo explícito de respuesta
  //     const response = await axiosInstance.get('/auth/me');
      
  //     // Verificar si la respuesta es exitosa
  //     if (response.status !== 200) {
  //       console.error('Respuesta con código de error:', response.status);
  //       throw new Error(`Error en la respuesta: ${response.status}`);
  //     }
      
  //     // Verificar si hay datos en la respuesta
  //     if (!response.data) {
  //       console.error('La respuesta no contiene datos');
  //       throw new Error('La respuesta no contiene datos del usuario');
  //     }
      
  //     console.log('Datos del usuario obtenidos correctamente:', {
  //       id: response.data.id_usuario,
  //       nombre: response.data.nombre,
  //       email: response.data.email,
  //       tipoUsuario: response.data.tipo_usuario
  //     });
      
  //     return response.data;
  //   } catch (error) {
  //     // Manejo detallado de errores
  //     if (error.response) {
  //       // El servidor respondió con un código de error
  //       console.error('Error de respuesta del servidor:', {
  //         status: error.response.status,
  //         data: error.response.data,
  //         headers: error.response.headers
  //       });
        
  //       // Mensaje específico según el código de error
  //       if (error.response.status === 401) {
  //         console.error('Error de autenticación: Token inválido o expirado');
  //         // Limpiar token y redirigir al login
  //         localStorage.removeItem('token');
  //         throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
  //       } else if (error.response.status === 404) {
  //         console.error('Ruta no encontrada. Verificar URL de la API');
  //         throw new Error('Servicio no disponible. Por favor contacte al administrador.');
  //       } else {
  //         console.error(`Error ${error.response.status}: ${error.response.data.message || 'Error del servidor'}`);
  //         throw new Error(error.response.data.message || 'Error al obtener datos del usuario');
  //       }
  //     } else if (error.request) {
  //       // La solicitud fue hecha pero no se recibió respuesta
  //       console.error('No se recibió respuesta del servidor:', error.request);
  //       throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
  //     } else {
  //       // Error en la configuración de la solicitud
  //       console.error('Error al configurar la solicitud:', error.message);
  //       throw new Error('Error en la aplicación. Por favor contacte al administrador.');
  //     }
  //   }
  // },
  getCurrentUser: async () => {
  try {
    console.log('Iniciando solicitud getCurrentUser');
    
    // Verificar si hay token en localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No hay token almacenado en localStorage');
      throw new Error('No hay token de autenticación');
    }
    
    console.log('Cabeceras de la solicitud:', {
      'Content-Type': 'application/json',
      'x-auth-token': token.substring(0, 10) + '...'
    });
    
    // Hacer la solicitud con manejo explícito de respuesta
    const response = await axiosInstance.get('/auth/me');
    
    // Verificar si la respuesta es exitosa
    if (response.status !== 200) {
      console.error('Respuesta con código de error:', response.status);
      throw new Error(`Error en la respuesta: ${response.status}`);
    }
    
    // Verificar si hay datos en la respuesta
    if (!response.data) {
      console.error('La respuesta no contiene datos');
      throw new Error('La respuesta no contiene datos del usuario');
    }
    
    console.log('Datos del usuario obtenidos correctamente:', {
      id: response.data.id_usuario,
      nombre: response.data.nombre,
      email: response.data.email,
      tipoUsuario: response.data.tipo_usuario
    });
    
    // Obtener medidas físicas del usuario
    try {
      console.log('Iniciando solicitud de medidas físicas');
      const medidasResponse = await axiosInstance.get('/client/physical-measurements');
      
      // Verificar respuesta de medidas
      if (medidasResponse.status === 200 && medidasResponse.data && medidasResponse.data.length > 0) {
        console.log(`Se encontraron ${medidasResponse.data.length} registros de medidas físicas`);
        // Agregar medidas al objeto de respuesta
        response.data.medidas = medidasResponse.data;
      } else {
        console.log('No se encontraron medidas físicas o la respuesta está vacía');
        response.data.medidas = [];
      }
    } catch (medidasError) {
      console.error('Error al obtener medidas físicas:', medidasError);
      // Registrar el tipo específico de error
      if (medidasError.response) {
        console.error(`Error ${medidasError.response.status} al obtener medidas:`, medidasError.response.data);
      } else if (medidasError.request) {
        console.error('No se recibió respuesta al solicitar medidas físicas');
      } else {
        console.error('Error en configuración de solicitud de medidas:', medidasError.message);
      }
      // Inicializar arreglo vacío de medidas para no generar errores posteriores
      response.data.medidas = [];
    }
    
    return response.data;
  } catch (error) {
    // Manejo detallado de errores
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('Error de respuesta del servidor:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Mensaje específico según el código de error
      if (error.response.status === 401) {
        console.error('Error de autenticación: Token inválido o expirado');
        // Limpiar token y redirigir al login
        localStorage.removeItem('token');
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      } else if (error.response.status === 404) {
        console.error('Ruta no encontrada. Verificar URL de la API');
        throw new Error('Servicio no disponible. Por favor contacte al administrador.');
      } else {
        console.error(`Error ${error.response.status}: ${error.response.data.message || 'Error del servidor'}`);
        throw new Error(error.response.data.message || 'Error al obtener datos del usuario');
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor:', error.request);
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
    } else {
      // Error en la configuración de la solicitud
      console.error('Error al configurar la solicitud:', error.message);
      throw new Error('Error en la aplicación. Por favor contacte al administrador.');
    }
  }
},
// Obtener medidas físicas de un cliente específico (para coach)
getClientMeasurements: async (clientId) => {
  try {
    console.log(`Obteniendo medidas físicas del cliente ${clientId}`);
    const response = await axiosInstance.get(`/coach/client-measurements/${clientId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener medidas físicas del cliente:', error);
    throw error;
  }
},
  verifyEmail: async (token) => {
    try {
      console.log("API - Iniciando verificación de email");
      console.log("Token a verificar:", token.substring(0, 10) + "...");
      
      // URL correcta para verificación
      const url = `/auth/verify-email/${token}`;
      console.log("URL de solicitud:", API_URL + url);
      
      // Verificar que el token sea válido
      if (!token || token.length < 10) {
        console.error('Token de verificación inválido o muy corto');
        throw new Error('Token de verificación inválido');
      }
      
      // Realizar la solicitud con timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout
      
      const response = await axiosInstance.get(url, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // Limpiar el timeout si la solicitud es exitosa
      
      // Imprimir respuesta completa
      console.log("Respuesta completa de verificación:", response);
      
      // Si la verificación fue exitosa
      if (response.data) {
        console.log("Datos de respuesta:", response.data);
        return response.data;
      } else {
        console.error("La respuesta no contiene datos");
        throw new Error("La respuesta del servidor no contiene datos");
      }
    } catch (error) {
      // Log detallado del error
      console.error("Error en verificación de email:", error);
      
      if (error.response) {
        console.error("Detalles de error de respuesta:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error("No se recibió respuesta del servidor:", error.request);
      } else {
        console.error("Error al configurar la solicitud:", error.message);
      }
      
      // Si el error fue por timeout, dar un mensaje más específico
      if (error.name === 'AbortError') {
        throw new Error("La verificación tomó demasiado tiempo. Por favor, intenta de nuevo.");
      }
      
      throw error;
    }
  },
// NUEVO MÉTODO: Verificación directa (fallback)
  verifyEmailDirect: async (token) => {
    try {
      console.log("API - Iniciando verificación directa de email");
      
      // Construir URL completa para redirección directa
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const directUrl = `${backendUrl}/api/auth/verify-email-direct/${token}`;
      
      console.log("Redirigiendo a URL directa:", directUrl);
      
      // Redirigir al usuario a esta URL
      window.location.href = directUrl;
      
      // No es necesario retornar nada ya que estamos redirigiendo
      return { redirecting: true };
    } catch (error) {
      console.error("Error al preparar redirección directa:", error);
      throw error;
    }
  },


  // Función para solicitar restablecimiento de contraseña
  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
      throw error;
    }
  },

  // Función para verificar token de restablecimiento
  verifyResetToken: async (token) => {
    try {
      const response = await axiosInstance.get(`/auth/reset-password/${token}`);
      return response.data;
    } catch (error) {
      console.error('Error al verificar token de restablecimiento:', error);
      throw error;
    }
  },

// Función para restablecer contraseña
resetPassword: async (token, password) => {
  try {
    const response = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    throw error;
  }
},

 // Función para reenviar el correo de verificación
  resendVerification: async (email) => {
    try {
      const response = await axiosInstance.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      console.error('Error al reenviar verificación:', error);
      throw error;
    }
  },

// Coaches - Admin
getCoaches: async () => {
  try {
    const response = await axiosInstance.get('/coach');
    return response;
  } catch (error) {
    console.error('Error al obtener coaches:', error);
    throw error;
  }
},

createCoach: async (coachData) => {
  try {
    const response = await axiosInstance.post('/coach', coachData);
    return response;
  } catch (error) {
    console.error('Error al crear coach:', error);
    throw error;
  }
},

// Coaches - Cliente
getAvailableCoaches: async () => {
  try {
    const response = await axiosInstance.get('/client/coaches');
    return response;
  } catch (error) {
    console.error('Error al obtener entrenadores disponibles:', error);
    throw error;
  }
},

getCoachClients: async () => {
  try {
    const response = await axiosInstance.get('/coach/clients');
    return response;
  } catch (error) {
    console.error('Error al obtener clientes del coach:', error);
    // Devolver un array vacío en caso de error para evitar errores en el frontend
    return { data: [] };
  }
},

getCoachPendingRequests: async () => {
  try {
    const response = await axiosInstance.get('/coach/pending-requests');
    return response;
  } catch (error) {
    console.error('Error al obtener solicitudes pendientes:', error);
    // Devolver un array vacío en caso de error para evitar errores en el frontend
    return { data: [] };
  }
},

acceptClientRequest: async (requestId) => {
  try {
    const response = await axiosInstance.post(`/coach/accept-request/${requestId}`);
    return response;
  } catch (error) {
    console.error('Error al aceptar solicitud:', error);
    throw error;
  }
},

rejectClientRequest: async (requestId) => {
  try {
    const response = await axiosInstance.post(`/coach/reject-request/${requestId}`);
    return response;
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    throw error;
  }
},

getCoachStatus: async () => {
  try {
    const response = await axiosInstance.get('/client/coach-status');
    return response;
  } catch (error) {
    console.error('Error al obtener estado del entrenador:', error);
    // Si el error es 404, devuelve un estado predeterminado
    if (error.response?.status === 404) {
      return { 
        data: { 
          hasCoach: false, 
          pendingRequest: false 
        } 
      };
    }
    throw error;
  }
},

requestCoach: async (coachId) => {
  try {
    const response = await axiosInstance.post(`/client/request-coach/${coachId}`);
    return response;
  } catch (error) {
    console.error('Error al solicitar entrenador:', error);
    // Mejorar el manejo de errores
    if (error.response?.status === 404) {
      throw new Error('La funcionalidad para solicitar entrenador no está disponible en este momento. Por favor, inténtalo más tarde.');
    }
    throw error;
  }
},

// Obtener detalles de un coach específico (Admin)
getCoachById: async (coachId) => {
  try {
    const response = await axiosInstance.get(`/coach/${coachId}`);
    return response;
  } catch (error) {
    console.error('Error al obtener detalles del coach:', error);
    throw error;
  }
},

// Modificar un coach existente (Admin)
updateCoach: async (coachId, coachData) => {
  try {
    const response = await axiosInstance.put(`/coach/${coachId}`, coachData);
    return response;
  } catch (error) {
    console.error('Error al actualizar coach:', error);
    throw error;
  }
},

// Eliminar un coach (Admin)
deleteCoach: async (coachId) => {
  try {
    const response = await axiosInstance.delete(`/coach/${coachId}`);
    return response;
  } catch (error) {
    console.error('Error al eliminar coach:', error);
    throw error;
  }
},

// Gestión de usuarios (Admin)
getUsers: async () => {
  try {
    const response = await axiosInstance.get('/admin/users');
    return response;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
},

createUser: async (userData) => {
  try {
    const response = await axiosInstance.post('/admin/users', userData);
    return response;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
},

updateUser: async (userId, userData) => {
  try {
    const response = await axiosInstance.put(`/admin/users/${userId}`, userData);
    return response;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
},

deleteUser: async (userId) => {
  try {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
},

// Función para obtener estadísticas del dashboard
getAdminStats: async (timeframe = 'month') => {
  try {
    console.log(`Solicitando estadísticas con timeframe: ${timeframe}`);
    const response = await axiosInstance.get(`/admin/dashboard/stats?timeframe=${timeframe}`);
    console.log('Respuesta de estadísticas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    // En caso de error, devolver un objeto con valores a cero
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalCoaches: 0,
      activeSubscriptions: 0,
      pendingVerifications: 0
    };
  }
},

// Función para obtener datos comparativos para estadísticas
getStatsComparison: async (timeframe = 'month') => {
  try {
    console.log(`Solicitando datos comparativos con timeframe: ${timeframe}`);
    const response = await axiosInstance.get(`/admin/dashboard/stats/comparison?timeframe=${timeframe}`);
    console.log('Respuesta de datos comparativos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos comparativos:', error);
    // En caso de error, devolver un objeto con valores a cero
    return {
      totalUsers: { current: 0, previous: 0 },
      activeUsers: { current: 0, previous: 0 },
      totalCoaches: { current: 0, previous: 0 },
      activeSubscriptions: { current: 0, previous: 0 }
    };
  }
},

// Función para obtener actividad reciente
getRecentActivity: async (filters = {}) => {
  try {
    // Construir query params
    const params = new URLSearchParams();
    
    if (filters.type) {
      params.append('type', filters.type);
    }
    
    if (filters.timeFilter) {
      params.append('timeFilter', filters.timeFilter);
    }
    
    if (filters.limit) {
      params.append('limit', filters.limit);
    }
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    console.log(`Solicitando actividad reciente con filtros: ${queryString}`);
    
    const response = await axiosInstance.get(`/admin/dashboard/activity${queryString}`);
    console.log('Respuesta de actividad reciente:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener actividad reciente:', error);
    return []; // Devolver array vacío en caso de error
  }
},

// Función para obtener verificaciones pendientes
getPendingVerifications: async () => {
  try {
    const response = await axiosInstance.get('/admin/verification/pending');
    console.log('Respuesta de verificaciones pendientes:', response.data);
    return response.data.count || 0;
  } catch (error) {
    console.error('Error al obtener verificaciones pendientes:', error);
    return 0;
  }
},

requestProfileUpdate: async (userData) => {
  try {
    const response = await axiosInstance.post('/client/profile/update-request', userData);
    return response.data;
  } catch (error) {
    console.error('Error al solicitar actualización de perfil:', error);
    throw error;
  }
},
// Función para solicitar actualización de perfil
requestProfileUpdate: async (userData) => {
  try {
    const response = await axiosInstance.post('/client/profile/update-request', userData);
    return response.data;
  } catch (error) {
    console.error('Error al solicitar actualización de perfil:', error);
    throw error;
  }
},

// Funciones para el administrador (para manejar solicitudes de actualización)
getProfileUpdateRequests: async () => {
  try {
    const response = await axiosInstance.get('/admin/profile-requests');
    return response.data;
  } catch (error) {
    console.error('Error al obtener solicitudes de actualización de perfil:', error);
    return []; // Devolver array vacío en caso de error
  }
},

approveProfileUpdate: async (requestId) => {
  try {
    const response = await axiosInstance.post(`/admin/profile-requests/${requestId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error al aprobar solicitud de actualización de perfil:', error);
    throw error;
  }
},

rejectProfileUpdate: async (requestId) => {
  try {
    const response = await axiosInstance.post(`/admin/profile-requests/${requestId}/reject`);
    return response.data;
  } catch (error) {
    console.error('Error al rechazar solicitud de actualización de perfil:', error);
    throw error;
  }
},


// Función updateProfile mejorada en api.js

updateProfile: async (userData) => {
  try {
    console.log('Enviando solicitud de actualización de perfil con datos:', JSON.stringify(userData, null, 2));
    
    // Verificar si hay token en localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No hay token almacenado en localStorage');
      throw new Error('No hay token de autenticación');
    }
    
    // Registrar la URL completa para depuración
    const url = `${API_URL}/auth/profile`;
    console.log('URL de solicitud:', url);
    console.log('Cabeceras:', {
      'Content-Type': 'application/json',
      'x-auth-token': token.substring(0, 10) + '...'
    });
    
    // Hacer la solicitud con configuración explícita para mejor depuración
    const response = await axios({
      method: 'put',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      data: userData,
      timeout: 10000 // 10 segundos de timeout
    });
    
    // Verificar si la respuesta es exitosa
    if (response.status !== 200) {
      console.error('Respuesta con código inesperado:', response.status);
      throw new Error(`Error en la respuesta: ${response.status}`);
    }
    
    // Verificar si hay datos en la respuesta
    if (!response.data) {
      console.error('La respuesta no contiene datos');
      throw new Error('La respuesta no contiene datos del usuario');
    }
    
    console.log('Respuesta del servidor:', JSON.stringify(response.data, null, 2));
    console.log('Perfil actualizado correctamente');
    
    return response.data;
  } catch (error) {
    console.error('Error completo al actualizar perfil:', error);
    
    // Manejo detallado de errores
    if (error.response) {
      console.error('Datos de la respuesta de error:', error.response.data);
      console.error('Estado HTTP:', error.response.status);
      console.error('Cabeceras de respuesta:', error.response.headers);
      
      // Mensaje específico según el código de error
      if (error.response.status === 401) {
        console.error('Error de autenticación: Token inválido o expirado');
        localStorage.removeItem('token');
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      } else if (error.response.status === 403) {
        console.error('Error de permisos: No autorizado para realizar esta acción');
        throw new Error('No tienes permisos para actualizar el perfil.');
      } else if (error.response.status === 404) {
        console.error('Endpoint no encontrado');
        throw new Error('El servicio de actualización de perfil no está disponible.');
      } else if (error.response.status === 500) {
        console.error('Error interno del servidor:', error.response.data);
        throw new Error(`Error interno del servidor: ${error.response.data.message || 'Error desconocido'}`);
      } else {
        console.error(`Error ${error.response.status}:`, error.response.data);
        throw new Error(error.response.data.message || 'Error al actualizar el perfil.');
      }
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor. Detalles de la solicitud:', error.request);
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
    } else {
      console.error('Error al configurar la solicitud:', error.message);
      throw new Error(`Error en la aplicación: ${error.message}`);
    }
  }
},
// Nueva función específica para actualizar perfil de coach en api.js

updateCoachProfile: async (coachData) => {
  try {
    console.log('Enviando solicitud de actualización de perfil de coach:', coachData);
    
    // Verificar si hay token en localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No hay token almacenado en localStorage');
      throw new Error('No hay token de autenticación');
    }
    
    // Hacer la solicitud a un nuevo endpoint específico para actualizar coach
    const response = await axiosInstance.post('/coach/update-profile', coachData);
    
    // Verificar si la respuesta es exitosa
    if (response.status !== 200) {
      console.error('Respuesta con código de error:', response.status);
      throw new Error(`Error en la respuesta: ${response.status}`);
    }
    
    // Verificar si hay datos en la respuesta
    if (!response.data) {
      console.error('La respuesta no contiene datos');
      throw new Error('La respuesta no contiene datos del coach');
    }
    
    console.log('Perfil de coach actualizado correctamente:', response.data);
    return response.data;
  } catch (error) {
    // Manejo detallado de errores
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('Error de respuesta del servidor:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Mensaje específico según el código de error
      if (error.response.status === 401) {
        console.error('Error de autenticación: Token inválido o expirado');
        // Limpiar token y redirigir al login
        localStorage.removeItem('token');
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      } else if (error.response.status === 403) {
        console.error('Error de permisos: No autorizado para realizar esta acción');
        throw new Error('No tienes permisos para actualizar el perfil de coach.');
      } else {
        console.error(`Error ${error.response.status}: ${error.response.data.message || 'Error del servidor'}`);
        throw new Error(error.response.data.message || 'Error al actualizar el perfil de coach.');
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor:', error.request);
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
    } else {
      // Error en la configuración de la solicitud
      console.error('Error al configurar la solicitud:', error.message);
      throw new Error('Error en la aplicación. Por favor contacte al administrador.');
    }
  }
},

// Función para actualizar la contraseña
updatePassword: async (currentPassword, newPassword) => {
  try {
    const response = await axiosInstance.put('/auth/password', {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    throw error;
  }
},

// Función para obtener todos los datos del perfil
getProfileDetails: async () => {
  try {
    const response = await axiosInstance.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalles del perfil:', error);
    throw error;
  }
},

// Si el usuario es un cliente y tiene entrenador, obtener info del entrenador
getMyCoach: async () => {
  try {
    const response = await axiosInstance.get('/client/my-coach');
    return response.data;
  } catch (error) {
    console.error('Error al obtener información del entrenador:', error);
    // Si el error es 404, significa que no tiene entrenador asignado
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
},

// Si el usuario es un entrenador, obtener sus estadísticas
getCoachStats: async () => {
  try {
    const response = await axiosInstance.get('/coach/stats');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas del entrenador:', error);
    // Devolver objeto vacío en caso de error
    return {};
  }
},

// Si el usuario es cliente, obtener estadísticas de progreso
getClientProgress: async () => {
  try {
    const response = await axiosInstance.get('/client/progress');
    return response.data;
  } catch (error) {
    console.error('Error al obtener progreso del cliente:', error);
    // Devolver objeto vacío en caso de error
    return {};
  }
},

// Obtener información de membresía (para clientes)
getMembershipInfo: async () => {
  try {
    const response = await axiosInstance.get('/client/membership');
    return response.data;
  } catch (error) {
    console.error('Error al obtener información de membresía:', error);
    // Si el error es 404, significa que no tiene membresía activa
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
},

// Obtener el perfil del usuario actual (usando la vista segura)
getUserProfile: async () => {
  try {
    console.log('Solicitando perfil de usuario');
    const response = await axiosInstance.get('/auth/profile');
    console.log('Respuesta de perfil:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    throw error;
  }
},

// Actualizar el perfil del usuario actual (usando el procedimiento almacenado seguro)
updateUserProfile: async (profileData) => {
  try {
    console.log('Enviando actualización de perfil:', profileData);
    const response = await axiosInstance.put('/auth/profile', profileData);
    console.log('Respuesta de actualización:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar perfil de usuario:', error);
    throw error;
  }
},

// Cambiar la contraseña del usuario actual
changePassword: async (currentPassword, newPassword) => {
  try {
    console.log('Solicitando cambio de contraseña');
    const response = await axiosInstance.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    console.log('Respuesta de cambio de contraseña:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    throw error;
  }
},

// Obtener las suscripciones del usuario actual
getUserSubscriptions: async () => {
  try {
    console.log('Solicitando suscripciones de usuario');
    const response = await axiosInstance.get('/auth/subscriptions');
    console.log('Respuesta de suscripciones:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener suscripciones:', error);
    return []; // Retornar array vacío en caso de error
  }
},

// Obtener la asignación de entrenador del usuario actual
getUserCoachAssignment: async () => {
  try {
    console.log('Solicitando asignación de entrenador');
    const response = await axiosInstance.get('/auth/coach-assignment');
    console.log('Respuesta de asignación de entrenador:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener asignación de entrenador:', error);
    return null; // Retornar null en caso de error
  }
},

// Obtener las notificaciones del usuario actual
getUserNotifications: async () => {
  try {
    console.log('Solicitando notificaciones de usuario');
    const response = await axiosInstance.get('/auth/notifications');
    console.log('Respuesta de notificaciones:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return []; // Retornar array vacío en caso de error
  }

},

// Funciones para la gestión de membresías desde el panel de administración

// Obtener usuarios con sus datos de membresía
getUsersWithMemberships: async () => {
  try {
    const response = await axiosInstance.get('/admin/users-with-memberships');
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios con membresías:', error);
    throw error;
  }
},

// Obtener todos los planes disponibles
getAvailablePlans: async () => {
  try {
    const response = await axiosInstance.get('/admin/plans');
    return response.data;
  } catch (error) {
    console.error('Error al obtener planes disponibles:', error);
    throw error;
  }
},

// Crear una nueva membresía
createMembership: async (membershipData) => {
  try {
    const response = await axiosInstance.post('/admin/memberships', membershipData);
    return response.data;
  } catch (error) {
    console.error('Error al crear membresía:', error);
    throw error;
  }
},

// Actualizar una membresía existente
updateMembership: async (id, membershipData) => {
  try {
    const response = await axiosInstance.put(`/admin/memberships/${id}`, membershipData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar membresía:', error);
    throw error;
  }
},

// Cancelar una membresía
cancelMembership: async (id) => {
  try {
    const response = await axiosInstance.post(`/admin/memberships/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error al cancelar membresía:', error);
    throw error;
  }
},

// Renovar una membresía
renewMembership: async (id, membershipData) => {
  try {
    const response = await axiosInstance.post(`/admin/memberships/${id}/renew`, membershipData);
    return response.data;
  } catch (error) {
    console.error('Error al renovar membresía:', error);
    throw error;
  }
},

// Obtener historial de membresías de un usuario
getUserMembershipHistory: async (userId) => {
  try {
    const response = await axiosInstance.get(`/admin/users/${userId}/membership-history`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial de membresías:', error);
    throw error;
  }
},

// Actualización para api.js para funcionar con SQL Server

// Función para probar la conexión
testConnection: async () => {
  try {
    const response = await axiosInstance.get('/test');
    console.log('Conexión exitosa al servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error en la prueba de conexión:', error);
    throw error;
  }
},

// Funciones para clientes - sección de membresías
getCurrentUserMembership: async () => {
  try {
    console.log('Solicitando información de membresía del usuario actual');
    const response = await axiosInstance.get('/usuarios/current/membresia');
    console.log('Respuesta de membresía recibida:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener membresía del usuario:', error);
    
    // Incluso en caso de error, devolvemos un estado mínimo para evitar errores en la UI
    return { 
      estado_membresia: 'inactiva',
      // Si tenemos información del usuario, incluirla
      id_usuario: localStorage.getItem('userId') || null,
    };
  }
},

getClientAvailablePlans: async () => {
  try {
    console.log('Solicitando planes disponibles para el cliente');
    const response = await axiosInstance.get('/planes');
    console.log('Planes disponibles recibidos:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener planes disponibles:', error);
    return []; // Retornar array vacío en caso de error
  }
},

createClientMembership: async (membershipData) => {
  try {
    console.log('Creando nueva membresía para el cliente:', membershipData);
    
    // Validar datos antes de enviar
    if (!membershipData.id_plan || !membershipData.tipo_plan) {
      throw new Error('Datos incompletos para crear membresía');
    }
    
    const response = await axiosInstance.post('/membresias', membershipData);
    console.log('Respuesta de creación de membresía:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al crear membresía para el cliente:', error);
    throw error;
  }
},
// Función mejorada para guardar medidas físicas
savePhysicalMeasurements: async (physicalData) => {
  try {
    console.log('Enviando medidas físicas para guardar:', physicalData);
    
    // Verificar si hay token en localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No hay token almacenado en localStorage');
      throw new Error('No hay token de autenticación');
    }
    
    // Variable para almacenar la respuesta
    let response = null;
    let usedEndpoint = '';
    
    // Intentar con el primer endpoint
    try {
      console.log('Intentando con endpoint principal: /client/physical-measurements');
      response = await axiosInstance.post('/client/physical-measurements', physicalData);
      usedEndpoint = 'principal';
    } catch (primaryError) {
      console.warn('Error en endpoint principal:', primaryError.message);
      
      // Solo intentar con el endpoint alternativo si el primero falló con 404
      if (primaryError.response && primaryError.response.status === 404) {
        console.log('Endpoint principal no encontrado, intentando endpoint alternativo...');
        try {
          response = await axiosInstance.post('/usuarios/medidas-fisicas', physicalData);
          usedEndpoint = 'alternativo';
        } catch (fallbackError) {
          console.error('Error en endpoint alternativo:', fallbackError);
          throw fallbackError; // Propagar el error del endpoint alternativo
        }
      } else {
        // Si no es 404, propagar el error original
        throw primaryError;
      }
    }
    
    // Verificar si la respuesta es exitosa
    if (response.status !== 201 && response.status !== 200) {
      console.error('Respuesta con código inesperado:', response.status);
      throw new Error(`Error en la respuesta: ${response.status}`);
    }
    
    console.log(`Medidas físicas guardadas correctamente usando endpoint ${usedEndpoint}:`, response.data);
    return response.data;
  } catch (error) {
    // Manejo detallado de errores
    if (error.response) {
      console.error('Error de respuesta del servidor:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Mensaje específico según el código de error
      if (error.response.status === 401) {
        console.error('Error de autenticación: Token inválido o expirado');
        localStorage.removeItem('token');
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      } else if (error.response.status === 403) {
        console.error('Error de permisos: No autorizado para realizar esta acción');
        throw new Error('No tienes permisos para realizar esta acción.');
      } else if (error.response.status === 404) {
        console.error('Error 404: Endpoints para medidas físicas no encontrados');
        throw new Error('La funcionalidad para guardar medidas físicas no está disponible en este momento. Contacte al administrador.');
      } else {
        console.error(`Error ${error.response.status}: ${error.response.data.message || 'Error del servidor'}`);
        throw new Error(error.response.data.message || 'Error al guardar medidas físicas.');
      }
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor:', error.request);
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
    } else {
      console.error('Error al configurar la solicitud:', error.message);
      throw new Error('Error en la aplicación. Por favor contacte al administrador.');
    }
  }
},
// Función mejorada para obtener medidas físicas del usuario
getPhysicalMeasurements: async () => {
  try {
    console.log('Solicitando historial de medidas físicas');
    const response = await axiosInstance.get('/physical-measurements');
    console.log('Respuesta de medidas físicas:', response.data);
    return response.data;
  } catch (error) {
    // Si el endpoint principal falla, intentamos con un endpoint alternativo
    if (error.response && error.response.status === 404) {
      try {
        console.log('Endpoint principal no encontrado, intentando endpoint alternativo...');
        const fallbackResponse = await axiosInstance.get('/usuarios/medidas-fisicas');
        console.log('Medidas físicas obtenidas correctamente con endpoint alternativo:', fallbackResponse.data);
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error('Error en endpoint alternativo:', fallbackError);
        return []; // Devolver array vacío en caso de error en ambos endpoints
      }
    }
    
    console.error('Error al obtener medidas físicas:', error);
    return []; // Retornar array vacío en caso de error
  }
},
renewClientMembership: async (id_suscripcion, membershipData) => {
  try {
    console.log('Renovando membresía:', id_suscripcion, membershipData);
    
    // Validar datos antes de enviar
    if (!membershipData.id_plan || !membershipData.tipo_plan) {
      throw new Error('Datos incompletos para renovar membresía');
    }
    
    const response = await axiosInstance.put(`/membresias/${id_suscripcion}/renovar`, membershipData);
    console.log('Respuesta de renovación de membresía:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al renovar membresía:', error);
    throw error;
  }
},

cancelClientMembership: async (id_suscripcion) => {
  try {
    console.log('Cancelando membresía:', id_suscripcion);
    const response = await axiosInstance.put(`/membresias/${id_suscripcion}/cancelar`);
    console.log('Respuesta de cancelación de membresía:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al cancelar membresía:', error);
    throw error;
  }
},// Obtener detalles de una rutina específica
getRoutineDetails: async (routineId) => {
  try {
    console.log(`Solicitando detalles de rutina ${routineId}`);
    const response = await axiosInstance.get(`/coach/routine/${routineId}`);
    return response;
  } catch (error) {
    console.error('Error al obtener detalles de rutina:', error);
    throw error;
  }
},

// Obtener asignaciones de una rutina (clientes que tienen asignada esta rutina)
// getRoutineAssignments: async (routineId) => {
//   try {
//     console.log(`Solicitando asignaciones para rutina ${routineId}`);
//     const response = await axiosInstance.get(`/coach/routine/${routineId}/assignments`);
//     return response;
//   } catch (error) {
//     console.error('Error al obtener asignaciones de rutina:', error);
//     // Si el endpoint no existe, devolver un array vacío
//     return { data: [] };
//   }
// },
// Agregar a api.js
// En api.js
getRoutineAssignments: async (routineId) => {
  try {
    console.log(`Solicitando asignaciones para rutina ${routineId}`);
    const response = await axiosInstance.get(`/coach/routine/${routineId}/assignments`);
    return response;
  } catch (error) {
    console.error('Error al obtener asignaciones de rutina:', error);
    // Si el endpoint no existe, devolver un array vacío
    return { data: [] };
  }
},
// Actualizar información de una rutina
updateRoutine: async (routineId, routineData) => {
  try {
    console.log(`Actualizando rutina ${routineId} con datos:`, routineData);
    const response = await axiosInstance.put(`/coach/routine/${routineId}`, routineData);
    return response;
  } catch (error) {
    console.error('Error al actualizar rutina:', error);
    throw error;
  }
},

// Eliminar una rutina
deleteRoutine: async (routineId) => {
  try {
    console.log(`Eliminando rutina ${routineId}`);
    const response = await axiosInstance.delete(`/coach/routine/${routineId}`);
    return response;
  } catch (error) {
    console.error('Error al eliminar rutina:', error);
    throw error;
  }
},
// Actualizar los ejercicios de una rutina
updateRoutineExercises: async (routineId, exercisesData) => {
  try {
    console.log(`Actualizando ejercicios para rutina ${routineId}`);
    console.log(`Total de ejercicios: ${exercisesData.length}`);
    
    const response = await axiosInstance.put(`/coach/routine/${routineId}/exercises`, { 
      exercises: exercisesData 
    });
    
    return response;
  } catch (error) {
    console.error('Error al actualizar ejercicios de rutina:', error);
    throw error;
  }
},
// Guardar medidas físicas
savePhysicalMeasurements: async (physicalData) => {
  try {
    console.log('Guardando medidas físicas:', physicalData);
    const response = await axiosInstance.post('/client/physical-measurements', physicalData);
    return response.data;
  } catch (error) {
    console.error('Error al guardar medidas físicas:', error);
    throw error;
  }
},

// Obtener medidas físicas
getPhysicalMeasurements: async () => {
  try {
    const response = await axiosInstance.get('/client/physical-measurements');
    return response.data;
  } catch (error) {
    console.error('Error al obtener medidas físicas:', error);
    throw error;
  }
},
requestCoach: async (coachId) => {
  try {
    console.log(`Enviando solicitud para el entrenador ID: ${coachId}`);
    
    // Verificar que se está enviando un ID válido
    if (!coachId) {
      throw new Error('ID de entrenador no válido');
    }
    
    const response = await axiosInstance.post(`/client/request-coach/${coachId}`);
    console.log('Respuesta de solicitud exitosa:', response.data);
    return response;
  } catch (error) {
    console.error('Error al solicitar entrenador:', error);
    
    // Detallar el error para ayudar a depurar
    if (error.response) {
      console.error('Datos de error del servidor:', error.response.data);
      console.error('Estado HTTP:', error.response.status);
      
      if (error.response.status === 500) {
        throw new Error('Ha ocurrido un problema en el servidor. El equipo técnico ha sido notificado. Por favor, intenta más tarde.');
      } else if (error.response.status === 404) {
        throw new Error('La funcionalidad para solicitar entrenador no está disponible en este momento.');
      } else if (error.response.status === 409) {
        throw new Error('Ya existe una solicitud pendiente o tienes un entrenador asignado.');
      } else {
        throw new Error(error.response.data?.message || 'Error al procesar tu solicitud. Por favor, inténtalo de nuevo.');
      }
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    } else {
      throw new Error('Error en la aplicación. Por favor contacta al administrador.');
    }
  }
},

// getExercises: async () => {
//   try {
//     console.log('Solicitando lista de ejercicios disponibles');
//     const response = await axiosInstance.get('/coach/exercises');
    
//     // Verificar la respuesta
//     if (!response.data) {
//       console.warn('No se recibieron datos de ejercicios');
//       return { data: [] };
//     }
    
//     console.log(`Se encontraron ${response.data.length} ejercicios`);
//     return response;
//   } catch (error) {
//     console.error('Error al obtener ejercicios:', error);
    
//     // En caso de error, devolver un array vacío para evitar errores en componentes
//     return { data: [] };
//   }
// },
// Obtener todos los ejercicios disponibles
getExercises: async () => {
  try {
    const response = await axiosInstance.get('/coach/exercises');
    // Asegurarse de que la respuesta sea un array
    return {
      data: Array.isArray(response.data) ? response.data : []
    };
  } catch (error) {
    console.error('Error al obtener ejercicios:', error);
    // Devolver una estructura consistente incluso en caso de error
    return { data: [] };
  }
},
// // Asignar rutina a cliente con días específicos
// assignRoutineToClientWithDays: async (clientId, routineId, trainingDays, startDate = null, endDate = null) => {
//   try {
//     console.log(`Asignando rutina ${routineId} al cliente ${clientId} con días específicos`);
    
//     const response = await axiosInstance.post('/coach/assign-routine-with-days', {
//       clientId,
//       routineId,
//       trainingDays,
//       startDate,
//       endDate
//     });
    
//     return response.data;
//   } catch (error) {
//     console.error('Error en assignRoutineToClientWithDays:', error);
//     throw error;
//   }
// },
// assignRoutineToClientWithDays: async (clientId, routineId, trainingDays, startDate = null, endDate = null) => {
//   try {
//     // Asegurarse que clientId y routineId sean números
//     const numClientId = parseInt(clientId);
//     const numRoutineId = parseInt(routineId);
    
//     if (isNaN(numClientId) || isNaN(numRoutineId)) {
//       throw new Error('ID de cliente o rutina no válido');
//     }
    
//     // Verificar que trainingDays sea un array y no esté vacío
//     if (!Array.isArray(trainingDays) || trainingDays.length === 0) {
//       throw new Error('Debe seleccionar al menos un día de entrenamiento');
//     }
    
//     console.log('Enviando petición con datos:', { 
//       clientId: numClientId, 
//       routineId: numRoutineId, 
//       trainingDays, 
//       startDate, 
//       endDate 
//     });
    
//     const response = await axiosInstance.post('/coach/assign-routine-with-days', {
//       clientId: numClientId,
//       routineId: numRoutineId,
//       trainingDays,
//       startDate,
//       endDate
//     });
    
//     return response.data;
//   } catch (error) {
//     console.error('Error en assignRoutineToClientWithDays:', error);
//     throw error;
//   }
// },

// Modificar la función de asignación de rutina en api.js
assignRoutineToClientWithDays: async (clientId, routineId, daysArray) => {
  try {
    console.log(`Asignando rutina ${routineId} al cliente ${clientId} para los días:`, daysArray);
    const response = await axiosInstance.post('/coach/assign-routine', {
      id_cliente: clientId,
      id_rutina: routineId,
      dias_entrenamiento: daysArray
    });
    return response;
  } catch (error) {
    console.error('Error al asignar rutina con días:', error);
    throw error;
  }
},
// En api.js
getAssignmentDays: async (assignmentId) => {
  try {
    console.log(`Solicitando días de entrenamiento para asignación ${assignmentId}`);
    const response = await axiosInstance.get(`/coach/assignment/${assignmentId}/days`);
    return response;
  } catch (error) {
    console.error('Error al obtener días de entrenamiento:', error);
    // Si hay error, devolver array vacío
    return { data: [] };
  }
},
// getRoutineTrainingDays: async (assignmentId) => {
//   try {
//     console.log(`Obteniendo días de entrenamiento para asignación ${assignmentId}`);
//     const response = await axiosInstance.get(`/client/routine-days/${assignmentId}`);
//     return response.data;
//   } catch (error) {
//     console.error('Error en getRoutineTrainingDays:', error);
//     throw error;
//   }
// },


// getClientActiveRoutine: async () => {
//   try {
//     console.log('Obteniendo rutina activa del cliente');
//     const response = await axiosInstance.get('/client/active-routine');
//     return response.data;
//   } catch (error) {
//     console.error('Error en getClientActiveRoutine:', error);
//     throw error;
//   }
// },

// En api.js
// getClientActiveRoutine: async (day) => {
//     try {
//         let url = '/client/active-routine';
//         if (day) {
//             url += `?day=${day}`;
//         }
//         const response = await axiosInstance.get(url);
//         return response;
//     } catch (error) {
//         console.error('Error al obtener rutina activa:', error);
//         return { data: null };
//     }
// },
// En api.js de cliente
getClientActiveRoutine: async (day) => {
    try {
        let url = '/client/active-routine';
        if (day) {
            url += `?day=${day}`;
        }
        const response = await axiosInstance.get(url);
        return response;
    } catch (error) {
        console.error('Error al obtener rutina activa:', error);
        return { data: null };
    }
},

getRoutineTrainingDays: async (assignmentId) => {
    try {
        const response = await axiosInstance.get(`/client/routine-days/${assignmentId}`);
        return response;
    } catch (error) {
        console.error('Error al obtener días de entrenamiento:', error);
        return { data: [] };
    }
},
getClientRoutines: async () => {
    try {
        const response = await axiosInstance.get('/client/routines');
        return response;
    } catch (error) {
        console.error('Error al obtener rutinas del cliente:', error);
        return { data: [] };
    }
},

getRoutineExercises: async (routineId) => {
  try {
    console.log(`Obteniendo ejercicios para rutina ${routineId}`);
    const response = await axiosInstance.get(`/client/routine-exercises/${routineId}`);
    return response.data;
  } catch (error) {
    console.error('Error en getRoutineExercises:', error);
    throw error;
  }
},
getClientById: async (clientId) => {
  try {
    const response = await axiosInstance.get(`/coach/client/${clientId}`);
    return response;
  } catch (error) {
    console.error('Error al obtener cliente por ID:', error);
    throw error;
  }
},
createCustomRoutine: async (routineData) => {
  try {
    console.log('Creando rutina personalizada con datos:', {
      nombre: routineData.nombre,
      objetivo: routineData.objetivo,
      nivel_dificultad: routineData.nivel_dificultad,
      ejercicios: routineData.ejercicios.length
    });
    
    // Validar datos mínimos
    if (!routineData.nombre) {
      throw new Error('El nombre de la rutina es obligatorio');
    }
    
    if (!routineData.ejercicios || routineData.ejercicios.length === 0) {
      throw new Error('La rutina debe tener al menos un ejercicio');
    }
    
    // Enviar solicitud al servidor
    const response = await axiosInstance.post('/coach/routine', routineData);
    
    console.log('Rutina creada correctamente:', response.data);
    
    return response;
  } catch (error) {
    console.error('Error al crear rutina personalizada:', error);
    
    // Detallar el error para mejor diagnóstico
    if (error.response) {
      console.error('Datos del error de respuesta:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    throw error;
  }
},
getCoachRoutines: async () => {
  try {
    const response = await axiosInstance.get('/coach/routines');
    return response;
  } catch (error) {
    console.error('Error al obtener rutinas del coach:', error);
    throw error;
  }
},

getRoutineDetails: async (routineId) => {
  try {
    const response = await axiosInstance.get(`/coach/routine/${routineId}`);
    return response;
  } catch (error) {
    console.error('Error al obtener detalles de rutina:', error);
    throw error;
  }
},

createCustomRoutine: async (routineData) => {
  try {
    const response = await axiosInstance.post('/coach/routine', routineData);
    return response;
  } catch (error) {
    console.error('Error al crear rutina personalizada:', error);
    throw error;
  }
},

assignRoutineToClient: async (clientId, routineId) => {
  try {
    const response = await axiosInstance.post('/coach/assign-routine', {
      id_cliente: clientId,
      id_rutina: routineId
    });
    return response;
  } catch (error) {
    console.error('Error al asignar rutina a cliente:', error);
    throw error;
  }
},

// Métodos para clientes
getClientRoutines: async () => {
  try {
    const response = await axiosInstance.get('/client/routines');
    return response;
  } catch (error) {
    console.error('Error al obtener rutinas del cliente:', error);
    throw error;
  }
},

getClientRoutineDetails: async (routineId) => {
  try {
    const response = await axiosInstance.get(`/client/routine/${routineId}`);
    return response;
  } catch (error) {
    console.error('Error al obtener detalles de rutina del cliente:', error);
    throw error;
  }
},

completeRoutine: async (routineId) => {
  try {
    const response = await axiosInstance.put(`/client/routine/${routineId}/complete`, {});
    return response;
  } catch (error) {
    console.error('Error al completar rutina:', error);
    throw error;
  }
},
// Esta función es opcional, sólo si necesitas ver el historial
getClientMembershipHistory: async () => {
  try {
    console.log('Solicitando historial de membresías');
    const response = await axiosInstance.get('/membresias/historial');
    console.log('Historial de membresías recibido:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener historial de membresías:', error);
    return []; // Retornar array vacío en caso de error
  }
}
};

const verifyEmail = async (token) => {
  try {
    console.log('Enviando solicitud de verificación con token:', token.substring(0, 10) + '...');
    const response = await axios.get(`${apiUrl}/api/auth/verify-email/${token}`);
    return response.data;
  } catch (error) {
    console.error('Error en verifyEmail:', error);
    throw error;
  }
};
// Añadir un método para verificación directa (fallback)
const verifyEmailDirect = async (token) => {
  // Esta función redirige al usuario en lugar de retornar datos
  window.location.href = `${apiUrl}/api/auth/verify-email-direct/${token}`;
};


export { verifyEmail, verifyEmailDirect };
export default api;
