import { beforeEach, expect, test } from "vitest"
import {
  createTaskTC,
  deleteTaskTC,
  updateTaskTC,
  tasksReducer,
} from "../tasks-slice.ts"
import { createTodolistTC, deleteTodolistTC } from "../todolists-slice.ts"
import { DomainTask } from "@/features/todolists/api/tasksApi.types"
import { TasksState } from "../tasks-slice.ts"
import {TaskPriority, TaskStatus} from "@/common/enums";


let startState: TasksState

const taskDefaultValues = {
  description: "",
  deadline: "",
  addedDate: "",
  startDate: "",
  priority: TaskPriority.Low,
  order: 0,
}

beforeEach(() => {
  startState = {
    todolistId1: [
      {
        id: "1",
        title: "CSS",
        status: TaskStatus.New,
        todoListId: "todolistId1",
        ...taskDefaultValues,
      },
      {
        id: "2",
        title: "JS",
        status: TaskStatus.Completed,
        todoListId: "todolistId1",
        ...taskDefaultValues,
      },
      {
        id: "3",
        title: "React",
        status: TaskStatus.New,
        todoListId: "todolistId1",
        ...taskDefaultValues,
      },
    ],
    todolistId2: [
      {
        id: "1",
        title: "bread",
        status: TaskStatus.New,
        todoListId: "todolistId2",
        ...taskDefaultValues,
      },
      {
        id: "2",
        title: "milk",
        status: TaskStatus.Completed,
        todoListId: "todolistId2",
        ...taskDefaultValues,
      },
      {
        id: "3",
        title: "tea",
        status: TaskStatus.New,
        todoListId: "todolistId2",
        ...taskDefaultValues,
      },
    ],
  }
})

test("correct task should be deleted", () => {
  const endState = tasksReducer(
      startState,
      deleteTaskTC.fulfilled(
          { todolistId: "todolistId2", taskId: "2" },
          "requestId",
          { todolistId: "todolistId2", taskId: "2" }
      )
  )

  expect(endState.todolistId2.length).toBe(2)
  expect(endState.todolistId2.find(t => t.id === "2")).toBeUndefined()
})

test("correct task should be created at correct array", () => {
  const newTask: DomainTask = {
    id: "4",
    title: "juice",
    status: TaskStatus.New,
    todoListId: "todolistId2",
    ...taskDefaultValues,
  }

  const endState = tasksReducer(
      startState,
      createTaskTC.fulfilled(
          { task: newTask },
          "requestId",
          { todolistId: "todolistId2", title: "juice" }
      )
  )

  expect(endState.todolistId2.length).toBe(4)
  expect(endState.todolistId2[0]).toEqual(newTask)
})

test("correct task should change its status", () => {
  const updatedTask: DomainTask = {
    ...startState.todolistId2[1],
    status: TaskStatus.New,
  }

  const endState = tasksReducer(
      startState,
      updateTaskTC.fulfilled(
          { task: updatedTask },
          "requestId",
          {
            todolistId: "todolistId2",
            taskId: "2",
            domainModel: { status: TaskStatus.New },
          }
      )
  )

  expect(endState.todolistId2[1].status).toBe(TaskStatus.New)
  expect(endState.todolistId1[1].status).toBe(TaskStatus.Completed)
})

test("correct task should change its title", () => {
  const updatedTask: DomainTask = {
    ...startState.todolistId2[1],
    title: "coffee",
  }

  const endState = tasksReducer(
      startState,
      updateTaskTC.fulfilled(
          { task: updatedTask },
          "requestId",
          {
            todolistId: "todolistId2",
            taskId: "2",
            domainModel: { title: "coffee" },
          }
      )
  )

  expect(endState.todolistId2[1].title).toBe("coffee")
  expect(endState.todolistId1[1].title).toBe("JS")
})

test("array should be created for new todolist", () => {
  const endState = tasksReducer(
      startState,
      createTodolistTC.fulfilled(
          { id: "todolistId3", title: "New todolist", addedDate: "", order: 0 },
          "requestId",
          "New todolist"
      )
  )

  expect(endState["todolistId3"]).toEqual([])
})

test("property with todolistId should be deleted", () => {
  const endState = tasksReducer(
      startState,
      deleteTodolistTC.fulfilled(
          { id: "todolistId2" },
          "requestId",
          "todolistId2"
      )
  )

  expect(endState["todolistId2"]).toBeUndefined()
  expect(Object.keys(endState).length).toBe(1)
})
