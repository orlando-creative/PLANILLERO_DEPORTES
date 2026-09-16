/**
 * Módulo de Autenticación Institucional
 * U.E. Luz del Mundo A - Planillero Deportivo
 */

import { clienteSupabase } from './supabase.js';
import { registrarAuditoria } from './auditoria.js';

/**
 * Inicia sesión mediante correo y contraseña
 */
export async function iniciarSesion(correo, contrasena) {
  const resultado = await clienteSupabase.auth.iniciarSesionConPassword(correo, contrasena);
  if (!resultado.error && resultado.data?.user) {
    await registrarAuditoria({
      tabla_afectada: 'usuarios',
      registro_id: resultado.data.user.id,
      accion: 'INICIO_SESION',
      descripcion: `Inicio de sesión exitoso: ${resultado.data.user.email}`
    });
  }
  return resultado;
}

/**
 * Cierra la sesión activa y redirige al inicio
 */
export async function cerrarSesion() {
  const usuario = clienteSupabase.auth.obtenerUsuario();
  if (usuario) {
    await registrarAuditoria({
      tabla_afectada: 'usuarios',
      registro_id: usuario.id,
      accion: 'INICIO_SESION',
      descripcion: `Cierre de sesión de usuario: ${usuario.email}`
    });
  }
  await clienteSupabase.auth.cerrarSesion();
  window.location.href = '/index.html';
}

/**
 * Envía correo para restablecer contraseña
 */
export async function solicitarRestablecerContrasena(correo) {
  return await clienteSupabase.auth.recuperarContrasena(correo);
}

/**
 * Obtiene el usuario autenticado actualmente
 */
export function obtenerUsuarioActual() {
  return clienteSupabase.auth.obtenerUsuario();
}

/**
 * Verifica si hay una sesión activa
 */
export function haySesionActiva() {
  return Boolean(clienteSupabase.auth.obtenerUsuario());
}
