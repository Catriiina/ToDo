import { EditableSpan } from "@/common/components/EditableSpan/EditableSpan"
import { useAppDispatch } from "@/common/hooks"
import {
  updateTaskTC , deleteTaskTC
} from "@/features/todolists/model/tasks-slice.ts"
import DeleteIcon from "@mui/icons-material/Delete"
import Checkbox from "@mui/material/Checkbox"
import IconButton from "@mui/material/IconButton"
import ListItem from "@mui/material/ListItem"
import type { ChangeEvent } from "react"
import { getListItemSx } from "./TaskItem.styles"
import {DomainTask} from "@/features/todolists/api/tasksApi.types.ts";
import {TaskStatus} from "@/common/enums";
import {DomainTodolist} from "@/features/todolists/model/todolists-slice.ts";

type Props = {
  task: DomainTask
  todolistId: string
  todolist: DomainTodolist
}

export const TaskItem = ({ task, todolistId, todolist }: Props) => {

  const dispatch = useAppDispatch()

  const isTaskCompleted = task.status === TaskStatus.Completed
  const isDisabled = todolist.entityStatus === 'loading'
  const deleteTask = () => {
    dispatch(deleteTaskTC({ todolistId, taskId: task.id }))
  }

  const changeTaskStatus = (e: ChangeEvent<HTMLInputElement>) => {
    const newStatusValue = e.currentTarget.checked
    dispatch(updateTaskTC ({ todolistId, taskId: task.id, domainModel: { status: newStatusValue ? TaskStatus.Completed : TaskStatus.New }  }))
  }

  const changeTaskTitle = (title: string) => {
    dispatch(updateTaskTC ({ todolistId, taskId: task.id, domainModel: { title } }))
  }

  return (
    <ListItem sx={getListItemSx(isTaskCompleted)}>
      <div>
        <span>{new Date(task.addedDate).toLocaleDateString()}</span>
        <Checkbox checked={isTaskCompleted} onChange={changeTaskStatus} disabled={isDisabled}/>
        <EditableSpan value={task.title} onChange={changeTaskTitle} disabled={isDisabled} />
      </div>
      <IconButton onClick={deleteTask} disabled={isDisabled}>
        <DeleteIcon />
      </IconButton>
    </ListItem>
  )
}
