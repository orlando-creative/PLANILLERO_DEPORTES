/**
 * Módulo de Partidos Deportivos y Fixture
 * U.E. Luz del Mundo A - Planillero Deportivo
 */

import { clienteSupabase } from './supabase.js';
import { registrarAuditoria } from './auditoria.js';

export async function obtenerPartidos(filtros = {}) {
  let consulta = clienteSupabase.from('partidos').select('*');

  if (filtros.competicion_id) {
    consulta = consulta.eq('competicion_id', filtros.competicion_id);
  }
  if (filtros.deporte) {
    consulta = consulta.eq('deporte', filtros.deporte);
  }
  if (filtros.estado) {
    consulta = consulta.eq('estado', filtros.estado);
  }

  consulta = consulta.order('fecha_hora', { ascending: true });
  const { data, error } = await consulta.ejecutar();

  if (error) {
    console.warn('Aviso al obtener partidos:', error.message || error);
    return [];
  }
  return data || [];
}

export async function obtenerPartidoPorId(id) {
  const { data, error } = await clienteSupabase
    .from('partidos')
    .select('*')
    .eq('id', id)
    .ejecutar();

  if (error || !data || !data.length) return null;
  return data[0];
}

export async function guardarPartido(datos) {
  if (datos.equipo_local_id === datos.equipo_visitante_id) {
    throw new Error('Un equipo no puede jugar contra sí mismo. Seleccione dos equipos diferentes.');
  }

  const esEdicion = Boolean(datos.id);
  let resultado;

  if (esEdicion) {
    const anterior = await obtenerPartidoPorId(datos.id);
    resultado = await clienteSupabase
      .from('partidos')
      .eq('id', datos.id)
      .update(datos);

    await registrarAuditoria({
      tabla_afectada: 'partidos',
      registro_id: datos.id,
      accion: 'UPDATE',
      datos_anteriores: anterior,
      datos_nuevos: datos,
      descripcion: `Modificación de partido: Jornada ${datos.jornada || 'N/D'}`
    });
  } else {
    resultado = await clienteSupabase
      .from('partidos')
      .insert({
        goles_local: 0,
        goles_visitante: 0,
        penales_local: 0,
        penales_visitante: 0,
        estado: 'programado',
        periodo_actual: 1,
        minuto_actual: 0,
        ...datos
      });

    await registrarAuditoria({
      tabla_afectada: 'partidos',
      registro_id: resultado.data?.[0]?.id || 'nuevo',
      accion: 'INSERT',
      datos_nuevos: datos,
      descripcion: `Programación de nuevo partido en cancha ${datos.cancha}`
    });
  }

  return resultado;
}

export async function cambiarEstadoPartido(id, nuevoEstado, datosExtra = {}) {
  const anterior = await obtenerPartidoPorId(id);
  if (!anterior) throw new Error('Partido no encontrado');

  const actualizacion = {
    estado: nuevoEstado,
    ...datosExtra
  };

  const res = await clienteSupabase
    .from('partidos')
    .eq('id', id)
    .update(actualizacion);

  await registrarAuditoria({
    tabla_afectada: 'partidos',
    registro_id: id,
    accion: 'CAMBIO_ESTADO',
    datos_anteriores: { estado: anterior.estado },
    datos_nuevos: { estado: nuevoEstado, ...datosExtra },
    descripcion: `Cambio de estado de partido a "${nuevoEstado}"`
  });

  return res;
}

export async function eliminarPartido(id) {
  // Eliminar eventos asociados
  await clienteSupabase
    .from('eventos_partido')
    .eq('partido_id', id)
    .delete();

  const anterior = await obtenerPartidoPorId(id);
  const res = await clienteSupabase
    .from('partidos')
    .eq('id', id)
    .delete();

  await registrarAuditoria({
    tabla_afectada: 'partidos',
    registro_id: id,
    accion: 'DELETE',
    datos_anteriores: anterior,
    descripcion: `Eliminación de partido ID: ${id}`
  });

  return res;
}
