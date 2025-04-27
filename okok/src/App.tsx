import { useState } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setTodos([input.trim(), ...todos]);
      setInput('');
    }
  };

  const removeTodo = (index: number) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  return (
    <div className="todo-container">
      <h1>To-Do List</h1>
      <form onSubmit={addTodo} className="todo-form">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a new task..."
          className="todo-input"
        />
        <button type="submit" className="todo-add-btn">Add</button>
      </form>
      <ul className="todo-list">
        {todos.length === 0 && <li className="todo-empty">No tasks yet!</li>}
        {todos.map((todo, idx) => (
          <li key={idx} className="todo-item">
            <span>{todo}</span>
            <button onClick={() => removeTodo(idx)} className="todo-remove-btn">Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
