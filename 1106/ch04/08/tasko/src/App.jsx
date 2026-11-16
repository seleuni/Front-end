import { useState } from 'react'
import {createPortal} from 'react-dom'
import './Modal.css'
import './App.css'

function ModalBox({message, onClose}) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <p>{message}</p>
        <button onClick={onClose}>닫기</button> 

      </div>
    </div>

  )
}

function ConfirmModal({message, onClose}){
  return createPortal(
    <ModalBox message={message} onClose={onClose}/>,
    document.body, //실제로는 body 바로 아래 렌더링됨

  );

}
function TaskItem({usePortal}){
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);
  return (

   
    <li className="clip-box">
     {usePortal? "포탈사용":"포탈없이" }
      할 일 목록 {""}
      <button onClick={()=>open()}>삭제</button>

      {
        isOpen &&
        ( 
          usePortal? (
          <div>
            <p> 사용</p>
            <ConfirmModal message="정말 삭제할까요?" onClose={close}/>
            </div>
            ) : (
            <div>
            <p>사용 안함</p>
            <ModalBox message="정말 삭제할까요?" onClose={close}/>
            </div>
          )
        )
      }
      
    </li>
  
  )
}
function App() {

  return (
  <ul>
    <TaskItem usePortal={false}/>
    <TaskItem usePortal={true}/>

  </ul>

  
  );
}

export default App

// 커밋안되서 비교못함;;;;;;아...