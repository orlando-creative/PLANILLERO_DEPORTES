/**
 * Módulo de Permisos y Control de Acceso Basado en Roles (RBAC)
 * U.E. Luz del Mundo A - Planillero Deportivo
 */

import { clienteSupabase } from './supabase.js';

/**
 * Retorna true si el usuario actual tiene rol 'administrador'
 */
export function esAdministrador() {
  const usuario = clienteSupabase.auth.obtenerUsuario();
  return Boolean(usuario && usuario.rol === 'administrador');
}

/**
 * Protege una página administrativa. Si no es admin, redirige a inicio-sesion.html
 */
export function protegerPaginaAdmin() {
  const usuario = clienteSupabase.auth.obtenerUsuario();
  if (!usuario || usuario.rol !== 'administrador') {
    const destino = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `inicio-sesion.html?redirigir=${destino}`;
    return false;
  }
  return true;
}

/**
 * Adapta los elementos de la interfaz según el rol del usuario:
 * Muestra u oculta controles con el atributo [data-requiere-admin]
 */
export function adaptarInterfazPorRol() {
  const admin = esAdministrador();
  const elementosAdmin = document.querySelectorAll('[data-requiere-admin]');

  elementosAdmin.forEach(el => {
    if (admin) {
      el.removeAttribute('hidden');
      if (el.style.display === 'none') {
        el.style.display = '';
      }
    } else {
      el.setAttribute('hidden', 'true');
      el.style.display = 'none';
    }
  });

  const elementosPublico = document.querySelectorAll('[data-solo-publico]');
  elementosPublico.forEach(el => {
    if (admin) {
      el.setAttribute('hidden', 'true');
      el.style.display = 'none';
    } else {
      el.removeAttribute('hidden');
      el.style.display = '';
    }
  });
}
