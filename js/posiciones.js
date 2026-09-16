/**
 * Módulo de Tabla de Posiciones, Clasificación y Eliminatorias Relámpago
 * U.E. Luz del Mundo A - Planillero Deportivo
 *
 * En modalidad de liga:
 * - Tabla por puntos acumulados (3 por victoria, 1 por empate, 0 por derrota)
 * - Criterios de desempate reglamentarios (Puntos, DG, GF, GC)
 *
 * En modalidad de torneo relámpago (eliminatoria directa):
 * - NO HAY PUNTOS.
 * - El representativo que pierde queda automáticamente FUERA de la competición.
 * - El representativo ganador clasifica a la siguiente fase o se corona Campeón.
 * - En caso de empate al final del tiempo reglamentario, se define por penales.
 */

import { clienteSupabase } from './supabase.js';
import { obtenerEquiposDeCompeticion, obtenerCompeticionPorId } from './competiciones.js';
import { obtenerReglamentoPorId } from './reglamentos.js';

/**
 * Obtiene la clasificación completa según el tipo de competición (Liga o Relámpago Eliminatorio)
 */
export async function obtenerClasificacionCompeticion(competicionId) {
  if (!competicionId) return null;

  const competicion = await obtenerCompeticionPorId(competicionId);
  if (!competicion) return null;

  const equipos = await obtenerEquiposDeCompeticion(competicionId);
  const esEliminatoria = competicion.tipo_competicion === 'torneo_eliminatorio';

  if (esEliminatoria) {
    return await calcularEliminatoriaRelampago(competicion, equipos);
  } else {
    const tablaLiga = await calcularTablaLiga(competicion, equipos);
    return {
      es_eliminatoria: false,
      competicion,
      equipos,
      tabla: tablaLiga
    };
  }
}

/**
 * Cálculo para Torneo Relámpago (Eliminatoria Directa)
 * Regla: No hay puntos, el que pierde queda fuera.
 */
async function calcularEliminatoriaRelampago(competicion, equipos) {
  // Obtener todos los partidos de la competición (para construir el bracket de llaves)
  const { data: partidos } = await clienteSupabase
    .from('partidos')
    .select('*')
    .eq('competicion_id', competicion.id)
    .order('fecha_hora', { ascending: true })
    .ejecutar();

  const mapaEquipos = {};
  for (const eq of equipos) {
    mapaEquipos[eq.id] = {
      equipo_id: eq.id,
      nombre_personalizado: eq.nombre_personalizado,
      curso: eq.curso,
      escudo_url: eq.escudo_url || 'assets/escudo-luz-del-mundo.svg',
      pj: 0,
      pg: 0,
      pp: 0,
      gf: 0,
      gc: 0,
      dg: 0,
      estado: 'clasificado', // 'campeon', 'subcampeon', 'clasificado', 'eliminado'
      fase_alcanzada: 'Primera Ronda',
      detalle_eliminacion: 'En carrera',
      eliminado: false,
      partidos_jugados: []
    };
  }

  // Estructura de llaves por rondas
  const rondasMapa = {};

  for (const p of (partidos || [])) {
    const jornadaNombre = p.jornada || 'Fase Eliminatoria';
    if (!rondasMapa[jornadaNombre]) {
      rondasMapa[jornadaNombre] = {
        nombre: jornadaNombre,
        partidos: []
      };
    }

    const local = mapaEquipos[p.equipo_local_id];
    const visitante = mapaEquipos[p.equipo_visitante_id];

    let ganadorId = null;
    let perdedorId = null;
    let metodoGanador = 'tiempo_reglamentario'; // o 'penales'

    if (p.estado === 'finalizado') {
      if (p.goles_local > p.goles_visitante) {
        ganadorId = p.equipo_local_id;
        perdedorId = p.equipo_visitante_id;
      } else if (p.goles_visitante > p.goles_local) {
        ganadorId = p.equipo_visitante_id;
        perdedorId = p.equipo_local_id;
      } else {
        // Empate en goles: se define por penales en eliminatoria
        if ((p.penales_local || 0) > (p.penales_visitante || 0)) {
          ganadorId = p.equipo_local_id;
          perdedorId = p.equipo_visitante_id;
          metodoGanador = 'penales';
        } else if ((p.penales_visitante || 0) > (p.penales_local || 0)) {
          ganadorId = p.equipo_visitante_id;
          perdedorId = p.equipo_local_id;
          metodoGanador = 'penales';
        }
      }

      // Actualizar estadísticas de los equipos
      if (local) {
        local.pj++;
        local.gf += p.goles_local;
        local.gc += p.goles_visitante;
        local.fase_alcanzada = jornadaNombre;
      }
      if (visitante) {
        visitante.pj++;
        visitante.gf += p.goles_visitante;
        visitante.gc += p.goles_local;
        visitante.fase_alcanzada = jornadaNombre;
      }

      const esFinal = jornadaNombre.toLowerCase().includes('final') && !jornadaNombre.toLowerCase().includes('semifinal') && !jornadaNombre.toLowerCase().includes('cuartos');

      if (ganadorId) {
        const ganadorEq = mapaEquipos[ganadorId];
        if (ganadorEq) {
          ganadorEq.pg++;
          if (esFinal) {
            ganadorEq.estado = 'campeon';
            ganadorEq.detalle_eliminacion = '🏆 ¡GRAN CAMPEÓN DEL RELÁMPAGO!';
          } else {
            ganadorEq.fase_alcanzada = jornadaNombre;
            ganadorEq.detalle_eliminacion = 'Avanza a la siguiente ronda';
          }
        }
      }

      if (perdedorId) {
        const perdedorEq = mapaEquipos[perdedorId];
        if (perdedorEq) {
          perdedorEq.pp++;
          perdedorEq.eliminado = true;
          if (esFinal) {
            perdedorEq.estado = 'subcampeon';
            perdedorEq.detalle_eliminacion = '🥈 Subcampeón Institucional';
          } else {
            perdedorEq.estado = 'eliminado';
            perdedorEq.detalle_eliminacion = `Eliminado en ${jornadaNombre} (Queda fuera)`;
          }
        }
      }
    }

    rondasMapa[jornadaNombre].partidos.push({
      ...p,
      equipo_local: local,
      equipo_visitante: visitante,
      ganador_id: ganadorId,
      perdedor_id: perdedorId,
      metodo_ganador: metodoGanador
    });
  }

  // Calcular diferencia de goles y ordenar mérito eliminatorio
  const listaEquipos = Object.values(mapaEquipos).map(eq => ({
    ...eq,
    dg: eq.gf - eq.gc
  }));

  // Orden de mérito en torneo eliminatorio:
  // 1. Campeón
  // 2. Subcampeón
  // 3. Equipos clasificados aún en competencia (sin derrotas)
  // 4. Eliminados ordenados por ronda más avanzada y luego por victorias / diferencia de goles
  const jerarquiaEstado = {
    campeon: 1,
    subcampeon: 2,
    clasificado: 3,
    eliminado: 4
  };

  const jerarquiaFase = {
    'gran final': 1,
    'final': 1,
    'semifinal': 2,
    'semifinales': 2,
    'tercer puesto': 3,
    'cuartos de final': 4,
    'cuartos': 4,
    'octavos de final': 5,
    'primera ronda': 6
  };

  listaEquipos.sort((a, b) => {
    const ordenA = jerarquiaEstado[a.estado] || 99;
    const ordenB = jerarquiaEstado[b.estado] || 99;
    if (ordenA !== ordenB) return ordenA - ordenB;

    const faseA = jerarquiaFase[a.fase_alcanzada.toLowerCase()] || 50;
    const faseB = jerarquiaFase[b.fase_alcanzada.toLowerCase()] || 50;
    if (faseA !== faseB) return faseA - faseB;

    if (b.pg !== a.pg) return b.pg - a.pg;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.nombre_personalizado.localeCompare(b.nombre_personalizado);
  });

  const tablaMerito = listaEquipos.map((eq, idx) => ({
    posicion: idx + 1,
    ...eq
  }));

  // Identificar campeón si existe
  const campeon = tablaMerito.find(e => e.estado === 'campeon') || null;
  const subcampeon = tablaMerito.find(e => e.estado === 'subcampeon') || null;

  return {
    es_eliminatoria: true,
    competicion,
    equipos,
    campeon,
    subcampeon,
    rondas: Object.values(rondasMapa),
    tablaMerito
  };
}

/**
 * Cálculo para Liga (Todos contra todos por puntos)
 */
async function calcularTablaLiga(competicion, equipos) {
  let ptsVictoria = 3;
  let ptsEmpate = 1;
  let ptsDerrota = 0;

  if (competicion.reglamento_id) {
    const reg = await obtenerReglamentoPorId(competicion.reglamento_id);
    if (reg) {
      ptsVictoria = reg.puntos_victoria ?? 3;
      ptsEmpate = reg.puntos_empate ?? 1;
      ptsDerrota = reg.puntos_derrota ?? 0;
    }
  }

  // Obtener partidos finalizados
  const { data: partidos } = await clienteSupabase
    .from('partidos')
    .select('*')
    .eq('competicion_id', competicion.id)
    .eq('estado', 'finalizado')
    .ejecutar();

  const mapaEquipos = {};
  for (const eq of equipos) {
    mapaEquipos[eq.id] = {
      equipo_id: eq.id,
      nombre_personalizado: eq.nombre_personalizado,
      curso: eq.curso,
      escudo_url: eq.escudo_url || 'assets/escudo-luz-del-mundo.svg',
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      gf: 0,
      gc: 0,
      dg: 0,
      pts: 0
    };
  }

  for (const p of (partidos || [])) {
    const local = mapaEquipos[p.equipo_local_id];
    const visitante = mapaEquipos[p.equipo_visitante_id];

    if (!local || !visitante) continue;

    local.pj++;
    visitante.pj++;

    local.gf += p.goles_local;
    local.gc += p.goles_visitante;
    visitante.gf += p.goles_visitante;
    visitante.gc += p.goles_local;

    if (p.goles_local > p.goles_visitante) {
      local.pg++;
      local.pts += ptsVictoria;
      visitante.pp++;
      visitante.pts += ptsDerrota;
    } else if (p.goles_local < p.goles_visitante) {
      visitante.pg++;
      visitante.pts += ptsVictoria;
      local.pp++;
      local.pts += ptsDerrota;
    } else {
      local.pe++;
      local.pts += ptsEmpate;
      visitante.pe++;
      visitante.pts += ptsEmpate;
    }
  }

  const tabla = Object.values(mapaEquipos).map(item => ({
    ...item,
    dg: item.gf - item.gc
  }));

  // Criterios de ordenamiento reglamentario para Liga
  tabla.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    if (a.gc !== b.gc) return a.gc - b.gc;
    return a.nombre_personalizado.localeCompare(b.nombre_personalizado);
  });

  return tabla.map((fila, index) => ({
    posicion: index + 1,
    ...fila
  }));
}

/**
 * Función compatible con llamadas anteriores
 */
export async function calcularTablaPosiciones(competicionId) {
  const res = await obtenerClasificacionCompeticion(competicionId);
  if (!res) return [];
  if (res.es_eliminatoria) {
    return res.tablaMerito;
  }
  return res.tabla;
}
