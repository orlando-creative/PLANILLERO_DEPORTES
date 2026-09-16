/**
 * Módulo de Jugadores y Plantillas
 * U.E. Luz del Mundo A - Planillero Deportivo
 */

import { clienteSupabase } from './supabase.js';
import { registrarAuditoria } from './auditoria.js';
import { esAdministrador } from './permisos.js';
import { enmascararEstudiante } from './utilidades.js';

export async function obtenerJugadores(equipoId = null) {
  let consulta = clienteSupabase.from('jugadores').select('*');
  if (equipoId) {
    consulta = consulta.eq('equipo_id', equipoId);
  }
  consulta = consulta.order('numero_camiseta', { ascending: true });
  const { data, error } = await consulta.ejecutar();

  if (error) {
    console.warn('Aviso al obtener jugadores:', error.message || error);
    return [];
  }

  const esAdmin = esAdministrador();
  return (data || []).map(j => {
    if (esAdmin) {
      return j;
    }
    // Para espectadores, enmascarar información personal
    return {
      ...j,
      apellido_protegido: enmascararEstudiante(j.nombre, j.apellido),
      apellido: enmascararEstudiante(j.nombre, j.apellido)
    };
  });
}

export async function obtenerJugadorPorId(id) {
  const { data, error } = await clienteSupabase
    .from('jugadores')
    .select('*')
    .eq('id', id)
    .ejecutar();

  if (error || !data || !data.length) return null;
  return data[0];
}

export async function guardarJugador(datos) {
  const esEdicion = Boolean(datos.id);

  // Validar número de camiseta único dentro del mismo equipo
  const plantilla = await clienteSupabase
    .from('jugadores')
    .select('*')
    .eq('equipo_id', datos.equipo_id)
    .ejecutar();

  const camisetaNum = parseInt(datos.numero_camiseta, 10);
  const duplicado = (plantilla.data || []).find(j => 
    j.numero_camiseta === camisetaNum && (!esEdicion || j.id !== datos.id)
  );

  if (duplicado) {
    throw new Error(`El número de camiseta ${camisetaNum} ya está asignado al estudiante ${duplicado.nombre} ${duplicado.apellido} en este equipo.`);
  }

  let resultado;
  if (esEdicion) {
    const anterior = await obtenerJugadorPorId(datos.id);
    resultado = await clienteSupabase
      .from('jugadores')
      .eq('id', datos.id)
      .update(datos);

    await registrarAuditoria({
      tabla_afectada: 'jugadores',
      registro_id: datos.id,
      accion: 'UPDATE',
      datos_anteriores: anterior,
      datos_nuevos: datos,
      descripcion: `Actualización de jugador: ${datos.nombre} ${datos.apellido} (#${datos.numero_camiseta})`
    });
  } else {
    resultado = await clienteSupabase
      .from('jugadores')
      .insert({
        activo: true,
        visible_publico: true,
        ...datos
      });

    await registrarAuditoria({
      tabla_afectada: 'jugadores',
      registro_id: resultado.data?.[0]?.id || 'nuevo',
      accion: 'INSERT',
      datos_nuevos: datos,
      descripcion: `Inscripción de jugador: ${datos.nombre} ${datos.apellido} (#${datos.numero_camiseta})`
    });
  }

  return resultado;
}

export async function eliminarJugador(id) {
  const anterior = await obtenerJugadorPorId(id);
  const resultado = await clienteSupabase
    .from('jugadores')
    .eq('id', id)
    .delete();

  await registrarAuditoria({
    tabla_afectada: 'jugadores',
    registro_id: id,
    accion: 'DELETE',
    datos_anteriores: anterior,
    descripcion: `Eliminación de jugador: ${anterior?.nombre} ${anterior?.apellido}`
  });

  return resultado;
}
