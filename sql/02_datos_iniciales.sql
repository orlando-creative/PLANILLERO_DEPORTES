-- ========================================================================
-- DATOS INICIALES E INSTITUCIONALES COMPLETOS (SEED DATA)
-- U.E. LUZ DEL MUNDO A - PLANILLERO DEPORTIVO
-- ========================================================================

-- 1. Insertar Reglamentos Deportivos Oficiales
INSERT INTO public.reglamentos (
    id, nombre, deporte, duracion_periodo_minutos, cantidad_periodos,
    cantidad_jugadores_cancha, sustituciones_maximas, sustituciones_rotativas,
    permite_tiempos_muertos, max_tiempos_muertos_periodo, faltas_acumulativas,
    limite_faltas_tiro_libre, penaliza_tarjeta_azul, minutos_sancion_tarjeta,
    puntos_victoria, puntos_empate, puntos_derrota, regla_desempate_texto, descripcion
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'Reglamento Oficial de Fútbol 11 - U.E. Luz del Mundo A',
    'futbol',
    45, 2, 11, 5, false,
    false, 0, false, 0, false, 0,
    3, 1, 0,
    'Criterios de desempate en fase de liga: 1) Puntos obtenidos, 2) Mayor diferencia de goles, 3) Mayor cantidad de goles a favor, 4) Resultado particular, 5) Penales o sorteo.',
    'Reglamento estándar adaptado para las canchas y jornadas intercolegiales de la institución.'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Reglamento Oficial de Fútbol Sala - U.E. Luz del Mundo A',
    'futsal',
    20, 2, 5, 7, true,
    true, 1, true, 5, true, 2,
    3, 1, 0,
    'En modalidad relámpago eliminación directa: el perdedor queda fuera. Los empates se definen por serie de 3 tiros penales. Faltas acumulativas a partir de la 6ta con tiro de 10m sin barrera.',
    'Reglamento oficial de futsal escolar con cronometraje oficial y tiempos muertos por período.'
)
ON CONFLICT (nombre) DO NOTHING;

-- 2. Insertar los 48 Equipos de Cursos Oficiales (Primaria y Secundaria)
INSERT INTO public.equipos (id, nombre_personalizado, curso, escudo_url, activo) VALUES
-- Primaria (24 equipos: 1ro a 6to de Primaria, Paralelos A, B, C, D)
('11111111-0001-0000-0000-000000000001', '1ro Primaria A', '1ro Primaria A', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0001-0000-0000-000000000002', '1ro Primaria B', '1ro Primaria B', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0001-0000-0000-000000000003', '1ro Primaria C', '1ro Primaria C', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0001-0000-0000-000000000004', '1ro Primaria D', '1ro Primaria D', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0002-0000-0000-000000000001', '2do Primaria A', '2do Primaria A', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0002-0000-0000-000000000002', '2do Primaria B', '2do Primaria B', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0002-0000-0000-000000000003', '2do Primaria C', '2do Primaria C', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0002-0000-0000-000000000004', '2do Primaria D', '2do Primaria D', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0003-0000-0000-000000000001', '3ro Primaria A', '3ro Primaria A', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0003-0000-0000-000000000002', '3ro Primaria B', '3ro Primaria B', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0003-0000-0000-000000000003', '3ro Primaria C', '3ro Primaria C', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0003-0000-0000-000000000004', '3ro Primaria D', '3ro Primaria D', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0004-0000-0000-000000000001', '4to Primaria A', '4to Primaria A', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0004-0000-0000-000000000002', '4to Primaria B', '4to Primaria B', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0004-0000-0000-000000000003', '4to Primaria C', '4to Primaria C', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0004-0000-0000-000000000004', '4to Primaria D', '4to Primaria D', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0005-0000-0000-000000000001', '5to Primaria A', '5to Primaria A', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0005-0000-0000-000000000002', '5to Primaria B', '5to Primaria B', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0005-0000-0000-000000000003', '5to Primaria C', '5to Primaria C', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0005-0000-0000-000000000004', '5to Primaria D', '5to Primaria D', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0006-0000-0000-000000000001', '6to Primaria A', '6to Primaria A', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0006-0000-0000-000000000002', '6to Primaria B', '6to Primaria B', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0006-0000-0000-000000000003', '6to Primaria C', '6to Primaria C', '/assets/escudo-luz-del-mundo.svg', true),
('11111111-0006-0000-0000-000000000004', '6to Primaria D', '6to Primaria D', '/assets/escudo-luz-del-mundo.svg', true),

-- Secundaria (24 equipos: 1ro a 6to de Secundaria, Paralelos A, B, C, D)
('22222222-0001-0000-0000-000000000001', '1ro Secundaria A', '1ro Secundaria A', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0001-0000-0000-000000000002', '1ro Secundaria B', '1ro Secundaria B', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0001-0000-0000-000000000003', '1ro Secundaria C', '1ro Secundaria C', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0001-0000-0000-000000000004', '1ro Secundaria D', '1ro Secundaria D', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0002-0000-0000-000000000001', '2do Secundaria A', '2do Secundaria A', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0002-0000-0000-000000000002', '2do Secundaria B', '2do Secundaria B', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0002-0000-0000-000000000003', '2do Secundaria C', '2do Secundaria C', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0002-0000-0000-000000000004', '2do Secundaria D', '2do Secundaria D', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0003-0000-0000-000000000001', '3ro Secundaria A', '3ro Secundaria A', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0003-0000-0000-000000000002', '3ro Secundaria B', '3ro Secundaria B', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0003-0000-0000-000000000003', '3ro Secundaria C', '3ro Secundaria C', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0003-0000-0000-000000000004', '3ro Secundaria D', '3ro Secundaria D', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0004-0000-0000-000000000001', '4to Secundaria A', '4to Secundaria A', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0004-0000-0000-000000000002', '4to Secundaria B', '4to Secundaria B', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0004-0000-0000-000000000003', '4to Secundaria C', '4to Secundaria C', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0004-0000-0000-000000000004', '4to Secundaria D', '4to Secundaria D', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0005-0000-0000-000000000001', '5to Secundaria A', '5to Secundaria A', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0005-0000-0000-000000000002', '5to Secundaria B', '5to Secundaria B', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0005-0000-0000-000000000003', '5to Secundaria C', '5to Secundaria C', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0005-0000-0000-000000000004', '5to Secundaria D', '5to Secundaria D', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0006-0000-0000-000000000001', '6to Secundaria A', '6to Secundaria A', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0006-0000-0000-000000000002', '6to Secundaria B', '6to Secundaria B', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0006-0000-0000-000000000003', '6to Secundaria C', '6to Secundaria C', '/assets/escudo-luz-del-mundo.svg', true),
('22222222-0006-0000-0000-000000000004', '6to Secundaria D', '6to Secundaria D', '/assets/escudo-luz-del-mundo.svg', true)
ON CONFLICT (nombre_personalizado, curso) DO NOTHING;

-- 3. Insertar Competiciones Oficiales por Categoría y Modalidad
INSERT INTO public.competiciones (id, nombre, deporte, tipo_competicion, categoria, fecha_inicio, fecha_finalizacion, estado, reglamento_id, descripcion) VALUES
(
    '33333333-0000-0000-0000-000000000001',
    'Torneo Intercursos de Fútbol - Secundaria (4to a 6to)',
    'futbol',
    'liga',
    '4to a 6to de Secundaria',
    '2026-09-01',
    '2026-10-31',
    'en_curso',
    '00000000-0000-0000-0000-000000000001',
    'Campeonato principal de fútbol campo por puntos (modalidad liga) para 4to, 5to y 6to de Secundaria.'
),
(
    '33333333-0000-0000-0000-000000000002',
    'Relámpago de Futsal - Secundaria (1ro a 3ro)',
    'futsal',
    'torneo_eliminatorio',
    '1ro a 3ro de Secundaria',
    '2026-09-15',
    '2026-09-25',
    'en_curso',
    '00000000-0000-0000-0000-000000000002',
    'Torneo relámpago con eliminación directa: no se otorgan puntos, el representativo que pierde queda fuera.'
),
(
    '33333333-0000-0000-0000-000000000003',
    'Relámpago de Futsal - Secundaria (4to a 6to)',
    'futsal',
    'torneo_eliminatorio',
    '4to a 6to de Secundaria',
    '2026-09-18',
    '2026-09-28',
    'en_curso',
    '00000000-0000-0000-0000-000000000002',
    'Torneo relámpago en el coliseo a eliminación directa sin acumulación de puntos.'
),
(
    '33333333-0000-0000-0000-000000000004',
    'Torneo Intercursos de Futsal - Primaria (4to a 6to)',
    'futsal',
    'liga',
    '4to a 6to de Primaria',
    '2026-09-10',
    '2026-10-15',
    'en_curso',
    '00000000-0000-0000-0000-000000000002',
    'Campeonato escolar de liga por puntos para los cursos mayores de primaria.'
),
(
    '33333333-0000-0000-0000-000000000005',
    'Relámpago Infantil de Futsal - Primaria (1ro a 3ro)',
    'futsal',
    'torneo_eliminatorio',
    '1ro a 3ro de Primaria',
    '2026-09-20',
    '2026-09-30',
    'en_curso',
    '00000000-0000-0000-0000-000000000002',
    'Torneo relámpago infantil a eliminación simple para cursos menores de primaria.'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Asociar Equipos a Competiciones
INSERT INTO public.competicion_equipos (competicion_id, equipo_id) VALUES
-- En competición 1 (Liga Secundaria 4to a 6to)
('33333333-0000-0000-0000-000000000001', '22222222-0004-0000-0000-000000000001'),
('33333333-0000-0000-0000-000000000001', '22222222-0004-0000-0000-000000000002'),
('33333333-0000-0000-0000-000000000001', '22222222-0004-0000-0000-000000000003'),
('33333333-0000-0000-0000-000000000001', '22222222-0004-0000-0000-000000000004'),
('33333333-0000-0000-0000-000000000001', '22222222-0005-0000-0000-000000000001'),
('33333333-0000-0000-0000-000000000001', '22222222-0005-0000-0000-000000000002'),
('33333333-0000-0000-0000-000000000001', '22222222-0006-0000-0000-000000000001'),
('33333333-0000-0000-0000-000000000001', '22222222-0006-0000-0000-000000000002'),

-- En competición 2 (Relámpago Secundaria 1ro a 3ro)
('33333333-0000-0000-0000-000000000002', '22222222-0001-0000-0000-000000000001'),
('33333333-0000-0000-0000-000000000002', '22222222-0001-0000-0000-000000000002'),
('33333333-0000-0000-0000-000000000002', '22222222-0002-0000-0000-000000000001'),
('33333333-0000-0000-0000-000000000002', '22222222-0002-0000-0000-000000000002'),
('33333333-0000-0000-0000-000000000002', '22222222-0003-0000-0000-000000000001'),
('33333333-0000-0000-0000-000000000002', '22222222-0003-0000-0000-000000000002')
ON CONFLICT (competicion_id, equipo_id) DO NOTHING;

-- 5. Insertar Jugadores de Muestra por Cursos
INSERT INTO public.jugadores (id, equipo_id, nombre, apellido, curso, numero_camiseta, activo, visible_publico) VALUES
('44444444-0000-0000-0000-000000000001', '22222222-0006-0000-0000-000000000001', 'Mateo', 'Fernández', '6to Secundaria A', 10, true, true),
('44444444-0000-0000-0000-000000000002', '22222222-0006-0000-0000-000000000001', 'Lucas', 'Gutiérrez', '6to Secundaria A', 9, true, true),
('44444444-0000-0000-0000-000000000003', '22222222-0006-0000-0000-000000000001', 'Santiago', 'Mendoza', '6to Secundaria A', 1, true, true),
('44444444-0000-0000-0000-000000000004', '22222222-0005-0000-0000-000000000002', 'Alejandro', 'Vargas', '5to Secundaria B', 7, true, true),
('44444444-0000-0000-0000-000000000005', '22222222-0005-0000-0000-000000000002', 'Daniel', 'Salazar', '5to Secundaria B', 11, true, true),
('44444444-0000-0000-0000-000000000006', '22222222-0004-0000-0000-000000000001', 'Nicolás', 'Pérez', '4to Secundaria A', 8, true, true),
('44444444-0000-0000-0000-000000000007', '22222222-0001-0000-0000-000000000001', 'Sebastián', 'Roca', '1ro Secundaria A', 10, true, true),
('44444444-0000-0000-0000-000000000008', '22222222-0003-0000-0000-000000000001', 'Joaquín', 'Suárez', '3ro Secundaria A', 10, true, true)
ON CONFLICT (equipo_id, numero_camiseta) DO NOTHING;

-- 6. Insertar Partidos de Liga y Torneo Relámpago
INSERT INTO public.partidos (
    id, competicion_id, deporte, fecha_hora, cancha, jornada,
    equipo_local_id, equipo_visitante_id, goles_local, goles_visitante,
    penales_local, penales_visitante, estado, periodo_actual, minuto_actual, observaciones
) VALUES
-- Partido de Liga finalizado
(
    '55555555-0000-0000-0000-000000000001',
    '33333333-0000-0000-0000-000000000001',
    'futbol',
    now() - INTERVAL '3 days',
    'Cancha Principal 1',
    'Jornada 1',
    '22222222-0006-0000-0000-000000000001',
    '22222222-0005-0000-0000-000000000002',
    3, 1, 0, 0,
    'finalizado', 2, 90,
    'Victoria de 6to Secundaria A en la fecha inaugural de la liga.'
),
-- Partido de Liga en juego
(
    '55555555-0000-0000-0000-000000000002',
    '33333333-0000-0000-0000-000000000001',
    'futbol',
    now() - INTERVAL '30 minutes',
    'Cancha Principal 1',
    'Jornada 1',
    '22222222-0004-0000-0000-000000000001',
    '22222222-0004-0000-0000-000000000002',
    2, 2, 0, 0,
    'en_juego', 2, 68,
    'Partido en disputa activa con transmisión en planilla.'
),
-- Partido Relámpago Cuartos de Final (Definido en tiempo reglamentario)
(
    '55555555-0000-0000-0000-000000000003',
    '33333333-0000-0000-0000-000000000002',
    'futsal',
    now() - INTERVAL '2 days',
    'Coliseo Polideportivo',
    'Cuartos de Final',
    '22222222-0001-0000-0000-000000000001',
    '22222222-0001-0000-0000-000000000002',
    3, 1, 0, 0,
    'finalizado', 2, 40,
    '1ro Secundaria A avanza a semifinales. 1ro Secundaria B queda eliminado.'
),
-- Partido Relámpago Cuartos de Final (Definido por penales)
(
    '55555555-0000-0000-0000-000000000004',
    '33333333-0000-0000-0000-000000000002',
    'futsal',
    now() - INTERVAL '2 days',
    'Coliseo Polideportivo',
    'Cuartos de Final',
    '22222222-0002-0000-0000-000000000001',
    '22222222-0002-0000-0000-000000000002',
    2, 2, 3, 2,
    'finalizado', 2, 40,
    'Definido por tiros penales (3-2). 2do Secundaria A avanza. 2do Secundaria B queda eliminado.'
),
-- Partido Relámpago Semifinal (Programado)
(
    '55555555-0000-0000-0000-000000000005',
    '33333333-0000-0000-0000-000000000002',
    'futsal',
    now() + INTERVAL '1 day',
    'Coliseo Polideportivo',
    'Semifinal',
    '22222222-0001-0000-0000-000000000001',
    '22222222-0002-0000-0000-000000000001',
    0, 0, 0, 0,
    'programado', 1, 0,
    'Semifinal del torneo relámpago: el ganador clasifica a la Gran Final.'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Insertar Eventos para el partido finalizado
INSERT INTO public.eventos_partido (partido_id, equipo_id, jugador_id, tipo_evento, periodo, minuto, segundo, confirmado, revertido, detalle) VALUES
('55555555-0000-0000-0000-000000000001', '22222222-0006-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'gol', 1, 14, 20, true, false, 'Gol de jugada colectiva'),
('55555555-0000-0000-0000-000000000001', '22222222-0005-0000-0000-000000000002', '44444444-0000-0000-0000-000000000004', 'gol', 1, 38, 10, true, false, 'Tiro libre directo'),
('55555555-0000-0000-0000-000000000001', '22222222-0006-0000-0000-000000000001', '44444444-0000-0000-0000-000000000002', 'gol', 2, 62, 45, true, false, 'Remate de media distancia'),
('55555555-0000-0000-0000-000000000001', '22222222-0006-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'gol', 2, 88, 12, true, false, 'Definición cruzada');

-- 8. Recalcular Posiciones iniciales para torneos en formato liga
SELECT public.recalcular_posiciones_competicion('33333333-0000-0000-0000-000000000001');
