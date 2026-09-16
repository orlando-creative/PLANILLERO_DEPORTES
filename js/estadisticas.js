/**
 * Módulo de Estadísticas Públicas y Deportivas
 * U.E. Luz del Mundo A - Planillero Deportivo
 */

import { clienteSupabase } from './supabase.js';
import { enmascararEstudiante } from './utilidades.js';
import { esAdministrador } from './permisos.js';

export async function obtenerGoleadores(competicionId = null) {
  // Obtener todos los eventos de tipo gol
  let consulta = clienteSupabase
    .from('eventos_partido')
    .select('*')
    .eq('tipo_evento', 'gol')
    .eq('confirmado', true)
    .eq('revertido', false);

  const { data: goles } = await consulta.ejecutar();
  if (!goles || !goles.length) return [];

  // Obtener partidos para filtrar por competición si aplica
  const { data: partidos } = await clienteSupabase.from('partidos').select('*').ejecutar();
  const mapaPartidos = {};
  (partidos || []).forEach(p => { mapaPartidos[p.id] = p; });

  const golesFiltrados = competicionId
    ? goles.filter(g => mapaPartidos[g.partido_id]?.competicion_id === competicionId)
    : goles;

  // Contar goles por jugador
  const conteo = {};
  for (const g of golesFiltrados) {
    if (!g.jugador_id) continue;
    conteo[g.jugador_id] = (conteo[g.jugador_id] || 0) + 1;
  }

  // Obtener datos de jugadores y equipos
  const { data: jugadores } = await clienteSupabase.from('jugadores').select('*').ejecutar();
  const { data: equipos } = await clienteSupabase.from('equipos').select('*').ejecutar();

  const mapaEquipos = {};
  (equipos || []).forEach(e => { mapaEquipos[e.id] = e; });

  const esAdmin = esAdministrador();
  const listaGoleadores = [];

  for (const [jugId, cantidad] of Object.entries(conteo)) {
    const jug = (jugadores || []).find(j => j.id === jugId);
    if (!jug) continue;

    const eq = mapaEquipos[jug.equipo_id];
    const nombreVisual = esAdmin
      ? `${jug.nombre} ${jug.apellido}`
      : enmascararEstudiante(jug.nombre, jug.apellido);

    listaGoleadores.push({
      jugador_id: jug.id,
      nombre_completo: nombreVisual,
      numero_camiseta: jug.numero_camiseta,
      curso: jug.curso,
      equipo_nombre: eq?.nombre_personalizado || 'Equipo',
      equipo_curso: eq?.curso || '',
      goles: cantidad
    });
  }

  listaGoleadores.sort((a, b) => b.goles - a.goles);
  return listaGoleadores.map((g, idx) => ({ posicion: idx + 1, ...g }));
}
