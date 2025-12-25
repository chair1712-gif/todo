// Konfigurasi API
const API_BASE_URL = window.location.origin.includes('netlify')
    ? window.location.origin + '/.netlify/functions'
    : 'http://localhost:8888/.netlify/functions';

const API_URL = `${API_BASE_URL}/todos`;
let currentFilter = 'all';

// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const apiUrl = document.getElementById('apiUrl');
const filterButtons = document.querySelectorAll('.filter-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAPIStatus();
    loadTodos();
    setupEventListeners();
    apiUrl.textContent = API_URL;
});

// Cek status API
async function checkAPIStatus() {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            statusDot.classList.add('connected');
            statusText.textContent = 'API Terhubung';
        } else {
            statusDot.classList.add('disconnected');
            statusText.textContent = 'API Bermasalah';
        }
    } catch (error) {
        statusDot.classList.add('disconnected');
        statusText.textContent = 'API Tidak Terhubung';
        console.error('API Error:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            loadTodos();
        });
    });
}

// Ambil semua todos
async function loadTodos() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Gagal mengambil data');
        
        const todos = await response.json();
        displayTodos(todos);
        updateStats(todos);
    } catch (error) {
        showError('Gagal memuat data dari API');
        console.error('Load error:', error);
    }
}

// Tampilkan todos
function displayTodos(todos) {
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `
            <li class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>Tidak ada tugas ${currentFilter === 'active' ? 'aktif' : 
                                    currentFilter === 'completed' ? 'selesai' : ''}.</p>
            </li>
        `;
        return;
    }

    todoList.innerHTML = filteredTodos.map(todo => `
        <li class="todo-item" data-id="${todo.id}">
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo('${todo.id}', this.checked)"
            >
            <span class="todo-text ${todo.completed ? 'completed' : ''}">
                ${escapeHtml(todo.text)}
            </span>
            <div class="todo-actions">
                <button class="action-btn edit-btn" onclick="editTodo('${todo.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteTodo('${todo.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </li>
    `).join('');
}

// Tambah todo baru
async function addTodo() {
    const text = todoInput.value.trim();
    if (!text) {
        showError('Masukkan teks tugas');
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) throw new Error('Gagal menambah tugas');
        
        todoInput.value = '';
        loadTodos();
        showSuccess('Tugas berhasil ditambah!');
    } catch (error) {
        showError('Gagal menambah tugas');
        console.error('Add error:', error);
    }
}

// Toggle status todo
async function toggleTodo(id, completed) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed })
        });

        if (!response.ok) throw new Error('Gagal mengupdate tugas');
        
        loadTodos();
    } catch (error) {
        showError('Gagal mengupdate tugas');
        console.error('Toggle error:', error);
    }
}

// Edit todo
async function editTodo(id) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    const todoText = todoItem.querySelector('.todo-text');
    const currentText = todoText.textContent;
    
    const newText = prompt('Edit tugas:', currentText);
    if (newText === null || newText.trim() === '') return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: newText.trim() })
        });

        if (!response.ok) throw new Error('Gagal mengedit tugas');
        
        loadTodos();
        showSuccess('Tugas berhasil diedit!');
    } catch (error) {
        showError('Gagal mengedit tugas');
        console.error('Edit error:', error);
    }
}

// Hapus todo
async function deleteTodo(id) {
    if (!confirm('Hapus tugas ini?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Gagal menghapus tugas');
        
        loadTodos();
        showSuccess('Tugas berhasil dihapus!');
    } catch (error) {
        showError('Gagal menghapus tugas');
        console.error('Delete error:', error);
    }
}

// Update statistik
function updateStats(todos) {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const active = total - completed;
    
    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;
}

// Helper functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    alert('❌ ' + message);
}

function showSuccess(message) {
    alert('✅ ' + message);
}
