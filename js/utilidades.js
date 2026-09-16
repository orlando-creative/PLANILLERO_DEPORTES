/**
 * Sistema Planillero Deportivo - U.E. Luz del Mundo A
 * Utilidades Generales y Asistentes de Formato
 */

/**
 * Sanitiza cadenas de texto para prevenir inyección HTML (XSS)
 */
export function sanitizarHTML(texto) {
  if (texto === null || texto === undefined) return '';
  const str = String(texto);
  const mapa = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, m => mapa[m]);
}

/**
 * Genera un UUID v4 compatible con estándares RFC4122
 */
export function generarUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Formatea una fecha ISO a formato local legible
 */
export function formatearFecha(fechaStr) {
  if (!fechaStr) return 'Sin fecha';
  try {
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) return fechaStr;
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return fechaStr;
  }
}

/**
 * Formatea fecha y hora completa
 */
export function formatearFechaHora(fechaHoraStr) {
  if (!fechaHoraStr) return 'Sin programar';
  try {
    const d = new Date(fechaHoraStr);
    if (isNaN(d.getTime())) return fechaHoraStr;
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return fechaHoraStr;
  }
}

/**
 * Formatea minutos y segundos a formato digital "MM:SS"
 */
export function formatearTiempoReloj(minutos, segundos = 0) {
  const m = String(Math.max(0, parseInt(minutos, 10) || 0)).padStart(2, '0');
  const s = String(Math.max(0, parseInt(segundos, 10) || 0)).padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Enmascara datos personales de estudiantes para preservar privacidad en vista pública
 * Ejemplo: "Lucas Gutiérrez" -> "Lucas G***"
 */
export function enmascararEstudiante(nombre, apellido) {
  const nom = (nombre || '').trim();
  const ape = (apellido || '').trim();
  if (!ape) return nom;
  const inicial = ape.charAt(0).toUpperCase();
  return `${nom} ${inicial}***`;
}

/**
 * Obtiene el texto representativo de un estado de partido
 */
export function obtenerTextoEstado(estado) {
  switch (estado) {
    case 'en_juego': return 'En Vivo';
    case 'pausado': return 'Pausado';
    case 'finalizado': return 'Finalizado';
    case 'suspendido': return 'Suspendido';
    case 'cancelado': return 'Cancelado';
    case 'programado':
    default:
      return 'Programado';
  }
}

/**
 * Obtiene la clase CSS para el badge de un estado
 */
export function obtenerClaseEstado(estado) {
  switch (estado) {
    case 'en_juego': return 'insignia-vivo';
    case 'pausado': return 'insignia-pausado';
    case 'finalizado': return 'insignia-finalizado';
    case 'suspendido': return 'insignia-suspendido';
    case 'cancelado': return 'insignia-suspendido';
    case 'programado':
    default:
      return 'insignia-programado';
  }
}

/**
 * Obtiene el nombre formateado de un tipo de evento
 */
export function obtenerNombreEvento(tipo) {
  const mapa = {
    'gol': 'Gol',
    'falta': 'Falta',
    'tarjeta_amarilla': 'Tarjeta Amarilla',
    'tarjeta_roja': 'Tarjeta Roja',
    'tarjeta_azul': 'Tarjeta Azul (Exclusión)',
    'sustitucion': 'Sustitución',
    'tiempo_muerto': 'Tiempo Muerto',
    'periodo_inicio': 'Inicio de Período',
    'periodo_fin': 'Fin de Período',
    'penal': 'Tiro Penal',
    'penal_desempate': 'Penal de Desempate',
    'observacion': 'Observación Arbitral'
  };
  return mapa[tipo] || tipo;
}
