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

  // Filters
  document.getElementById("paisFilter").addEventListener("change", filterPreguntas)
  document.getElementById("paisFilterEscenarios").addEventListener("change", filterEscenarios)
  document.getElementById("paisFilterSprites").addEventListener("change", filterSprites)

  // Modal close
  document.querySelector(".close").addEventListener("click", closeModal)
  document.getElementById("modal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modal")) {
      closeModal()
    }
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

// Navigation functions
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
    currentData.escenarios = escenarios
    renderEscenariosTable(escenarios)
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
            <div class="form-group">
                <label for="imagenObjetivo">Imagen Objetivo:</label>
                <input type="file" id="imagenObjetivo" accept="image/*" ${!isEdit ? "required" : ""}>
                ${isEdit ? `<p class="current-image">Imagen actual: ${escenario.imagen_objetivo}</p>` : ""}
            </div>
            <div class="form-buttons">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"}</button>
            </div>
        </form>
        
        ${
          !isEdit
            ? `
        <div id="colliderSection" style="display: none; margin-top: 20px; padding: 20px; border: 2px solid #007bff; border-radius: 8px; background-color: #f8f9fa;">
            <h3>Crear Collider para el Escenario</h3>
            <p style="background-color: #fff3cd; padding: 10px; border-radius: 4px; margin: 10px 0;">
                <strong>Instrucciones:</strong> Haz clic en la imagen para marcar los puntos del área clickeable. Necesitas al menos 3 puntos para formar un polígono.
            </p>
            
            <div id="colliderImageContainer" style="position: relative; display: inline-block; border: 2px solid #ddd; margin: 10px 0;">
                <img id="colliderImage" style="max-width: 100%; height: auto; display: block;">
                <svg id="colliderPolygon" style="position: absolute; top: 0; left: 0; pointer-events: none;">
                    <polygon id="polygon" fill="rgba(255, 0, 0, 0.3)" stroke="red" stroke-width="2" points=""/>
                </svg>
            </div>
            
            <div class="collider-controls" style="margin: 15px 0;">
                <p>Puntos marcados: <span id="pointCount">0</span></p>
                <button type="button" id="undoPoint" class="btn btn-warning" disabled>Deshacer último punto</button>
                <button type="button" id="clearPoints" class="btn btn-danger" disabled>Limpiar todo</button>
                <button type="button" id="submitCollider" class="btn btn-success" disabled>Crear Collider</button>
            </div>
        </div>
        `
            : ""
        }
    `

  showModal(title, content)

  // Variables for manejar colliders en escenarios nuevos
  let colliderPoints = []
  let currentEscenarioId = null

  document.getElementById("escenarioForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    try {
      const data = {
        pais_id: document.getElementById("escenarioPais").value,
      }

      // Subir imagen si se seleccionó
      const imagenFondoFile = document.getElementById("imagenFondo").files[0]
      if (imagenFondoFile) {
        data.imagen_fondo = await uploadImage(imagenFondoFile)
      } else if (isEdit) {
        data.imagen_fondo = escenario.imagen_fondo
      }

      const imagenObjetivoFile = document.getElementById("imagenObjetivo").files[0]
      if (imagenObjetivoFile) {
        data.imagen_objetivo = await uploadImage(imagenObjetivoFile)
      } else if (isEdit) {
        data.imagen_objetivo = escenario.imagen_objetivo
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

        currentEscenarioId = response.id

        document.getElementById("colliderSection").style.display = "block"
        const colliderImage = document.getElementById("colliderImage")
        colliderImage.src = data.imagen_fondo

        setupColliderEvents()

        // Ocultar el formulario de escenario
        document.getElementById("escenarioForm").style.display = "none"
      }
    } catch (error) {
      alert("Error: " + error.message)
    }
  })

  function setupColliderEvents() {
    const colliderImage = document.getElementById("colliderImage")
    const undoButton = document.getElementById("undoPoint")
    const clearButton = document.getElementById("clearPoints")
    const submitButton = document.getElementById("submitCollider")

    colliderImage.addEventListener("click", (e) => {
      const rect = colliderImage.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      colliderPoints.push({ x, y, indice: colliderPoints.length })

      // Crear punto visual
      const point = document.createElement("div")
      point.className = "collider-point"
      point.style.cssText = `
        position: absolute;
        left: ${x}%;
        top: ${y}%;
        width: 8px;
        height: 8px;
        background-color: red;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
      `
      document.getElementById("colliderImageContainer").appendChild(point)

      updatePolygonDisplay()
      updateControls()
    })

    undoButton.addEventListener("click", () => {
      if (colliderPoints.length > 0) {
        colliderPoints.pop()
        const points = document.querySelectorAll(".collider-point")
        if (points.length > 0) {
          points[points.length - 1].remove()
        }
        updatePolygonDisplay()
        updateControls()
      }
    })

    clearButton.addEventListener("click", () => {
      colliderPoints = []
      document.querySelectorAll(".collider-point").forEach((point) => point.remove())
      updatePolygonDisplay()
      updateControls()
    })

    submitButton.addEventListener("click", async () => {
      try {
        const pointsData = colliderPoints.map((point) => ({
          punto_x: point.x,
          punto_y: point.y,
          indice: point.indice,
        }))

        await apiRequest("/colliders/batch", {
          method: "POST",
          body: JSON.stringify({
            escenario_id: currentEscenarioId,
            points: pointsData,
          }),
        })

        alert("Collider creado exitosamente!")
        closeModal()
        loadEscenarios()
      } catch (error) {
        alert("Error al crear collider: " + error.message)
      }
    })
  }

  function updatePolygonDisplay() {
    const polygon = document.getElementById("polygon")
    const colliderImage = document.getElementById("colliderImage")
    const svg = document.getElementById("colliderPolygon")

    if (colliderPoints.length >= 2) {
      const rect = colliderImage.getBoundingClientRect()
      svg.style.width = rect.width + "px"
      svg.style.height = rect.height + "px"

      const points = colliderPoints
        .map((point) => {
          const x = (point.x / 100) * rect.width
          const y = (point.y / 100) * rect.height
          return `${x},${y}`
        })
        .join(" ")

      polygon.setAttribute("points", points)
    } else {
      polygon.setAttribute("points", "")
    }

    document.getElementById("pointCount").textContent = colliderPoints.length
  }

  function updateControls() {
    const hasPoints = colliderPoints.length > 0
    const canSubmit = colliderPoints.length >= 3

    document.getElementById("undoPoint").disabled = !hasPoints
    document.getElementById("clearPoints").disabled = !hasPoints
    document.getElementById("submitCollider").disabled = !canSubmit
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
      <button type="submit">${isEdit ? "Actualizar" : "Crear"} Sprite</button>
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
                ${isEdit ? "<small>Dejar en blanco para mantener la contraseña actual</small>" : ""}
            </div>
            <div class="form-group">
                <div class="checkbox-group">
                    <input type="checkbox" id="usuarioAdmin" ${isEdit && usuario.es_admin ? "checked" : ""}>
                    <label for="usuarioAdmin">Es Administrador</label>
                </div>
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
    if (contrasena) {
      data.contrasena = contrasena
    }

    try {
      if (isEdit) {
        await apiRequest(`/usuarios/${usuario.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        })
      } else {
        await apiRequest("/usuarios", {
          method: "POST",
          body: JSON.stringify(data),
        })
      }

      closeModal()
      loadUsuarios()
    } catch (error) {
      alert("Error: " + error.message)
    }
  })
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
      "¿Estás seguro de que quieres eliminar este escenario? Esto también eliminará todos los sprites relacionados.",
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

function showNotification(message, type) {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    document.body.removeChild(notification)
  }, 3000)
}
