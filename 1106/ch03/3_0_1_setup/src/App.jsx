// src/App.jsx
import { useState }from 'react'
import 'ch03\3_0_1_setup\src\App.jsx'
function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
    <label htmlfor="task-input"> 할 일</label>
    <input type="text" placeholder='할 일을 입력하세요'/>
    <input
      id="task-input"
      type="text"
      placeholder="할 일을 입력하세요"
      maxLength={20}
      />

    <p><img src="/vite.svg" alt="Vite로고" width={24}/>
      숫자는 중괄호로 넘긴다.
      </p>
      <p className="done"> className으로 지정한 문단</p>
      <p style= { {color:"red", fontSize:"20px"}}>스트일로 직접</p>
      </div>
  )
}

export default App