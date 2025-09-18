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
    item.addEventListener("click", (e) => switchTabFn(e.target.closest(".nav-item").dataset.tab))
  })

  document.getElementById("addPaisBtn")?.addEventListener("click", () => showPaisForm())
  document.getElementById("addPreguntaBtn")?.addEventListener("click", () => showPreguntaForm())
  document.getElementById("addEscenarioBtn")?.addEventListener("click", () => showEscenarioForm())
  document.getElementById("addSpriteBtn")?.addEventListener("click", () => showSpriteForm())
  document.getElementById("addUsuarioBtn")?.addEventListener("click", () => showUsuarioForm())
  document.getElementById("addRuletaTemaBtn")?.addEventListener("click", () => showRuletaTemaForm())
  document.getElementById("addRuletaPreguntaBtn")?.addEventListener("click", () => showRuletaPreguntaForm())
  document.getElementById("manageTerapiasBtn")?.addEventListener("click", () => showTerapiasSection())
  document.getElementById("addTerapiaBtn")?.addEventListener("click", () => showTerapiaForm())
  document.getElementById("backToSpritesBtn")?.addEventListener("click", () => hideTerapiasSection())

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
  switchTabFn("paises")
  feather.replace()
}

function switchTabFn(tabName) {
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
    "ruleta-preguntas": async () => {
      await loadRuletaTemas() // Agrega esta línea para cargar los temas primero.
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
async function apiRequest(endpoint, method = "GET", body = null, isFormData = false) {
  const config = {
    method,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  }

  if (body) {
    if (isFormData) {
      config.body = body
    } else {
      config.headers["Content-Type"] = "application/json"
      config.body = JSON.stringify(body)
    }
  }

  try {
    console.log("[v0] Making API request to:", `${API_BASE}${endpoint}`)
    console.log("[v0] Method:", method)
    console.log("[v0] Body:", isFormData ? "FormData" : body)

    const response = await fetch(`${API_BASE}${endpoint}`, config)

    if (!response.ok) {
      console.log("[v0] Response not OK:", response.status, response.statusText)
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("[v0] API request successful")
    return data
  } catch (error) {
    console.error("[v0] API request failed:", error)
    throw error
  }
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
        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
          <span class="badge ${pais.genfy_pregunta_visible ? "badge-success" : "badge-danger"}" title="Genfy Pregunta">GP</span>
          <span class="badge ${pais.genfy_encuentra_visible ? "badge-success" : "badge-danger"}" title="Genfy Encuentra">GE</span>
          <span class="badge ${pais.mision_genfy_visible ? "badge-success" : "badge-danger"}" title="Misión Genfy">MG</span>
          <span class="badge ${pais.ruleta_visible ? "badge-success" : "badge-danger"}" title="Ruleta">R</span>
        </div>
      </td>
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
  try {
    console.log("[v0] Loading scenarios...")
    currentData.escenarios = await apiRequest("/escenarios")
    console.log("[v0] Escenarios loaded:", currentData.escenarios.length)

    const escenariosConObjetos = await Promise.all(
      currentData.escenarios.map(async (esc) => {
        try {
          const objetos = await apiRequest(`/escenarios/${esc.id}/objetos`)
          return { ...esc, objetosCount: objetos.length }
        } catch (error) {
          console.error(`[v0] Error loading objects for scenario ${esc.id}:`, error)
          return { ...esc, objetosCount: 0 }
        }
      }),
    )
    renderEscenariosTable(escenariosConObjetos)
  } catch (error) {
    console.error("[v0] Error loading escenarios:", error)
    alert("Error al cargar escenarios: " + error.message)
  }
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
        <small>Tamaño máximo de archivo: 5 MB</small>
        ${isEdit ? `<p class="current-image">Imagen actual: <img src="${escenario.imagen_fondo}" style="max-width: 100px; max-height: 100px;"></p>` : ""}
      </div>
      <div class="form-buttons">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"}</button>
      </div>
    </form>
  `
  showModal(title, content)

  document.getElementById("escenarioForm").onsubmit = async (e) => {
    e.preventDefault()

    const selectedPaisesArray = Array.from(document.getElementById("escenarioPaises").selectedOptions).map(
      (option) => option.value,
    )
    const fileInput = document.getElementById("imagenFondo")

    try {
      let requestData
      let isFormData = false

      if (fileInput.files[0]) {
        // If there's a new file, use FormData
        const formData = new FormData()
        formData.append("paises_ids", JSON.stringify(selectedPaisesArray))
        formData.append("imagen", fileInput.files[0])
        requestData = formData
        isFormData = true
      } else {
        // If no new file, use JSON
        requestData = {
          paises_ids: selectedPaisesArray,
          imagen_fondo: isEdit ? escenario.imagen_fondo : null,
        }
      }

      if (isEdit) {
        await apiRequest(`/escenarios/${escenario.id}`, "PUT", requestData, isFormData)
      } else {
        await apiRequest("/escenarios", "POST", requestData, isFormData)
      }

      closeModal()
      await loadEscenarios()
      alert("Escenario " + (isEdit ? "actualizado" : "creado") + " exitosamente")
    } catch (error) {
      console.error("[v0] Error in escenario form:", error)
      alert("Error: " + error.message)
    }
  }
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
        ${esc.enlace ? `<a href="${esc.enlace}" target="_blank" class="btn btn-small btn-secondary">Ver Enlace</a>` : "<em>Sin enlace</em>"}
      </td>
      <td>
        <span class="badge">${esc.objetosCount || 0}</span>
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
              <button class="btn btn-danger btn-small" onclick="deleteObject(${obj.id}, ${escenarioId})">Eliminar</button>
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
        <small>Tamaño máximo de archivo: 5 MB</small>
      </div>
      <div class="form-group">
        <label for="objectUrl">Url:</label>
        <input type="url" id="objectUrl">
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
  const UrlInput = document.getElementById("objectUrl")

  if (!imageInput || !UrlInput) {
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
  formData.append("Url", UrlInput.value)

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
    if (escenario) {
      manageObjects(escenarioId, escenario.paises_nombres || "Escenario")
    }
  } catch (error) {
    alert("Error al agregar objeto: " + error.message)
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
        <label for="objectOrder">Url:</label>
        <input type="url" id="objectOrder" value="${isEdit ? objeto.Url : ""}" required>
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
  const Url = document.getElementById("objectOrder").value

  if (!Url) {
    alert("Por favor complete todos los campos requeridos")
    return
  }

  try {
    let response

    if (imageFile) {
      // If there's a new image, use FormData for file upload
      const formData = new FormData()
      formData.append("imagen_objetivo", imageFile)
      formData.append("Url", Url)

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
          Url,
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
async function deleteObject(objectId, escenarioId) {
  if (!confirm("¿Estás seguro de que quieres eliminar este objeto?")) {
    return
  }
  try {
    await apiRequest(`/objetos/${objectId}`, "DELETE")
    alert("Objeto eliminado exitosamente")
    await manageObjects(escenarioId, "Escenario") // Usa manageObjects para recarregar
  } catch (error) {
    console.error("Error al eliminar objeto:", error)
    alert("Error al eliminar el objeto")
  }
}

async function loadSprites() {
  currentData.sprites = await apiRequest("/sprites")
  
  
  renderSpritesTable(currentData.sprites)
}

async function loadTerapias() {
  try {
    currentData.terapias = await apiRequest("/terapias")
    renderTerapiasTable(currentData.terapias)
  } catch (error) {
    console.error("Error loading terapias:", error)
    currentData.terapias = []
  }
}

function showTerapiaForm() {
  const medicamentos = currentData.sprites.filter((s) => s.tipo === "medicamento")
  const bacterias = currentData.sprites.filter((s) => s.tipo === "bacteria")

  if (medicamentos.length === 0 || bacterias.length === 0) {
    alert("Necesitas tener al menos un medicamento y una bacteria para crear una asociación de terapia")
    return
  }

  const content = `
    <form id="terapiaForm">
      <div class="form-group">
        <label for="medicamentoSelect">Medicamento:</label>
        <select id="medicamentoSelect" required>
          <option value="">Seleccionar medicamento...</option>
        </select>
        <div id="medicamentoPreview" class="sprite-preview"></div>
      </div>
      <div class="form-group">
        <label for="bacteriaSelect">Bacteria:</label>
        <select id="bacteriaSelect" required>
          <option value="">Seleccionar bacteria...</option>
        </select>
        <div id="bacteriaPreview" class="sprite-preview"></div>
      </div>
      <div class="form-buttons">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Crear Asociación</button>
      </div>
    </form>
  `
  showModal("Agregar Asociación de Terapia", content)

  const medicamentoSelect = document.getElementById("medicamentoSelect")
  const bacteriaSelect = document.getElementById("bacteriaSelect")
  const medicamentoPreview = document.getElementById("medicamentoPreview")
  const bacteriaPreview = document.getElementById("bacteriaPreview")

  medicamentos.forEach((m) => {
    const option = document.createElement("option")
    option.value = m.id
    option.textContent = `${m.nombre || `ID: ${m.id}`} - Países: ${m.paises_nombres || "Sin asignar"}`
    option.dataset.imagen = m.imagen_url
    option.dataset.paises = m.paises_nombres || ""
    medicamentoSelect.appendChild(option)
  })

  function updateBacteriaOptions() {
    const selectedMedicamento = medicamentos.find((m) => m.id == medicamentoSelect.value)
    bacteriaSelect.innerHTML = '<option value="">Seleccionar bacteria...</option>'

    if (selectedMedicamento) {
      const medicamentoPaises = selectedMedicamento.paises_nombres || ""
      const compatibleBacterias = bacterias.filter((b) => {
        return 1
      })

      if (compatibleBacterias.length === 0) {
        const option = document.createElement("option")
        option.textContent = "No hay bacterias con los mismos países"
        option.disabled = true
        bacteriaSelect.appendChild(option)
      } else {
        compatibleBacterias.forEach((b) => {
          const option = document.createElement("option")
          option.value = b.id
          console.log(b);
          
          option.textContent = `${b.nombre_terapia}`
          option.dataset.imagen = b.imagen_url
          option.dataset.paises = b.paises_nombres || ""
          bacteriaSelect.appendChild(option)
        })
      }
    }
  }

  medicamentoSelect.addEventListener("change", (e) => {
    const selectedOption = e.target.selectedOptions[0]
    if (selectedOption && selectedOption.dataset.imagen) {
      medicamentoPreview.innerHTML = `
        <div class="sprite-card">
          <img class="sprite-thumbnail" src="${selectedOption.dataset.imagen}" alt="Medicamento" />
          <p><strong>Países:</strong> ${selectedOption.dataset.paises || "Sin asignar"}</p>
        </div>
      `
    } else {
      medicamentoPreview.innerHTML = ""
    }
    updateBacteriaOptions()
    bacteriaPreview.innerHTML = ""
  })

  bacteriaSelect.addEventListener("change", (e) => {
    const selectedOption = e.target.selectedOptions[0]
    if (selectedOption && selectedOption.dataset.imagen) {
      bacteriaPreview.innerHTML = `
        <div class="sprite-card">
          <img class="sprite-thumbnail" src="${selectedOption.dataset.imagen}" alt="Bacteria" />
        </div>
      `
    } else {
      bacteriaPreview.innerHTML = ""
    }
  })

  document.getElementById("terapiaForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    const medicamento_id = document.getElementById("medicamentoSelect").value
    const bacteria_id = document.getElementById("bacteriaSelect").value

    try {
      await apiRequest("/terapias", "POST", { medicamento_id, bacteria_id })
      closeModal()
      loadTerapias()
    } catch (error) {
      alert("Error: " + error.message)
    }
  })
}

async function deleteTerapia(id) {
  try {
    await apiRequest(`/terapias/${id}`, "DELETE")
    await loadTerapias()
    showMessage("Terapia eliminada exitosamente", "success")
  } catch (error) {
    showMessage(`Error al eliminar terapia: ${error.message}`, "error")
  }
}
function Asociar_terapia(id) {
  showTerapiasSection()
  showTerapiaForm()
  document.getElementById("medicamentoSelect").value=id
  document.getElementById("medicamentoSelect").dispatchEvent(new Event('change'));
}
function renderSpritesTable(sprites) {

  sprites=sprites.filter(e=>e.tipo!="bacteria")

  const tbody = document.querySelector("#spritesTable tbody")
  tbody.innerHTML = sprites
    .map(
      (s) => `
    <tr>
      <td>${s.id}</td>
      <td>${s.paises_nombres || "<em>Sin Asignar</em>"}</td>
      <td>${s.tipo}</td>
      <td><img src="${s.imagen_url}" alt="Sprite" style="max-width: 50px; max-height: 50px;"></td>
      <td>
        ${s.tipo === "medicamento" && s.enlace ? `<a href="${s.enlace}" target="_blank" class="btn btn-small btn-secondary">Ver Enlace</a>` : "<em>Sin enlace</em>"}
      </td>
      <td class="admin-only">
        <button class="btn btn-warning btn-small" onclick="editSprite(${s.id})">Editar</button>
        <button class="btn btn-warning btn-small" onclick="Asociar_terapia(${s.id})">Asociar terapia</button>
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
    filtered = filtered.filter((p) => {
      if (!p.paises_ids) return false
      const paisesArray = p.paises_ids.split(",")
      return paisesArray.includes(paisId)
    })
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
      await apiRequest(endpoint, method, data)
      closeModal()
      loadPreguntas()
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
        <select style="display:none;" id="spriteTipo" required onchange="toggleEnlaceField()">
          <option value="medicamento" ${isEdit && sprite.tipo === "medicamento" ? "selected" : ""}>Medicamento</option>
        </select>
      </div>
      <div class="form-group">
        <label for="spriteImagen">Imagen:</label>
        <input type="file" id="spriteImagen" accept="image/*" ${!isEdit ? "required" : ""}>
        <small>Tamaño máximo de archivo: 5 MB</small>
        ${isEdit ? `<p class="current-image">Imagen actual: <img src="${sprite.imagen_url}" style="max-width: 100px; max-height: 100px;"></p>` : ""}
      </div>
      <div class="form-group" id="enlaceGroup" style="display: ${isEdit && sprite.tipo === "medicamento" ? "block" : isEdit ? "none" : "block"};">
        <label for="spriteEnlace">Enlace</label>
        <input type="url" id="spriteEnlace" value="${isEdit ? sprite.enlace || "" : ""}" placeholder="https://ejemplo.com">
        <small>URL relacionada con este medicamento</small>
      </div>
      <div class="form-buttons">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"}</button>
      </div>
    </form>
  `
  showModal(title, content)

  // Add toggle function for enlace field
  window.toggleEnlaceField = () => {
    const tipo = document.getElementById("spriteTipo").value
    const enlaceGroup = document.getElementById("enlaceGroup")
    enlaceGroup.style.display = tipo === "medicamento" ? "block" : "none"
    if (tipo !== "medicamento") {
      document.getElementById("spriteEnlace").value = ""
    }
  }

  document.getElementById("spriteForm").onsubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    const selectedPaisesArray = Array.from(document.getElementById("spritePaises").selectedOptions).map(
      (option) => option.value,
    )

    formData.append("paises_ids", selectedPaisesArray.join(","))
    formData.append("tipo", document.getElementById("spriteTipo").value)

    const enlaceValue = document.getElementById("spriteEnlace").value
    if (document.getElementById("spriteTipo").value === "medicamento" && enlaceValue) {
      formData.append("enlace", enlaceValue)
    }

    const fileInput = document.getElementById("spriteImagen")
    if (fileInput.files[0]) {
      formData.append("imagen", fileInput.files[0])
    } else if (isEdit) {
      formData.append("imagen_url", sprite.imagen_url)
    }

    try {
      if (isEdit) {
        await apiRequest(`/sprites/${sprite.id}`, "PUT", formData, true)
      } else {
        await apiRequest("/sprites", "POST", formData, true)
      }
      closeModal()
      loadSprites()
    } catch (error) {
      alert("Error: " + error.message)
    }
  }
}

function showPaisForm(pais = null) {
  const isEdit = !!pais
  const title = isEdit ? "Editar País" : "Agregar País"

  const content = `
    <form id="paisForm">
      <div class="form-group">
        <label for="paisNombre">Nombre del País:</label>
        <input type="text" id="paisNombre" value="${isEdit ? pais.nombre : ""}" required>
      </div>
      
      <div class="form-group">
        <label>Visibilidad de Minijuegos:</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px;">
          <div class="checkbox-group">
            <input type="checkbox" id="genfyPreguntaVisible" ${isEdit ? (pais.genfy_pregunta_visible ? "checked" : "") : "checked"}>
            <label for="genfyPreguntaVisible">Genfy Pregunta</label>
          </div>
          <div class="checkbox-group">
            <input type="checkbox" id="genfyEncuentraVisible" ${isEdit ? (pais.genfy_encuentra_visible ? "checked" : "") : "checked"}>
            <label for="genfyEncuentraVisible">Genfy Encuentra</label>
          </div>
          <div class="checkbox-group">
            <input type="checkbox" id="misionGenfyVisible" ${isEdit ? (pais.mision_genfy_visible ? "checked" : "") : "checked"}>
            <label for="misionGenfyVisible">Misión Genfy</label>
          </div>
          <div class="checkbox-group">
            <input type="checkbox" id="ruletaVisible" ${isEdit ? (pais.ruleta_visible ? "checked" : "") : "checked"}>
            <label for="ruletaVisible">Ruleta</label>
          </div>
        </div>
      </div>
      
      <div class="form-buttons">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"}</button>
      </div>
    </form>
  `
  showModal(title, content)

  document.getElementById("paisForm").onsubmit = async (e) => {
    e.preventDefault()
    const formData = {
      nombre: document.getElementById("paisNombre").value,
      genfy_pregunta_visible: document.getElementById("genfyPreguntaVisible").checked,
      genfy_encuentra_visible: document.getElementById("genfyEncuentraVisible").checked,
      mision_genfy_visible: document.getElementById("misionGenfyVisible").checked,
      ruleta_visible: document.getElementById("ruletaVisible").checked,
    }

    try {
      if (isEdit) {
        await apiRequest(`/paises/${pais.id}`, "PUT", formData)
      } else {
        await apiRequest("/paises", "POST", formData)
      }

      closeModal()
      await loadPaises()
      alert("País " + (isEdit ? "actualizado" : "creado") + " exitosamente")
    } catch (error) {
      console.error("[v0] Error in pais form:", error)
      alert("Error: " + error.message)
    }
  }
}

async function editPais(id) {
  const pais = currentData.paises.find((p) => p.id === id)
  if (pais) {
    showPaisForm(pais)
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

// --- DELETE FUNCTIONS ---
async function deletePregunta(id) {
  if (confirm("¿Estás seguro de que quieres eliminar esta pregunta?")) {
    try {
      await apiRequest(`/preguntas/${id}`, "DELETE")
      loadPreguntas()
    } catch (error) {
      alert("Error: " + error.message)
    }
  }
}

async function deleteEscenario(id) {
  if (!confirm("¿Estás seguro de que quieres eliminar este escenario?")) {
    return
  }
  try {
    await apiRequest(`/escenarios/${id}`, "DELETE")
    alert("Escenario eliminado exitosamente")
    await loadEscenarios()
  } catch (error) {
    alert("Error al eliminar el escenario: " + error.message)
  }
}

async function deleteSprite(spriteId) {
  if (!confirm("¿Estás seguro de que quieres eliminar este sprite? Esto también eliminará las terapias asociadas.")) {
    return
  }
  try {
    // La llamada a apiRequest se hace con el método como un argumento separado
    await apiRequest(`/sprites/${spriteId}`, "DELETE")
    alert("Sprite eliminado exitosamente")
    loadSprites()
  } catch (error) {
    console.error("Error al eliminar sprite:", error)
    alert("Error al eliminar el sprite: " + error.message)
  }
}

async function deletePais(id) {
  if (confirm("¿Estás seguro de que quieres eliminar este país?")) {
    try {
      await apiRequest(`/paises/${id}`, "DELETE")
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

async function deleteRuletaTema(temaId) {
  try {
    await apiRequest(`/ruleta/temas/${temaId}`, "DELETE")
    alert("Tema eliminado exitosamente")
    loadRuletaTemas() // Recargar la lista de temas
  } catch (error) {
    console.error("Error al eliminar tema:", error)
    alert("Error al eliminar el tema: " + error.message)
  }
}
async function deleteRuletaPregunta(id) {
  if (confirm("¿Estás seguro de que quieres eliminar esta pregunta?")) {
    try {
      await apiRequest(`/ruleta/preguntas/${id}`, "DELETE")
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
        indice: index,
      }))

      // Corregido: Separar el método 'POST' y los datos en argumentos separados
      await apiRequest(`/objetos/${objetoId}/colliders/batch`, "POST", {
        points: pointsData,
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

function showTerapiasSection() {
  document.querySelector("#spritesSection .section-header").style.display = "none"
  document.querySelector("#spritesSection .filters").style.display = "none"
  document.querySelector("#spritesTable").parentElement.style.display = "none"
  document.querySelector("#terapiasSubsection").style.display = "block"
  loadTerapias()
}

function hideTerapiasSection() {
  document.querySelector("#spritesSection .section-header").style.display = "flex"
  document.querySelector("#spritesSection .filters").style.display = "block"
  document.querySelector("#spritesTable").parentElement.style.display = "block"
  document.querySelector("#terapiasSubsection").style.display = "none"
}

function renderTerapiasTable(terapias) {
  const tbody = document.querySelector("#terapiasTable tbody")
  tbody.innerHTML = ""

  terapias.forEach((terapia) => {
    const row = document.createElement("tr")
    const medicamentoName = terapia.medicamento_nombre || `ID: ${terapia.medicamento_id}`
    const bacteriaName = terapia.bacteria_nombre || `ID: ${terapia.bacteria_id}`

    row.innerHTML = `
      <td>${terapia.id}</td>
      <td>
        <div class="sprite-info">
          <img src="${terapia.medicamento_imagen}" alt="Medicamento" class="sprite-thumbnail" />
          <div>
            <strong>${medicamentoName}</strong><br>
            <small>Países: ${terapia.paises_medicamento || "Sin asignar"}</small>
          </div>
        </div>
      </td>
      <td>
        <div class="sprite-info">
          <img src="${terapia.bacteria_imagen}" alt="Bacteria" class="sprite-thumbnail" />
        </div>
      </td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteTerapia(${terapia.id})">Eliminar</button>
      </td>
    `
    tbody.appendChild(row)
  })
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Add event listeners here
  document.getElementById("addPaisBtn").onclick = () => showPaisForm()
  document.getElementById("addEscenarioBtn").onclick = () => showEscenarioForm()
  document.getElementById("addSpriteBtn").onclick = () => showSpriteForm()
})

// Additional functions for undeclared variables
function showUsuarioForm(usuario = null) {
  const isEdit = !!usuario
  const title = isEdit ? "Editar Usuario" : "Agregar Usuario"

  const content = `
    <form id="usuarioForm">
      <div class="form-group">
        <label for="usuarioNombre">Nombre del Usuario:</label>
        <input type="text" id="usuarioNombre" value="${isEdit ? usuario.nombre : ""}" required>
      </div>
      <div class="form-group">
        <label for="usuarioCorreo">Correo del Usuario:</label>
        <input type="email" id="usuarioCorreo" value="${isEdit ? usuario.correo : ""}" required>
      </div>
      <div class="form-group">
        <label for="usuarioAdmin">Es Administrador:</label>
        <input type="checkbox" id="usuarioAdmin" ${isEdit ? (usuario.es_admin ? "checked" : "") : ""}>
      </div>
      <div class="form-buttons">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"}</button>
      </div>
    </form>
  `
  showModal(title, content)

  document.getElementById("usuarioForm").onsubmit = async (e) => {
    e.preventDefault()
    const formData = {
      nombre: document.getElementById("usuarioNombre").value,
      correo: document.getElementById("usuarioCorreo").value,
      es_admin: document.getElementById("usuarioAdmin").checked,
    }

    try {
      if (isEdit) {
        await apiRequest(`/usuarios/${usuario.id}`, "PUT", formData)
      } else {
        await apiRequest("/usuarios", "POST", formData)
      }
      closeModal()
      loadUsuarios()
    } catch (error) {
      alert("Error: " + error.message)
    }
  }
}

async function loadRuletaTemas() {
  currentData.ruletaTemas = await apiRequest("/ruleta/temas")
  renderRuletaTemasTable(currentData.ruletaTemas)
}

function renderRuletaTemasTable(temas) {
  const tbody = document.querySelector("#ruletaTemasTable tbody")
  tbody.innerHTML = temas
    .map(
      (tema) => `
    <tr>
      <td>${tema.id}</td>
      <td>${tema.nombre}</td>
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
      <td>${p.paises_nombres || "<em>Sin Asignar</em>"}</td>
      <td>${p.pregunta.substring(0, 50)}...</td>
      <td>${p.respuesta_correcta}</td>
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

function editRuletaTema(id) {
  const tema = currentData.ruletaTemas?.find((t) => t.id === id)
  if (!tema) {
    alert("Tema no encontrado")
    return
  }
  showRuletaTemaForm(tema)
}

function editRuletaPregunta(id) {
  const pregunta = currentData.ruletaPreguntas?.find((p) => p.id === id)
  if (!pregunta) {
    alert("Pregunta no encontrada")
    return
  }
  showRuletaPreguntaForm(pregunta)
}

function showRuletaTemaForm(tema = null) {
  const isEdit = !!tema
  const title = isEdit ? "Editar Tema de Ruleta" : "Agregar Tema de Ruleta"

  const content = `
    <form id="ruletaTemaForm">
      <div class="form-group">
        <label for="temaNombre">Nombre del Tema:</label>
        <input type="text" id="temaNombre" value="${isEdit ? tema.nombre : ""}" required>
      </div>
      <div class="form-group">
        <label for="temaColor">Color:</label>
        <input type="color" id="temaColor" value="${isEdit ? tema.color : "#3498db"}" required>
      </div>
      <div class="form-group">
        <div class="checkbox-group">
          <input type="checkbox" id="temaActivo" ${isEdit ? (tema.activo ? "checked" : "") : "checked"}>
          <label for="temaActivo">Tema Activo</label>
        </div>
      </div>
      <div class="form-buttons">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"}</button>
      </div>
    </form>
  `

  showModal(title, content)

  document.getElementById("ruletaTemaForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    const nombre = document.getElementById("temaNombre").value
    const color = document.getElementById("temaColor").value
    const activo = document.getElementById("temaActivo").checked

    try {
      if (isEdit) {
        await apiRequest(`/ruleta/temas/${tema.id}`, "PUT", { nombre, color, activo })
      } else {
        await apiRequest("/ruleta/temas", "POST", { nombre, color, activo })
      }
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

  const paisesOptions = currentData.paises
    .map((pais) => {
      const isSelected = isEdit && pregunta.paises_ids && pregunta.paises_ids.split(",").includes(pais.id.toString())
      return `<option value="${pais.id}" ${isSelected ? "selected" : ""}>${pais.nombre}</option>`
    })
    .join("")

  const temasOptions = currentData.ruletaTemas
    .map((tema) => {
      const isSelected = isEdit && pregunta.tema_id === tema.id
      return `<option value="${tema.id}" ${isSelected ? "selected" : ""}>${tema.nombre}</option>`
    })
    .join("")

  const content = `
    <form id="ruletaPreguntaForm">
      <div class="form-group">
        <label for="preguntaTema">Tema:</label>
        <select id="preguntaTema" required>
          <option value="">Seleccionar tema...</option>
          ${temasOptions}
        </select>
      </div>
      <div class="form-group">
        <label for="preguntaPaises">Países:</label>
        <select id="preguntaPaises" multiple required>
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
        <label for="respuesta1">Respuesta Incorrecta 1:</label>
        <input type="text" id="respuesta1" value="${isEdit ? pregunta.respuesta_1 : ""}" required>
      </div>
      <div class="form-group">
        <label for="respuesta2">Respuesta Incorrecta 2:</label>
        <input type="text" id="respuesta2" value="${isEdit ? pregunta.respuesta_2 : ""}" required>
      </div>
      <div class="form-group">
        <label for="respuesta3">Respuesta Incorrecta 3:</label>
        <input type="text" id="respuesta3" value="${isEdit ? pregunta.respuesta_3 : ""}" required>
      </div>
      <div class="form-group">
        <div class="checkbox-group">
          <input type="checkbox" id="preguntaActiva" ${isEdit ? (pregunta.activa ? "checked" : "") : "checked"}>
          <label for="preguntaActiva">Pregunta Activa</label>
        </div>
      </div>
      <div class="form-buttons">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? "Actualizar" : "Crear"}</button>
      </div>
    </form>
  `

  showModal(title, content)

  document.getElementById("ruletaPreguntaForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    const tema_id = document.getElementById("preguntaTema").value
    const paisesSelect = document.getElementById("preguntaPaises")
    const paises_ids = Array.from(paisesSelect.selectedOptions).map((option) => Number.parseInt(option.value))
    const preguntaTexto = document.getElementById("preguntaTexto").value
    const respuesta_correcta = document.getElementById("respuestaCorrecta").value
    const respuesta_1 = document.getElementById("respuesta1").value
    const respuesta_2 = document.getElementById("respuesta2").value
    const respuesta_3 = document.getElementById("respuesta3").value
    const activa = document.getElementById("preguntaActiva").checked

    try {
      if (isEdit) {
        await apiRequest(`/ruleta/preguntas/${pregunta.id}`, "PUT", {
          tema_id: Number.parseInt(tema_id),
          paises_ids,
          pregunta: preguntaTexto,
          respuesta_correcta,
          respuesta_1,
          respuesta_2,
          respuesta_3,
          activa,
        })
      } else {
        await apiRequest("/ruleta/preguntas", "POST", {
          tema_id: Number.parseInt(tema_id),
          paises_ids,
          pregunta: preguntaTexto,
          respuesta_correcta,
          respuesta_1,
          respuesta_2,
          respuesta_3,
          activa,
        })
      }
      closeModal()
      loadRuletaPreguntas()
    } catch (error) {
      alert("Error: " + error.message)
    }
  })
}

async function editPregunta(id) {
  const pregunta = currentData.preguntas.find((p) => p.id === id)
  if (pregunta) {
    showPreguntaForm(pregunta)
  }
}

async function editUsuario(id) {
  const usuario = currentData.usuarios.find((u) => u.id === id)
  if (usuario) {
    showUsuarioForm(usuario)
  }
}

function showMessage(message, type = "info") {
  // Create message container if it doesn't exist
  let messageContainer = document.getElementById("messageContainer")
  if (!messageContainer) {
    messageContainer = document.createElement("div")
    messageContainer.id = "messageContainer"
    messageContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 9999;
      display: none;
      font-weight: 500;
    `
    document.body.appendChild(messageContainer)
  }

  messageContainer.textContent = message
  messageContainer.className = `message ${type}`

  // Set colors based on type
  if (type === "success") {
    messageContainer.style.backgroundColor = "#10b981"
    messageContainer.style.color = "white"
  } else if (type === "error") {
    messageContainer.style.backgroundColor = "#ef4444"
    messageContainer.style.color = "white"
  } else {
    messageContainer.style.backgroundColor = "#3b82f6"
    messageContainer.style.color = "white"
  }

  messageContainer.style.display = "block"

  setTimeout(() => {
    messageContainer.style.display = "none"
  }, 3000)
}
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  const loginContainer = document.getElementById("loginContainer")
  const appContainer = document.getElementById("appContainer")
  const logoutBtn = document.getElementById("logoutBtn")
  const loginError = document.getElementById("loginError")

  document.querySelectorAll(".nav-item[data-tab]").forEach((item) => {
    item.addEventListener("click", () => {
      if (window.innerWidth <= 1024) {
        closeSidebar()
      }
    })
  })

  document.querySelectorAll(".submenu-toggle").forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault()
      const submenuId = toggle.dataset.submenu + "-submenu"
      const submenu = document.getElementById(submenuId)
      const arrow = toggle.querySelector(".submenu-arrow")

      if (submenu.style.display === "block") {
        submenu.style.display = "none"
        arrow.style.transform = "rotate(0deg)"
        toggle.classList.remove("active")
      } else {
        submenu.style.display = "block"
        arrow.style.transform = "rotate(90deg)"
        toggle.classList.add("active")
      }
    })
  })

  document.querySelectorAll(".nav-item[data-tab]").forEach((item) => {
    item.addEventListener("click", (e) => {
      if (!item.classList.contains("submenu-toggle")) {
        switchTabFn(e.target.closest(".nav-item").dataset.tab)
      }
    })
  })

  // Add event listener for modal close button
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("close") || e.target.innerHTML === "&times;") {
      closeModal()
    }
  })

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const correo = document.getElementById("correo").value
      const contrasena = document.getElementById("contrasena").value

      if (correo === "admin@minijuegos.com" && contrasena === "admin123") {
        currentUser = { correo, esAdmin: true }
        loginContainer.style.display = "none"
        appContainer.style.display = "flex"
        initializeApp()
      } else if (correo === "editor@minijuegos.com" && contrasena === "editor123") {
        currentUser = { correo, esAdmin: false }
        loginContainer.style.display = "none"
        appContainer.style.display = "flex"
        initializeApp()
      } else {
        loginError.textContent = "Credenciales incorrectas"
      }
    })
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      currentUser = null
      appContainer.style.display = "none"
      loginContainer.style.display = "flex"
      loginError.textContent = ""
    })
  }

  function initializeApp() {
    updateUIForUserRole()
    loadPaises()
    loadPreguntas()
    loadEscenarios()
    loadSprites()
    loadRuletaTemas()
    loadRuletaPreguntas()
    loadUsuarios()
    loadLogs()
    feather.replace()
  }

  function updateUIForUserRole() {
    const adminOnlyElements = document.querySelectorAll(".admin-only")
    adminOnlyElements.forEach((element) => {
      if (currentUser && currentUser.esAdmin) {
        element.style.display = ""
      } else {
        element.style.display = "none"
      }
    })
  }
})