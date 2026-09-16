/**
 * Módulo de Componentes de Interfaz Institucional
 * U.E. Luz del Mundo A - Planillero Deportivo
 * Sin emojis en ningún elemento.
 */

import { sanitizarHTML } from './utilidades.js';

/**
 * Muestra una notificación institucional (Toast)
 */
export function mostrarNotificacion(mensaje, tipo = 'info', duracionMs = 4000) {
  let contenedor = document.getElementById('contenedor-notificaciones');
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.id = 'contenedor-notificaciones';
    document.body.appendChild(contenedor);
  }

  const toast = document.createElement('div');
  toast.className = `notificacion-toast ${tipo}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = sanitizarHTML(mensaje);

  contenedor.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duracionMs);
}

/**
 * Diálogo accesible de confirmación institucional antes de acciones irreversibles
 */
export function mostrarConfirmacion({
  titulo = 'Confirmar Acción',
  mensaje = '¿Está seguro de que desea proceder?',
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  esPeligroso = false,
  alConfirmar
}) {
  const modalId = 'modal-confirmacion-dinamico';
  let modal = document.getElementById(modalId);
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'modal-fondo';
  modal.innerHTML = `
    <div class="modal-dialogo" role="dialog" aria-modal="true" aria-labelledby="titulo-confirmacion">
      <div class="modal-encabezado">
        <h3 id="titulo-confirmacion">${sanitizarHTML(titulo)}</h3>
        <button type="button" class="modal-cerrar" id="btn-cerrar-confirmacion" aria-label="Cerrar ventana">×</button>
      </div>
      <div class="modal-cuerpo">
        <p>${sanitizarHTML(mensaje)}</p>
      </div>
      <div class="modal-pie">
        <button type="button" class="boton boton-contorno boton-md" id="btn-cancelar-confirmacion">${sanitizarHTML(textoCancelar)}</button>
        <button type="button" class="boton ${esPeligroso ? 'boton-peligro' : 'boton-primario'} boton-md" id="btn-aceptar-confirmacion">${sanitizarHTML(textoConfirmar)}</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const cerrar = () => modal.remove();

  document.getElementById('btn-cerrar-confirmacion').addEventListener('click', cerrar);
  document.getElementById('btn-cancelar-confirmacion').addEventListener('click', cerrar);
  document.getElementById('btn-aceptar-confirmacion').addEventListener('click', () => {
    cerrar();
    if (typeof alConfirmar === 'function') {
      alConfirmar();
    }
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrar();
  });
}

/**
 * Control de apertura de modal por ID
 */
export function abrirModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.removeAttribute('hidden');
    modal.style.display = 'flex';
    const primerFoco = modal.querySelector('input, select, textarea, button');
    if (primerFoco) primerFoco.focus();
  }
}

/**
 * Control de cierre de modal por ID
 */
export function cerrarModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.setAttribute('hidden', 'true');
    modal.style.display = 'none';
  }
}

/**
 * Renderiza un spinner de carga en el contenedor dado
 */
export function mostrarCargando(contenedorId, mensaje = 'Cargando información deportiva...') {
  const c = document.getElementById(contenedorId);
  if (!c) return;
  c.innerHTML = `
    <div class="estado-carga">
      <div class="spinner"></div>
      <p>${sanitizarHTML(mensaje)}</p>
    </div>
  `;
}

/**
 * Renderiza un estado vacío institucional
 */
export function mostrarEstadoVacio(contenedorId, titulo, subtitulo = '') {
  const c = document.getElementById(contenedorId);
  if (!c) return;
  c.innerHTML = `
    <div class="estado-vacio">
      <div class="icono-svg-contenedor">
        <svg class="icono-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      </div>
      <h3>${sanitizarHTML(titulo)}</h3>
      ${subtitulo ? `<p>${sanitizarHTML(subtitulo)}</p>` : ''}
    </div>
  `;
}
