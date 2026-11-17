/**
 * CloudDoc SaaS — Controlador Frontend Vanilla JS
 * Integración directa con API REST Spring Boot (/api/documentos)
 */

const API_BASE = '/api/documentos';
let documentoActualId = null;
let documentosCache = [];

// Instancia Toast de Bootstrap
let toastBS = null;

document.addEventListener('DOMContentLoaded', () => {
  const toastElement = document.getElementById('appToast');
  if (toastElement) {
    toastBS = new bootstrap.Toast(toastElement, { delay: 3500 });
  }

  // Inicializar listeners
  document.getElementById('btnGuardar').addEventListener('click', guardarDocumento);
  document.getElementById('btnNuevo').addEventListener('click', nuevoDocumento);
  
  const editor = document.getElementById('docContenido');
  editor.addEventListener('input', () => {
    actualizarMetricas();
    marcarComoNoSincronizado();
  });
  
  document.getElementById('docTitulo').addEventListener('input', marcarComoNoSincronizado);
  
  // Búsqueda interactiva
  document.getElementById('searchDesktop').addEventListener('input', (e) => filtrarLista(e.target.value));
  document.getElementById('searchMobile').addEventListener('input', (e) => filtrarLista(e.target.value));

  // Carga inicial de documentos
  cargarListaDocumentos();
});

// --------------------------------------------------------------------------
// 1. GESTIÓN DE ACCIONES WYSIWYG
// --------------------------------------------------------------------------
function formatDoc(command, value = null) {
  document.execCommand(command, false, value);
  document.getElementById('docContenido').focus();
  actualizarMetricas();
}

function insertarHipervinculo() {
  const url = prompt('Ingrese el enlace URL (ejemplo: https://google.com):');
  if (url && url.trim() !== '') {
    formatDoc('createLink', url.trim());
  }
}

// --------------------------------------------------------------------------
// 2. COMUNICACIÓN ASÍNCRONA CON LA API REST (SPRING BOOT)
// --------------------------------------------------------------------------
async function cargarListaDocumentos() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error('Error al conectar con la API REST');
    documentosCache = await response.json();
    renderizarListas(documentosCache);
    document.getElementById('totalDocsBadge').textContent = documentosCache.length;
  } catch (err) {
    mostrarNotificacion('Error de red al cargar documentos', 'danger');
    console.error(err);
  }
}

// Escapa texto del usuario antes de insertarlo con innerHTML (evita XSS en títulos).
function escaparHtml(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function renderizarListas(docs) {
  const contenedorDesktop = document.getElementById('listaDocsDesktop');
  const contenedorMobile = document.getElementById('listaDocsMobile');
  
  if (docs.length === 0) {
    const vacioHtml = `<div class="text-center text-muted p-4 fs-xs"><i class="bi bi-folder-x fs-2 d-block mb-1"></i>Sin documentos aún</div>`;
    contenedorDesktop.innerHTML = vacioHtml;
    contenedorMobile.innerHTML = vacioHtml;
    return;
  }

  const generarHtmlItem = (doc) => `
    <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-2 rounded mb-1 border-0 ${doc.id === documentoActualId ? 'bg-primary-subtle text-primary border-start border-3 border-primary' : 'bg-transparent'}">
      <div class="overflow-hidden me-2 cursor-pointer flex-grow-1" onclick="cargarDocumentoPorId(${doc.id})">
        <div class="fw-semibold text-truncate fs-sm">${escaparHtml(doc.titulo) || 'Sin Título'}</div>
        <small class="text-muted fs-xs d-block">${doc.fechaModificacion ? new Date(doc.fechaModificacion).toLocaleDateString() : 'Borrador'}</small>
      </div>
      <button class="btn btn-outline-danger btn-sm border-0 p-1 rounded-circle" onclick="eliminarDocumento(event, ${doc.id})" title="Eliminar">
        <i class="bi bi-trash fs-xs"></i>
      </button>
    </div>
  `;

  const htmlFinal = docs.map(generarHtmlItem).join('');
  contenedorDesktop.innerHTML = `<div class="list-group list-group-flush">${htmlFinal}</div>`;
  contenedorMobile.innerHTML = `<div class="list-group list-group-flush">${htmlFinal}</div>`;
}

async function cargarDocumentoPorId(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) throw new Error('Documento no encontrado');
    const doc = await response.json();
    
    documentoActualId = doc.id;
    document.getElementById('docTitulo').value = doc.titulo || '';
    document.getElementById('docContenido').innerHTML = doc.contenido || '';
    
    // Cerrar Offcanvas móvil si está abierto
    const offcanvasEl = document.getElementById('offcanvasSidebar');
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
    if (bsOffcanvas) bsOffcanvas.hide();
    
    actualizarMetricas();
    marcarComoSincronizado();
    renderizarListas(documentosCache);
    mostrarNotificacion(`Documento "${doc.titulo}" cargado`, 'info');
  } catch (err) {
    mostrarNotificacion('Error al obtener documento', 'danger');
  }
}

async function guardarDocumento() {
  const titulo = document.getElementById('docTitulo').value.trim() || 'Documento sin título';
  const contenido = document.getElementById('docContenido').innerHTML;
  const docPayload = { titulo, contenido, autor: 'Alumno FullStack' };

  const btn = document.getElementById('btnGuardar');
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Guardando...`;

  try {
    let response;
    if (documentoActualId) {
      // Operación PUT (Actualización)
      response = await fetch(`${API_BASE}/${documentoActualId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docPayload)
      });
    } else {
      // Operación POST (Creación)
      response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docPayload)
      });
    }

    if (!response.ok) throw new Error('Error al guardar en el servidor');
    const guardado = await response.json();
    documentoActualId = guardado.id;
    
    marcarComoSincronizado();
    await cargarListaDocumentos();
    mostrarNotificacion('Documento sincronizado con éxito en la nube SaaS', 'success');
  } catch (err) {
    mostrarNotificacion('Fallo en la persistencia del documento', 'danger');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

async function eliminarDocumento(e, id) {
  e.stopPropagation(); // Evitar cargar el documento al hacer clic en eliminar
  if (!confirm('¿Está seguro de eliminar este documento de la nube?')) return;

  try {
    const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('No se pudo eliminar');
    
    if (documentoActualId === id) {
      nuevoDocumento();
    }
    await cargarListaDocumentos();
    mostrarNotificacion('Documento eliminado correctamente', 'warning');
  } catch (err) {
    mostrarNotificacion('Error al eliminar', 'danger');
  }
}

function nuevoDocumento() {
  documentoActualId = null;
  document.getElementById('docTitulo').value = '';
  document.getElementById('docContenido').innerHTML = '';
  actualizarMetricas();
  marcarComoSincronizado('Nuevo borrador');
  renderizarListas(documentosCache);
}

// --------------------------------------------------------------------------
// 3. UTILIDADES DE ESTADO, MÉTRICAS Y NOTIFICACIONES
// --------------------------------------------------------------------------
function actualizarMetricas() {
  const texto = document.getElementById('docContenido').innerText.trim();
  const numPalabras = texto ? texto.split(/\s+/).length : 0;
  const numCaracteres = texto.length;
  document.getElementById('lblPalabras').textContent = numPalabras;
  document.getElementById('lblCaracteres').textContent = numCaracteres;
}

function marcarComoNoSincronizado() {
  const badge = document.getElementById('syncBadge');
  badge.className = 'badge bg-warning-subtle text-warning border border-warning-subtle d-none d-md-inline-flex align-items-center gap-1';
  badge.innerHTML = '<i class="bi bi-clock-history"></i> Cambios no guardados';
  document.getElementById('lblUltimaModificacion').textContent = 'Edición en curso...';
}

function marcarComoSincronizado(textoCustom = 'Sincronizado') {
  const badge = document.getElementById('syncBadge');
  badge.className = 'badge bg-secondary-subtle text-secondary border border-secondary-subtle d-none d-md-inline-flex align-items-center gap-1';
  badge.innerHTML = `<i class="bi bi-cloud-check"></i> ${textoCustom}`;
  document.getElementById('lblUltimaModificacion').textContent = 'Guardado ' + new Date().toLocaleTimeString();
}

function filtrarLista(texto) {
  const query = texto.toLowerCase();
  const filtrados = documentosCache.filter(d => (d.titulo || '').toLowerCase().includes(query));
  renderizarListas(filtrados);
}

function mostrarNotificacion(msg, tipo = 'success') {
  if (!toastBS) return;
  const toastEl = document.getElementById('appToast');
  const msgEl = document.getElementById('toastMessage');
  
  let icono = 'bi-check-circle-fill text-success';
  if (tipo === 'danger') icono = 'bi-exclamation-triangle-fill text-danger';
  if (tipo === 'warning') icono = 'bi-exclamation-circle-fill text-warning';
  if (tipo === 'info') icono = 'bi-info-circle-fill text-info';

  msgEl.innerHTML = `<i class="bi ${icono} fs-5"></i> ${escaparHtml(msg)}`;
  toastBS.show();
}
