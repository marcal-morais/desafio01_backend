const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(u => u.username === username);
  if (!user) {
    return response.status(404).json({
      error: 'Mensagem do erro'
    });
  }
  request.user = user;
  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const user = {
    id: uuidv4(), // precisa ser um uuid
    name,
    username,
    todos: []
  };
  const userExists = users.find(u => u.username === username);

  if (userExists) {
    return response.status(400).json({
      error: 'Mensagem do erro'
    });
  }
  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const user = users.find(u => u.username === username);
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;
  const user = users.find(u => u.username === username);
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { username } = request.headers;
  const user = users.find(u => u.username === username);
  const todo = user.todos.find(t => t.id === id);
  if (!todo) {
    return response.status(404).json({ error: "Page not found" });
  }
  todo.title = title;
  todo.deadline = deadline;
  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;
  const user = users.find(u => u.username === username);
  const todo = user.todos.find(t => t.id === id);
  if (!todo) {
    return response.status(404).json({ error: "Page not found" });
  }
  todo.done = true;
  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;
  const user = users.find(u => u.username === username);
  const todoExists = user.todos.find(t => t.id === id);
  if (!todoExists) {
    return response.status(404).json({ error: "Page not found" });
  }
  const todo = user.todos.filter(t => t.id !== id);

  user.todos = todo;
  return response.status(204).json(users.todos);
});

module.exports = app;