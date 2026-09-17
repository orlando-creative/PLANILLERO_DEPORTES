/**
 * Módulo de Navegación y Estructura Institucional
 * U.E. Luz del Mundo A - Planillero Deportivo
 */

import { clienteSupabase } from './supabase.js';
import { cerrarSesion } from './autenticacion.js';
import { esAdministrador, adaptarInterfazPorRol } from './permisos.js';
import { sanitizarHTML } from './utilidades.js';

export function inicializarNavegacion() {
  const usuario = clienteSupabase.auth.obtenerUsuario();
  const admin = esAdministrador();
  const rutaActual = window.location.pathname.split('/').pop() || 'index.html';

  // Renderizar o sincronizar el encabezado institucional
  const header = document.querySelector('header.encabezado-institucional');
  if (header) {
    const nombreUsuarioSanitizado = usuario ? sanitizarHTML(usuario.nombre_completo || usuario.email) : '';

    header.innerHTML = `
      <div class="barra-superior-institucional">
        <div class="barra-superior-contenedor">
          <span class="barra-texto-institucion">U.E. "Luz del Mundo A" &bull; Dep. Educación Física y Deportes</span>
          <span class="barra-texto-gestion">Gestión 2026</span>
        </div>
      </div>
      <div class="encabezado-contenedor">
        <a href="index.html" class="marca-institucional" aria-label="Ir a página de inicio">
          <img src="assets/escudo-luz-del-mundo.svg" alt="Escudo Institucional" class="escudo-header" />
          <div class="marca-textos">
            <span class="marca-titulo">PLANILLERO <span>DEPORTIVO</span></span>
            <span class="marca-subtitulo">U.E. LUZ DEL MUNDO A</span>
          </div>
        </a>

        <!-- Área de sesión en desktop -->
        <div class="area-sesion area-sesion-desktop">
          ${usuario ? `
            <span class="badge-rol ${admin ? 'admin' : 'espectador'}">
              ${admin ? 'ADMINISTRADOR' : 'ESPECTADOR'}
            </span>
            <a href="perfil.html" class="boton-usuario" title="Perfil de usuario">
              ${nombreUsuarioSanitizado}
            </a>
            <button type="button" class="boton boton-contorno boton-sm btn-logout-action">
              Salir
            </button>
          ` : `
            <a href="inicio-sesion.html" class="boton boton-secundario boton-sm" title="Acceso exclusivo para árbitros y administradores">
              Acceso Admin
            </a>
          `}
        </div>

        <button type="button" class="boton-menu-movil" id="btn-toggle-menu" aria-label="Abrir menú de navegación" aria-expanded="false" aria-controls="menu-navegacion">
          <span class="icono-barra barra-1"></span>
          <span class="icono-barra barra-2"></span>
          <span class="icono-barra barra-3"></span>
        </button>
      </div>

      <!-- Menú de navegación responsive (Desktop + Drawer Móvil) -->
      <nav class="navegacion-principal" id="menu-navegacion" aria-label="Menú principal">
        <div class="menu-enlaces-contenedor">
          <div class="menu-seccion-titulo-movil">Navegación Oficial</div>
          <a href="/index.html" class="enlace-navegacion ${rutaActual === 'index.html' ? 'activo' : ''}">Inicio</a>
          <a href="/competiciones.html" class="enlace-navegacion ${rutaActual === 'competiciones.html' ? 'activo' : ''}">Competiciones</a>
          <a href="/equipos.html" class="enlace-navegacion ${rutaActual === 'equipos.html' ? 'activo' : ''}">Equipos</a>
          <a href="/jugadores.html" class="enlace-navegacion ${rutaActual === 'jugadores.html' ? 'activo' : ''}">Jugadores</a>
          <a href="/calendario.html" class="enlace-navegacion ${rutaActual === 'calendario.html' ? 'activo' : ''}">Calendario</a>
          <a href="/resultados.html" class="enlace-navegacion ${rutaActual === 'resultados.html' ? 'activo' : ''}">Resultados</a>
          <a href="/posiciones.html" class="enlace-navegacion ${rutaActual === 'posiciones.html' ? 'activo' : ''}">Posiciones</a>
          <a href="/reglamento.html" class="enlace-navegacion ${rutaActual === 'reglamento.html' ? 'activo' : ''}">Reglamento</a>

          ${admin ? `
            <div class="menu-seccion-titulo-movil">Gestión y Control</div>
            <a href="/planilla.html" class="enlace-navegacion enlace-admin ${rutaActual === 'planilla.html' ? 'activo' : ''}">Planilla en Vivo</a>
            <a href="/administracion.html" class="enlace-navegacion enlace-admin ${rutaActual === 'administracion.html' ? 'activo' : ''}">Administración</a>
          ` : ''}
        </div>

        <!-- Área de sesión en móvil integrada dentro del menú desplegable -->
        <div class="area-sesion-movil">
          ${usuario ? `
            <div class="usuario-tarjeta-movil">
              <div class="usuario-avatar-movil">
                ${(usuario.nombre_completo || usuario.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div class="usuario-info-movil">
                <span class="usuario-nombre-movil">${nombreUsuarioSanitizado}</span>
                <span class="badge-rol ${admin ? 'admin' : 'espectador'}">
                  ${admin ? 'ADMINISTRADOR' : 'ESPECTADOR'}
                </span>
              </div>
            </div>
            <div class="usuario-acciones-movil">
              <a href="/perfil.html" class="boton boton-contorno boton-md boton-bloque">Mi Perfil</a>
              <button type="button" class="boton boton-peligro boton-md boton-bloque btn-logout-action">Cerrar Sesión</button>
            </div>
          ` : `
            <div class="invitado-bloque-movil">
              <p class="invitado-texto-movil">Los espectadores navegan libremente sin iniciar sesión. El acceso con cuenta es exclusivo para Árbitros y Administradores.</p>
              <a href="/inicio-sesion.html" class="boton boton-secundario boton-md boton-bloque">
                Acceso Administrador
              </a>
            </div>
          `}
        </div>
      </nav>

      <!-- Fondo oscuro translúcido para menú móvil -->
      <div id="fondo-menu-movil" class="fondo-menu-movil" aria-hidden="true"></div>

    `;

    // Eventos del header y menú móvil
    const btnMenu = document.getElementById('btn-toggle-menu');
    const menuNav = document.getElementById('menu-navegacion');
    const fondoMenu = document.getElementById('fondo-menu-movil');

    const cerrarMenuMovil = () => {
      if (menuNav && menuNav.classList.contains('menu-abierto')) {
        menuNav.classList.remove('menu-abierto');
        btnMenu?.classList.remove('menu-activo');
        btnMenu?.setAttribute('aria-expanded', 'false');
        btnMenu?.setAttribute('aria-label', 'Abrir menú de navegación');
        fondoMenu?.classList.remove('activo');
        document.body.classList.remove('bloquear-scroll-movil');
      }
    };

    const abrirMenuMovil = () => {
      menuNav?.classList.add('menu-abierto');
      btnMenu?.classList.add('menu-activo');
      btnMenu?.setAttribute('aria-expanded', 'true');
      btnMenu?.setAttribute('aria-label', 'Cerrar menú de navegación');
      fondoMenu?.classList.add('activo');
      document.body.classList.add('bloquear-scroll-movil');
    };

    if (btnMenu && menuNav) {
      btnMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        if (menuNav.classList.contains('menu-abierto')) {
          cerrarMenuMovil();
        } else {
          abrirMenuMovil();
        }
      });
    }

    if (fondoMenu) {
      fondoMenu.addEventListener('click', cerrarMenuMovil);
    }

    // Cerrar el menú al hacer clic en un enlace de navegación
    menuNav?.querySelectorAll('a').forEach(enlace => {
      enlace.addEventListener('click', cerrarMenuMovil);
    });

    // Cerrar al presionar la tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cerrarMenuMovil();
    });

    // Escuchadores de cierre de sesión unificados
    document.querySelectorAll('.btn-logout-action').forEach(btn => {
      btn.addEventListener('click', () => {
        cerrarSesion();
      });
    });
  }

  // Renderizar o sincronizar el pie institucional
  const footer = document.querySelector('footer.pie-institucional');
  if (footer) {
    footer.innerHTML = `
      <div class="pie-contenido">
        <div class="pie-texto">
          <strong>U.E. Luz del Mundo A &bull; Planillero Deportivo Oficial</strong>
          <p>Competiciones escolares de Fútbol y Fútbol Sala. Plataforma institucional para control en vivo, marcadores y estadísticas.</p>
        </div>
        <div class="pie-enlaces">
          <a href="/index.html">Inicio</a>
          <a href="/competiciones.html">Competiciones</a>
          <a href="/posiciones.html">Tablas</a>
          <a href="/reglamento.html">Reglamentos</a>
          <a href="/administracion.html">Gestión</a>
        </div>
      </div>
    `;
  }

  // Actualizar permisos en pantalla
  adaptarInterfazPorRol();
}

// Inicializar automáticamente cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarNavegacion);
} else {
  inicializarNavegacion();
}
