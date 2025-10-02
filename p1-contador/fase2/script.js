

// Estado simple en memoria: { nombre: valor }
const estado = new Map();
const lista = document.getElementById("lista");
const estadoUI = document.getElementById("estado");
const btnCargar = document.getElementById("btn-cargar-nombres");
const btnReset = document.getElementById("btn-reset");
const inputArchivo = document.getElementById("input-archivo");
const tpl = document.getElementById("tpl-persona");
// --- Elementos y estado para selección múltiple ---
// Botón para activar el modo de selección múltiple
const btnSeleccionMultiple = document.getElementById("btn-seleccion-multiple");
// Menú inferior que aparece en modo selección
const menuSeleccion = document.getElementById("menu-seleccion");
// Botón para sumar a todos los seleccionados
const btnSumarSeleccion = document.getElementById("btn-sumar-seleccion");
// Botón para sumar decimas a todos los seleccionados
const btnSumarDecimaSeleccion = document.getElementById("btn-sumar-decima-seleccion");
// Botón para restar a todos los seleccionados
const btnRestarSeleccion = document.getElementById("btn-restar-seleccion");
// Botón para restar decimas a todos los seleccionados
const btnRestarDecimaSeleccion = document.getElementById("btn-restar-decima-seleccion");
// Botón para salir del modo selección
const btnConfirmarSeleccion = document.getElementById("btn-confirmar-seleccion");
// Estado global: ¿está activo el modo selección?
let modoSeleccion = false;

// --------- Utilidades ---------
function normalizaNombre(s) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
}

// Renderiza una tarjeta de persona, mostrando el checkbox oculto para selección múltiple
function renderPersona(nombre, valor = 10) {
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.nombre = nombre;
  node.querySelector(".nombre").textContent = nombre;
  const span = node.querySelector(".contador");
  span.textContent = valor;
  span.dataset.valor = String(valor);
  // Checkbox oculto, usado solo para guardar el estado de selección
  const chk = node.querySelector(".check-seleccion");
  chk.style.display = "none";
  // Si está seleccionado, se resalta la tarjeta
  node.classList.toggle("seleccionada", chk.checked);
  return node;
}
// --- Modo selección múltiple ---
// Activa el modo selección múltiple y muestra el menú inferior
btnSeleccionMultiple.addEventListener("click", () => {
  modoSeleccion = true;
  menuSeleccion.classList.remove("oculto");
  renderLista();
  setEstado("Selecciona varias tarjetas y usa el menú inferior.");
});

// Sale del modo selección múltiple y oculta el menú inferior
btnConfirmarSeleccion.addEventListener("click", () => {
  modoSeleccion = false;
  menuSeleccion.classList.add("oculto");
  renderLista();
  setEstado("Modo selección desactivado.");
});



// Suma +1 a todas las tarjetas seleccionadas
btnSumarSeleccion.addEventListener("click", () => {
  const seleccionados = lista.querySelectorAll(".check-seleccion:checked");
  seleccionados.forEach(chk => {
    const card = chk.closest(".persona");
    const nombre = card.dataset.nombre;
    let valor = estado.get(nombre) ?? 10;
    valor += 1;
    estado.set(nombre, valor);
    card.querySelector(".contador").textContent = valor;
    card.querySelector(".contador").dataset.valor = String(valor);
    bump(card.querySelector(".contador"));
  });
  setEstado(`Sumado +1 a ${seleccionados.length} tarjetas seleccionadas.`);
});

// Suma +0.1 a todas las tarjetas seleccionadas
btnSumarDecimaSeleccion.addEventListener("click", () => {
  const seleccionados = lista.querySelectorAll(".check-seleccion:checked");
  seleccionados.forEach(chk => {
    const card = chk.closest(".persona");
    const nombre = card.dataset.nombre;
    let valor = estado.get(nombre) ?? 10;
    valor += 0.1;
    estado.set(nombre, valor);
    card.querySelector(".contador").textContent = valor;
    card.querySelector(".contador").dataset.valor = String(valor);
    bump(card.querySelector(".contador"));
  });
  setEstado(`Sumado +0.1 a ${seleccionados.length} tarjetas seleccionadas.`);
});


// Resta -1 a todas las tarjetas seleccionadas
btnRestarSeleccion.addEventListener("click", () => {
  const seleccionados = lista.querySelectorAll(".check-seleccion:checked");
  seleccionados.forEach(chk => {
    const card = chk.closest(".persona");
    const nombre = card.dataset.nombre;
    let valor = estado.get(nombre) ?? 10;
    valor -= 1;
    estado.set(nombre, valor);
    card.querySelector(".contador").textContent = valor;
    card.querySelector(".contador").dataset.valor = String(valor);
    bump(card.querySelector(".contador"));
  });
  setEstado(`Restado -1 a ${seleccionados.length} tarjetas seleccionadas.`);
});



// Resta -0.1 a todas las tarjetas seleccionadas
btnRestarDecimaSeleccion.addEventListener("click", () => {
  const seleccionados = lista.querySelectorAll(".check-seleccion:checked");
  seleccionados.forEach(chk => {
    const card = chk.closest(".persona");
    const nombre = card.dataset.nombre;
    let valor = estado.get(nombre) ?? 10;
    valor -= 0.1;
    estado.set(nombre, valor);
    card.querySelector(".contador").textContent = valor;
    card.querySelector(".contador").dataset.valor = String(valor);
    bump(card.querySelector(".contador"));
  });
  setEstado(`Restado -0.1 a ${seleccionados.length} tarjetas seleccionadas.`);
});

function bump(el) {
  el.classList.add("bump");
  setTimeout(() => el.classList.remove("bump"), 160);
}

// Render completo desde estado
function renderLista() {
  lista.innerHTML = "";
  const nombres = Array.from(estado.keys()).sort((a, b) =>
    normalizaNombre(a).localeCompare(normalizaNombre(b))
  );
  for (const n of nombres) {
    const v = estado.get(n) ?? 10;
    lista.appendChild(renderPersona(n, v));
  }
}

// Mensaje de estado accesible
function setEstado(msg) {
  estadoUI.textContent = msg ?? "";
}

// --------- Carga de nombres ---------
async function cargarNombresDesdeTxt(url = "nombres.txt") {
  setEstado("Cargando nombres…");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo leer ${url}`);
  const text = await res.text();

  // Permite .txt (una por línea) o .json (array de strings)
  let nombres;
  if (url.endsWith(".json")) {
    const arr = JSON.parse(text);
    nombres = Array.isArray(arr) ? arr : [];
  } else {
    nombres = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }

  if (nombres.length === 0) throw new Error("El archivo no contiene nombres.");

  // Inicializa estado si no existían
  for (const n of nombres) {
    if (!estado.has(n)) estado.set(n, 10);
  }
  renderLista();
  setEstado(`Cargados ${nombres.length} nombres.`);
}

// Carga desde archivo local (input file)
async function cargarDesdeArchivoLocal(file) {
  const text = await file.text();
  let nombres;
  if (file.name.endsWith(".json")) {
    const arr = JSON.parse(text);
    nombres = Array.isArray(arr) ? arr : [];
  } else {
    nombres = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }

  if (nombres.length === 0) throw new Error("El archivo no contiene nombres.");

  for (const n of nombres) {
    if (!estado.has(n)) estado.set(n, 10);
  }
  renderLista();
  setEstado(`Cargados ${nombres.length} nombres desde archivo local.`);
}

// --------- Interacción ---------
// Delegación: un solo listener para todos los botones
lista.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  const card = btn.closest(".persona");
  if (!card) return;

  const nombre = card.dataset.nombre;
  if (!estado.has(nombre)) return;

  const span = card.querySelector(".contador");
  let valor = Number(span.dataset.valor || "10");

  if (btn.classList.contains("btn-mas")) valor += 1;
  if (btn.classList.contains("btn-menos")) valor -= 1;

  estado.set(nombre, valor);
  span.dataset.valor = String(valor);
  span.textContent = valor;
  bump(span);
});

// Permite seleccionar/deseleccionar una tarjeta haciendo clic en cualquier parte de la tarjeta (excepto botones) en modo selección
lista.addEventListener("click", (ev) => {
  if (!modoSeleccion) return;
  const card = ev.target.closest(".persona");
  if (!card) return;
  // Evita que los botones internos activen la selección
  if (ev.target.closest("button")) return;
  const chk = card.querySelector(".check-seleccion");
  chk.checked = !chk.checked;
  // Añade o quita el contorno azul según el estado
  card.classList.toggle("seleccionada", chk.checked);
});
btnReset.addEventListener("click", () => {
  for (const n of estado.keys()) estado.set(n, 10);
  renderLista();
  setEstado("Todos los contadores han sido reiniciados a 10.");
});

btnCargar.addEventListener("click", async () => {
  try {
    await cargarNombresDesdeTxt("nombres.txt");
  } catch (err) {
    console.error(err);
    setEstado("No se pudo cargar nombres.txt. Puedes subir un archivo local.");
  }
});

inputArchivo.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    await cargarDesdeArchivoLocal(file);
  } catch (err) {
    console.error(err);
    setEstado("No se pudo leer el archivo local.");
  } finally {
    inputArchivo.value = "";
  }
});

// Seleccionar todos
// Selecciona todas las tarjetas (en modo selección múltiple)
document.getElementById("btn-seleccionar-todos").addEventListener("click", () => {
  const checkboxes = lista.querySelectorAll(".check-seleccion");
  checkboxes.forEach(chk => {
    chk.checked = true;
    chk.closest(".persona").classList.add("seleccionada");
  });
  setEstado(`Se han seleccionado ${checkboxes.length} personas`);
});

// Deseleccionar todos
// Deselecciona todas las tarjetas (en modo selección múltiple)
document.getElementById("btn-deseleccionar-todos").addEventListener("click", () => {
  const checkboxes = lista.querySelectorAll(".check-seleccion");
  checkboxes.forEach(chk => {
    chk.checked = false;
    chk.closest(".persona").classList.remove("seleccionada");
  });
  setEstado("Se han deseleccionado todas las personas");
});

// --------- Bootstrap ---------
// Opción A (recomendada en local con live server): intenta cargar nombres.txt
// Opción B: si falla, el usuario puede usar “Cargar archivo local”
cargarNombresDesdeTxt("nombres.txt").catch(() => {
  setEstado("Consejo: coloca un nombres.txt junto a esta página o usa 'Cargar archivo local'.");
});

