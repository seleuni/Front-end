import styles from "./TaskItem.module.css";

function TaskItem({title, isDone}){
  return(
    <div>
      <li className={`${styles.item} ${isDone? styles.done:""}`}>{title}</li>
    </div>
  );
}

export default TaskItem