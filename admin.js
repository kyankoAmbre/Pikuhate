const DB = {
    get(key) {
        return JSON.parse(localStorage.getItem(key) || 'null');
    },
    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
};

function renderUsers() {
    const users = DB.get('users');
    const list = document.getElementById('userList');
    list.innerHTML = Object.keys(users).map(u => `
        <li>${u} ${users[u].banned ? '🚫 ЗАБАНЕН' : '✅ активен'} (ID: ${u})</li>
    `).join('');
}

document.getElementById('refreshBtn').onclick = renderUsers;

document.getElementById('banBtn').onclick = () => {
    const id = document.getElementById('banUserId').value.trim();
    if (!id) return alert('Введите ID');
    const users = DB.get('users');
    if (!users[id]) return alert('Пользователь не найден');
    users[id].banned = !users[id].banned;
    DB.set('users', users);
    renderUsers();
    alert('Статус изменён');
};

document.getElementById('logoutAdminBtn').onclick = () => {
    window.close();
};

renderUsers();
