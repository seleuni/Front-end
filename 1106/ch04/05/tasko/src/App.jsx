import { useState } from 'react'
import './App.css'

function TaskForm(){
  const [form, setForm] = useState({title:"1", memo:"2", priority:"normal"});

    const handleChange =(e) => {
      const {name, value} = e.target; //구조 분해
      setForm({...form, [name]:value}); //스프레드 +계산된 속성명
    };

  return (
    <div>
      <form>
        <p><input name="title" placeholder="제목" 
        value={form.title}
        onChange={handleChange}
        /></p>
        <p><textarea 
        name="memo" placeholder="메모" cols={40} rows={5} 
        value={form.memo}
        onChange={handleChange}
        />
        </p>
        <p>
          <select name="priority" 
            value={form.priority}
            onChange={handleChange}
            >
          <option value="high">긴급</option>
          <option value="normal">보통</option>
          <option value="low">낮음</option>
          </select>
          </p>
      </form>
    </div>
  )
}
function App() {
  

  return (
  
      <div>
       <h2>여러 입력값을 개체 하나로</h2>
       <TaskForm/>
      </div>
    
  )
}

export default App
