
const amountInput = document.getElementById("amount");
const currencySelect = document.getElementById("currency");
const usdRateInput = document.getElementById("usdRate");
const eurRateInput = document.getElementById("eurRate");
const noteTitleInput = document.getElementById("noteTitle");
const resultValue = document.getElementById("resultValue");
const addConvertedNoteButton = document.getElementById("addConvertedNote");

const openNoteFormButton = document.getElementById("openNoteForm");
const noteForm = document.getElementById("noteForm");
const customTitleInput = document.getElementById("customTitle");
const customTextInput = document.getElementById("customText");
const formHeading = document.getElementById("formHeading");
const saveNoteButton = document.getElementById("saveNote");
const cancelNoteButton = document.getElementById("cancelNote");
const notesGrid = document.getElementById("notesGrid");
const emptyMessage = document.getElementById("emptyMessage");

const STORAGE_KEY = "conversorPizarronNotas";

const colors = [
  "note-blue",
  "note-slate",
  "note-brown",
  "note-purple",
  "note-pink",
  "note-mint"
];

let notes = loadNotes();
let editingId = null;
let nextColor = notes.length % colors.length;

// Cargar las notas guardadas
function loadNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : null;

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

// Guardar las notas en el navegador
function saveNotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    alert("No se pudieron guardar las notas en este navegador.");
  }
}

// Obtener la cotización seleccionada
function getRate() {
  return currencySelect.value === "USD"
    ? Number(usdRateInput.value)
    : Number(eurRateInput.value);
}

// Dar formato a los importes
function formatMoney(value, currency) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2
  }).format(value);
}

// Calcular la conversión
function calculateConversion() {
  const amount = Number(amountInput.value);
  const rate = getRate();
  const currency = currencySelect.value;

  if (
    amountInput.value.trim() === "" ||
    !Number.isFinite(amount) ||
    amount < 0 ||
    !Number.isFinite(rate) ||
    rate <= 0
  ) {
    resultValue.textContent =
      currency === "USD" ? "US$ 0,00" : "€ 0,00";

    return null;
  }

  const converted = amount / rate;

  resultValue.textContent = formatMoney(converted, currency);

  return {
    amount,
    converted,
    currency
  };
}

// Abrir el formulario para crear o editar una nota
function openForm(note = null) {
  editingId = note ? note.id : null;

  formHeading.textContent = note ? "Editar nota" : "Nueva nota";
  saveNoteButton.textContent = note
    ? "Guardar cambios"
    : "Guardar nota";

  customTitleInput.value = note ? note.title : "";
  customTextInput.value = note ? note.text : "";

  noteForm.hidden = false;
  openNoteFormButton.setAttribute("aria-expanded", "true");

  customTitleInput.focus();
}

// Cerrar el formulario
function closeForm() {
  noteForm.reset();
  noteForm.hidden = true;
  editingId = null;

  openNoteFormButton.setAttribute("aria-expanded", "false");
}

// Mostrar todas las notas
function renderNotes() {
  notesGrid.replaceChildren();
  emptyMessage.hidden = notes.length > 0;

  notes.forEach((note) => {
    const card = document.createElement("article");

    card.className =
      `note ${colors[note.colorIndex % colors.length] || colors[0]}`;

    const title = document.createElement("h3");
    title.textContent = note.title;

    const text = document.createElement("p");
    text.textContent = note.text;

    const actions = document.createElement("div");
    actions.className = "note-actions";

    // Botón para editar
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Editar";

    editButton.addEventListener("click", () => {
      openForm(note);
    });

    // Botón para eliminar
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Eliminar";

    deleteButton.addEventListener("click", () => {
      if (confirm(`¿Querés eliminar la nota "${note.title}"?`)) {
        notes = notes.filter((item) => item.id !== note.id);

        saveNotes();
        renderNotes();
      }
    });

    actions.append(editButton, deleteButton);
    card.append(title, text, actions);

    notesGrid.append(card);
  });
}

// Crear una nota nueva
function addNote(title, text) {
  notes.push({
    id: (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,

    title,
    text,
    colorIndex: nextColor
  });

  nextColor = (nextColor + 1) % colors.length;

  saveNotes();
  renderNotes();
}

// Actualizar el resultado al cambiar los datos
[
  amountInput,
  currencySelect,
  usdRateInput,
  eurRateInput
].forEach((element) => {
  element.addEventListener("input", calculateConversion);
  element.addEventListener("change", calculateConversion);
});

// Agregar una conversión al pizarrón
addConvertedNoteButton.addEventListener("click", () => {
  const conversion = calculateConversion();

  if (!conversion) {
    alert("Ingresá un importe válido y una cotización mayor que cero.");
    return;
  }

  const title = noteTitleInput.value.trim() || "Conversión";

  const details =
    `${formatMoney(conversion.amount, "ARS")} = ` +
    `${formatMoney(conversion.converted, conversion.currency)}`;

  addNote(title, details);
});

// Mostrar u ocultar el formulario de notas
openNoteFormButton.addEventListener("click", () => {
  if (noteForm.hidden) {
    openForm();
  } else {
    closeForm();
  }
});

// Cancelar una nota
cancelNoteButton.addEventListener("click", closeForm);

// Guardar una nota nueva o los cambios de una nota existente
noteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = customTitleInput.value.trim();
  const text = customTextInput.value.trim();

  if (!title || !text) {
    alert("Completá el título y el texto de la nota.");
    return;
  }

  if (editingId) {
    notes = notes.map((note) =>
      note.id === editingId
        ? { ...note, title, text }
        : note
    );

    saveNotes();
    renderNotes();
  } else {
    addNote(title, text);
  }

  closeForm();
});

// Inicializar la aplicación
calculateConversion();
renderNotes();