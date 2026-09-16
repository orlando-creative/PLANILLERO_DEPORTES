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

        <button type="button" class="boton-menu-movil" id="btn-toggle-menu" aria-label="Abrir menú de navegación" aria-expanded="false">
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

      <!-- Barra de Navegación Móvil Inferior Fija -->
      <nav class="barra-movil-inferior" aria-label="Navegación rápida móvil">
        <a href="/index.html" class="item-nav-movil ${rutaActual === 'index.html' ? 'activo' : ''}">
          <svg viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Inicio</span>
        </a>
        <a href="/competiciones.html" class="item-nav-movil ${rutaActual === 'competiciones.html' ? 'activo' : ''}">
          <svg viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
          <span>Torneos</span>
        </a>
        <a href="/posiciones.html" class="item-nav-movil ${rutaActual === 'posiciones.html' ? 'activo' : ''}">
          <svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><rect width="4" height="7" x="7" y="10" rx="1"/><rect width="4" height="12" x="15" y="5" rx="1"/></svg>
          <span>Posiciones</span>
        </a>
        <a href="/calendario.html" class="item-nav-movil ${rutaActual === 'calendario.html' ? 'activo' : ''}">
          <svg viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          <span>Fixture</span>
        </a>
        <button type="button" class="item-nav-movil" id="btn-abrir-menu-inferior" aria-label="Más opciones de navegación">
          <svg viewBox="0 0 24 24"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          <span>Menú</span>
        </button>
      </nav>
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
        fondoMenu?.classList.remove('activo');
        document.body.classList.remove('bloquear-scroll-movil');
      }
    };

    const abrirMenuMovil = () => {
      menuNav?.classList.add('menu-abierto');
      btnMenu?.classList.add('menu-activo');
      btnMenu?.setAttribute('aria-expanded', 'true');
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

    const btnMenuInferior = document.getElementById('btn-abrir-menu-inferior');
    if (btnMenuInferior && menuNav) {
      btnMenuInferior.addEventListener('click', (e) => {
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
