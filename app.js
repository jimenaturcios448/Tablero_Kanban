const STORAGE_KEY = "kanban-tareas";
let tareas = cargar();

function cargar() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function guardar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
}

function crearTarjeta(tarea) {
  const card = document.createElement("div");
  card.className = "card";
  card.draggable = true;
  card.dataset.estado = tarea.estado;

  const texto = document.createElement("span");
  texto.textContent = tarea.texto;

  const btnBorrar = document.createElement("button");
  btnBorrar.className = "borrar";
  btnBorrar.textContent = "✕";
  btnBorrar.title = "Eliminar tarea";
  btnBorrar.addEventListener("click", () => {
    tareas = tareas.filter((t) => t.id !== tarea.id);
    guardar();
    render();
  });

  card.append(texto, btnBorrar);

  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", tarea.id);
    card.classList.add("arrastrando");
  });
  card.addEventListener("dragend", () => card.classList.remove("arrastrando"));

  return card;
}

function render() {
  document.querySelectorAll(".column").forEach((columna) => {
    const estado = columna.dataset.estado;
    const lista = columna.querySelector(".lista");
    const delEstado = tareas.filter((t) => t.estado === estado);

    lista.innerHTML = "";
    delEstado.forEach((t) => lista.appendChild(crearTarjeta(t)));
    columna.querySelector(".contador").textContent = delEstado.length;
  });
}

document.querySelectorAll(".column").forEach((columna) => {
  const estado = columna.dataset.estado;

  // Agregar tareas nuevas
  columna.querySelector(".nueva").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = e.target.querySelector("input");
    const texto = input.value.trim();
    if (!texto) return;

    tareas.push({ id: Date.now().toString(), texto, estado });
    input.value = "";
    guardar();
    render();
  });

  // Soltar tarjetas en la columna
  columna.addEventListener("dragover", (e) => {
    e.preventDefault();
    columna.classList.add("sobre");
  });
  columna.addEventListener("dragleave", () => columna.classList.remove("sobre"));
  columna.addEventListener("drop", (e) => {
    e.preventDefault();
    columna.classList.remove("sobre");

    const id = e.dataTransfer.getData("text/plain");
    const tarea = tareas.find((t) => t.id === id);
    if (tarea) {
      tarea.estado = estado;
      guardar();
      render();
    }
    const total = tareas.length;
    const hechas = tareas.filter((t) => t.estado === "hecho").length;
    const porcentaje = total ? Math.round((hechas / total) * 100) : 0;
    document.getElementById("barra").style.width = porcentaje + "%";
    document.getElementById("porcentaje").textContent = porcentaje + "% completado";

  });
});

render();