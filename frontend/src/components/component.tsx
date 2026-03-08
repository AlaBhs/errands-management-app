import React, { useState } from 'react';

interface Task {
    id: number;
    title: string;
    completed: boolean;
}

export const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [input, setInput] = useState('');

    const addTask = () => {
        if (input.trim()) {
            setTasks([...tasks, { id: Date.now(), title: input, completed: false }]);
            setInput('');
        }
    };

    const toggleTask = (id: number) => {
        setTasks(tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Task List</h1>
            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    placeholder="Add a new task..."
                />
                <button onClick={addTask}>Add</button>
            </div>
            <ul>
                {tasks.map(task => (
                    <li key={task.id}>
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                        />
                        <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                            {task.title}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};