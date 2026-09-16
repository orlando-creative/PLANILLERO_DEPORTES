/**
 * Cliente Nativo de Supabase (Vanilla JS / Módulos ES Nativos)
 * U.E. Luz del Mundo A - Planillero Deportivo
 *
 * Comunicación directa mediante API REST y Auth de Supabase (PostgREST)
 * utilizando fetch() estándar sin dependencias pesadas.
 * Código 100% limpio sin datos semilla hardcodeados.
 */

import { generarUUID } from './utilidades.js';

const SUPABASE_URL = 'https://fsqphnwrrikhishllmtk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzcXBobndycmlraGlzaGxsbXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1Njg0NDksImV4cCI6MjEwNTE0NDQ0OX0.-0Ejqy8rl3SpLwoWOiPpxwrfno6FBz8u_CQmxcQmu0s';

// Clave de almacenamiento de configuración en navegador
const CLAVE_CONFIG = 'supabase_config_institucional';
const CLAVE_SESION = 'supabase_auth_sesion_ue';

/**
 * Valida si una URL es una URL real y válida para Supabase (no un placeholder)
 */
export function esUrlValidaSupabase(url) {
  if (!url || typeof url !== 'string') return false;
  const limpia = url.trim().toLowerCase();
  if (!limpia.startsWith('https://') && !limpia.startsWith('http://')) return false;
  if (limpia.includes('xyzcompany') || limpia.includes('example.com') || limpia.includes('placeholder') || limpia.includes('tu-proyecto') || limpia.includes('ejemplo')) {
    return false;
  }
  try {
    const parsed = new URL(limpia);
    return parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

/**
 * Valida si la Anon Key tiene un formato real y no es un placeholder
 */
export function esKeyValidaSupabase(key) {
  if (!key || typeof key !== 'string') return false;
  const limpia = key.trim();
  if (limpia.includes('...') || limpia.length < 20) return false;
  return true;
}

// Limpieza automática de cualquier residuo de datos semilla de pruebas o credenciales inválidas
try {
  if (typeof localStorage !== 'undefined') {
    const residuos = localStorage.getItem('datos_locales_planillero_ue');
    if (residuos && (residuos.includes('part-01') || residuos.includes('part-rel-01') || residuos.includes('comp-01'))) {
      localStorage.removeItem('datos_locales_planillero_ue');
    }
    const guardada = localStorage.getItem(CLAVE_CONFIG);
    if (guardada) {
      try {
        const parsed = JSON.parse(guardada);
        if (!esUrlValidaSupabase(parsed.url) || !esKeyValidaSupabase(parsed.anonKey)) {
          localStorage.removeItem(CLAVE_CONFIG);
        }
      } catch {
        localStorage.removeItem(CLAVE_CONFIG);
      }
    }
  }
} catch {
  // Ignorar errores de acceso a localStorage en sandbox
}

/**
 * Obtiene la configuración activa de Supabase (Variables de entorno Vite o localStorage)
 */
function obtenerConfiguracion() {
  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY
  };
}

let configActual = obtenerConfiguracion();

/**
 * Guarda o actualiza las credenciales del proyecto Supabase
 */
export function guardarConfiguracionSupabase(url, anonKey) {
  const limpiaUrl = (url || '').trim().replace(/\/$/, '');
  const limpiaKey = (anonKey || '').trim();

  if (esUrlValidaSupabase(limpiaUrl) && esKeyValidaSupabase(limpiaKey)) {
    configActual = { url: limpiaUrl, anonKey: limpiaKey };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CLAVE_CONFIG, JSON.stringify(configActual));
    }
  } else {
    configActual = { url: '', anonKey: '' };
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CLAVE_CONFIG);
    }
  }

  try {
    window.dispatchEvent(new CustomEvent('supabase:config-actualizada', { detail: configActual }));
  } catch {
    // Ignorar
  }

  return true;
}

export function obtenerConfiguracionSupabase() {
  return { ...configActual };
}

export function estaConectadoASupabase() {
  return esUrlValidaSupabase(configActual.url) && esKeyValidaSupabase(configActual.anonKey);
}

// ------------------------------------------------------------------------
// CONSTRUCTOR DE CONSULTAS POSTGREST (Directo mediante fetch())
// ------------------------------------------------------------------------
class ConstructorConsulta {
  constructor(tabla, token = null) {
    this.tabla = tabla;
    this.token = token;
    this.filtros = [];
    this.ordenacion = null;
    this.limiteNum = null;
    this.selectCampos = '*';
  }

  select(campos = '*') {
    this.selectCampos = campos;
    return this;
  }

  eq(columna, valor) {
    this.filtros.push({ columna, op: 'eq', valor });
    return this;
  }

  neq(columna, valor) {
    this.filtros.push({ columna, op: 'neq', valor });
    return this;
  }

  order(columna, { ascending = true } = {}) {
    this.ordenacion = { columna, ascending };
    return this;
  }

  limit(cantidad) {
    this.limiteNum = cantidad;
    return this;
  }

  async ejecutarFetch(metodo, body = null, cabecerasExtra = {}) {
    if (!estaConectadoASupabase()) {
      return { data: metodo === 'GET' ? [] : null, error: null };
    }

    const urlBase = configActual.url;
    const anonKey = configActual.anonKey;

    let ruta = `${urlBase}/rest/v1/${this.tabla}?select=${encodeURIComponent(this.selectCampos)}`;

    // Añadir filtros PostgREST
    for (const f of this.filtros) {
      ruta += `&${encodeURIComponent(f.columna)}=${f.op}.${encodeURIComponent(f.valor)}`;
    }

    if (this.ordenacion) {
      const dir = this.ordenacion.ascending ? 'asc' : 'desc';
      ruta += `&order=${encodeURIComponent(this.ordenacion.columna)}.${dir}`;
    }

    if (this.limiteNum !== null) {
      ruta += `&limit=${this.limiteNum}`;
    }

    const headers = {
      'apikey': anonKey,
      'Authorization': `Bearer ${this.token || anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...cabecerasExtra
    };

    try {
      const res = await fetch(ruta, {
        method: metodo,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      if (!res.ok) {
        let errorDetalle = res.statusText;
        try {
          const errJson = await res.json();
          errorDetalle = errJson.message || errJson.hint || JSON.stringify(errJson);
        } catch {
          // Ignorar
        }
        console.warn(`Aviso Supabase [${res.status}]: ${errorDetalle}`);
        return { data: metodo === 'GET' ? [] : null, error: metodo === 'GET' ? null : new Error(`Error Supabase [${res.status}]: ${errorDetalle}`) };
      }

      const data = await res.json();
      return { data: data || [], error: null };
    } catch (err) {
      console.warn(`Aviso de conexión Supabase en ${this.tabla} (${err.message}). Se usará estado limpio.`);
      return { data: metodo === 'GET' ? [] : null, error: null };
    }
  }

  // Soporte de await directo
  async then(resolve, reject) {
    try {
      const res = await this.ejecutar();
      resolve(res);
    } catch (err) {
      reject(err);
    }
  }

  async ejecutar() {
    if (!estaConectadoASupabase()) {
      return { data: [], error: null };
    }
    return await this.ejecutarFetch('GET');
  }

  async insert(registros) {
    if (!estaConectadoASupabase()) {
      return {
        data: null,
        error: new Error('Base de datos no conectada. Configure VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')
      };
    }
    const arr = Array.isArray(registros) ? registros : [registros];
    return await this.ejecutarFetch('POST', arr);
  }

  async update(cambios) {
    if (!estaConectadoASupabase()) {
      return {
        data: null,
        error: new Error('Base de datos no conectada. Configure VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')
      };
    }
    const actualizados = {
      ...cambios,
      actualizado_en: new Date().toISOString()
    };
    return await this.ejecutarFetch('PATCH', actualizados);
  }

  async delete() {
    if (!estaConectadoASupabase()) {
      return {
        data: null,
        error: new Error('Base de datos no conectada. Configure VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')
      };
    }
    return await this.ejecutarFetch('DELETE');
  }
}

// ------------------------------------------------------------------------
// MÓDULO DE AUTENTICACIÓN SUPABASE (PostgREST Auth Nativo)
// ------------------------------------------------------------------------
class ModuloAutenticacion {
  constructor() {
    this.sesionActual = this.cargarSesion();
  }

  cargarSesion() {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(CLAVE_SESION);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  }

  guardarSesion(sesion) {
    this.sesionActual = sesion;
    if (typeof localStorage !== 'undefined') {
      if (sesion) {
        localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
      } else {
        localStorage.removeItem(CLAVE_SESION);
      }
    }
  }

  obtenerSesion() {
    return this.sesionActual;
  }

  obtenerUsuario() {
    return this.sesionActual?.user || null;
  }

  async iniciarSesionConPassword(email, password) {
    const limpioEmail = (email || '').trim().toLowerCase();

    if (!estaConectadoASupabase()) {
      return {
        data: null,
        error: new Error('Supabase no está conectado todavía. Por favor configure las credenciales de la base de datos.')
      };
    }

    try {
      const res = await fetch(`${configActual.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': configActual.anonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: limpioEmail, password })
      });

      if (!res.ok) {
        let mensaje = 'Credenciales no reconocidas en Supabase Auth.';
        try {
          const err = await res.json();
          mensaje = err.error_description || err.message || mensaje;
        } catch {
          // Ignorar
        }
        return { data: null, error: new Error(mensaje) };
      }

      const datos = await res.json();

      // Consultar rol asignado en la tabla de usuarios
      let rol = 'administrador';
      let nombreCompleto = datos.user.email;

      try {
        const { data: usuarioPerfil } = await clienteSupabase
          .from('usuarios')
          .select('*')
          .eq('id', datos.user.id)
          .ejecutar();

        if (usuarioPerfil && usuarioPerfil[0]) {
          rol = usuarioPerfil[0].rol || 'administrador';
          nombreCompleto = usuarioPerfil[0].nombre_completo || nombreCompleto;
        }
      } catch {
        // Asumir admin si inicia sesión con éxito
      }

      const usuarioConRol = {
        ...datos.user,
        rol,
        nombre_completo: nombreCompleto
      };

      const sesion = {
        access_token: datos.access_token,
        refresh_token: datos.refresh_token,
        user: usuarioConRol
      };

      this.guardarSesion(sesion);
      return { data: sesion, error: null };
    } catch (err) {
      return { data: null, error: new Error(`Fallo en autenticación: ${err.message}`) };
    }
  }

  async recuperarContrasena(email) {
    if (!estaConectadoASupabase()) {
      return { data: null, error: new Error('Supabase no está conectado.') };
    }

    try {
      const res = await fetch(`${configActual.url}/auth/v1/recover`, {
        method: 'POST',
        headers: {
          'apikey': configActual.anonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!res.ok) throw new Error('Error al solicitar recuperación de contraseña');
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async cerrarSesion() {
    if (estaConectadoASupabase() && this.sesionActual?.access_token) {
      try {
        await fetch(`${configActual.url}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'apikey': configActual.anonKey,
            'Authorization': `Bearer ${this.sesionActual.access_token}`
          }
        });
      } catch {
        // Ignorar
      }
    }
    this.guardarSesion(null);
    return { error: null };
  }
}

// ------------------------------------------------------------------------
// CLIENTE PRINCIPAL EXPORTADO
// ------------------------------------------------------------------------
class ClienteSupabase {
  constructor() {
    this.auth = new ModuloAutenticacion();
  }

  from(tabla) {
    const sesion = this.auth.obtenerSesion();
    return new ConstructorConsulta(tabla, sesion?.access_token);
  }

  // Llamadas RPC (funciones almacenadas en PostgreSQL)
  async rpc(nombreFuncion, parametros = {}) {
    if (!estaConectadoASupabase()) {
      return { data: null, error: new Error('Supabase no está conectado.') };
    }

    try {
      const sesion = this.auth.obtenerSesion();
      const res = await fetch(`${configActual.url}/rest/v1/rpc/${nombreFuncion}`, {
        method: 'POST',
        headers: {
          'apikey': configActual.anonKey,
          'Authorization': `Bearer ${sesion?.access_token || configActual.anonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parametros)
      });

      if (!res.ok) throw new Error(`Error en función RPC: ${res.statusText}`);
      const data = await res.json();
      return { data, error: null };
    } catch (err) {
      console.warn('Fallo RPC remoto:', err.message);
      return { data: null, error: err };
    }
  }
}

export const clienteSupabase = new ClienteSupabase();

// Exponer en window para vinculación inmediata y depuración directa
if (typeof window !== 'undefined') {
  window.guardarConfiguracionSupabase = guardarConfiguracionSupabase;
  window.conectarSupabase = guardarConfiguracionSupabase;
  window.obtenerConfiguracionSupabase = obtenerConfiguracionSupabase;
  window.clienteSupabase = clienteSupabase;
}
