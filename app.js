// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand(); // Раскрываем приложение на весь экран

// Имитация данных (замените на реальные данные позже)
let projects = {
  active: [
    { 
      address: "ул. Строителей, 15", 
      files: [
        { name: "План этажа.pdf", date: "2024-03-01" },
        { name: "Электрика.pdf", date: "2024-03-05" }
      ]
    }
  ],
  completed: [],
  abandoned: []
};

// Текущий пользователь (431218382)
let currentUser = {
  id: tg.initDataUnsafe.user?.id || 0,
  isAdmin: tg.initDataUnsafe.user?.id === 431218382 // 
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

// Создание модального окна
function createModal(title, content) {
  // Удаляем предыдущее модальное окно
  if (elements.modal) elements.modal.remove();

  // Создаем контейнер
  elements.modal = document.createElement("div");
  elements.modal.className = "modal";

  // Заголовок
  const modalHeader = document.createElement("div");
  modalHeader.className = "modal-header";
  modalHeader.innerHTML = `
    <h2>${title}</h2>
    <button class="close-btn">&times;</button>
  `;

  // Контент
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  modalContent.appendChild(content);

  // Собираем модальное окно
  elements.modal.appendChild(modalHeader);
  elements.modal.appendChild(modalContent);
  document.body.appendChild(elements.modal);

  // Закрытие по клику на крестик
  elements.modal.querySelector(".close-btn").addEventListener("click", () => {
    elements.modal.remove();
  });
}

// Показать список объектов
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

// Показать список файлов проекта
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
// Обработчики событий
// ========================

// Кнопка "Действующие объекты"
elements.activeProjectsBtn.addEventListener("click", () => {
  showProjectsList("active");
});

// Скрыть админ-панель для обычных пользователей
if (!currentUser.isAdmin) {
  document.querySelector(".admin-section").style.display = "none";
}

// ========================
// Инициализация
// ========================
console.log("User ID:", currentUser.id);