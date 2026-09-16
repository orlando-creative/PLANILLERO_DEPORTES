-- ========================================================================
-- SISTEMA WEB: PLANILLERO DEPORTIVO
-- INSTITUCIÓN: U.E. LUZ DEL MUNDO A
-- BASE DE DATOS Y AUTENTICACIÓN: SUPABASE (POSTGRESQL)
-- ========================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================================
-- 1. TABLA: usuarios
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    correo TEXT NOT NULL UNIQUE,
    nombre_completo TEXT NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('administrador', 'espectador')) DEFAULT 'espectador',
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON public.usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON public.usuarios(correo);

-- ========================================================================
-- 2. TABLA: reglamentos
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.reglamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    deporte TEXT NOT NULL CHECK (deporte IN ('futbol', 'futsal')),
    duracion_periodo_minutos INT NOT NULL DEFAULT 45 CHECK (duracion_periodo_minutos > 0),
    cantidad_periodos INT NOT NULL DEFAULT 2 CHECK (cantidad_periodos >= 1),
    cantidad_jugadores_cancha INT NOT NULL DEFAULT 11 CHECK (cantidad_jugadores_cancha >= 1),
    sustituciones_maximas INT NOT NULL DEFAULT 5,
    sustituciones_rotativas BOOLEAN NOT NULL DEFAULT false,
    permite_tiempos_muertos BOOLEAN NOT NULL DEFAULT false,
    max_tiempos_muertos_periodo INT NOT NULL DEFAULT 0,
    faltas_acumulativas BOOLEAN NOT NULL DEFAULT false,
    limite_faltas_tiro_libre INT NOT NULL DEFAULT 5,
    penaliza_tarjeta_azul BOOLEAN NOT NULL DEFAULT false,
    minutos_sancion_tarjeta INT NOT NULL DEFAULT 2,
    puntos_victoria INT NOT NULL DEFAULT 3,
    puntos_empate INT NOT NULL DEFAULT 1,
    puntos_derrota INT NOT NULL DEFAULT 0,
    regla_desempate_texto TEXT,
    descripcion TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========================================================================
-- 3. TABLA: competiciones
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.competiciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    deporte TEXT NOT NULL CHECK (deporte IN ('futbol', 'futsal')),
    tipo_competicion TEXT NOT NULL CHECK (tipo_competicion IN ('liga', 'torneo_eliminatorio')),
    categoria TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_finalizacion DATE,
    estado TEXT NOT NULL CHECK (estado IN ('planificada', 'en_curso', 'finalizada', 'cancelada')) DEFAULT 'planificada',
    reglamento_id UUID REFERENCES public.reglamentos(id) ON DELETE RESTRICT,
    descripcion TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competiciones_deporte ON public.competiciones(deporte);
CREATE INDEX IF NOT EXISTS idx_competiciones_estado ON public.competiciones(estado);

-- ========================================================================
-- 4. TABLA: equipos
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.equipos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_personalizado TEXT NOT NULL,
    curso TEXT NOT NULL,
    escudo_url TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_equipo_nombre_curso UNIQUE (nombre_personalizado, curso)
);

CREATE INDEX IF NOT EXISTS idx_equipos_curso ON public.equipos(curso);

-- ========================================================================
-- 5. TABLA: competicion_equipos
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.competicion_equipos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competicion_id UUID NOT NULL REFERENCES public.competiciones(id) ON DELETE CASCADE,
    equipo_id UUID NOT NULL REFERENCES public.equipos(id) ON DELETE RESTRICT,
    fecha_inscripcion TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (competicion_id, equipo_id)
);

CREATE INDEX IF NOT EXISTS idx_competicion_equipos_comp ON public.competicion_equipos(competicion_id);
CREATE INDEX IF NOT EXISTS idx_competicion_equipos_eq ON public.competicion_equipos(equipo_id);

-- ========================================================================
-- 6. TABLA: jugadores
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.jugadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipo_id UUID NOT NULL REFERENCES public.equipos(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    curso TEXT NOT NULL,
    numero_camiseta INT NOT NULL CHECK (numero_camiseta >= 1 AND numero_camiseta <= 99),
    activo BOOLEAN NOT NULL DEFAULT true,
    visible_publico BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_jugador_equipo_camiseta UNIQUE (equipo_id, numero_camiseta)
);

CREATE INDEX IF NOT EXISTS idx_jugadores_equipo ON public.jugadores(equipo_id);

-- ========================================================================
-- 7. TABLA: partidos
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.partidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competicion_id UUID NOT NULL REFERENCES public.competiciones(id) ON DELETE CASCADE,
    deporte TEXT NOT NULL CHECK (deporte IN ('futbol', 'futsal')),
    fecha_hora TIMESTAMPTZ NOT NULL,
    cancha TEXT NOT NULL,
    jornada TEXT NOT NULL,
    equipo_local_id UUID NOT NULL REFERENCES public.equipos(id) ON DELETE RESTRICT,
    equipo_visitante_id UUID NOT NULL REFERENCES public.equipos(id) ON DELETE RESTRICT,
    goles_local INT NOT NULL DEFAULT 0 CHECK (goles_local >= 0),
    goles_visitante INT NOT NULL DEFAULT 0 CHECK (goles_visitante >= 0),
    penales_local INT NOT NULL DEFAULT 0 CHECK (penales_local >= 0),
    penales_visitante INT NOT NULL DEFAULT 0 CHECK (penales_visitante >= 0),
    estado TEXT NOT NULL CHECK (estado IN ('programado', 'en_juego', 'pausado', 'finalizado', 'suspendido', 'cancelado')) DEFAULT 'programado',
    periodo_actual INT NOT NULL DEFAULT 1 CHECK (periodo_actual >= 1),
    minuto_actual INT NOT NULL DEFAULT 0 CHECK (minuto_actual >= 0),
    tiempo_extra BOOLEAN NOT NULL DEFAULT false,
    observaciones TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_equipos_distintos CHECK (equipo_local_id <> equipo_visitante_id)
);

CREATE INDEX IF NOT EXISTS idx_partidos_competicion ON public.partidos(competicion_id);
CREATE INDEX IF NOT EXISTS idx_partidos_estado ON public.partidos(estado);
CREATE INDEX IF NOT EXISTS idx_partidos_fecha ON public.partidos(fecha_hora);

-- ========================================================================
-- 8. TABLA: eventos_partido
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.eventos_partido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partido_id UUID NOT NULL REFERENCES public.partidos(id) ON DELETE CASCADE,
    equipo_id UUID NOT NULL REFERENCES public.equipos(id) ON DELETE RESTRICT,
    jugador_id UUID REFERENCES public.jugadores(id) ON DELETE SET NULL,
    tipo_evento TEXT NOT NULL CHECK (tipo_evento IN (
        'gol', 'falta', 'tarjeta_amarilla', 'tarjeta_roja', 'tarjeta_azul',
        'sustitucion', 'tiempo_muerto', 'periodo_inicio', 'periodo_fin',
        'penal', 'penal_desempate', 'observacion'
    )),
    periodo INT NOT NULL DEFAULT 1,
    minuto INT NOT NULL DEFAULT 0,
    segundo INT NOT NULL DEFAULT 0,
    confirmado BOOLEAN NOT NULL DEFAULT true,
    revertido BOOLEAN NOT NULL DEFAULT false,
    detalle TEXT,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eventos_partido ON public.eventos_partido(partido_id);
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON public.eventos_partido(tipo_evento);

-- ========================================================================
-- 9. TABLA: posiciones
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.posiciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competicion_id UUID NOT NULL REFERENCES public.competiciones(id) ON DELETE CASCADE,
    equipo_id UUID NOT NULL REFERENCES public.equipos(id) ON DELETE CASCADE,
    posicion INT NOT NULL DEFAULT 0,
    partidos_jugados INT NOT NULL DEFAULT 0,
    victorias INT NOT NULL DEFAULT 0,
    empates INT NOT NULL DEFAULT 0,
    derrotas INT NOT NULL DEFAULT 0,
    goles_favor INT NOT NULL DEFAULT 0,
    goles_contra INT NOT NULL DEFAULT 0,
    diferencia_goles INT NOT NULL DEFAULT 0,
    puntos INT NOT NULL DEFAULT 0,
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_posicion_comp_equipo UNIQUE (competicion_id, equipo_id)
);

CREATE INDEX IF NOT EXISTS idx_posiciones_competicion ON public.posiciones(competicion_id);
CREATE INDEX IF NOT EXISTS idx_posiciones_puntos ON public.posiciones(competicion_id, puntos DESC, diferencia_goles DESC);

-- ========================================================================
-- 10. TABLA: registros_auditoria
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.registros_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabla_afectada TEXT NOT NULL,
    registro_id UUID NOT NULL,
    accion TEXT NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE', 'REVERTIR_EVENTO', 'CAMBIO_ESTADO', 'INICIO_SESION')),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    descripcion TEXT,
    ip_direccion TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_tabla ON public.registros_auditoria(tabla_afectada);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON public.registros_auditoria(creado_en DESC);

-- ========================================================================
-- TRIGGERS Y FUNCIONES: ACTUALIZACIÓN AUTOMÁTICA DE FECHAS
-- ========================================================================
CREATE OR REPLACE FUNCTION public.actualizar_marca_tiempo()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_actualizado
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION public.actualizar_marca_tiempo();

CREATE TRIGGER trg_reglamentos_actualizado
    BEFORE UPDATE ON public.reglamentos
    FOR EACH ROW EXECUTE FUNCTION public.actualizar_marca_tiempo();

CREATE TRIGGER trg_competiciones_actualizado
    BEFORE UPDATE ON public.competiciones
    FOR EACH ROW EXECUTE FUNCTION public.actualizar_marca_tiempo();

CREATE TRIGGER trg_equipos_actualizado
    BEFORE UPDATE ON public.equipos
    FOR EACH ROW EXECUTE FUNCTION public.actualizar_marca_tiempo();

CREATE TRIGGER trg_jugadores_actualizado
    BEFORE UPDATE ON public.jugadores
    FOR EACH ROW EXECUTE FUNCTION public.actualizar_marca_tiempo();

CREATE TRIGGER trg_partidos_actualizado
    BEFORE UPDATE ON public.partidos
    FOR EACH ROW EXECUTE FUNCTION public.actualizar_marca_tiempo();

CREATE TRIGGER trg_eventos_partido_actualizado
    BEFORE UPDATE ON public.eventos_partido
    FOR EACH ROW EXECUTE FUNCTION public.actualizar_marca_tiempo();

-- ========================================================================
-- TRIGGER: CREAR USUARIO AUTOMÁTICAMENTE DESDE auth.users
-- ========================================================================
CREATE OR REPLACE FUNCTION public.manejar_nuevo_usuario()
RETURNS TRIGGER AS $$
DECLARE
    v_es_primer_usuario BOOLEAN;
    v_nombre TEXT;
BEGIN
    SELECT (COUNT(*) = 0) INTO v_es_primer_usuario FROM public.usuarios;

    v_nombre := COALESCE(
        NEW.raw_user_meta_data->>'nombre_completo',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );

    INSERT INTO public.usuarios (
        id,
        correo,
        nombre_completo,
        rol,
        activo
    ) VALUES (
        NEW.id,
        NEW.email,
        v_nombre,
        CASE WHEN v_es_primer_usuario THEN 'administrador' ELSE 'espectador' END,
        true
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sobre auth.users
DROP TRIGGER IF EXISTS trg_auth_nuevo_usuario ON auth.users;
CREATE TRIGGER trg_auth_nuevo_usuario
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.manejar_nuevo_usuario();

-- ========================================================================
-- FUNCIÓN: ACTUALIZACIÓN AUTOMÁTICA DEL MARCADOR POR GOLES
-- ========================================================================
CREATE OR REPLACE FUNCTION public.actualizar_marcador_partido()
RETURNS TRIGGER AS $$
DECLARE
    v_partido_id UUID;
    v_goles_local INT := 0;
    v_goles_visitante INT := 0;
    v_local_id UUID;
    v_visitante_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_partido_id := OLD.partido_id;
    ELSE
        v_partido_id := NEW.partido_id;
    END IF;

    SELECT equipo_local_id, equipo_visitante_id 
    INTO v_local_id, v_visitante_id
    FROM public.partidos
    WHERE id = v_partido_id;

    -- Calcular goles válidos no revertidos
    SELECT COUNT(*) INTO v_goles_local
    FROM public.eventos_partido
    WHERE partido_id = v_partido_id
      AND equipo_id = v_local_id
      AND tipo_evento = 'gol'
      AND confirmado = true
      AND revertido = false;

    SELECT COUNT(*) INTO v_goles_visitante
    FROM public.eventos_partido
    WHERE partido_id = v_partido_id
      AND equipo_id = v_visitante_id
      AND tipo_evento = 'gol'
      AND confirmado = true
      AND revertido = false;

    UPDATE public.partidos
    SET goles_local = v_goles_local,
        goles_visitante = v_goles_visitante,
        actualizado_en = now()
    WHERE id = v_partido_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_marcador_eventos
    AFTER INSERT OR UPDATE OR DELETE ON public.eventos_partido
    FOR EACH ROW EXECUTE FUNCTION public.actualizar_marcador_partido();

-- ========================================================================
-- FUNCIÓN Y TRIGGER: RECÁLCULO AUTOMÁTICO DE LA TABLA DE POSICIONES
-- ========================================================================
CREATE OR REPLACE FUNCTION public.recalcular_posiciones_competicion(p_competicion_id UUID)
RETURNS VOID AS $$
DECLARE
    r RECORD;
    v_puntos_victoria INT := 3;
    v_puntos_empate INT := 1;
    v_puntos_derrota INT := 0;
    v_pos INT := 1;
BEGIN
    -- Obtener puntuación del reglamento si existe
    SELECT rgl.puntos_victoria, rgl.puntos_empate, rgl.puntos_derrota
    INTO v_puntos_victoria, v_puntos_empate, v_puntos_derrota
    FROM public.competiciones c
    JOIN public.reglamentos rgl ON rgl.id = c.reglamento_id
    WHERE c.id = p_competicion_id;

    -- Recalcular métricas de cada equipo inscrito
    CREATE TEMP TABLE IF NOT EXISTS tmp_posiciones ON COMMIT DROP AS
    SELECT 
        ce.equipo_id,
        COUNT(p.id) FILTER (WHERE p.estado = 'finalizado') AS pj,
        COUNT(p.id) FILTER (WHERE p.estado = 'finalizado' AND (
            (p.equipo_local_id = ce.equipo_id AND p.goles_local > p.goles_visitante) OR
            (p.equipo_visitante_id = ce.equipo_id AND p.goles_visitante > p.goles_local)
        )) AS pg,
        COUNT(p.id) FILTER (WHERE p.estado = 'finalizado' AND p.goles_local = p.goles_visitante) AS pe,
        COUNT(p.id) FILTER (WHERE p.estado = 'finalizado' AND (
            (p.equipo_local_id = ce.equipo_id AND p.goles_local < p.goles_visitante) OR
            (p.equipo_visitante_id = ce.equipo_id AND p.goles_visitante < p.goles_local)
        )) AS pp,
        COALESCE(SUM(CASE 
            WHEN p.estado = 'finalizado' AND p.equipo_local_id = ce.equipo_id THEN p.goles_local
            WHEN p.estado = 'finalizado' AND p.equipo_visitante_id = ce.equipo_id THEN p.goles_visitante
            ELSE 0 END), 0) AS gf,
        COALESCE(SUM(CASE 
            WHEN p.estado = 'finalizado' AND p.equipo_local_id = ce.equipo_id THEN p.goles_visitante
            WHEN p.estado = 'finalizado' AND p.equipo_visitante_id = ce.equipo_id THEN p.goles_local
            ELSE 0 END), 0) AS gc
    FROM public.competicion_equipos ce
    LEFT JOIN public.partidos p ON p.competicion_id = ce.competicion_id 
        AND (p.equipo_local_id = ce.equipo_id OR p.equipo_visitante_id = ce.equipo_id)
    WHERE ce.competicion_id = p_competicion_id
    GROUP BY ce.equipo_id;

    -- Actualizar o insertar en tabla posiciones con orden de desempate
    FOR r IN (
        SELECT 
            t.equipo_id,
            t.pj,
            t.pg,
            t.pe,
            t.pp,
            t.gf,
            t.gc,
            (t.gf - t.gc) AS dg,
            ((t.pg * COALESCE(v_puntos_victoria, 3)) + (t.pe * COALESCE(v_puntos_empate, 1)) + (t.pp * COALESCE(v_puntos_derrota, 0))) AS pts
        FROM tmp_posiciones t
        ORDER BY pts DESC, (t.gf - t.gc) DESC, t.gf DESC, t.equipo_id
    ) LOOP
        INSERT INTO public.posiciones (
            competicion_id, equipo_id, posicion, partidos_jugados,
            victorias, empates, derrotas, goles_favor, goles_contra,
            diferencia_goles, puntos, actualizado_en
        ) VALUES (
            p_competicion_id, r.equipo_id, v_pos, r.pj,
            r.pg, r.pe, r.pp, r.gf, r.gc,
            r.dg, r.pts, now()
        )
        ON CONFLICT (competicion_id, equipo_id) DO UPDATE SET
            posicion = v_pos,
            partidos_jugados = r.pj,
            victorias = r.pg,
            empates = r.pe,
            derrotas = r.pp,
            goles_favor = r.gf,
            goles_contra = r.gc,
            diferencia_goles = r.dg,
            puntos = r.pts,
            actualizado_en = now();

        v_pos := v_pos + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para recalcular posiciones cuando un partido finaliza o cambia marcador
CREATE OR REPLACE FUNCTION public.trigger_recalcular_posiciones()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.recalcular_posiciones_competicion(OLD.competicion_id);
    ELSE
        PERFORM public.recalcular_posiciones_competicion(NEW.competicion_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_partidos_recalcular_posiciones
    AFTER INSERT OR UPDATE OR DELETE ON public.partidos
    FOR EACH ROW EXECUTE FUNCTION public.trigger_recalcular_posiciones();

-- ========================================================================
-- POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- ========================================================================

-- Función auxiliar para verificar si el usuario conectado es administrador
CREATE OR REPLACE FUNCTION public.es_administrador()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = auth.uid()
          AND rol = 'administrador'
          AND activo = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activar RLS en todas las tablas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reglamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competiciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competicion_equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_partido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posiciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_auditoria ENABLE ROW LEVEL SECURITY;

-- 1. Políticas para 'usuarios'
CREATE POLICY "usuarios_lectura_propia_o_admin"
    ON public.usuarios FOR SELECT
    USING (auth.uid() = id OR public.es_administrador());

CREATE POLICY "usuarios_modificacion_admin"
    ON public.usuarios FOR UPDATE
    USING (public.es_administrador())
    WITH CHECK (public.es_administrador());

-- 2. Políticas para 'reglamentos' (Lectura pública, escritura admin)
CREATE POLICY "reglamentos_lectura_publica"
    ON public.reglamentos FOR SELECT
    USING (true);

CREATE POLICY "reglamentos_escritura_admin"
    ON public.reglamentos FOR ALL
    USING (public.es_administrador())
    WITH CHECK (public.es_administrador());

-- 3. Políticas para 'competiciones' (Lectura pública, escritura admin)
CREATE POLICY "competiciones_lectura_publica"
    ON public.competiciones FOR SELECT
    USING (true);

CREATE POLICY "competiciones_escritura_admin"
    ON public.competiciones FOR ALL
    USING (public.es_administrador())
    WITH CHECK (public.es_administrador());

-- 4. Políticas para 'equipos' (Lectura pública, escritura admin)
CREATE POLICY "equipos_lectura_publica"
    ON public.equipos FOR SELECT
    USING (true);

CREATE POLICY "equipos_escritura_admin"
    ON public.equipos FOR ALL
    USING (public.es_administrador())
    WITH CHECK (public.es_administrador());

-- 5. Políticas para 'competicion_equipos' (Lectura pública, escritura admin)
CREATE POLICY "competicion_equipos_lectura_publica"
    ON public.competicion_equipos FOR SELECT
    USING (true);

CREATE POLICY "competicion_equipos_escritura_admin"
    ON public.competicion_equipos FOR ALL
    USING (public.es_administrador())
    WITH CHECK (public.es_administrador());

-- 6. Políticas para 'jugadores' (Protección de datos escolares)
-- Espectadores solo ven jugadores activos y con visible_publico = true
CREATE POLICY "jugadores_lectura_publica"
    ON public.jugadores FOR SELECT
    USING (public.es_administrador() OR (activo = true AND visible_publico = true));

CREATE POLICY "jugadores_escritura_admin"
    ON public.jugadores FOR ALL
    USING (public.es_administrador())
    WITH CHECK (public.es_administrador());

-- 7. Políticas para 'partidos' (Lectura pública, escritura admin)
CREATE POLICY "partidos_lectura_publica"
    ON public.partidos FOR SELECT
    USING (true);

CREATE POLICY "partidos_escritura_admin"
    ON public.partidos FOR ALL
    USING (public.es_administrador())
    WITH CHECK (public.es_administrador());

-- 8. Políticas para 'eventos_partido' (Lectura pública, escritura admin)
CREATE POLICY "eventos_partido_lectura_publica"
    ON public.eventos_partido FOR SELECT
    USING (true);

CREATE POLICY "eventos_partido_escritura_admin"
    ON public.eventos_partido FOR ALL
    USING (public.es_administrador())
    WITH CHECK (public.es_administrador());

-- 9. Políticas para 'posiciones' (Lectura pública, escritura admin)
CREATE POLICY "posiciones_lectura_publica"
    ON public.posiciones FOR SELECT
    USING (true);

CREATE POLICY "posiciones_escritura_admin"
    ON public.posiciones FOR ALL
    USING (public.es_administrador())
    WITH CHECK (public.es_administrador());

-- 10. Políticas para 'registros_auditoria' (Solo administradores)
CREATE POLICY "auditoria_lectura_admin"
    ON public.registros_auditoria FOR SELECT
    USING (public.es_administrador());

CREATE POLICY "auditoria_insercion_autenticados"
    ON public.registros_auditoria FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ========================================================================
-- VISTA PÚBLICA SEGURA DE ESTUDIANTES / JUGADORES
-- Oculta parcialmente el apellido para proteger la privacidad estudiantil
-- ========================================================================
CREATE OR REPLACE VIEW public.vista_jugadores_publica AS
SELECT 
    j.id,
    j.equipo_id,
    j.nombre,
    CONCAT(SUBSTRING(j.apellido, 1, 1), '***') AS apellido_protegido,
    j.curso,
    j.numero_camiseta,
    e.nombre_personalizado AS equipo_nombre,
    e.curso AS equipo_curso
FROM public.jugadores j
JOIN public.equipos e ON e.id = j.equipo_id
WHERE j.activo = true AND j.visible_publico = true;
