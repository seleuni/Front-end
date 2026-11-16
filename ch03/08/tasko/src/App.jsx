import { useState } from 'react'
import './App.css'

 function Card(title,children){
    return(
      <>
        <h2>{props.title}</h2>
        <p>{props.content}</p>
      
      </>
    )}


function TaskList({tasks}) {
  return (
    <ul>
      <tasks.map((task)=> (
        <li key={tasks.id}>{tasks.title}</li>
        ))};

    </ul>
  );
}
function App() {
 
  const tasks = [
    {id:1, title: "리액트 공부하기"},
    {id:2, title: "게임하기1"},
    {id:3, title: "게임하기2"},
    {id:4, title: "게임하기3"},
  ]
  }

  return (
    <>

    <h1> 컴포넌트 합성</h1>
    <Card title="공부하기">
    <h2>리액트 공부하기</h2>
    <p> 2시간</p>
    </Card>
    <hr/>
    <Card>
      <TaskList tasks={tasks}/>
    </Card>
    </>
      
  )


export default App
