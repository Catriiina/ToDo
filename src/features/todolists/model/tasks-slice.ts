import { createSlice, nanoid } from "@reduxjs/toolkit"
import {createTodolistTC, deleteTodolistTC, fetchTodolistsTC} from "./todolists-slice.ts"

export type Task = {
    id: string
    title: string
    isDone: boolean
}

export type TasksState = Record<string, Task[]>

export const tasksSlice = createSlice({
    name: 'tasks',
    initialState: {} as TasksState,
    reducers: create => ({
        deleteTaskAC: create.reducer<{ todolistId: string; taskId: string }>((state, action) => {
            const tasks = state[action.payload.todolistId]
            if (!tasks) return
            const index = tasks.findIndex((task) => task.id === action.payload.taskId)
            if (index !== -1) {
                tasks.splice(index, 1)
            }
        }),
        createTaskAC: create.reducer<{ todolistId: string; title: string }>((state, action) => {
            if (!state[action.payload.todolistId]) {
                state[action.payload.todolistId] = []
            }

            const newTask: Task = {
                title: action.payload.title,
                isDone: false,
                id: nanoid()
            }
            state[action.payload.todolistId].unshift(newTask)
        }),
        changeTaskStatusAC: create.reducer<{ todolistId: string; taskId: string; isDone: boolean }>(
            (state, action) => {
                const tasks = state[action.payload.todolistId]
                if (!tasks) return
                const task = tasks.find((task) => task.id === action.payload.taskId)
                if (task) {
                    task.isDone = action.payload.isDone
                }
            }
        ),
        changeTaskTitleAC: create.reducer<{ todolistId: string; taskId: string; title: string }>(
            (state, action) => {
                const tasks = state[action.payload.todolistId]
                if (!tasks) return
                const task = tasks.find((task) => task.id === action.payload.taskId)
                if (task) {
                    task.title = action.payload.title
                }
            }
        ),
    }),
    extraReducers: builder => {
        builder
            .addCase(fetchTodolistsTC.fulfilled, (state, action) => {
                action.payload.todolists.forEach(tl => {
                    state[tl.id] = []
                })
            })
            .addCase(createTodolistTC.fulfilled, (state, action) => {
                state[action.payload.id] = []
            })
            .addCase(deleteTodolistTC.fulfilled, (state, action) => {
                delete state[action.payload.id]
            })
    },
})

export const { deleteTaskAC, createTaskAC, changeTaskStatusAC, changeTaskTitleAC } = tasksSlice.actions
export const tasksReducer = tasksSlice.reducer