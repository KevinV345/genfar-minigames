// Global variables
let currentUser = null
let authToken = null
const currentData = {}
const colliderEditor = {
  active: false,
  escenarioId: null,
  points: [],
  imageElement: null,
  containerElement: null,
}
let currentView = null // Declare currentView variable

// Feather icon library
const feather = window.feather

// API Base URL
const API_BASE = "/api"

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()

  const mobileMenuToggle = document.getElementById("mobileMenuToggle")
  const sidebar = document.getElementById("sidebar")
  let sidebarOverlay = null

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
      toggleSidebar()
    })
  }

  function toggleSidebar() {
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar()
  }

  function openSidebar() {
    sidebar.classList.add("open")
    if (!sidebarOverlay) {
      sidebarOverlay = document.createElement("div")
      sidebarOverlay.className = "sidebar-overlay"
      document.body.appendChild(sidebarOverlay)
      sidebarOverlay.addEventListener("click", closeSidebar)
    }
    sidebarOverlay.classList.add("active")
  }

  function closeSidebar() {
    sidebar.classList.remove("open")
    if (sidebarOverlay) {
      sidebarOverlay.classList.remove("active")
    }
  }

  document.querySelectorAll(".nav-item[data-tab]").forEach((item) => {
    item.addEventListener("click", () => {
      if (window.innerWidth <= 1024) {
        closeSidebar()
      }
    })
  })

  // Add event listener for modal close button
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("close") || e.target.innerHTML === "&times;") {
      closeModal()
    }
  })
})

function initializeApp() {
  authToken = localStorage.getItem("authToken")
  if (authToken) {
    verifyToken()
  } else {
    showLogin()
  }
  setupEventListeners()
}

function setupEventListeners() {
  document.getElementById("loginForm").addEventListener("submit", handleLogin)
  document.getElementById("logoutBtn").addEventListener("click", handleLogout)

  document.querySelectorAll(".nav-item[data-tab]").forEach((item) => {
    item.addEventListener("click", (e) => switchTab(e.target.closest(".nav-item").dataset.tab))
  })

  document.getElementById("addPaisBtn")?.addEventListener("click", () => showPaisForm())
  document.getElementById("addPreguntaBtn")?.addEventListener("click", () => showPreguntaForm())
  document.getElementById("addEscenarioBtn")?.addEventListener("click", () => showEscenarioForm())
  document.getElementById("addSpriteBtn")?.addEventListener("click", () => showSpriteForm())
  document.getElementById("addUsuarioBtn")?.addEventListener("click", () => showUsuarioForm())
  document.getElementById("addRuletaTemaBtn")?.addEventListener("click", () => showRuletaTemaForm())
  document.getElementById("addRuletaPreguntaBtn")?.addEventListener("click", () => showRuletaPreguntaForm())

  document.getElementById("paisFilterPreguntas").addEventListener("change", filterPreguntas)
  document.getElementById("paisFilterEscenarios").addEventListener("change", filterEscenarios)
  document.getElementById("paisFilterSprites").addEventListener("change", filterSprites)
  document.getElementById("paisFilterRuleta").addEventListener("change", filterRuletaPreguntasByPais)
  document.getElementById("temaFilterRuleta").addEventListener("change", filterRuletaPreguntasByTema)
}

// --- AUTH FUNCTIONS ---
async function handleLogin(e) {
  e.preventDefault()
  const correo = document.getElementById("correo").value
  const contrasena = document.getElementById("contrasena").value
  const errorDiv = document.getElementById("loginError")
  errorDiv.style.display = "none"

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contrasena }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Error de autenticación")

    authToken = data.token
    currentUser = data.user
    localStorage.setItem("authToken", authToken)
    showApp()
  } catch (error) {
    errorDiv.textContent = error.message
    errorDiv.style.display = "block"
  }
}

function handleLogout() {
  authToken = null
  currentUser = null
  localStorage.removeItem("authToken")
  showLogin()
}

async function verifyToken() {
  try {
    const response = await fetch(`${API_BASE}/auth/verify`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    if (!response.ok) throw new Error("Token inválido")
    const data = await response.json()
    currentUser = data.user
    showApp()
  } catch (error) {
    handleLogout()
  }
}

function showLogin() {
  document.getElementById("loginContainer").style.display = "block"
  document.getElementById("appContainer").style.display = "none"
  document.body.classList.remove("admin")
}

async function showApp() {
  document.getElementById("loginContainer").style.display = "none"
  document.getElementById("appContainer").style.display = "block"

  document.body.classList.toggle("admin", currentUser && currentUser.es_admin)

  await loadPaises() // Load countries first as they are needed by others
  switchTab("paises")
  feather.replace()
}

function switchTab(tabName) {
  document.querySelectorAll(".section").forEach((s) => s.classList.remove("active"))
  document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"))
  document.getElementById(`${tabName}Section`).classList.add("active")
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")
  feather.replace()

  // Load data for the new tab
  const loadFunction = {
    paises: loadPaises,
    preguntas: () => {
      loadPreguntas()
      loadPaisesForFilter("paisFilterPreguntas")
    },
    escenarios: () => {
      loadEscenarios()
      loadPaisesForFilter("paisFilterEscenarios")
    },
    sprites: () => {
      loadSprites()
      loadPaisesForFilter("paisFilterSprites")
    },
    "ruleta-temas": loadRuletaTemas,
    "ruleta-preguntas": () => {
      loadRuletaPreguntas()
      loadTemasForFilter()
      loadPaisesForFilter("paisFilterRuleta")
    },
    usuarios: loadUsuarios,
    logs: loadLogs,
  }[tabName]

  if (loadFunction) loadFunction()
  currentView = tabName // Set currentView to the active tab
}

// --- API HELPER ---
async function apiRequest(endpoint, options = {}) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    ...options,
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || "Error en la petición")
  return data
}

// --- DATA LOADING & RENDERING ---
async function loadPaises() {
  currentData.paises = await apiRequest("/paises")
  const tbody = document.querySelector("#paisesTable tbody")
  tbody.innerHTML = currentData.paises
    .map(
      (pais) => `
    <tr>
      <td>${pais.id}</td>
      <td>${pais.nombre}</td>
      <td class="admin-only">
        <button class="btn btn-warning btn-small" onclick="editPais(${pais.id})">Editar</button>
        <button class="btn btn-danger btn-small" onclick="deletePais(${pais.id})">Eliminar</button>
      </td>
    </tr>
  `,
    )
    .join("")
}

async function loadPreguntas() {
  currentData.preguntas = await apiRequest("/preguntas")
  renderPreguntasTable(currentData.preguntas)
}

function renderPreguntasTable(preguntas) {
  const tbody = document.querySelector("#preguntasTable tbody")
  tbody.innerHTML = preguntas
    .map(
      (p) => `
    <tr>
      <td>${p.id}</td>
      <td>${p.paises_nombres || "<em>Sin Asignar</em>"}</td>
      <td>${p.pregunta.substring(0, 50)}...</td>
      <td>${p.respuesta_correcta}</td>
      <td class="admin-only">
        <button class="btn btn-warning btn-small" onclick="editPregunta(${p.id})">Editar</button>
        <button class="btn btn-danger btn-small" onclick="deletePregunta(${p.id})">Eliminar</button>
      </td>
    </tr>
  `,
    )
    .join("")
}

async function loadEscenarios() {
  currentData.escenarios = await apiRequest("/escenarios")
  const escenariosConObjetos = await Promise.all(
    currentData.escenarios.map(async (esc) => {
      const objetos = await apiRequest(`/escenarios/${esc.id}/objetos`)
      return { ...esc, objetosCount: objetos.length }
    }),
  )
  renderEscenariosTable(escenariosConObjetos)
}

function renderEscenariosTable(scenarios) {
  const tbody = document.querySelector("#escenariosTable tbody")
  tbody.innerHTML = scenarios
    .map(
      (esc) => `
    <tr>
      <td>${esc.id}</td>
      <td>${esc.paises_nombres || "<em>Sin Asignar</em>"}</td>
      <td><img src="${esc.imagen_fondo}" alt="Fondo" style="width: 50px; height: auto;"></td>
      <td>
        <span class="badge">${esc.objetosCount}</span>
        <button class="btn btn-small btn-primary" onclick="manageObjects(${esc.id}, '${esc.paises_nombres || "Escenario"}')">
          Gestionar
        </button>
      </td>
      <td class="admin-only">
        <button class="btn btn-small btn-warning" onclick="editEscenario(${esc.id})">Editar</button>
        <button class="btn btn-small btn-danger" onclick="deleteEscenario(${esc.id})">Eliminar</button>
      </td>
    </tr>
  `,
    )
    .join("")
}

async function loadSprites() {
  currentData.sprites = await apiRequest("/sprites")
  renderSpritesTable(currentData.sprites)
}

function renderSpritesTable(sprites) {
  const tbody = document.querySelector("#spritesTable tbody")
  tbody.innerHTML = sprites
    .map(
      (s) => `
    <tr>
      <td>${s.id}</td>
      <td>${s.paises_nombres || "<em>Sin Asignar</em>"}</td>
      <td>${s.tipo}</td>
      <td><img src="${s.imagen_url}" alt="Sprite" style="max-width: 50px; max-height: 50px;"></td>
      <td class="admin-only">
        <button class="btn btn-warning btn-small" onclick="editSprite(${s.id})">Editar</button>
        <button class="btn btn-danger btn-small" onclick="deleteSprite(${s.id})">Eliminar</button>
      </td>
    </tr>
  `,
    )
    .join("")
}

async function loadUsuarios() {
  if (!currentUser.es_admin) return
  currentData.usuarios = await apiRequest("/usuarios")
  const tbody = document.querySelector("#usuariosTable tbody")
  tbody.innerHTML = currentData.usuarios
    .map(
      (u) => `
    <tr>
      <td>${u.id}</td>
      <td>${u.nombre}</td>
      <td>${u.correo}</td>
      <td>${u.es_admin ? "Sí" : "No"}</td>
      <td>
        <button class="btn btn-warning btn-small" onclick="editUsuario(${u.id})">Editar</button>
        <button class="btn btn-danger btn-small" onclick="deleteUsuario(${u.id})">Eliminar</button>
      </td>
    </tr>
  `,
    )
    .join("")
}

async function loadLogs() {
  if (!currentUser.es_admin) return
  currentData.logs = await apiRequest("/logs")
  const tbody = document.querySelector("#logsTable tbody")
  tbody.innerHTML = currentData.logs
    .map(
      (log) => `
    <tr>
      <td>${log.id}</td>
      <td>${new Date(log.fecha).toLocaleString()}</td>
      <td>${log.accion}</td>
      <td>${log.detalle || "N/A"}</td>
    </tr>
  `,
    )
    .join("")
}

// --- FILTER FUNCTIONS ---
function loadPaisesForFilter(selectId) {
  const select = document.getElementById(selectId)
  select.innerHTML = '<option value="">Todos los países</option>'
  currentData.paises.forEach((pais) => {
    select.innerHTML += `<option value="${pais.id}">${pais.nombre}</option>`
  })
}

function filterPreguntas() {
  const paisId = document.getElementById("paisFilterPreguntas").value
  const filtered = paisId
    ? currentData.preguntas.filter((p) => p.paises_ids && p.paises_ids.split(",").includes(paisId))
    : currentData.preguntas
  renderPreguntasTable(filtered)
}

function filterEscenarios() {
  const paisId = document.getElementById("paisFilterEscenarios").value
  const filtered = paisId
    ? currentData.escenarios.filter((e) => e.paises_ids && e.paises_ids.split(",").includes(paisId))
    : currentData.escenarios
  renderEscenariosTable(filtered)
}

function filterSprites() {
  const paisId = document.getElementById("paisFilterSprites").value
  const filtered = paisId
    ? currentData.sprites.filter((s) => s.paises_ids && s.paises_ids.split(",").includes(paisId))
    : currentData.sprites
  renderSpritesTable(filtered)
}

function filterRuletaPreguntasByPais() {
  const paisId = document.getElementById("paisFilterRuleta").value
  const temaId = document.getElementById("temaFilterRuleta").value

  let filtered = currentData.ruletaPreguntas

  if (paisId) {
    filtered = filtered.filter((p) => p.paises_ids && p.paises_ids.split(",").includes(paisId))
  }

  if (temaId) {
    filtered = filtered.filter((p) => p.tema_id == temaId)
  }

  renderRuletaPreguntasTable(filtered)
}

function filterRuletaPreguntasByTema(temaId) {
  document.getElementById("temaFilterRuleta").value = temaId
  filterRuletaPreguntasByPais()
}

// --- MODAL & FORMS ---
function showModal(title, content) {
  const modalBody = document.getElementById("modalBody")
  modalBody.innerHTML = `<h3>${title}</h3>${content}`
  document.getElementById("modal").style.display = "block"
  feather.replace()
}

function closeModal() {
  document.getElementById("modal").style.display = "none"
}

// MODIFICADO: Formularios para usar <select multiple>
function showPreguntaForm(pregunta = null) {
  const isEdit = !!pregunta
  const title = isEdit ? "Editar Pregunta" : "Agregar Pregunta"
  const selectedPaises = isEdit && pregunta.paises_ids ? pregunta.paises_ids.split(",") : []

  const paisesOptions = currentData.paises
    .map(
      (pais) =>
        `<option value="${pais.id}" ${selectedPaises.includes(String(pais.id)) ? "selected" : ""}>${pais.nombre}</option>`,
    )
    .join("")

  const content = `
    <form id="preguntaForm">
      <div class="form-group">
        <label for="preguntaPaises">País/Países:</label>
        <select id="preguntaPaises" multiple required>${paisesOptions}</select>
        <small>Mantén Ctrl (o Cmd en Mac) para seleccionar varios.</small>
      </div>
      <div class="form-group">
        <label for="preguntaTexto">Pregunta:</label>
        <textarea id="preguntaTexto" required>${isEdit ? pregunta.pregunta : ""}</textarea>
      </div>
      <div class="form-group">
        <label for="respuestaCorrecta">Respuesta Correcta:</label>
        <input type="text" id="respuestaCorrecta" value="${isEdit ? pregunta.respuesta_correcta : ""}" required>
      </div>
      <div class="form-group">
        <label for="respuesta1">Respuesta 1:</label>
        <input type="text" id="respuesta1" value="${isEdit ? pregunta.respuesta_1 : ""}" required>
      </div>
      <div class="form-group">
        <label for="respuesta2">Respuesta 2:</label>
        <input type="text" id="respuesta2" value="${isEdit ? pregunta.respuesta_2 : ""}" required>
      </div>
      <div class="form-group">
        <label for="respuesta3">Respuesta 3:</label>
        <input type="text" id="respuesta3" value="${isEdit ? pregunta.respuesta_3 : ""}" required>
      </div>
      <div class="form-buttons">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"}</button>
      </div>
    </form>
  `
  showModal(title, content)

  document.getElementById("preguntaForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    const selectedOptions = document.getElementById("preguntaPaises").selectedOptions
    const paises_ids = Array.from(selectedOptions).map((opt) => opt.value)

    const data = {
      paises_ids,
      pregunta: document.getElementById("preguntaTexto").value,
      respuesta_correcta: document.getElementById("respuestaCorrecta").value,
      respuesta_1: document.getElementById("respuesta1").value,
      respuesta_2: document.getElementById("respuesta2").value,
      respuesta_3: document.getElementById("respuesta3").value,
    }

    const endpoint = isEdit ? `/preguntas/${pregunta.id}` : "/preguntas"
    const method = isEdit ? "PUT" : "POST"

    try {
      await apiRequest(endpoint, { method, body: JSON.stringify(data) })
      closeModal()
      loadPreguntas()
    } catch (error) {
      alert("Error: " + error.message)
    }
  })
}

function showEscenarioForm(escenario = null) {
  const isEdit = !!escenario
  const title = isEdit ? "Editar Escenario" : "Agregar Escenario"
  const selectedPaises = isEdit && escenario.paises_ids ? escenario.paises_ids.split(",") : []

  const paisesOptions = currentData.paises
    .map(
      (pais) =>
        `<option value="${pais.id}" ${selectedPaises.includes(String(pais.id)) ? "selected" : ""}>${pais.nombre}</option>`,
    )
    .join("")

  const content = `
    <form id="escenarioForm">
      <div class="form-group">
        <label for="escenarioPaises">País/Países:</label>
        <select id="escenarioPaises" multiple required>${paisesOptions}</select>
        <small>Mantén Ctrl (o Cmd en Mac) para seleccionar varios.</small>
      </div>
      <div class="form-group">
        <label for="imagenFondo">Imagen de Fondo:</label>
        <input type="file" id="imagenFondo" accept="image/*" ${!isEdit ? "required" : ""}>
        ${isEdit ? `<p>Imagen actual: <img src="${escenario.imagen_fondo}" style="max-width: 100px; max-height: 100px;"></p>` : ""}
      </div>
      <div class="form-buttons">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"}</button>
      </div>
    </form>
  `
  showModal(title, content)

  document.getElementById("escenarioForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    const selectedOptions = document.getElementById("escenarioPaises").selectedOptions
    const paises_ids = Array.from(selectedOptions).map((opt) => opt.value)
    const fileInput = document.getElementById("imagenFondo")

    let imagen_fondo = isEdit ? escenario.imagen_fondo : null

    if (fileInput.files[0]) {
      const formData = new FormData()
      formData.append("image", fileInput.files[0])

      try {
        const uploadResponse = await fetch(`${API_BASE}/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${authToken}` },
          body: formData,
        })
        const uploadData = await uploadResponse.json()
        if (!uploadResponse.ok) throw new Error(uploadData.error)
        imagen_fondo = uploadData.url
      } catch (error) {
        alert("Error al subir imagen: " + error.message)
        return
      }
    }

    const data = { paises_ids, imagen_fondo }
    const endpoint = isEdit ? `/escenarios/${escenario.id}` : "/escenarios"
    const method = isEdit ? "PUT" : "POST"

    try {
      await apiRequest(endpoint, { method, body: JSON.stringify(data) })
      closeModal()
      loadEscenarios()
    } catch (error) {
      alert("Error: " + error.message)
    }
  })
}

function showSpriteForm(sprite = null) {
  const isEdit = !!sprite
  const title = isEdit ? "Editar Sprite" : "Agregar Sprite"
  const selectedPaises = isEdit && sprite.paises_ids ? sprite.paises_ids.split(",") : []

  const paisesOptions = currentData.paises
    .map(
      (pais) =>
        `<option value="${pais.id}" ${selectedPaises.includes(String(pais.id)) ? "selected" : ""}>${pais.nombre}</option>`,
    )
    .join("")

  const content = `
    <form id="spriteForm">
      <div class="form-group">
        <label for="spritePaises">País/Países:</label>
        <select id="spritePaises" multiple required>${paisesOptions}</select>
        <small>Mantén Ctrl (o Cmd en Mac) para seleccionar varios.</small>
      </div>
      <div class="form-group">
        <label for="spriteTipo">Tipo:</label>
        <select id="spriteTipo" required>
          <option value="medicamento" ${isEdit && sprite.tipo === "medicamento" ? "selected" : ""}>Medicamento</option>
          <option value="bacteria" ${isEdit && sprite.tipo === "bacteria" ? "selected" : ""}>Bacteria</option>
        </select>
      </div>
      <div class="form-group">
        <label for="spriteImagen">Imagen:</label>
        <input type="file" id="spriteImagen" accept="image/*" ${!isEdit ? "required" : ""}>
        ${isEdit ? `<p>Imagen actual: <img src="${sprite.imagen_url}" style="max-width: 100px; max-height: 100px;"></p>` : ""}
      </div>
      <div class="form-buttons">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"}</button>
      </div>
    </form>
  `
  showModal(title, content)

  document.getElementById("spriteForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    const selectedOptions = document.getElementById("spritePaises").selectedOptions
    const paises_ids = Array.from(selectedOptions).map((opt) => opt.value)
    const tipo = document.getElementById("spriteTipo").value
    const fileInput = document.getElementById("spriteImagen")

    const formData = new FormData()
    formData.append("paises_ids", paises_ids.join(","))
    formData.append("tipo", tipo)

    if (isEdit) {
      formData.append("imagen_url", sprite.imagen_url)
    }

    if (fileInput.files[0]) {
      formData.append("imagen", fileInput.files[0])
    }

    const endpoint = isEdit ? `/sprites/${sprite.id}` : "/sprites"
    const method = isEdit ? "PUT" : "POST"

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      closeModal()
      loadSprites()
    } catch (error) {
      alert("Error: " + error.message)
    }
  })
}

function showPaisForm(pais = null) {
  const isEdit = !!pais
  const title = isEdit ? "Editar País" : "Agregar País"

  const content = `
    <form id="paisForm">
      <div class="form-group">
        <label for="paisNombre">Nombre:</label>
        <input type="text" id="paisNombre" value="${isEdit ? pais.nombre : ""}" required>
      </div>
      <div class="form-buttons">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"}</button>
      </div>
    </form>
  `
  showModal(title, content)

  document.getElementById("paisForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    const data = { nombre: document.getElementById("paisNombre").value }
    const endpoint = isEdit ? `/paises/${pais.id}` : "/paises"
    const method = isEdit ? "PUT" : "POST"

    try {
      await apiRequest(endpoint, { method, body: JSON.stringify(data) })
      closeModal()
      loadPaises()
    } catch (error) {
      alert("Error: " + error.message)
    }
  })
}

function showUsuarioForm(usuario = null) {
  const isEdit = !!usuario
  const title = isEdit ? "Editar Usuario" : "Agregar Usuario"

  const content = `
    <form id="usuarioForm">
      <div class="form-group">
        <label for="usuarioNombre">Nombre:</label>
        <input type="text" id="usuarioNombre" value="${isEdit ? usuario.nombre : ""}" required>
      </div>
      <div class="form-group">
        <label for="usuarioCorreo">Correo:</label>
        <input type="email" id="usuarioCorreo" value="${isEdit ? usuario.correo : ""}" required>
      </div>
      <div class="form-group">
        <label for="usuarioContrasena">Contraseña:</label>
        <input type="password" id="usuarioContrasena" ${!isEdit ? "required" : ""}>
        ${isEdit ? "<small>Dejar vacío para mantener la contraseña actual</small>" : ""}
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" id="usuarioAdmin" ${isEdit && usuario.es_admin ? "checked" : ""}>
          Administrador
        </label>
      </div>
      <div class="form-buttons">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"}</button>
      </div>
    </form>
  `
  showModal(title, content)

  document.getElementById("usuarioForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    const data = {
      nombre: document.getElementById("usuarioNombre").value,
      correo: document.getElementById("usuarioCorreo").value,
      es_admin: document.getElementById("usuarioAdmin").checked,
    }

    const contrasena = document.getElementById("usuarioContrasena").value
    if (contrasena) data.contrasena = contrasena

    const endpoint = isEdit ? `/usuarios/${usuario.id}` : "/usuarios"
    const method = isEdit ? "PUT" : "POST"

    try {
      await apiRequest(endpoint, { method, body: JSON.stringify(data) })
      closeModal()
      loadUsuarios()
    } catch (error) {
      alert("Error: " + error.message)
    }
  })
}

function showRuletaTemaForm(tema = null) {
  const isEdit = !!tema
  const title = isEdit ? "Editar Tema" : "Agregar Tema"

  const content = `
    <form id="ruletaTemaForm">
      <div class="form-group">
        <label for="temaNombre">Nombre:</label>
        <input type="text" id="temaNombre" value="${isEdit ? tema.nombre : ""}" required>
      </div>
      <div class="form-group">
        <label for="temaColor">Color:</label>
        <input type="color" id="temaColor" value="${isEdit ? tema.color : "#3498db"}" required>
      </div>
      ${
        isEdit
          ? `
      <div class="form-group">
        <label>
          <input type="checkbox" id="temaActivo" ${tema.activo ? "checked" : ""}>
          Activo
        </label>
      </div>
      `
          : ""
      }
      <div class="form-buttons">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"}</button>
      </div>
    </form>
  `
  showModal(title, content)

  document.getElementById("ruletaTemaForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    const data = {
      nombre: document.getElementById("temaNombre").value,
      color: document.getElementById("temaColor").value,
      activo: isEdit ? document.getElementById("temaActivo").checked : true,
    }

    const endpoint = isEdit ? `/ruleta/temas/${tema.id}` : "/ruleta/temas"
    const method = isEdit ? "PUT" : "POST"

    try {
      await apiRequest(endpoint, { method, body: JSON.stringify(data) })
      closeModal()
      loadRuletaTemas()
    } catch (error) {
      alert("Error: " + error.message)
    }
  })
}

function showRuletaPreguntaForm(pregunta = null) {
  const isEdit = !!pregunta
  const title = isEdit ? "Editar Pregunta de Ruleta" : "Agregar Pregunta de Ruleta"

  const temasOptions = currentData.ruletaTemas
    .map(
      (tema) =>
        `<option value="${tema.id}" ${isEdit && pregunta.tema_id == tema.id ? "selected" : ""}>${tema.nombre}</option>`,
    )
    .join("")

  const selectedPaises = isEdit && pregunta.paises_ids ? pregunta.paises_ids.split(",") : []

  const paisesOptions = currentData.paises
    .map(
      (pais) =>
        `<option value="${pais.id}" ${selectedPaises.includes(String(pais.id)) ? "selected" : ""}>${pais.nombre}</option>`,
    )
    .join("")

  const content = `
    <form id="ruletaPreguntaForm">
      <div class="form-group">
        <label for="preguntaTema">Tema:</label>
        <select id="preguntaTema" required>${temasOptions}</select>
      </div>
      <div class="form-group">
        <label for="preguntaPaisesRuleta">Países:</label>
        <select id="preguntaPaisesRuleta" multiple required style="height: 120px;">${paisesOptions}</select>
        <small>Mantén Ctrl/Cmd presionado para seleccionar múltiples países</small>
      </div>
      <div class="form-group">
        <label for="preguntaTextoRuleta">Pregunta:</label>
        <textarea id="preguntaTextoRuleta" required>${isEdit ? pregunta.pregunta : ""}</textarea>
      </div>
      <div class="form-group">
        <label for="respuestaCorrectaRuleta">Respuesta Correcta:</label>
        <input type="text" id="respuestaCorrectaRuleta" value="${isEdit ? pregunta.respuesta_correcta : ""}" required>
      </div>
      <div class="form-group">
        <label for="respuesta1Ruleta">Respuesta 1:</label>
        <input type="text" id="respuesta1Ruleta" value="${isEdit ? pregunta.respuesta_1 : ""}" required>
      </div>
      <div class="form-group">
        <label for="respuesta2Ruleta">Respuesta 2:</label>
        <input type="text" id="respuesta2Ruleta" value="${isEdit ? pregunta.respuesta_2 : ""}" required>
      </div>
      <div class="form-group">
        <label for="respuesta3Ruleta">Respuesta 3:</label>
        <input type="text" id="respuesta3Ruleta" value="${isEdit ? pregunta.respuesta_3 : ""}" required>
      </div>
      ${
        isEdit
          ? `
      <div class="form-group">
        <label>
          <input type="checkbox" id="preguntaActiva" ${pregunta.activa ? "checked" : ""}>
          Activa
        </label>
      </div>
      `
          : ""
      }
      <div class="form-buttons">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"}</button>
      </div>
    </form>
  `
  showModal(title, content)

  document.getElementById("ruletaPreguntaForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    const selectedOptions = document.getElementById("preguntaPaisesRuleta").selectedOptions
    const paisesSeleccionados = Array.from(selectedOptions).map((opt) => opt.value)

    const data = {
      tema_id: document.getElementById("preguntaTema").value,
      pregunta: document.getElementById("preguntaTextoRuleta").value,
      respuesta_correcta: document.getElementById("respuestaCorrectaRuleta").value,
      respuesta_1: document.getElementById("respuesta1Ruleta").value,
      respuesta_2: document.getElementById("respuesta2Ruleta").value,
      respuesta_3: document.getElementById("respuesta3Ruleta").value,
      activa: isEdit ? document.getElementById("preguntaActiva").checked : true,
      paises_ids: paisesSeleccionados,
    }

    const endpoint = isEdit ? `/ruleta/preguntas/${pregunta.id}` : "/ruleta/preguntas"
    const method = isEdit ? "PUT" : "POST"

    try {
      await apiRequest(endpoint, { method, body: JSON.stringify(data) })
      closeModal()
      loadRuletaPreguntas()
    } catch (error) {
      alert("Error: " + error.message)
    }
  })
}

// --- RULETA FUNCTIONS ---
async function loadRuletaTemas() {
  currentData.ruletaTemas = await apiRequest("/ruleta/temas")
  const tbody = document.querySelector("#ruletaTemasTable tbody")
  tbody.innerHTML = currentData.ruletaTemas
    .map(
      (tema) => `
    <tr>
      <td>${tema.id}</td>
      <td>${tema.nombre}</td>
      <td><span class="color-badge" style="background-color: ${tema.color};">${tema.color}</span></td>
      <td>${tema.activo ? "Activo" : "Inactivo"}</td>
      <td class="admin-only">
        <button class="btn btn-warning btn-small" onclick="editRuletaTema(${tema.id})">Editar</button>
        <button class="btn btn-danger btn-small" onclick="deleteRuletaTema(${tema.id})">Eliminar</button>
      </td>
    </tr>
  `,
    )
    .join("")
}

async function loadRuletaPreguntas() {
  currentData.ruletaPreguntas = await apiRequest("/ruleta/preguntas")
  renderRuletaPreguntasTable(currentData.ruletaPreguntas)
}

function renderRuletaPreguntasTable(preguntas) {
  const tbody = document.querySelector("#ruletaPreguntasTable tbody")
  tbody.innerHTML = preguntas
    .map(
      (p) => `
    <tr>
      <td>${p.id}</td>
      <td><span class="color-badge" style="background-color: ${p.tema_color};">${p.tema_nombre}</span></td>
      <td>${p.paises_nombres || "Sin países"}</td>
      <td>${p.pregunta.substring(0, 50)}...</td>
      <td>${p.respuesta_correcta}</td>
      <td>${p.activa ? "Activa" : "Inactiva"}</td>
      <td class="admin-only">
        <button class="btn btn-warning btn-small" onclick="editRuletaPregunta(${p.id})">Editar</button>
        <button class="btn btn-danger btn-small" onclick="deleteRuletaPregunta(${p.id})">Eliminar</button>
      </td>
    </tr>
  `,
    )
    .join("")
}

function loadTemasForFilter() {
  const select = document.getElementById("temaFilterRuleta")
  select.innerHTML = '<option value="">Todos los temas</option>'
  currentData.ruletaTemas.forEach((tema) => {
    select.innerHTML += `<option value="${tema.id}">${tema.nombre}</option>`
  })
}

// --- OBJECT MANAGEMENT FUNCTIONALITY ---
async function manageObjects(escenarioId, escenarioName) {
  try {
    const objetos = await apiRequest(`/escenarios/${escenarioId}/objetos`)

    const content = `
      <div class="objects-manager">
        <h4>Objetos del Escenario: ${escenarioName}</h4>
        <button class="btn btn-primary btn-small" onclick="showAddObjectForm(${escenarioId})">Agregar Objeto</button>
        <div class="objects-list">
          ${objetos
            .map(
              (obj) => `
            <div class="object-item">
              <img src="${obj.imagen_objetivo}" style="max-width: 50px; max-height: 50px;">
              <span>Orden: ${obj.orden}</span>
              <button class="btn btn-warning btn-small" onclick="editObject(${obj.id})">Editar</button>
              <button class="btn btn-danger btn-small" onclick="deleteObject(${obj.id})">Eliminar</button>
              <button class="btn btn-info btn-small" onclick="editObjectColliders(${obj.id}, ${escenarioId})">Colliders</button>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `

    showModal("Gestión de Objetos", content)
  } catch (error) {
    alert("Error: " + error.message)
  }
}

function showAddObjectForm(escenarioId) {
  const content = `
    <form id="addObjectForm" onsubmit="addObjectToScenario(event, ${escenarioId})">
      <div class="form-group">
        <label for="objectImage">Imagen del Objeto:</label>
        <input type="file" id="objectImage" accept="image/*" required>
      </div>
      <div class="form-group">
        <label for="objectOrder">Orden:</label>
        <input type="number" id="objectOrder" min="1" required>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Agregar Objeto</button>
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      </div>
    </form>
  `

  showModal("Agregar Objeto", content)
}

// --- ADD OBJECT FUNCTIONALITY ---
async function addObjectToScenario(event, escenarioId) {
  event.preventDefault()

  const imageInput = document.getElementById("objectImage")
  const orderInput = document.getElementById("objectOrder")

  if (!imageInput || !orderInput) {
    alert("Error: No se encontraron los campos del formulario")
    return
  }

  if (!imageInput.files || !imageInput.files[0]) {
    alert("Error: Por favor selecciona una imagen")
    return
  }

  const formData = new FormData()
  formData.append("escenario_id", escenarioId)
  formData.append("imagen_objetivo", imageInput.files[0])
  formData.append("orden", orderInput.value)

  try {
    const response = await fetch(`${API_BASE}/escenarios/${escenarioId}/objetos`, {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData,
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)

    closeModal()
    const escenarios = await apiRequest("/escenarios")
    const escenario = escenarios.find((e) => e.id === escenarioId)
    manageObjects(escenarioId, escenario ? escenario.imagen_fondo : "Escenario")
  } catch (error) {
    alert("Error: " + error.message)
  }
}

// --- EDIT FUNCTIONS ---
async function editPregunta(id) {
  const pregunta = currentData.preguntas.find((p) => p.id === id)
  if (pregunta) showPreguntaForm(pregunta)
}

async function editEscenario(id) {
  const escenario = currentData.escenarios.find((e) => e.id === id)
  if (escenario) showEscenarioForm(escenario)
}

async function editSprite(id) {
  const sprite = currentData.sprites.find((s) => s.id === id)
  if (sprite) showSpriteForm(sprite)
}

async function editPais(id) {
  const pais = currentData.paises.find((p) => p.id === id)
  if (pais) showPaisForm(pais)
}

async function editUsuario(id) {
  const usuario = currentData.usuarios.find((u) => u.id === id)
  if (usuario) showUsuarioForm(usuario)
}

async function editRuletaTema(id) {
  const tema = currentData.ruletaTemas.find((t) => t.id === id)
  if (tema) showRuletaTemaForm(tema)
}

async function editRuletaPregunta(id) {
  const pregunta = currentData.ruletaPreguntas.find((p) => p.id === id)
  if (pregunta) showRuletaPreguntaForm(pregunta)
}

// --- DELETE FUNCTIONS ---
async function deletePregunta(id) {
  if (confirm("¿Estás seguro de que quieres eliminar esta pregunta?")) {
    try {
      await apiRequest(`/preguntas/${id}`, { method: "DELETE" })
      loadPreguntas()
    } catch (error) {
      alert("Error: " + error.message)
    }
  }
}

async function deleteEscenario(id) {
  if (confirm("¿Estás seguro de que quieres eliminar este escenario?")) {
    try {
      await apiRequest(`/escenarios/${id}`, { method: "DELETE" })
      loadEscenarios()
    } catch (error) {
      alert("Error: " + error.message)
    }
  }
}

async function deleteSprite(id) {
  if (confirm("¿Estás seguro de que quieres eliminar este sprite?")) {
    try {
      await apiRequest(`/sprites/${id}`, { method: "DELETE" })
      loadSprites()
    } catch (error) {
      alert("Error: " + error.message)
    }
  }
}

async function deletePais(id) {
  if (confirm("¿Estás seguro de que quieres eliminar este país?")) {
    try {
      await apiRequest(`/paises/${id}`, { method: "DELETE" })
      loadPaises()
    } catch (error) {
      alert("Error: " + error.message)
    }
  }
}

async function deleteUsuario(id) {
  if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
    try {
      await apiRequest(`/usuarios/${id}`, { method: "DELETE" })
      loadUsuarios()
    } catch (error) {
      alert("Error: " + error.message)
    }
  }
}

async function deleteRuletaTema(id) {
  if (confirm("¿Estás seguro de que quieres eliminar este tema?")) {
    try {
      await apiRequest(`/ruleta/temas/${id}`, { method: "DELETE" })
      loadRuletaTemas()
    } catch (error) {
      alert("Error: " + error.message)
    }
  }
}

async function deleteRuletaPregunta(id) {
  if (confirm("¿Estás seguro de que quieres eliminar esta pregunta?")) {
    try {
      await apiRequest(`/ruleta/preguntas/${id}`, { method: "DELETE" })
      loadRuletaPreguntas()
    } catch (error) {
      alert("Error: " + error.message)
    }
  }
}

// --- COLLIDER EDITOR FUNCTIONALITY ---
async function editObjectColliders(objetoId, escenarioId) {
  try {
    // Get scenario info for background image
    const escenarios = await apiRequest("/escenarios")
    const escenario = escenarios.find((e) => e.id === escenarioId)

    if (!escenario) {
      alert("Error: No se pudo encontrar el escenario")
      return
    }

    // Get existing colliders
    const colliders = await apiRequest(`/objetos/${objetoId}/colliders`)

    const content = `
      <div class="collider-editor">
        <h3>Editor de Colliders</h3>
        <div class="editor-instructions">
          <p><strong>Instrucciones:</strong></p>
          <p>• Haz clic en la imagen para marcar los puntos del área clickeable</p>
          <p>• Necesitas al menos 3 puntos para formar un polígono</p>
          <p>• Los puntos se conectarán automáticamente para formar el área de detección</p>
        </div>
        
        <div class="image-container" style="position: relative; display: inline-block;">
          <img id="colliderImage" src="${escenario.imagen_fondo}" style="max-width: 100%; height: auto; cursor: crosshair;">
          <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
            <polygon id="colliderPolygon" points="" fill="rgba(255, 0, 0, 0.3)" stroke="red" stroke-width="2"></polygon>
          </svg>
        </div>
        
        <div class="editor-controls" style="margin-top: 15px;">
          <span class="point-counter">Puntos: <span id="pointCount">0</span></span>
          <button type="button" id="undoPoint" class="btn btn-warning" disabled>Deshacer</button>
          <button type="button" id="clearPoints" class="btn btn-danger" disabled>Limpiar</button>
          <button type="button" id="saveColliders" class="btn btn-success" disabled>Guardar</button>
          <button type="button" class="btn btn-secondary" onclick="manageObjects(${escenarioId}, 'Escenario')">Volver</button>
        </div>
      </div>
    `

    showModal(`Colliders`, content)

    // Initialize collider editor
    initializeColliderEditor(objetoId, colliders, escenarioId)
  } catch (error) {
    alert("Error al cargar editor de colliders: " + error.message)
  }
}

function initializeColliderEditor(objetoId, existingColliders, escenarioId) {
  let points = []
  const image = document.getElementById("colliderImage")
  const polygon = document.getElementById("colliderPolygon")
  const pointCountSpan = document.getElementById("pointCount")
  const undoBtn = document.getElementById("undoPoint")
  const clearBtn = document.getElementById("clearPoints")
  const saveBtn = document.getElementById("saveColliders")

  if (existingColliders && existingColliders.length > 0) {
    // Sort colliders by index to maintain proper order
    const sortedColliders = existingColliders.sort((a, b) => a.indice - b.indice)
    points = sortedColliders.map((c) => ({
      x: c.punto_x,
      y: c.punto_y,
      indice: c.indice,
    }))

    // Wait for image to load before updating display
    if (image.complete) {
      updateDisplay()
    } else {
      image.addEventListener("load", () => {
        updateDisplay()
      })
    }
  }

  // Image click handler
  image.addEventListener("click", (e) => {
    const rect = image.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    points.push({ x, y, indice: points.length })
    updateDisplay()
  })

  // Button handlers
  undoBtn.addEventListener("click", () => {
    if (points.length > 0) {
      points.pop()
      updateDisplay()
    }
  })

  clearBtn.addEventListener("click", () => {
    points = []
    updateDisplay()
  })

  saveBtn.addEventListener("click", async () => {
    try {
      const pointsData = points.map((point, index) => ({
        punto_x: point.x,
        punto_y: point.y,
        indice: index, // Use array index to ensure proper ordering
      }))

      await apiRequest(`/objetos/${objetoId}/colliders/batch`, {
        method: "POST",
        body: JSON.stringify({ points: pointsData }),
      })

      alert("Colliders guardados exitosamente!")
      manageObjects(escenarioId, "Escenario")
    } catch (error) {
      alert("Error al guardar colliders: " + error.message)
    }
  })

  function updateDisplay() {
    // Update point count
    pointCountSpan.textContent = points.length

    // Update button states
    const hasPoints = points.length > 0
    const canSave = points.length >= 3

    undoBtn.disabled = !hasPoints
    clearBtn.disabled = !hasPoints
    saveBtn.disabled = !canSave

    // Update polygon
    if (points.length >= 2) {
      const rect = image.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        const pointsStr = points
          .map((point) => {
            const x = (point.x / 100) * rect.width
            const y = (point.y / 100) * rect.height
            return `${x},${y}`
          })
          .join(" ")

        polygon.setAttribute("points", pointsStr)
      }
    } else {
      polygon.setAttribute("points", "")
    }

    // Update visual points
    const container = image.parentElement
    container.querySelectorAll(".collider-point").forEach((p) => p.remove())

    points.forEach((point) => {
      const pointEl = document.createElement("div")
      pointEl.className = "collider-point"
      pointEl.style.position = "absolute"
      pointEl.style.left = `${point.x}%`
      pointEl.style.top = `${point.y}%`
      pointEl.style.width = "8px"
      pointEl.style.height = "8px"
      pointEl.style.backgroundColor = "red"
      pointEl.style.borderRadius = "50%"
      pointEl.style.transform = "translate(-50%, -50%)"
      pointEl.style.pointerEvents = "none"
      pointEl.style.zIndex = "1000"
      container.appendChild(pointEl)
    })
  }
}

// --- OBJECT EDIT FUNCTIONS ---
async function editObject(id) {
  try {
    const objeto = await apiRequest(`/objetos/${id}`)
    if (objeto) showObjectForm(objeto)
  } catch (error) {
    console.error("Error loading object:", error)
    alert("Error al cargar el objeto")
  }
}

function showObjectForm(objeto = null) {
  const isEdit = objeto !== null
  const title = isEdit ? "Editar Objeto" : "Agregar Objeto"

  const content = `
    <form id="objectForm">
      <div class="form-group">
        <label for="objectImage">Imagen del Objeto:</label>
        <input type="file" id="objectImage" accept="image/*" ${!isEdit ? "required" : ""}>
        ${isEdit ? `<p>Imagen actual: <img src="${objeto.imagen_objetivo}" style="max-width: 100px; max-height: 100px;"></p>` : ""}
      </div>
      <div class="form-group">
        <label for="objectOrder">Orden:</label>
        <input type="number" id="objectOrder" value="${isEdit ? objeto.orden : ""}" required min="1">
      </div>
      <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Agregar"} Objeto</button>
    </form>
  `

  showModal(title, content)

  document.getElementById("objectForm").onsubmit = async (e) => {
    e.preventDefault()

    if (isEdit) {
      await updateObject(objeto.id)
    } else {
      // This would be called from showAddObjectForm with escenarioId
      console.error("showObjectForm called without escenarioId for new object")
    }
  }
}

async function updateObject(objectId) {
  const imageFile = document.getElementById("objectImage").files[0]
  const orden = document.getElementById("objectOrder").value

  if (!orden) {
    alert("Por favor complete todos los campos requeridos")
    return
  }

  try {
    let response

    if (imageFile) {
      // If there's a new image, use FormData for file upload
      const formData = new FormData()
      formData.append("imagen_objetivo", imageFile)
      formData.append("orden", orden)

      response = await fetch(`${API_BASE}/objetos/${objectId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      })
    } else {
      // If no new image, get current object data and send JSON
      const currentObject = await apiRequest(`/objetos/${objectId}`)
      response = await fetch(`${API_BASE}/objetos/${objectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          imagen_objetivo: currentObject.imagen_objetivo,
          orden: Number.parseInt(orden),
        }),
      })
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || "Error en la petición")
    }

    alert("Objeto actualizado exitosamente")
    closeModal()
    // Refresh the current view if we're in objects management
    if (currentView === "escenarios") {
      loadEscenarios()
    }
  } catch (error) {
    console.error("Error updating object:", error)
    alert("Error al actualizar el objeto: " + error.message)
  }
}

async function deleteObject(objectId) {
  if (!confirm("¿Estás seguro de que quieres eliminar este objeto?")) {
    return
  }

  try {
    await apiRequest(`/objetos/${objectId}`, {
      method: "DELETE",
    })

    alert("Objeto eliminado exitosamente")
    // Refresh the current view
    if (currentView === "escenarios") {
      loadEscenarios()
    }
  } catch (error) {
    console.error("Error deleting object:", error)
    alert("Error al eliminar el objeto")
  }
}

function filterRuletaPreguntas() {
  const paisFilter = document.getElementById("paisFilterRuleta").value
  const temaFilter = document.getElementById("temaFilterRuleta").value

  let filtered = currentData.ruletaPreguntas

  if (paisFilter && paisFilter !== "todos") {
    filtered = filtered.filter((pregunta) => {
      if (!pregunta.paises_ids) return false
      const paisesArray = pregunta.paises_ids.split(",")
      return paisesArray.includes(paisFilter)
    })
  }

  if (temaFilter && temaFilter !== "todos") {
    filtered = filtered.filter((pregunta) => pregunta.tema_id == temaFilter)
  }

  renderRuletaPreguntasTable(filtered)
}
