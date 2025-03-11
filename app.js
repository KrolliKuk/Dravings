let lastOpenedFiles = JSON.parse(localStorage.getItem("lastOpened")) || {};
// Проверка на бан
const currentUserData = users.find(u => u.id === currentUser.id);
if (currentUserData?.isBanned) {
  alert("Ваш аккаунт заблокирован!");
  tg.close();
}
// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand(); // Раскрываем приложение на весь экран

// Изменим структуру проектов для поддержки папок
let projects = JSON.parse(localStorage.getItem("projects")) || {
  active: { folders: [] },
  completed: { folders: [] },
  abandoned: { folders: [] },
  all: [] // Все нераспределенные файлы
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

function showFilesList(project) {
  const list = document.createElement("div");
  project.files.forEach(file => {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";
    fileItem.innerHTML = `
      <span>📄 ${file.name}</span>
      <span class="file-date">${file.date}</span>
    `;
    fileItem.addEventListener("click", () => {
  // Для локальных файлов
  const pdfWindow = window.open("");
  pdfWindow.document.write(`
    <embed 
      width="100%" 
      height="100%" 
      src="${file.content}" 
      type="application/pdf"
    />
  `);
});
      // Сохраняем последний открытый файл
      lastOpenedFiles[currentUser.id] = file;
      localStorage.setItem("lastOpened", JSON.stringify(lastOpenedFiles));
      updateLastFileName();
      
      // Открываем PDF (пример для файла из интернета)
      tg.openLink(`https://your-server.com/pdfs/${file.name}`);
    });
    list.appendChild(fileItem);
  });
  createModal(project.address, list);
}

// Добавьте новую функцию:
function updateLastFileName() {
  const lastFile = lastOpenedFiles[currentUser.id];
  const fileNameElement = document.getElementById("last-file-name");
  fileNameElement.textContent = lastFile ? lastFile.name : "Файл не выбран";
}

// Вызовите при запуске:
updateLastFileName();

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
// ========================
// Логика админ-панели
// ========================

// Открытие админ-панели
document.getElementById("admin-panel").addEventListener("click", () => {
  if (!currentUser.isAdmin) {
    alert("Доступ запрещен!");
    return;
  }

  const adminContent = document.createElement("div");
  adminContent.innerHTML = `
    <button class="admin-feature-btn" id="add-admin">👑 Добавить админа</button>
    <button class="admin-feature-btn" id="ban-user">🚫 Забанить пользователя</button>
    <button class="admin-feature-btn" id="upload-pdf">📤 Загрузить PDF</button>
    <button class="admin-feature-btn" id="move-files">📦 Переместить файлы</button>
  `;
  createModal("Админ-панель", adminContent);

  // Добавление админа
  document.getElementById("add-admin").addEventListener("click", () => {
    const userId = prompt("Введите ID пользователя:");
    if (userId) {
      // Здесь будет запрос к бэкенду
      alert(`Пользователь ${userId} стал админом!`);
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
    const reader = new FileReader();
    reader.onload = function(event) {
      const newFile = {
        name: file.name,
        date: new Date().toISOString().split("T")[0],
        content: event.target.result // base64 data
      };
      
      projects.all.push(newFile);
      localStorage.setItem("projects", JSON.stringify(projects));
      alert("Файл загружен в раздел 'Все'!");
    };
    reader.readAsDataURL(file);
  }
};

    input.click();
  });
});
// ========================
// Хранение пользователей
// ========================
let users = JSON.parse(localStorage.getItem("users")) || [];

// При инициализации приложения сохраняем текущего пользователя
if (currentUser.id && !users.some(u => u.id === currentUser.id)) {
  users.push({
    id: currentUser.id,
    isAdmin: false,
    isBanned: false,
    firstAccess: new Date().toISOString()
  });
  localStorage.setItem("users", JSON.stringify(users));
}

// ========================
// Активация всех разделов
// ========================
document.getElementById("completed-projects").addEventListener("click", () => {
  showProjectsList("completed");
});

document.getElementById("abandoned-projects").addEventListener("click", () => {
  showProjectsList("abandoned");
});

// ========================
// Система пользователей (админ-панель)
// ========================
document.getElementById("users-list").addEventListener("click", () => {
  if (!currentUser.isAdmin) {
    alert("Доступ запрещен!");
    return;
  }

  const userList = document.createElement("div");
  users.forEach(user => {
    const userEl = document.createElement("div");
    userEl.className = "user-item";
    userEl.innerHTML = `
      <div class="user-info">
        <span>ID: ${user.id}</span>
        <span>Дата регистрации: ${user.firstAccess.split("T")[0]}</span>
        ${user.isBanned ? '🔴 Заблокирован' : ''}
      </div>
      <div class="user-actions">
        ${!user.isAdmin ? `<button class="make-admin-btn" data-id="${user.id}">Сделать админом</button>` : ''}
        <button class="ban-user-btn" data-id="${user.id}">
          ${user.isBanned ? 'Разблокировать' : 'Заблокировать'}
        </button>
      </div>
    `;
    userList.appendChild(userEl);
  });

  createModal("Список пользователей", userList);

  // Обработчики для кнопок
  document.querySelectorAll(".make-admin-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const userId = parseInt(e.target.dataset.id);
      users = users.map(u => u.id === userId ? {...u, isAdmin: true} : u);
      localStorage.setItem("users", JSON.stringify(users));
      alert(`Пользователь ${userId} стал админом!`);
      e.target.disabled = true;
    });
  });

  document.querySelectorAll(".ban-user-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const userId = parseInt(e.target.dataset.id);
      users = users.map(u => u.id === userId ? {...u, isBanned: !u.isBanned} : u);
      localStorage.setItem("users", JSON.stringify(users));
      alert(`Статус блокировки пользователя ${userId} изменен!`);
      e.target.textContent = u.isBanned ? 'Разблокировать' : 'Заблокировать';
    });
  });
});
// ========================
// Логика раздела "Всё" (админ-панель)
// ========================
function showAllFiles() {
  const content = document.createElement("div");
  
  // Заголовок и кнопка возврата
  const header = document.createElement("div");
  header.innerHTML = `<h3>Все файлы (${projects.all.length})</h3>`;
  content.appendChild(header);

  // Список файлов
  const filesList = document.createElement("div");
  projects.all.forEach((file, index) => {
    const fileEl = document.createElement("div");
    fileEl.className = "file-item";
    fileEl.innerHTML = `
      <span>📄 ${file.name}</span>
      <div class="file-actions">
        <select class="move-select" data-index="${index}">
          <option value="">Переместить в...</option>
          <option value="active">Действующие</option>
          <option value="completed">Завершённые</option>
          <option value="abandoned">Заброшенные</option>
        </select>
      </div>
    `;
    filesList.appendChild(fileEl);
  });

  // Обработчик перемещения
  filesList.querySelectorAll(".move-select").forEach(select => {
    select.addEventListener("change", (e) => {
      const type = e.target.value;
      const index = e.target.dataset.index;
      if (type) {
        const file = projects.all.splice(index, 1)[0];
        projects[type].folders[0].files.push(file); // Добавляем в первую папку раздела
        localStorage.setItem("projects", JSON.stringify(projects));
        showAllFiles(); // Обновляем список
      }
    });
  });

  createModal("Все файлы", filesList);
}

// ========================
// Редактор вкладок (админ-панель)
// ========================
function showTabEditor(type) {
  const content = document.createElement("div");
  
  // Создание новой папки
  const newFolderInput = document.createElement("input");
  newFolderInput.placeholder = "Название папки";
  const createBtn = document.createElement("button");
  createBtn.textContent = "Создать";
  createBtn.onclick = () => {
    if (newFolderInput.value) {
      projects[type].folders.push({
        name: newFolderInput.value,
        files: []
      });
      localStorage.setItem("projects", JSON.stringify(projects));
      showTabEditor(type);
    }
  };
  
  content.appendChild(newFolderInput);
  content.appendChild(createBtn);

  // Список существующих папок
  const foldersList = document.createElement("div");
  projects[type].folders.forEach((folder, index) => {
    const folderEl = document.createElement("div");
    folderEl.className = "folder-item";
    folderEl.innerHTML = `
      <input type="text" value="${folder.name}" class="folder-name" data-index="${index}">
      <button class="delete-folder" data-index="${index}">❌</button>
    `;
    
    // Переименование
    folderEl.querySelector(".folder-name").addEventListener("change", (e) => {
      projects[type].folders[e.target.dataset.index].name = e.target.value;
      localStorage.setItem("projects", JSON.stringify(projects));
    });

    // Удаление
    folderEl.querySelector(".delete-folder").addEventListener("click", (e) => {
      projects[type].folders.splice(e.target.dataset.index, 1);
      localStorage.setItem("projects", JSON.stringify(projects));
      showTabEditor(type);
    });

    foldersList.appendChild(folderEl);
  });

  content.appendChild(foldersList);
  createModal(`Редактор: ${type}`, content);
}

// ========================
// Обновленная логика отображения проектов
// ========================
function showProjectsList(type) {
  const list = document.createElement("div");
  
  // Кнопка редактирования (только для админа)
  if (currentUser.isAdmin) {
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️ Редактировать раздел";
    editBtn.className = "edit-section-btn";
    editBtn.onclick = () => showTabEditor(type);
    list.appendChild(editBtn);
  }

  // Список папок
  projects[type].folders.forEach(folder => {
    const folderBtn = document.createElement("button");
    folderBtn.className = "folder-btn";
    folderBtn.innerHTML = `
      📁 ${folder.name} (${folder.files.length} файлов)
    `;
    folderBtn.onclick = () => showFilesList(folder.files);
    list.appendChild(folderBtn);
  });

  createModal(type, list);
}

// ========================
// Обновление админ-панели
// ========================
// В обработчике кнопки админ-панели добавьте:
const adminContent = document.createElement("div");
adminContent.innerHTML += `
  <button class="admin-feature-btn" id="manage-all-files">📚 Все файлы</button>
  <button class="admin-feature-btn" id="edit-active">✏️ Действующие</button>
  <button class="admin-feature-btn" id="edit-completed">✏️ Завершённые</button>
  <button class="admin-feature-btn" id="edit-abandoned">✏️ Заброшенные</button>
`;

// Обработчики для новых кнопок
document.getElementById("manage-all-files").addEventListener("click", showAllFiles);
document.getElementById("edit-active").addEventListener("click", () => showTabEditor("active"));
document.getElementById("edit-completed").addEventListener("click", () => showTabEditor("completed"));
document.getElementById("edit-abandoned").addEventListener("click", () => showTabEditor("abandoned"));
