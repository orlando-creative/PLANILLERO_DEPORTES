/**
 * Módulo de Equipos Deportivos
 * U.E. Luz del Mundo A - Planillero Deportivo
 */

import { clienteSupabase } from './supabase.js';
import { registrarAuditoria } from './auditoria.js';

export async function obtenerEquipos(soloActivos = false) {
  let consulta = clienteSupabase.from('equipos').select('*');
  if (soloActivos) {
    consulta = consulta.eq('activo', true);
  }
  consulta = consulta.order('curso', { ascending: true });
  const { data, error } = await consulta.ejecutar();

  if (error) {
    console.warn('Aviso al obtener equipos:', error.message || error);
    return [];
  }
  return data || [];
}

export async function obtenerEquipoPorId(id) {
  const { data, error } = await clienteSupabase
    .from('equipos')
    .select('*')
    .eq('id', id)
    .ejecutar();

  if (error || !data || !data.length) return null;
  return data[0];
}

export async function guardarEquipo(datos) {
  const esEdicion = Boolean(datos.id);

  // Validar unicidad de nombre personalizado + curso
  const todos = await obtenerEquipos();
  const duplicado = todos.find(e => 
    e.nombre_personalizado.trim().toLowerCase() === datos.nombre_personalizado.trim().toLowerCase() &&
    e.curso.trim().toLowerCase() === datos.curso.trim().toLowerCase() &&
    (!esEdicion || e.id !== datos.id)
  );

  if (duplicado) {
    throw new Error(`Ya existe un equipo registrado con el nombre "${datos.nombre_personalizado}" para el curso "${datos.curso}".`);
  }

  let resultado;
  if (esEdicion) {
    const anterior = await obtenerEquipoPorId(datos.id);
    resultado = await clienteSupabase
      .from('equipos')
      .eq('id', datos.id)
      .update(datos);

    await registrarAuditoria({
      tabla_afectada: 'equipos',
      registro_id: datos.id,
      accion: 'UPDATE',
      datos_anteriores: anterior,
      datos_nuevos: datos,
      descripcion: `Actualización de equipo: ${datos.nombre_personalizado} (${datos.curso})`
    });
  } else {
    resultado = await clienteSupabase
      .from('equipos')
      .insert({
        escudo_url: '/assets/escudo-luz-del-mundo.svg',
        activo: true,
        ...datos
      });

    await registrarAuditoria({
      tabla_afectada: 'equipos',
      registro_id: resultado.data?.[0]?.id || 'nuevo',
      accion: 'INSERT',
      datos_nuevos: datos,
      descripcion: `Registro de equipo: ${datos.nombre_personalizado} (${datos.curso})`
    });
  }

  return resultado;
}

export async function eliminarEquipo(id) {
  // Verificar partidos asociados
  const { data: partidosLocal } = await clienteSupabase
    .from('partidos')
    .select('id')
    .eq('equipo_local_id', id)
    .ejecutar();

  const { data: partidosVisitante } = await clienteSupabase
    .from('partidos')
    .select('id')
    .eq('equipo_visitante_id', id)
    .ejecutar();

  if ((partidosLocal && partidosLocal.length > 0) || (partidosVisitante && partidosVisitante.length > 0)) {
    throw new Error('No es posible eliminar el equipo porque tiene partidos registrados en el fixture.');
  }

  // Verificar si tiene jugadores inscritos
  const { data: jugadores } = await clienteSupabase
    .from('jugadores')
    .select('id')
    .eq('equipo_id', id)
    .ejecutar();

  if (jugadores && jugadores.length > 0) {
    throw new Error(`El equipo tiene ${jugadores.length} jugadores inscritos. Debe dar de baja o transferir a los jugadores antes de eliminar el equipo.`);
  }

  const anterior = await obtenerEquipoPorId(id);
  const resultado = await clienteSupabase
    .from('equipos')
    .eq('id', id)
    .delete();

  await registrarAuditoria({
    tabla_afectada: 'equipos',
    registro_id: id,
    accion: 'DELETE',
    datos_anteriores: anterior,
    descripcion: `Eliminación de equipo: ${anterior?.nombre_personalizado} (${anterior?.curso})`
  });

  return resultado;
}
