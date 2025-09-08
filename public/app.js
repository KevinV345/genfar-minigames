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

// Feather icon library
const feather = window.feather

// API Base URL
const API_BASE = "/api"

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()

  // Mobile menu toggle functionality
  const mobileMenuToggle = document.getElementById("mobileMenuToggle")
  const sidebar = document.getElementById("sidebar")
  let sidebarOverlay = null

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
      toggleSidebar()
    })
  }

  function toggleSidebar() {
    const isOpen = sidebar.classList.contains("open")

    if (isOpen) {
      closeSidebar()
    } else {
      openSidebar()
    }
  }

  function openSidebar() {
    sidebar.classList.add("open")

    // Create overlay
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

  // Close sidebar when clicking on nav items (mobile)
  document.querySelectorAll(".nav-item[data-tab]").forEach((item) => {
    item.addEventListener("click", () => {
      if (window.innerWidth <= 1024) {
        closeSidebar()
      }
    })
  })
})

function initializeApp() {
  // Check for existing token
  authToken = localStorage.getItem("authToken")
  if (authToken) {
    // Verify token and load user data
    verifyToken()
  } else {
    showLogin()
  }

  setupEventListeners()
}

function setupEventListeners() {
  // Login form
  document.getElementById("loginForm").addEventListener("submit", handleLogin)

  // Logout button
  document.getElementById("logoutBtn").addEventListener("click", handleLogout)

  document.querySelectorAll(".nav-item[data-tab]").forEach((item) => {
    item.addEventListener("click", (e) => switchTab(e.target.closest(".nav-item").dataset.tab))
  })

  // Add buttons
  document.getElementById("addPaisBtn").addEventListener("click", () => showPaisForm())
  document.getElementById("addPreguntaBtn").addEventListener("click", () => showPreguntaForm())
  document.getElementById("addEscenarioBtn").addEventListener("click", () => showEscenarioForm())
  document.getElementById("addSpriteBtn").addEventListener("click", () => showSpriteForm())
  document.getElementById("addUsuarioBtn").addEventListener("click", () => showUsuarioForm())

  document.getElementById("addRuletaTemaBtn").addEventListener("click", () => showRuletaTemaForm())
  document.getElementById("addRuletaPreguntaBtn").addEventListener("click", () => showRuletaPreguntaForm())

  // Filters
  document.getElementById("paisFilter").addEventListener("change", filterPreguntas)
  document.getElementById("paisFilterEscenarios").addEventListener("change", filterEscenarios)
  document.getElementById("paisFilterSprites").addEventListener("change", filterSprites)

  // Modal close
  document.querySelector(".close").addEventListener("click", closeModal)
  document.getElementById("modal").addEventListener("click", (e) => {
    if (e.target.id === "modal") closeModal()
  })
}

// Authentication functions
async function handleLogin(e) {
  e.preventDefault()

  const correo = document.getElementById("correo").value
  const contrasena = document.getElementById("contrasena").value
  const errorDiv = document.getElementById("loginError")

  console.log("Attempting login with:", { correo, contrasena: "***" })

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo, contrasena }),
    })

    console.log("Response status:", response.status)

    const data = await response.json()
    console.log("Response data:", data)

    if (response.ok) {
      authToken = data.token
      currentUser = data.user
      localStorage.setItem("authToken", authToken)
      showApp()
    } else {
      errorDiv.textContent = data.error || "Error de autenticación"
      errorDiv.style.display = "block"
      console.error("Login failed:", data.error)
    }
  } catch (error) {
    console.error("Network error:", error)
    errorDiv.textContent = "Error de conexión"
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
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      currentUser = data.user
      console.log("Token verified, user:", currentUser)
      showApp()
    } else {
      // Token is invalid
      console.log("Token invalid, removing from storage")
      localStorage.removeItem("authToken")
      authToken = null
      currentUser = null
      showLogin()
    }
  } catch (error) {
    console.error("Error verifying token:", error)
    localStorage.removeItem("authToken")
    authToken = null
    currentUser = null
    showLogin()
  }
}

function showLogin() {
  document.getElementById("loginContainer").style.display = "block"
  document.getElementById("appContainer").style.display = "none"
  document.body.classList.remove("admin")
}

function showApp() {
  console.log("showApp called, currentUser:", currentUser)
  document.getElementById("loginContainer").style.display = "none"
  document.getElementById("appContainer").style.display = "block"

  // Only show admin class for user management features
  if (currentUser && currentUser.es_admin) {
    console.log("Admin class added to body")
    document.body.classList.add("admin")
  } else {
    console.log("Admin class removed from body")
    document.body.classList.remove("admin")
  }

  // Load initial data
  loadPaises()
  loadPreguntas()
  loadEscenarios()
  loadSprites()
  if (currentUser && currentUser.es_admin) {
    loadUsuarios()
    loadLogs()
  }
}

function switchTab(tabName) {
  // Hide all sections
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active")
  })

  // Remove active class from all nav items
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active")
  })

  // Show selected section
  document.getElementById(`${tabName}Section`).classList.add("active")

  // Add active class to selected nav item
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")

  setTimeout(() => {
    feather.replace()
  }, 100)

  // Load data for the selected tab if needed
  switch (tabName) {
    case "paises":
      loadPaises()
      break
    case "preguntas":
      loadPreguntas()
      loadPaisesForFilter()
      break
    case "escenarios":
      loadEscenarios()
      loadPaisesForFilter()
      break
    case "sprites":
      loadSprites()
      loadPaisesForFilter()
      break
    case "ruleta-temas":
      loadRuletaTemas()
      break
    case "ruleta-preguntas":
      loadRuletaPreguntas()
      loadTemasForFilter()
      break
    case "usuarios":
      if (currentUser && currentUser.es_admin) {
        loadUsuarios()
      }
      break
    case "logs":
      if (currentUser && currentUser.es_admin) {
        loadLogs()
      }
      break
  }
}

// API helper function
async function apiRequest(endpoint, options = {}) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    ...options,
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || "Error en la petición")
  }

  return response.json()
}

// Data loading functions
async function loadPaises() {
  try {
    const paises = await apiRequest("/paises")
    currentData.paises = paises
    renderPaisesTable(paises)
  } catch (error) {
    console.error("Error loading paises:", error)
  }
}

async function loadPreguntas() {
  try {
    const preguntas = await apiRequest("/preguntas")
    currentData.preguntas = preguntas
    renderPreguntasTable(preguntas)
  } catch (error) {
    console.error("Error loading preguntas:", error)
  }
}

async function loadEscenarios() {
  try {
    const escenarios = await apiRequest("/escenarios")
    const tbody = document.querySelector("#escenariosTable tbody")

    // Get objects count for each scenario
    const escenariosWithObjects = await Promise.all(
      escenarios.map(async (escenario) => {
        try {
          const objetos = await apiRequest(`/escenarios/${escenario.id}/objetos`)
          return { ...escenario, objetosCount: objetos.length }
        } catch (error) {
          return { ...escenario, objetosCount: 0 }
        }
      }),
    )
    currentData.escenarios = escenarios
    tbody.innerHTML = escenariosWithObjects
      .map(
        (escenario) => `
        <tr>
            <td>${escenario.id}</td>
            <td>${escenario.pais_nombre || "Sin país"}</td>
            <td><img src="${escenario.imagen_fondo}" alt="Fondo" style="width: 50px; height: 50px; object-fit: cover;"></td>
            <td>
                <span class="badge">${escenario.objetosCount} objeto(s)</span>
                <button class="btn btn-small btn-primary" onclick="manageObjects(${escenario.id}, '${escenario.pais_nombre || "Sin país"}')">
                    Gestionar Objetos
                </button>
            </td>
            <td>
                <button class="btn btn-small btn-warning" onclick="editEscenario(${escenario.id})">Editar</button>
                <button class="btn btn-small btn-danger admin-only" onclick="deleteEscenario(${escenario.id})">Eliminar</button>
            </td>
        </tr>
    `,
      )
      .join("")
  } catch (error) {
    console.error("Error loading escenarios:", error)
  }
}

async function loadSprites() {
  try {
    const sprites = await apiRequest("/sprites")
    currentData.sprites = sprites
    displaySprites(sprites)
  } catch (error) {
    console.error("Error loading sprites:", error)
  }
}

async function loadUsuarios() {
  try {
    const usuarios = await apiRequest("/usuarios")
    currentData.usuarios = usuarios
    renderUsuariosTable(usuarios)
  } catch (error) {
    console.error("Error loading usuarios:", error)
  }
}

async function loadLogs() {
  try {
    const logs = await apiRequest("/logs")
    currentData.logs = logs
    renderLogsTable(logs)
  } catch (error) {
    console.error("Error loading logs:", error)
  }
}

async function loadRuletaTemas() {
  try {
    const temas = await apiRequest("/ruleta/temas")
    currentData.ruletaTemas = temas
    renderRuletaTemasTable(temas)
  } catch (error) {
    console.error("Error loading ruleta temas:", error)
  }
}

async function loadRuletaPreguntas() {
  try {
    const preguntas = await apiRequest("/ruleta/preguntas")
    currentData.ruletaPreguntas = preguntas
    renderRuletaPreguntasTable(preguntas)
  } catch (error) {
    console.error("Error loading ruleta preguntas:", error)
  }
}

async function loadTemasForFilter() {
  if (!currentData.ruletaTemas) {
    await loadRuletaTemas()
  }

  const temaFilter = document.getElementById("temaFilterRuleta")
  if (temaFilter) {
    temaFilter.innerHTML = '<option value="">Todos los temas</option>'
    currentData.ruletaTemas.forEach((tema) => {
      const option = document.createElement("option")
      option.value = tema.id
      option.textContent = tema.nombre
      temaFilter.appendChild(option)
    })

    temaFilter.addEventListener("change", (e) => {
      filterRuletaPreguntasByTema(e.target.value)
    })
  }
}

function filterRuletaPreguntasByTema(temaId) {
  let filteredPreguntas = currentData.ruletaPreguntas || []

  if (temaId) {
    filteredPreguntas = filteredPreguntas.filter((p) => p.tema_id == temaId)
  }

  renderRuletaPreguntasTable(filteredPreguntas)
}

// Filter functions
async function loadPaisesForFilter() {
  if (!currentData.paises) {
    await loadPaises()
  }

  const select = document.getElementById("paisFilter")
  select.innerHTML = '<option value="">Todos los países</option>'

  const selectEscenarios = document.getElementById("paisFilterEscenarios")
  selectEscenarios.innerHTML = '<option value="">Todos los países</option>'

  const selectSprites = document.getElementById("paisFilterSprites")
  selectSprites.innerHTML = '<option value="">Todos los países</option>'

  currentData.paises.forEach((pais) => {
    const option = document.createElement("option")
    option.value = pais.id
    option.textContent = pais.nombre
    select.appendChild(option)

    const optionEscenarios = option.cloneNode(true)
    selectEscenarios.appendChild(optionEscenarios)

    const optionSprites = option.cloneNode(true)
    selectSprites.appendChild(optionSprites)
  })
}

function filterPreguntas() {
  const paisId = document.getElementById("paisFilter").value
  let filteredPreguntas = currentData.preguntas || []

  if (paisId) {
    filteredPreguntas = filteredPreguntas.filter((p) => p.pais_id == paisId)
  }

  renderPreguntasTable(filteredPreguntas)
}

function filterEscenarios() {
  const paisId = document.getElementById("paisFilterEscenarios").value
  let filteredEscenarios = currentData.escenarios || []

  if (paisId) {
    filteredEscenarios = filteredEscenarios.filter((e) => e.pais_id == paisId)
  }

  renderEscenariosTable(filteredEscenarios)
}

function filterSprites() {
  const paisId = document.getElementById("paisFilterSprites").value
  let filteredSprites = currentData.sprites || []

  if (paisId) {
    filteredSprites = filteredSprites.filter((s) => s.pais_id == paisId)
  }

  displaySprites(filteredSprites)
}

// Render functions
function renderPaisesTable(paises) {
  const tbody = document.querySelector("#paisesTable tbody")
  tbody.innerHTML = ""

  paises.forEach((pais) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${pais.id}</td>
            <td>${pais.nombre}</td>
            <td>
                <button class="btn btn-warning btn-small" onclick="editPais(${pais.id})">Editar</button>
                <button class="btn btn-danger btn-small" onclick="deletePais(${pais.id})">Eliminar</button>
            </td>
        `
    tbody.appendChild(row)
  })
}

function renderPreguntasTable(preguntas) {
  const tbody = document.querySelector("#preguntasTable tbody")
  tbody.innerHTML = ""

  preguntas.forEach((pregunta) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${pregunta.id}</td>
            <td>${pregunta.pais_nombre || "N/A"}</td>
            <td>${pregunta.pregunta}</td>
            <td>${pregunta.respuesta_correcta}</td>
            <td>
                <button class="btn btn-warning btn-small" onclick="editPregunta(${pregunta.id})">Editar</button>
                <button class="btn btn-danger btn-small" onclick="deletePregunta(${pregunta.id})">Eliminar</button>
            </td>
        `
    tbody.appendChild(row)
  })
}

function renderEscenariosTable(scenarios) {
  const tbody = document.querySelector("#escenariosTable tbody")
  tbody.innerHTML = ""

  scenarios.forEach((escenario) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${escenario.id}</td>
            <td>${escenario.pais_nombre || "N/A"}</td>
            <td><img src="${escenario.imagen_fondo}" alt="Fondo" style="width: 50px; height: 30px; object-fit: cover;"></td>
            <td><img src="${escenario.imagen_objetivo}" alt="Objetivo" style="width: 50px; height: 30px; object-fit: cover;"></td>
            <td>
                <button class="btn btn-warning btn-small" onclick="editEscenario(${escenario.id})">Editar</button>
                <button class="btn btn-danger btn-small" onclick="deleteEscenario(${escenario.id})">Eliminar</button>
            </td>
        `
    tbody.appendChild(row)
  })
}

function displaySprites(sprites) {
  const tbody = document.querySelector("#spritesTable tbody")
  tbody.innerHTML = ""

  sprites.forEach((sprite) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${sprite.id}</td>
      <td>${sprite.pais_nombre}</td>
      <td>${sprite.tipo}</td>
      <td>
        ${sprite.imagen_url ? `<img src="${sprite.imagen_url}" alt="Sprite" style="max-width: 50px; max-height: 50px;">` : "Sin imagen"}
      </td>
      <td>
        <button onclick="showSpriteForm(${JSON.stringify(sprite).replace(/"/g, "&quot;")})" class="btn btn-edit">Editar</button>
        <button onclick="deleteSprite(${sprite.id})" class="btn btn-delete">Eliminar</button>
      </td>
    `
    tbody.appendChild(row)
  })
}

function renderUsuariosTable(usuarios) {
  const tbody = document.querySelector("#usuariosTable tbody")
  tbody.innerHTML = ""

  usuarios.forEach((usuario) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.nombre}</td>
            <td>${usuario.correo}</td>
            <td>${usuario.es_admin ? "Sí" : "No"}</td>
            <td>
                <button class="btn btn-warning btn-small" onclick="editUsuario(${usuario.id})">Editar</button>
                <button class="btn btn-danger btn-small" onclick="deleteUsuario(${usuario.id})">Eliminar</button>
            </td>
        `
    tbody.appendChild(row)
  })
}

function renderLogsTable(logs) {
  const tbody = document.querySelector("#logsTable tbody")
  tbody.innerHTML = ""

  logs.forEach((log) => {
    const row = document.createElement("tr")
    const fechaUTC = new Date(log.fecha).toLocaleString("es-ES", { timeZone: "UTC" }) + " UTC"
    row.innerHTML = `
            <td>${log.id}</td>
            <td>${fechaUTC}</td>
            <td>${log.accion}</td>
            <td>${log.detalle || "N/A"}</td>
        `
    tbody.appendChild(row)
  })
}

function renderRuletaTemasTable(temas) {
  const tbody = document.querySelector("#ruletaTemasTable tbody")
  tbody.innerHTML = ""

  temas.forEach((tema) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${tema.id}</td>
      <td>${tema.nombre}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 20px; height: 20px; background-color: ${tema.color}; border-radius: 4px; border: 1px solid #ccc;"></div>
          <span>${tema.color}</span>
        </div>
      </td>
      <td>
        <span class="badge ${tema.activo ? "badge-success" : "badge-danger"}">
          ${tema.activo ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td>
        <button class="btn btn-warning btn-small" onclick="editRuletaTema(${tema.id})">Editar</button>
        <button class="btn btn-danger btn-small admin-only" onclick="deleteRuletaTema(${tema.id})">Eliminar</button>
      </td>
    `
    tbody.appendChild(row)
  })
}

function renderRuletaPreguntasTable(preguntas) {
  const tbody = document.querySelector("#ruletaPreguntasTable tbody")
  tbody.innerHTML = ""

  preguntas.forEach((pregunta) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${pregunta.id}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 16px; height: 16px; background-color: ${pregunta.tema_color || "#ccc"}; border-radius: 50%;"></div>
          <span>${pregunta.tema_nombre || "N/A"}</span>
        </div>
      </td>
      <td>${pregunta.pregunta}</td>
      <td>${pregunta.respuesta_correcta}</td>
      <td>
        <span class="badge ${pregunta.activa ? "badge-success" : "badge-danger"}">
          ${pregunta.activa ? "Activa" : "Inactiva"}
        </span>
      </td>
      <td>
        <button class="btn btn-warning btn-small" onclick="editRuletaPregunta(${pregunta.id})">Editar</button>
        <button class="btn btn-danger btn-small admin-only" onclick="deleteRuletaPregunta(${pregunta.id})">Eliminar</button>
      </td>
    `
    tbody.appendChild(row)
  })
}

// Modal functions
function showModal(title, content) {
  document.getElementById("modalBody").innerHTML = `
        <h3>${title}</h3>
        ${content}
    `
  document.getElementById("modal").style.display = "block"
}

function closeModal() {
  document.getElementById("modal").style.display = "none"
}

// Form functions
function showPaisForm(pais = null) {
  const isEdit = pais !== null
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
    const nombre = document.getElementById("paisNombre").value

    try {
      if (isEdit) {
        await apiRequest(`/paises/${pais.id}`, {
          method: "PUT",
          body: JSON.stringify({ nombre }),
        })
      } else {
        await apiRequest("/paises", {
          method: "POST",
          body: JSON.stringify({ nombre }),
        })
      }

      closeModal()
      loadPaises()
    } catch (error) {
      alert("Error: " + error.message)
    }
  })
}

function showPreguntaForm(pregunta = null) {
  const isEdit = pregunta !== null
  const title = isEdit ? "Editar Pregunta" : "Agregar Pregunta"

  // Generate paises options
  let paisesOptions = '<option value="">Seleccionar país</option>'
  if (currentData.paises) {
    currentData.paises.forEach((pais) => {
      const selected = isEdit && pregunta.pais_id === pais.id ? "selected" : ""
      paisesOptions += `<option value="${pais.id}" ${selected}>${pais.nombre}</option>`
    })
  }

  const content = `
        <form id="preguntaForm">
            <div class="form-group">
                <label for="preguntaPais">País:</label>
                <select id="preguntaPais" required>
                    ${paisesOptions}
                </select>
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

    const data = {
      pais_id: document.getElementById("preguntaPais").value,
      pregunta: document.getElementById("preguntaTexto").value,
      respuesta_correcta: document.getElementById("respuestaCorrecta").value,
      respuesta_1: document.getElementById("respuesta1").value,
      respuesta_2: document.getElementById("respuesta2").value,
      respuesta_3: document.getElementById("respuesta3").value,
    }

    try {
      if (isEdit) {
        await apiRequest(`/preguntas/${pregunta.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        })
      } else {
        await apiRequest("/preguntas", {
          method: "POST",
          body: JSON.stringify(data),
        })
      }

      closeModal()
      loadPreguntas()
    } catch (error) {
      alert("Error: " + error.message)
    }
  })
}

async function uploadImage(file) {
  const formData = new FormData()
  formData.append("image", file)

  try {
    if (!authToken) {
      throw new Error("No hay token de autenticación")
    }

    console.log("Uploading image with token:", authToken.substring(0, 20) + "...")

    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Upload failed:", response.status, errorData)
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    console.log("Image uploaded successfully:", result.url)
    return result.url
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

async function showEscenarioForm(escenario = null) {
  const isEdit = !!escenario
  const title = isEdit ? "Editar Escenario" : "Crear Escenario"

  const paises = await apiRequest("/paises")
  const paisesOptions = paises
    .map(
      (pais) =>
        `<option value="${pais.id}" ${isEdit && escenario.pais_id === pais.id ? "selected" : ""}>${pais.nombre}</option>`,
    )
    .join("")

  const content = `
        <form id="escenarioForm">
            <div class="form-group">
                <label for="escenarioPais">País:</label>
                <select id="escenarioPais" required>
                    ${paisesOptions}
                </select>
            </div>
            <div class="form-group">
                <label for="imagenFondo">Imagen de Fondo:</label>
                <input type="file" id="imagenFondo" accept="image/*" ${!isEdit ? "required" : ""}>
                ${isEdit ? `<p class="current-image">Imagen actual: ${escenario.imagen_fondo}</p>` : ""}
            </div>
            <div class="form-buttons">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"}</button>
            </div>
        </form>
        
        ${
          !isEdit
            ? `
        <div id="nextStepInfo" style="display: none; margin-top: 20px; padding: 20px; border: 2px solid #28a745; border-radius: 8px; background-color: #d4edda;">
            <h4>¡Escenario creado exitosamente!</h4>
            <p>Ahora puedes agregar objetos a buscar en este escenario.</p>
            <button type="button" id="manageObjectsBtn" class="btn btn-success">Gestionar Objetos</button>
        </div>
        `
            : ""
        }
    `

  showModal(title, content)

  let createdEscenarioId = null

  document.getElementById("escenarioForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    try {
      const data = {
        pais_id: document.getElementById("escenarioPais").value,
      }

      // Upload background image if selected
      const imagenFondoFile = document.getElementById("imagenFondo").files[0]
      if (imagenFondoFile) {
        data.imagen_fondo = await uploadImage(imagenFondoFile)
      } else if (isEdit) {
        data.imagen_fondo = escenario.imagen_fondo
      }

      if (isEdit) {
        await apiRequest(`/escenarios/${escenario.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        })
        closeModal()
        loadEscenarios()
      } else {
        const response = await apiRequest("/escenarios", {
          method: "POST",
          body: JSON.stringify(data),
        })
        loadEscenarios()

        createdEscenarioId = response.id

        // Show next step info
        document.getElementById("escenarioForm").style.display = "none"
        document.getElementById("nextStepInfo").style.display = "block"

        document.getElementById("manageObjectsBtn").addEventListener("click", () => {
          closeModal()
          const paisName = document.getElementById("escenarioPais").selectedOptions[0].text
          manageObjects(createdEscenarioId, paisName)
        })
      }
    } catch (error) {
      alert("Error: " + error.message)
    }
  })
}

async function manageObjects(escenarioId, paisName) {
  try {
    const objetos = await apiRequest(`/escenarios/${escenarioId}/objetos`)

    const content = `
      <div class="objects-manager">
        <div class="section-header">
          <h3>Objetos para Escenario de ${paisName}</h3>
          <button id="addObjectBtn" class="btn btn-primary">Agregar Objeto</button>
        </div>
        
        <div id="objectsList">
          ${
            objetos.length === 0
              ? '<p style="text-align: center; color: #666; padding: 20px;">No hay objetos agregados aún.</p>'
              : objetos
                  .map(
                    (objeto) => `
              <div class="object-item" style="border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin: 12px 0; background: #f9f9f9;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 16px;">
                    <img src="${objeto.imagen_objetivo}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                    <div>
                      <p style="margin: 4px 0; color: #666; font-size: 14px;">Orden: ${objeto.orden}</p>
                    </div>
                  </div>
                  <div>
                    <button class="btn btn-small btn-success" onclick="editObjectColliders(${objeto.id}, ${escenarioId})">
                      Colliders
                    </button>
                    <button class="btn btn-small btn-warning" onclick="editObject(${objeto.id}, ${escenarioId})">
                      Editar
                    </button>
                    <button class="btn btn-small btn-danger" onclick="deleteObject(${objeto.id}, ${escenarioId})">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            `,
                  )
                  .join("")
          }
        </div>
      </div>
    `

    showModal(`Gestión de Objetos - ${paisName}`, content)

    document.getElementById("addObjectBtn").addEventListener("click", () => {
      showObjectForm(escenarioId)
    })
  } catch (error) {
    alert("Error al cargar objetos: " + error.message)
  }
}

async function showObjectForm(escenarioId, objeto = null) {
  const isEdit = !!objeto
  const title = isEdit ? "Editar Objeto" : "Agregar Objeto"

  const content = `
    <form id="objectForm">
      <div class="form-group">
        <label for="objectImage">Imagen del Objeto:</label>
        <input type="file" id="objectImage" accept="image/*" ${!isEdit ? "required" : ""}>
        ${isEdit ? `<p class="current-image">Imagen actual: ${objeto.imagen_objetivo}</p>` : ""}
      </div>
      <div class="form-group">
        <label for="objectOrder">Orden de Búsqueda:</label>
        <input type="number" id="objectOrder" min="1" value="${isEdit ? objeto.orden : 1}" required>
        <small style="color: #666;">El orden en que el jugador debe encontrar este objeto</small>
      </div>
      <div class="form-buttons">
        <button type="button" class="btn btn-secondary" onclick="manageObjects(${escenarioId}, 'Escenario')">Volver</button>
        <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"} Objeto</button>
      </div>
    </form>
  `

  showModal(title, content)

  document.getElementById("objectForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    try {
      const data = {
        orden: Number.parseInt(document.getElementById("objectOrder").value),
      }

      const imageFile = document.getElementById("objectImage").files[0]
      if (imageFile) {
        data.imagen_objetivo = await uploadImage(imageFile)
      } else if (isEdit) {
        data.imagen_objetivo = objeto.imagen_objetivo
      }

      if (isEdit) {
        await apiRequest(`/objetos/${objeto.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        })
      } else {
        await apiRequest(`/escenarios/${escenarioId}/objetos`, {
          method: "POST",
          body: JSON.stringify(data),
        })
      }

      // Refresh the objects list
      manageObjects(escenarioId, "Escenario")
    } catch (error) {
      alert("Error: " + error.message)
    }
  })
}

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
        
        <div class="image-container">
          <img id="colliderImage" src="${escenario.imagen_fondo}" class="scenario-image">
          <svg class="collider-polygon">
            <polygon id="colliderPolygon" points=""></polygon>
          </svg>
        </div>
        
        <div class="editor-controls">
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
      pointEl.style.left = `${point.x}%`
      pointEl.style.top = `${point.y}%`
      container.appendChild(pointEl)
    })
  }
}

async function editObject(objetoId, escenarioId) {
  try {
    const objetos = await apiRequest(`/escenarios/${escenarioId}/objetos`)
    const objeto = objetos.find((o) => o.id === objetoId)

    if (objeto) {
      showObjectForm(escenarioId, objeto)
    }
  } catch (error) {
    alert("Error al cargar objeto: " + error.message)
  }
}

async function deleteObject(objetoId, escenarioId) {
  if (confirm("¿Estás seguro de que quieres eliminar este objeto? También se eliminarán sus colliders.")) {
    try {
      await apiRequest(`/objetos/${objetoId}`, { method: "DELETE" })
      manageObjects(escenarioId, "Escenario")
    } catch (error) {
      alert("Error al eliminar objeto: " + error.message)
    }
  }
}

function showSpriteForm(sprite = null) {
  const isEdit = sprite !== null
  const modalBody = document.getElementById("modalBody")

  modalBody.innerHTML = `
    <h3>${isEdit ? "Editar" : "Agregar"} Sprite</h3>
    <form id="spriteForm" enctype="multipart/form-data">
      <div class="form-group">
        <label for="spritePaisId">País:</label>
        <select id="spritePaisId" required>
          <option value="">Seleccionar país</option>
        </select>
      </div>
      <div class="form-group">
        <label for="spriteTipo">Tipo:</label>
        <select id="spriteTipo" required>
          <option value="">Seleccionar tipo</option>
          <option value="medicamento">Medicamento</option>
          <option value="bacteria">Bacteria</option>
        </select>
      </div>
      <div class="form-group">
        <label for="spriteImagen">Subir imagen:</label>
        <input type="file" id="spriteImagen" accept="image/*" ${!isEdit ? "required" : ""}>
      </div>
      <div class="form-buttons">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"} Sprite</button>
      </div>
    </form>
  `

  loadPaisesForSelect("spritePaisId")

  if (isEdit) {
    document.getElementById("spritePaisId").value = sprite.pais_id
    document.getElementById("spriteTipo").value = sprite.tipo
  }

  document.getElementById("spriteForm").addEventListener("submit", (e) => {
    e.preventDefault()

    const paisId = document.getElementById("spritePaisId").value
    const tipo = document.getElementById("spriteTipo").value
    const fileInput = document.getElementById("spriteImagen")

    if (!paisId || !tipo) {
      showNotification("Por favor completa todos los campos requeridos", "error")
      return
    }

    if (!isEdit && !fileInput.files[0]) {
      showNotification("Por favor selecciona una imagen", "error")
      return
    }

    const formData = new FormData()
    formData.append("pais_id", paisId)
    formData.append("tipo", tipo)

    if (fileInput.files[0]) {
      formData.append("imagen", fileInput.files[0])
    }

    const url = isEdit ? `/api/sprites/${sprite.id}` : "/api/sprites"
    const method = isEdit ? "PUT" : "POST"

    fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          closeModal()
          loadSprites()
          showNotification(`Sprite ${isEdit ? "actualizado" : "creado"} exitosamente`, "success")
        } else {
          showNotification(data.error || "Error al procesar sprite", "error")
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        showNotification("Error al procesar sprite", "error")
      })
  })

  document.getElementById("modal").style.display = "block"
}

function showUsuarioForm(usuario = null) {
  const isEdit = usuario !== null
  const modalBody = document.getElementById("modalBody")

  modalBody.innerHTML = `
    <h3>${isEdit ? "Editar" : "Agregar"} Usuario</h3>
    <form id="usuarioForm">
      <div class="form-group">
        <label for="usuarioNombre">Nombre:</label>
        <input type="text" id="usuarioNombre" required value="${isEdit ? usuario.nombre : ""}">
      </div>
      <div class="form-group">
        <label for="usuarioCorreo">Correo:</label>
        <input type="email" id="usuarioCorreo" required value="${isEdit ? usuario.correo : ""}">
      </div>
      <div class="form-group">
        <label for="usuarioAdmin">Admin:</label>
        <input type="checkbox" id="usuarioAdmin" ${isEdit && usuario.es_admin ? "checked" : ""}>
      </div>
      <div class="form-buttons">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"} Usuario</button>
      </div>
    </form>
  `

  document.getElementById("usuarioForm").addEventListener("submit", (e) => {
    e.preventDefault()

    const nombre = document.getElementById("usuarioNombre").value
    const correo = document.getElementById("usuarioCorreo").value
    const esAdmin = document.getElementById("usuarioAdmin").checked

    const formData = new FormData()
    formData.append("nombre", nombre)
    formData.append("correo", correo)
    formData.append("es_admin", esAdmin)

    const url = isEdit ? `/api/usuarios/${usuario.id}` : "/api/usuarios"
    const method = isEdit ? "PUT" : "POST"

    fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          closeModal()
          loadUsuarios()
          showNotification(`Usuario ${isEdit ? "actualizado" : "creado"} exitosamente`, "success")
        } else {
          showNotification(data.error || "Error al procesar usuario", "error")
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        showNotification("Error al procesar usuario", "error")
      })
  })

  document.getElementById("modal").style.display = "block"
}

// Edit functions
async function editPais(id) {
  const pais = currentData.paises.find((p) => p.id === id)
  if (pais) {
    showPaisForm(pais)
  }
}

async function editPregunta(id) {
  const pregunta = currentData.preguntas.find((p) => p.id === id)
  if (pregunta) {
    showPreguntaForm(pregunta)
  }
}

async function editEscenario(id) {
  console.log(currentData)

  const escenario = currentData.escenarios.find((e) => e.id === id)
  if (escenario) {
    showEscenarioForm(escenario)
  }
}

async function editSprite(id) {
  const sprite = currentData.sprites.find((s) => s.id === id)
  if (sprite) {
    showSpriteForm(sprite)
  }
}

async function editUsuario(id) {
  const usuario = currentData.usuarios.find((u) => u.id === id)
  if (usuario) {
    showUsuarioForm(usuario)
  }
}

async function editRuletaTema(id) {
  const tema = currentData.ruletaTemas.find((t) => t.id === id)
  if (tema) {
    showRuletaTemaForm(tema)
  }
}

async function editRuletaPregunta(id) {
  const pregunta = currentData.ruletaPreguntas.find((p) => p.id === id)
  if (pregunta) {
    showRuletaPreguntaForm(pregunta)
  }
}

// Delete functions
async function deletePais(id) {
  if (
    confirm("¿Estás seguro de que quieres eliminar este país? Esto también eliminará todos los datos relacionados.")
  ) {
    try {
      await apiRequest(`/paises/${id}`, { method: "DELETE" })
      loadPaises()
    } catch (error) {
      alert("Error: " + error.message)
    }
  }
}

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
  if (
    confirm(
      "¿Estás seguro de que quieres eliminar este escenario? Esto también eliminará todos los objetos y colliders relacionados.",
    )
  ) {
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
  if (
    confirm("¿Estás seguro de que quieres eliminar este tema? Esto también eliminará todas las preguntas asociadas.")
  ) {
    try {
      await apiRequest(`/ruleta/temas/${id}`, { method: "DELETE" })
      loadRuletaTemas()
      showSuccessMessage("Tema eliminado correctamente")
    } catch (error) {
      showErrorMessage("Error al eliminar el tema: " + error.message)
    }
  }
}

function loadPaisesForSelect(selectId) {
  const select = document.getElementById(selectId)
  select.innerHTML = '<option value="">Seleccionar país</option>'

  currentData.paises.forEach((pais) => {
    const option = document.createElement("option")
    option.value = pais.id
    option.textContent = pais.nombre
    select.appendChild(option)
  })
}

function showRuletaTemaForm(tema = null) {
  const isEdit = tema !== null
  const title = isEdit ? "Editar Tema de Ruleta" : "Agregar Tema de Ruleta"

  const content = `
    <form id="ruletaTemaForm">
      <div class="form-group">
        <label for="temaNombre">Nombre del Tema:</label>
        <input type="text" id="temaNombre" value="${isEdit ? tema.nombre : ""}" required>
      </div>
      <div class="form-group">
        <label for="temaColor">Color:</label>
        <input type="color" id="temaColor" value="${isEdit ? tema.color : "#000000"}" required>
      </div>
      <div class="form-group">
        <label for="temaActivo">Activo:</label>
        <input type="checkbox" id="temaActivo" ${isEdit && tema.activo ? "checked" : ""}>
      </div>
      <div class="form-buttons">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"} Tema</button>
      </div>
    </form>
  `

  showModal(title, content)

  document.getElementById("ruletaTemaForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    const data = {
      nombre: document.getElementById("temaNombre").value,
      color: document.getElementById("temaColor").value,
      activo: document.getElementById("temaActivo").checked,
    }

    try {
      if (isEdit) {
        await apiRequest(`/ruleta/temas/${tema.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        })
      } else {
        await apiRequest("/ruleta/temas", {
          method: "POST",
          body: JSON.stringify(data),
        })
      }

      closeModal()
      loadRuletaTemas()
    } catch (error) {
      alert("Error: " + error.message)
    }
  })
}

function showRuletaPreguntaForm(pregunta = null) {
  const isEdit = pregunta !== null
  const title = isEdit ? "Editar Pregunta de Ruleta" : "Agregar Pregunta de Ruleta"

  const temasOptions = currentData.ruletaTemas
    ? currentData.ruletaTemas
        .map(
          (tema) =>
            `<option value="${tema.id}" ${isEdit && pregunta.tema_id === tema.id ? "selected" : ""}>${tema.nombre}</option>`,
        )
        .join("")
    : '<option value="">Seleccionar tema</option>'

  const content = `
    <form id="ruletaPreguntaForm">
      <div class="form-group">
        <label for="preguntaTema">Tema:</label>
        <select id="preguntaTema" required>
          ${temasOptions}
        </select>
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
      <div class="form-buttons">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"} Pregunta</button>
      </div>
    </form>
  `

  showModal(title, content)

  document.getElementById("ruletaPreguntaForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    const data = {
      tema_id: document.getElementById("preguntaTema").value,
      pregunta: document.getElementById("preguntaTextoRuleta").value,
      respuesta_correcta: document.getElementById("respuestaCorrectaRuleta").value,
      respuesta_1: document.getElementById("respuesta1Ruleta").value,
      respuesta_2: document.getElementById("respuesta2Ruleta").value,
      respuesta_3: document.getElementById("respuesta3Ruleta").value,
    }

    try {
      if (isEdit) {
        await apiRequest(`/ruleta/preguntas/${pregunta.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        })
      } else {
        await apiRequest("/ruleta/preguntas", {
          method: "POST",
          body: JSON.stringify(data),
        })
      }

      closeModal()
      loadRuletaPreguntas()
    } catch (error) {
      alert("Error: " + error.message)
    }
  })
}

function showNotification(message, type) {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    document.body.removeChild(notification)
  }, 3000)
}

function showSuccessMessage(message) {
  showNotification(message, "success")
}

function showErrorMessage(message) {
  showNotification(message, "error")
}
