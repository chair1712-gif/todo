// API Backend menggunakan Netlify Functions
let todos = [
    { id: '1', text: 'Belajar membuat API', completed: false },
    { id: '2', text: 'Buat aplikasi Todo', completed: true },
    { id: '3', text: 'Deploy ke Netlify', completed: false }
];

exports.handler = async (event, context) => {
    const { httpMethod, path, pathParameters, queryStringParameters, body } = event;
    
    // CORS headers
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Handle preflight
    if (httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // GET /api/todos
    if (httpMethod === 'GET' && path.endsWith('/todos')) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(todos)
        };
    }

    // GET /api/todos/{id}
    if (httpMethod === 'GET' && path.includes('/todos/')) {
        const id = path.split('/').pop();
        const todo = todos.find(t => t.id === id);
        
        if (!todo) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Todo tidak ditemukan' })
            };
        }
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(todo)
        };
    }

    // POST /api/todos
    if (httpMethod === 'POST' && path.endsWith('/todos')) {
        try {
            const { text } = JSON.parse(body || '{}');
            
            if (!text || text.trim() === '') {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Text wajib diisi' })
                };
            }
            
            const newTodo = {
                id: Date.now().toString(),
                text: text.trim(),
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            todos.push(newTodo);
            
            return {
                statusCode: 201,
                headers,
                body: JSON.stringify(newTodo)
            };
        } catch (error) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid JSON body' })
            };
        }
    }

    // PUT /api/todos/{id}
    if (httpMethod === 'PUT' && path.includes('/todos/')) {
        try {
            const id = path.split('/').pop();
            const todoIndex = todos.findIndex(t => t.id === id);
            
            if (todoIndex === -1) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Todo tidak ditemukan' })
                };
            }
            
            const updates = JSON.parse(body || '{}');
            const todo = todos[todoIndex];
            
            // Update fields
            if ('text' in updates) {
                todo.text = updates.text.trim();
            }
            if ('completed' in updates) {
                todo.completed = Boolean(updates.completed);
            }
            
            todo.updatedAt = new Date().toISOString();
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(todo)
            };
        } catch (error) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid JSON body' })
            };
        }
    }

    // DELETE /api/todos/{id}
    if (httpMethod === 'DELETE' && path.includes('/todos/')) {
        const id = path.split('/').pop();
        const initialLength = todos.length;
        
        todos = todos.filter(t => t.id !== id);
        
        if (todos.length === initialLength) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Todo tidak ditemukan' })
            };
        }
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Todo berhasil dihapus' })
        };
    }

    // Route tidak ditemukan
    return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Route tidak ditemukan' })
    };
};
