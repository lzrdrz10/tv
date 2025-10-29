
// === FOCUS SIEMPRE VISIBLE + NAVEGACIÓN TV ===
// filas/rows configuradas tal como en tu código original
const rows = [
  { els: document.querySelectorAll('header nav a'), container: null },
  { els: [document.querySelector('.btn-play'), document.querySelector('.btn-info')], container: null },
  { els: document.querySelectorAll('.categories .category'), container: document.querySelector('.categories-container') },
  { els: document.querySelectorAll('[data-row="1"] .card'), container: document.querySelector('[data-row="1"] .scroll') },
  { els: document.querySelectorAll('[data-row="2"] .card'), container: document.querySelector('[data-row="2"] .scroll') }
];

// estado actual
let row = 1, col = 0;
let current = rows[row].els[col];
if (current) current.classList.add('focus');

// array para guardar el último índice activo por fila (inicial 0)
const lastIndexPerRow = new Array(rows.length).fill(0);

// Lazy Load
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const img=entry.target;
      img.src=img.dataset.src;
      img.classList.remove('lazy');
      observer.unobserve(img);
    }
  });
},{rootMargin:'400px'});
document.querySelectorAll('img.lazy').forEach(img=>observer.observe(img));

// Mantener elemento visible en pantalla centrado
function keepInView(el){
  // si el elemento está dentro de un contenedor con scroll horizontal específico, hacemos scroll hacia ese contenedor
  const scroller = el.closest('.scroll, .categories-container');
  if (scroller) {
    // centrado horizontal en su contenedor
    scroller.scrollTo({
      left: el.offsetLeft - scroller.offsetWidth / 2 + el.offsetWidth / 2,
      behavior: 'smooth'
    });
    // también aseguramos que la página verticalmente muestre la fila
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    // fallback: scrollIntoView centrado en la página
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }
}

// función para actualizar clases focus de forma segura
function setFocus(newRow, newCol){
  // limpiar focus anterior
  if (current) current.classList.remove('focus');

  row = newRow;
  col = newCol;

  // guardamos el índice actual en lastIndexPerRow de la fila que acabamos de activar
  lastIndexPerRow[row] = col;

  const newEls = rows[row].els;
  // si no hay elementos en la fila, no hacer nada
  if (!newEls || newEls.length === 0) {
    current = null;
    return;
  }
  current = newEls[col];
  if (current) {
    current.classList.add('focus');
    keepInView(current);
  }
}

// Navegación con teclas
document.addEventListener('keydown', e => {
  if (!rows || rows.length === 0) return;
  const oldRow = row;
  let oldCol = col;

  // quitamos focus visual del actual (lo volveremos a añadir en setFocus)
  if (current) current.classList.remove('focus');

  if (e.key === 'ArrowRight') {
    // mover a la derecha dentro de la misma fila
    const max = rows[row].els.length - 1;
    if (col < max) col++;
    // actualizar último índice visitado de esta fila
    lastIndexPerRow[row] = col;
    current = rows[row].els[col];
    if (current) current.classList.add('focus');
    if (current) keepInView(current);
    e.preventDefault();
    return;
  }

  if (e.key === 'ArrowLeft') {
    // mover a la izquierda dentro de la misma fila
    if (col > 0) col--;
    lastIndexPerRow[row] = col;
    current = rows[row].els[col];
    if (current) current.classList.add('focus');
    if (current) keepInView(current);
    e.preventDefault();
    return;
  }

  if (e.key === 'ArrowDown') {
    // guardar índice actual en la fila actual antes de cambiar
    lastIndexPerRow[row] = col;

    // bajar una fila
    const targetRow = Math.min(row + 1, rows.length - 1);
    // si la fila destino no tiene elementos, no cambiar
    if (!rows[targetRow].els || rows[targetRow].els.length === 0) {
      current = rows[row].els[col];
      if (current) current.classList.add('focus');
      e.preventDefault();
      return;
    }
    // RULE: al bajar -> vamos al primer póster (índice 0) de la fila destino
    const targetCol = 0;
    setFocus(targetRow, targetCol);
    e.preventDefault();
    return;
  }

  if (e.key === 'ArrowUp') {
    // guardar índice actual en la fila actual antes de cambiar
    lastIndexPerRow[row] = col;

    // subir una fila
    const targetRow = Math.max(row - 1, 0);
    if (!rows[targetRow].els || rows[targetRow].els.length === 0) {
      current = rows[row].els[col];
      if (current) current.classList.add('focus');
      e.preventDefault();
      return;
    }
    // RULE: al subir -> restaurar el último póster activo en la fila destino
    // si no hay registro, caer a 0
    const saved = lastIndexPerRow[targetRow] ?? 0;
    // clamp para evitar índices fuera de rango
    const targetCol = Math.min(saved, rows[targetRow].els.length - 1);
    setFocus(targetRow, targetCol);
    e.preventDefault();
    return;
  }

  if (e.key === 'Enter') {
    // reactivar focus visual y ejecutar acción
    current = rows[row].els[col];
    if (current) {
      current.classList.add('focus');
      const title = current.dataset.title || current.querySelector('.card-title')?.textContent || 'Contenido';
      alert('Reproduciendo: ' + title);
    }
    e.preventDefault();
    return;
  }

  // si otra tecla, no interferimos
});

// Carga inicial del banner
window.addEventListener('load',()=>{
  const banner=document.querySelector('.banner img');
  if(banner) banner.src=banner.dataset.src;

  // aseguramos foco inicial consistente
  if (!current) {
    // buscar primer elemento disponible
    for (let r = 0; r < rows.length; r++) {
      if (rows[r].els && rows[r].els.length > 0) {
        setFocus(r, 0);
        break;
      }
    }
  } else {
    keepInView(current);
  }
});