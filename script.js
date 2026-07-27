// Имитация базы данных в localStorage
const DB = {
    get(key) {
        return JSON.parse(localStorage.getItem(key) || 'null');
    },
    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
};

// Инициализация
if (!DB.get('users')) DB.set('users', {});
if (!DB.get('topics')) DB.set('topics', []);
if (!DB.get('posts')) DB.set('posts', {});
if (!DB.get('banned')) DB.set('banned', []);

let currentUser = null;
let currentTopicId = null;

// DOM
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminCodeInput = document.getElementById('adminCode');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const topicList = document.getElementById('topicList');
const postList = document.getElementById('postList');
const postContent = document.getElementById('postContent');
const addPostBtn = document.getElementById('addPostBtn');
const createTopicBtn = document.getElementById('createTopicBtn');
const topicNameInput = document.getElementById('topicName');
const createTopicSection = document.getElementById('create-topic');

// --- Аутентификация ---
function updateUI() {
    if (currentUser) {
        document.querySelectorAll('#auth-section input').forEach(i => i.disabled = true);
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
    } else {
        document.querySelectorAll('#auth-section input').forEach(i => i.disabled = false);
        loginBtn.style.display = 'inline-block';
        registerBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
    }
    renderTopics();
}

registerBtn.onclick = () => {
    const u = usernameInput.value.trim();
    const p = passwordInput.value.trim();
    if (!u || !p) return alert('Заполните поля');
    const users = DB.get('users');
    if (users[u]) return alert('Логин занят');
    users[u] = { password: p, banned: false };
    DB.set('users', users);
    alert('Регистрация успешна');
};

loginBtn.onclick = () => {
    const u = usernameInput.value.trim();
    const p = passwordInput.value.trim();
    const users = DB.get('users');
    if (!users[u]) return alert('Нет такого пользователя');
    if (users[u].password !== p) return alert('Неверный пароль');
    if (users[u].banned) return alert('Вы забанены');
    currentUser = u;
    updateUI();
};

logoutBtn.onclick = () => {
    currentUser = null;
    updateUI();
};

// --- Админский доступ ---
adminLoginBtn.onclick = () => {
    const code = adminCodeInput.value.trim();
    if (code === 'SATANDAGI') {
        currentUser = 'admin';
        updateUI();
        createTopicSection.style.display = 'block';
        alert('Добро пожаловать, Админ!');
        // Открываем админ-панель в новом окне
        window.open('admin.html', '_blank');
    } else {
        alert('Неверный код');
    }
};

// --- Темы ---
function renderTopics() {
    const topics = DB.get('topics');
    topicList.innerHTML = topics.map((t, i) => `
        <div class="topic" data-id="${i}">
            <strong>${t.name}</strong>
            <button onclick="selectTopic(${i})">Открыть</button>
            ${currentUser === 'admin' ? `<button onclick="deleteTopic(${i})">Удалить</button>` : ''}
        </div>
    `).join('');
}

window.selectTopic = (id) => {
    currentTopicId = id;
    renderPosts();
};

window.deleteTopic = (id) => {
    if (!confirm('Удалить тему?')) return;
    let topics = DB.get('topics');
    topics.splice(id, 1);
    DB.set('topics', topics);
    renderTopics();
    if (currentTopicId === id) {
        currentTopicId = null;
        postList.innerHTML = '';
    }
};

createTopicBtn.onclick = () => {
    if (currentUser !== 'admin') return alert('Только админ');
    const name = topicNameInput.value.trim();
    if (!name) return alert('Введите имя');
    const topics = DB.get('topics');
    topics.push({ name, created: Date.now() });
    DB.set('topics', topics);
    topicNameInput.value = '';
    renderTopics();
};

// --- Посты ---
function renderPosts() {
    if (currentTopicId === null) {
        postList.innerHTML = '<p>Выберите тему</p>';
        return;
    }
    const posts = DB.get('posts')[currentTopicId] || [];
    postList.innerHTML = posts.map(p => `
        <div class="post">
            <div>${p.content}</div>
            <small>${new Date(p.date).toLocaleString()}</small>
        </div>
    `).join('');
}

addPostBtn.onclick = () => {
    if (!currentUser) return alert('Войдите или зарегистрируйтесь');
    if (currentTopicId === null) return alert('Выберите тему');
    const content = postContent.value.trim();
    if (!content) return alert('Напишите что-то');
    
    // Проверка на бан
    const users = DB.get('users');
    if (users[currentUser]?.banned) return alert('Вы забанены');

    const posts = DB.get('posts');
    if (!posts[currentTopicId]) posts[currentTopicId] = [];
    posts[currentTopicId].push({ content, date: Date.now() });
    DB.set('posts', posts);
    postContent.value = '';
    renderPosts();
};

// --- Инициализация ---
updateUI();
