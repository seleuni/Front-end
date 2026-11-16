import {useState} from "react";

function TaskForm({onAdd}) {
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); 
    const trimmed = inputText.trim();
    if (trimmed === "") return;
    onAdd(trimmed);
    setInputText("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="할 일을 입력하세요"
      />
      <button type="submit">추가</button>
    </form>
  );
}

function App() {
  const [tasks, setTasks] = useState([]);

  const handleAdd = (title) => {
    setTasks([...tasks, {id: Date.now(), title, isDone:false}]);
  };

  return (
      <div>
        <h2>할 일 추가하기</h2>
        <TaskForm onAdd={handleAdd}/>
        <ul>
          {tasks.map((task)=>(
            <li key={task.id}>{task.title}</li>
          ))}
        </ul>
        </div>
  );
}

export default App
