import {createTodolistTC, deleteTodolistTC, fetchTodolistsTC} from "./todolists-slice.ts"
import {RootState} from "@/app/store.ts";
import {createAppSlice} from "@/common/utils/createAppSlice.ts";
import {tasksApi} from "@/features/todolists/api/tasksApi.ts";
import { TaskStatus} from "@/common/enums";
import {DomainTask, UpdateTaskModel} from "@/features/todolists/api/tasksApi.types.ts";
import {setAppStatusAC} from "@/app/app-slice.ts";

export type TasksState = Record<string, DomainTask[]>

export const tasksSlice = createAppSlice({
    name: 'tasks',
    initialState: {} as TasksState,
    reducers: create => ({
        fetchTasksTC: create.asyncThunk(
            async (todolistId: string, { dispatch, rejectWithValue }) => {
                try {
                    dispatch(setAppStatusAC({ status: 'loading' }))
                    const res = await tasksApi.getTasks(todolistId)
                    dispatch(setAppStatusAC({ status: 'succeeded' }))
                    return { todolistId, tasks: res.data.items }
                } catch (error) {
                    dispatch(setAppStatusAC({ status: 'failed' }))
                    return rejectWithValue(null)
                }
            },
            {
                fulfilled: (state, action) => {
                    state[action.payload.todolistId] = action.payload.tasks
                },
            }
        ),
        deleteTaskTC: create.asyncThunk(
            async (payload: { todolistId: string; taskId: string }, thunkAPI) => {
                try {
                    await tasksApi.deleteTask(payload)
                    return payload
                } catch (error) {
                    return thunkAPI.rejectWithValue(null)
                }
            },
            {
                fulfilled: (state, action) => {
                    const tasks = state[action.payload.todolistId]
                    const index = tasks.findIndex((task) => task.id === action.payload.taskId)
                    if (index !== -1) {
                        tasks.splice(index, 1)
                    }
                },
            }
        ),
        createTaskTC: create.asyncThunk(
            async (payload: { todolistId: string; title: string }, { dispatch, rejectWithValue }) => {
                try {
                    dispatch(setAppStatusAC({ status: 'loading' }))
                    const res = await tasksApi.createTask(payload)
                    dispatch(setAppStatusAC({ status: 'succeeded' }))
                    return { task: res.data.data.item }
                } catch (error) {
                    dispatch(setAppStatusAC({ status: 'failed' }))
                    return rejectWithValue(null)
                }
            },
            {
                fulfilled: (state, action) => {
                    state[action.payload.task.todoListId].unshift(action.payload.task)
                },
            }
        ),
        changeTaskStatusTC: create.asyncThunk(
            async (payload: { todolistId: string; taskId: string, status: TaskStatus }, thunkAPI) => {
                const {todolistId, taskId, status} = payload

                const allTodolistTasks = (thunkAPI.getState() as RootState).tasks[todolistId]
                const task = allTodolistTasks.find(task => task.id === taskId)

                if (!task) {
                    return thunkAPI.rejectWithValue(null)
                }

                const model: UpdateTaskModel = {
                    description: task.description,
                    title: task.title,
                    priority: task.priority,
                    startDate: task.startDate,
                    deadline: task.deadline,
                    status,
                }

                try {
                    const res = await tasksApi.updateTask({todolistId, taskId, model})
                    return { task: res.data.data.item }
                } catch (error) {
                    return thunkAPI.rejectWithValue(null)
                }
            },
            {
                fulfilled: (state, action) => {
                    const task = state[action.payload.task.todoListId].find((task) => task.id === action.payload.task.id)
                    if (task) {
                        task.status = action.payload.task.status
                    }
                },
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

export const {deleteTaskTC, createTaskTC, fetchTasksTC, changeTaskStatusTC, changeTaskTitleAC } = tasksSlice.actions
export const tasksReducer = tasksSlice.reducer

export const selectTasks = (state: RootState): TasksState => state.tasks