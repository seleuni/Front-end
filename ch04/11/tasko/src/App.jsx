import { useState } from 'react'
import './App.css'
import NavMenu from "./NavMenu.jsx";
import TaskItem from "./TaskItem.jsx";

function App() {


  return (
   <div>
    <NavMenu/>
    <ul>
      <TaskItem title="리액트 공부하기" isDone={true}/>
      <TaskItem title="네스트 공부하기" isDone={false}/>
    </ul>
   </div>
  )
}

export default App
