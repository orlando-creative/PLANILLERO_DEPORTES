/**
 * Módulo de Competiciones
 * U.E. Luz del Mundo A - Planillero Deportivo
 */

import { clienteSupabase } from './supabase.js';
import { registrarAuditoria } from './auditoria.js';

export async function obtenerCompeticiones(filtros = {}) {
  let consulta = clienteSupabase.from('competiciones').select('*');

  if (filtros.deporte) {
    consulta = consulta.eq('deporte', filtros.deporte);
  }
  if (filtros.estado) {
    consulta = consulta.eq('estado', filtros.estado);
  }

  consulta = consulta.order('fecha_inicio', { ascending: false });
  const { data, error } = await consulta.ejecutar();

  if (error) {
    console.warn('Aviso al obtener competiciones:', error.message || error);
    return [];
  }
  return data || [];
}

export async function obtenerCompeticionPorId(id) {
  const { data, error } = await clienteSupabase
    .from('competiciones')
    .select('*')
    .eq('id', id)
    .ejecutar();

  if (error || !data || !data.length) return null;
  return data[0];
}

export async function guardarCompeticion(datos) {
  const esEdicion = Boolean(datos.id);
  let resultado;

  if (esEdicion) {
    const anterior = await obtenerCompeticionPorId(datos.id);
    resultado = await clienteSupabase
      .from('competiciones')
      .eq('id', datos.id)
      .update(datos);

    await registrarAuditoria({
      tabla_afectada: 'competiciones',
      registro_id: datos.id,
      accion: 'UPDATE',
      datos_anteriores: anterior,
      datos_nuevos: datos,
      descripcion: `Modificación de competición: ${datos.nombre}`
    });
  } else {
    resultado = await clienteSupabase
      .from('competiciones')
      .insert(datos);

    await registrarAuditoria({
      tabla_afectada: 'competiciones',
      registro_id: resultado.data?.[0]?.id || 'nuevo',
      accion: 'INSERT',
      datos_nuevos: datos,
      descripcion: `Creación de competición: ${datos.nombre}`
    });
  }

  return resultado;
}

export async function eliminarCompeticion(id) {
  // Verificar si tiene partidos asociados
  const { data: partidos } = await clienteSupabase
    .from('partidos')
    .select('id')
    .eq('competicion_id', id)
    .ejecutar();

  if (partidos && partidos.length > 0) {
    throw new Error('No es posible eliminar la competición porque tiene partidos registrados.');
  }

  const anterior = await obtenerCompeticionPorId(id);
  const resultado = await clienteSupabase
    .from('competiciones')
    .eq('id', id)
    .delete();

  await registrarAuditoria({
    tabla_afectada: 'competiciones',
    registro_id: id,
    accion: 'DELETE',
    datos_anteriores: anterior,
    descripcion: `Eliminación de competición: ${anterior?.nombre || id}`
  });

  return resultado;
}

export async function obtenerEquiposDeCompeticion(competicionId) {
  const { data: inscritos } = await clienteSupabase
    .from('competicion_equipos')
    .select('*')
    .eq('competicion_id', competicionId)
    .ejecutar();

  if (!inscritos || !inscritos.length) return [];

  const { data: equipos } = await clienteSupabase
    .from('equipos')
    .select('*')
    .ejecutar();

  const idsInscritos = new Set(inscritos.map(i => i.equipo_id));
  return (equipos || []).filter(eq => idsInscritos.has(eq.id));
}

export async function asociarEquipoACompeticion(competicionId, equipoId) {
  // Verificar duplicado
  const { data: existentes } = await clienteSupabase
    .from('competicion_equipos')
    .select('*')
    .eq('competicion_id', competicionId)
    .eq('equipo_id', equipoId)
    .ejecutar();

  if (existentes && existentes.length > 0) {
    throw new Error('El equipo ya se encuentra inscrito en esta competición.');
  }

  const res = await clienteSupabase
    .from('competicion_equipos')
    .insert({
      competicion_id: competicionId,
      equipo_id: equipoId
    });

  await registrarAuditoria({
    tabla_afectada: 'competicion_equipos',
    registro_id: `${competicionId}_${equipoId}`,
    accion: 'INSERT',
    descripcion: `Inscripción de equipo ${equipoId} en competición ${competicionId}`
  });

  return res;
}

export async function desasociarEquipoDeCompeticion(competicionId, equipoId) {
  const res = await clienteSupabase
    .from('competicion_equipos')
    .eq('competicion_id', competicionId)
    .eq('equipo_id', equipoId)
    .delete();

  await registrarAuditoria({
    tabla_afectada: 'competicion_equipos',
    registro_id: `${competicionId}_${equipoId}`,
    accion: 'DELETE',
    descripcion: `Baja de equipo ${equipoId} de competición ${competicionId}`
  });

  return res;
}
