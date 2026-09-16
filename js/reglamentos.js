/**
 * Módulo de Reglamentos Deportivos
 * U.E. Luz del Mundo A - Planillero Deportivo
 */

import { clienteSupabase } from './supabase.js';
import { registrarAuditoria } from './auditoria.js';

export async function obtenerReglamentos() {
  const { data, error } = await clienteSupabase
    .from('reglamentos')
    .select('*')
    .order('nombre', { ascending: true })
    .ejecutar();

  if (error) {
    console.warn('Aviso al obtener reglamentos:', error.message || error);
    return [];
  }
  return data || [];
}

export async function obtenerReglamentoPorId(id) {
  const { data, error } = await clienteSupabase
    .from('reglamentos')
    .select('*')
    .eq('id', id)
    .ejecutar();

  if (error || !data || !data.length) return null;
  return data[0];
}

export async function guardarReglamento(datos) {
  const esEdicion = Boolean(datos.id);
  let resultado;

  if (esEdicion) {
    const anterior = await obtenerReglamentoPorId(datos.id);
    resultado = await clienteSupabase
      .from('reglamentos')
      .eq('id', datos.id)
      .update(datos);

    await registrarAuditoria({
      tabla_afectada: 'reglamentos',
      registro_id: datos.id,
      accion: 'UPDATE',
      datos_anteriores: anterior,
      datos_nuevos: datos,
      descripcion: `Actualización de reglamento: ${datos.nombre}`
    });
  } else {
    resultado = await clienteSupabase
      .from('reglamentos')
      .insert(datos);

    await registrarAuditoria({
      tabla_afectada: 'reglamentos',
      registro_id: resultado.data?.[0]?.id || 'nuevo',
      accion: 'INSERT',
      datos_nuevos: datos,
      descripcion: `Creación de reglamento: ${datos.nombre}`
    });
  }

  return resultado;
}
