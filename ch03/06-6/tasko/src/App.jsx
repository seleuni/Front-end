import { useState } from 'react'
import './App.css'

function TaskItemWithProps(props) {
  return <li className={props.isDone ? "done": ""}> props.title}</li>
  const [count, setCount] = useState(0)

function TaskItem({title, isDone=false, priority="normal"}) {
  return (
    <li className={isDone ? "done" : ""}>
      [{priority}] {title}
    </li>
  );
}

function TaskItemInBody(props) {
  const {title, isDone}= props;
  return <li className={isDone ? "done" : ""}>{title}</li>;
}

function TaskItemWithRest({title, ... rest}) {
  console.log(rest); 
  return <li {... rest}>{title}</li>
}
 
}

function App() {
  return (
    <ul>
      <TaskItemWithProps title="props.title로 읽기" isDone={false}/>
      <TaskItem title="구조 분해 + 기본값"/>
      <TaskItem title="priority를 넘긴 경우" isDone={true} priority="high" />
      <TaskItemInBody title="본문에서 구조 분해" isDone={false}/>
      <TaskItemWithRest title="나머지 props 펼치기" className="done"/>
    </ul>
  );
}

export default App
