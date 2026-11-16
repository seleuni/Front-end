import { useState } from 'react'
import './App.css'

//할일 컴포넌트
function TaskItem(props){
//  return(
//    <li>
//      [{props.property}{props.title} {props.isDone ? "완료" : "미완료"}
//    </li>
//  );
//}
//할일 목록 컴포넌트
function TaskList(tasks){
  return(
    <ul>
      <tasks.map((task)=>(
        <TaskItem 
          key={task.id}
          title={task.title}
          priority={task.priority}
          isDone={task.isDone}
        />
      ))}
     </ul>
  );
}


function App() {
  const tasks = [
    {id: 1, title: "리액트 공부하기", priority:"높음", isDone:true}
    {id: 1, title: "게임하기", priority:"낮음", isDone:false}
  ]

  return (
    <div>
      <h1> 할 일 관리 앱1</h1>
      <ol>
      <TaskItem title="리액트 공부하기" priority="높음" isDone={false}/>
      <TaskItem title="게임하기" priority="낮음" isDone={true}/>
      </ol>
      <h1> 할 일 관리 앱2</h1>
      <TaskItem tasks={tasks}/>
    </div>
     
  )
}

export default App
