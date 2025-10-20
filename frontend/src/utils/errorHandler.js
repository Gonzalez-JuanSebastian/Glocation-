// Utilidad para manejar errores globalmente
export const handleError = (error, context = '') => {
  console.error(`Error en ${context}:`, error);
  
  // Ignorar errores de Firebase de extensiones
  if (error?.message?.includes('firebase') || 
      error?.message?.includes('identitytoolkit')) {
    return; // Silenciar errores de extensiones
  }
  
  // Aquí podrías enviar errores a un servicio de monitoreo
  // Sentry.captureException(error);
};

// Utilidad para validar datos de la API
export const validateApiResponse = (data, expectedType = 'array') => {
  if (!data) {
    console.warn('API response is null or undefined');
    return expectedType === 'array' ? [] : {};
  }
  
  if (expectedType === 'array' && !Array.isArray(data)) {
    console.warn('Expected array but got:', typeof data, data);
    return [];
  }
  
  if (expectedType === 'object' && (typeof data !== 'object' || Array.isArray(data))) {
    console.warn('Expected object but got:', typeof data, data);
    return {};
  }
  
  return data;
};