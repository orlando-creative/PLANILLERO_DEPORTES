/**
 * Módulo de Eventos Deportivos en Partido (Planilla en Vivo)
 * U.E. Luz del Mundo A - Planillero Deportivo
 */

import { clienteSupabase } from './supabase.js';
import { registrarAuditoria } from './auditoria.js';
import { obtenerPartidoPorId } from './partidos.js';

export async function obtenerEventosPartido(partidoId) {
  const { data, error } = await clienteSupabase
    .from('eventos_partido')
    .select('*')
    .eq('partido_id', partidoId)
    .order('periodo', { ascending: true })
    .order('minuto', { ascending: true })
    .order('segundo', { ascending: true })
    .ejecutar();

  if (error) {
    console.warn('Aviso al obtener eventos del partido:', error.message || error);
    return [];
  }
  return data || [];
}

export async function recalcularMarcadorPartido(partidoId) {
  const partido = await obtenerPartidoPorId(partidoId);
  if (!partido) return;

  const eventos = await obtenerEventosPartido(partidoId);

  let golesLocal = 0;
  let golesVisitante = 0;
  let penalesLocal = 0;
  let penalesVisitante = 0;

  for (const ev of eventos) {
    if (ev.revertido || !ev.confirmado) continue;

    if (ev.tipo_evento === 'gol') {
      if (ev.equipo_id === partido.equipo_local_id) {
        golesLocal++;
      } else if (ev.equipo_id === partido.equipo_visitante_id) {
        golesVisitante++;
      }
    } else if (ev.tipo_evento === 'penal_desempate') {
      if (ev.equipo_id === partido.equipo_local_id) {
        penalesLocal++;
      } else if (ev.equipo_id === partido.equipo_visitante_id) {
        penalesVisitante++;
      }
    }
  }

  await clienteSupabase
    .from('partidos')
    .eq('id', partidoId)
    .update({
      goles_local: golesLocal,
      goles_visitante: golesVisitante,
      penales_local: penalesLocal,
      penales_visitante: penalesVisitante
    });

  return { golesLocal, golesVisitante, penalesLocal, penalesVisitante };
}

export async function registrarEvento(datos) {
  const res = await clienteSupabase
    .from('eventos_partido')
    .insert({
      confirmado: true,
      revertido: false,
      ...datos
    });

  if (datos.tipo_evento === 'gol' || datos.tipo_evento === 'penal_desempate') {
    await recalcularMarcadorPartido(datos.partido_id);
  }

  await registrarAuditoria({
    tabla_afectada: 'eventos_partido',
    registro_id: res.data?.[0]?.id || 'nuevo',
    accion: 'INSERT',
    datos_nuevos: datos,
    descripcion: `Registro de evento deportivo "${datos.tipo_evento}" en partido ${datos.partido_id}`
  });

  return res;
}

export async function revertirEvento(eventoId, partidoId) {
  const res = await clienteSupabase
    .from('eventos_partido')
    .eq('id', eventoId)
    .update({ revertido: true });

  await recalcularMarcadorPartido(partidoId);

  await registrarAuditoria({
    tabla_afectada: 'eventos_partido',
    registro_id: eventoId,
    accion: 'REVERTIR_EVENTO',
    descripcion: `Reversión / anulación de evento deportivo ${eventoId}`
  });

  return res;
}

export async function restaurarEvento(eventoId, partidoId) {
  const res = await clienteSupabase
    .from('eventos_partido')
    .eq('id', eventoId)
    .update({ revertido: false });

  await recalcularMarcadorPartido(partidoId);

  await registrarAuditoria({
    tabla_afectada: 'eventos_partido',
    registro_id: eventoId,
    accion: 'UPDATE',
    descripcion: `Restauración de evento deportivo ${eventoId}`
  });

  return res;
}

export async function eliminarEvento(eventoId, partidoId) {
  const res = await clienteSupabase
    .from('eventos_partido')
    .eq('id', eventoId)
    .delete();

  await recalcularMarcadorPartido(partidoId);

  await registrarAuditoria({
    tabla_afectada: 'eventos_partido',
    registro_id: eventoId,
    accion: 'DELETE',
    descripcion: `Eliminación de evento ${eventoId}`
  });

  return res;
}
