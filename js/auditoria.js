/**
 * Módulo de Historial de Auditoría
 * U.E. Luz del Mundo A - Planillero Deportivo
 */

import { clienteSupabase } from './supabase.js';

/**
 * Registra una acción administrativa en el historial de auditoría
 */
export async function registrarAuditoria({
  tabla_afectada,
  registro_id,
  accion,
  datos_anteriores = null,
  datos_nuevos = null,
  descripcion = ''
}) {
  try {
    const usuario = clienteSupabase.auth.obtenerUsuario();
    const registro = {
      tabla_afectada,
      registro_id: String(registro_id),
      accion,
      usuario_id: usuario?.id || null,
      datos_anteriores: datos_anteriores ? JSON.stringify(datos_anteriores) : null,
      datos_nuevos: datos_nuevos ? JSON.stringify(datos_nuevos) : null,
      descripcion,
      creado_en: new Date().toISOString()
    };

    await clienteSupabase.from('registros_auditoria').insert(registro);
  } catch (err) {
    console.warn('No se pudo registrar la auditoría:', err.message);
  }
}

/**
 * Obtiene los registros de auditoría más recientes
 */
export async function obtenerAuditoria(limite = 100) {
  const { data, error } = await clienteSupabase
    .from('registros_auditoria')
    .select('*')
    .order('creado_en', { ascending: false })
    .limit(limite)
    .ejecutar();

  if (error) {
    console.warn('Aviso al obtener registros de auditoría:', error.message || error);
    return [];
  }
  return data || [];
}
