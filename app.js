// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Имитация данных (хранится в localStorage)
let projects = JSON.parse(localStorage.getItem("projects")) || {
  active: [],
  completed: [],
  abandoned: [],
  all: [] // Временное хранилище для новых файлов
};

let users = JSON.parse(localStorage.getItem("users")) || [];
const mainAdminId = 431218382; // ЗАМЕНИТЕ НА ВАШ REAL TG ID

// Текущий пользователь
const currentUser = {
  id: tg.initDataUnsafe.user?.id || 0,
  isAdmin: tg.initDataUnsafe.user?.id === mainAdminId
};

// Элементы интерфейса
const elements = {
  lastBlueprintBtn: document.getElementById("last-blueprint"),
  activeProjectsBtn: document.getElementById("active-projects"),
  adminPanelBtn: document.getElementById("admin-panel"),
  modal: null
};

// ========================
// Логика модальных окон
// ========================
function createModal(title, content) {
  if (elements.modal) elements.modal.remove();
  
  elements.modal = document.createElement("div");
  elements.modal.className = "modal";
  
  const modalHeader = document.createElement("div");
  modalHeader.className = "modal-header";
  modalHeader.innerHTML = `
    <h2>${title}</h2>
    <button class="close-btn">&times;</button>
  `;
  
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  modalContent.appendChild(content);
  
  elements.modal.appendChild(modalHeader);
  elements.modal.appendChild(modalContent);
  document.body.appendChild(elements.modal);
  
  modalHeader.querySelector(".close-btn").addEventListener("click", () => {
    elements.modal.remove();
  });
}

// ========================
// Логика проектов
// ========================
function showProjectsList(type) {
  const list = document.createElement("div");
  projects[type].forEach(project => {
    const btn = document.createElement("button");
    btn.className = "project-btn";
    btn.textContent = project.address;
    btn.addEventListener("click", () => showFilesList(project));
    list.appendChild(btn);
  });
  createModal("Список объектов", list);
}

function showFilesList(project) {
  const list = document.createElement("div");
  project.files.forEach(file => {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";
    fileItem.innerHTML = `
      <span>📄 ${file.name}</span>
      <span class="file-date">${file.date}</span>
    `;
    list.appendChild(fileItem);
  });
  createModal(project.address, list);
}

// ========================
// Логика админ-панели
// ========================
function handleAdminPanel() {
  if (!currentUser.isAdmin) {
    tg.showAlert("🚫 Доступ запрещен!");
    return;
  }

  const adminContent = document.createElement("div");
  adminContent.innerHTML = `
    <button class="admin-feature-btn" id="add-admin">👑 Добавить админа</button>
    <button class="admin-feature-btn" id="ban-user">🚫 Забанить пользователя</button>
    <button class="admin-feature-btn" id="upload-pdf">📤 Загрузить PDF</button>
  `;

  createModal("Админ-панель", adminContent);

  // Добавление админа
  document.getElementById("add-admin").addEventListener("click", () => {
    const userId = prompt("Введите ID пользователя:");
    if (userId) {
      users.push({ 
        id: parseInt(userId), 
        isAdmin: true,
        isBanned: false 
      });
      localStorage.setItem("users", JSON.stringify(users));
      alert(`Пользователь ${userId} стал админом!`);
    }
  });

  // Бан пользователя
  document.getElementById("ban-user").addEventListener("click", () => {
    const userId = prompt("Введите ID для блокировки:");
    if (userId) {
      users = users.map(u => 
        u.id === parseInt(userId) ? {...u, isBanned: true} : u
      );
      localStorage.setItem("users", JSON.stringify(users));
      alert(`Пользователь ${userId} заблокирован!`);
    }
  });

  // Загрузка PDF
  document.getElementById("upload-pdf").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        projects.all.push({
          name: file.name,
          date: new Date().toISOString().split("T")[0]
        });
        localStorage.setItem("projects", JSON.stringify(projects));
        alert("Файл загружен в раздел 'Все'!");
      }
    };
    input.click();
  });
}

// ========================
// Инициализация
// ========================
document.addEventListener("DOMContentLoaded", () => {
  // Скрыть админ-панель для обычных пользователей
  if (!currentUser.isAdmin) {
    document.querySelector(".admin-section").style.display = "none";
  }

  // Обработчики событий
  elements.activeProjectsBtn.addEventListener("click", () => showProjectsList("active"));
  document.getElementById("completed-projects").addEventListener("click", () => showProjectsList("completed"));
  document.getElementById("abandoned-projects").addEventListener("click", () => showProjectsList("abandoned"));
  elements.adminPanelBtn.addEventListener("click", handleAdminPanel);

  // Логирование для отладки
  console.log("Текущий пользователь:", {
    id: currentUser.id,
    isAdmin: currentUser.isAdmin,
    users: users
  });
});
