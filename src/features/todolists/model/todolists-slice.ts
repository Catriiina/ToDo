import {Todolist} from "@/features/todolists/api/todolistsApi.types.ts";
import {todolistsApi} from "@/features/todolists/api/todolistsApi.ts";
import {RootState} from "@/app/store.ts";
import {createAppSlice} from "@/common/utils/createAppSlice.ts";
import {setAppStatusAC} from "@/app/app-slice.ts";
import {RequestStatus} from "@/common/types";

export type FilterValues = "all" | "active" | "completed"

export type DomainTodolist = Todolist & {
    filter: FilterValues
    entityStatus: RequestStatus
}

export const todolistsSlice = createAppSlice({
    name: 'todolists',
    initialState: [] as DomainTodolist[],
    reducers: create => ({
        changeTodolistFilterAC: create.reducer<{ id: string; filter: FilterValues }>(
            (state, action) => {
                const todolist = state.find(todolist => todolist.id === action.payload.id)
                if (todolist) {
                    todolist.filter = action.payload.filter
                }
            }
        ),
        fetchTodolistsTC: create.asyncThunk(
            async (_, { dispatch, rejectWithValue }) => {
                try {
                    dispatch(setAppStatusAC({ status: 'loading' }))
                    const res = await todolistsApi.getTodolists()
                    dispatch(setAppStatusAC({ status: 'succeeded' }))
                    return { todolists: res.data }
                } catch (error) {
                    dispatch(setAppStatusAC({ status: 'failed' }))
                    return rejectWithValue(null)
                }
            },
            {
                fulfilled: (state, action) => {
                    action.payload?.todolists.forEach(tl => {
                        state.push({ ...tl, filter: 'all', entityStatus: 'idle'})
                    })
                },
            }
        ),
        changeTodolistTitleTC: create.asyncThunk(
            async (payload: { id: string; title: string }, { dispatch, rejectWithValue }) => {
                try {
                    dispatch(setAppStatusAC({ status: 'loading' }))
                    await todolistsApi.changeTodolistTitle(payload)
                    dispatch(setAppStatusAC({ status: 'succeeded' }))
                    return payload
                } catch (error) {
                    dispatch(setAppStatusAC({ status: 'failed' }))
                    return rejectWithValue(null)
                }
            },
            {
                fulfilled: (state, action) => {
                    const index = state.findIndex(todolist => todolist.id === action.payload.id)
                    if (index !== -1) {
                        state[index].title = action.payload.title
                    }
                },
            }
        ),
        changeTodolistStatusAC: create.reducer<{ id: string; entityStatus: RequestStatus }>(
            (state, action) => {
                const todolist = state.find(tl => tl.id === action.payload.id)
                if (todolist) {
                    todolist.entityStatus = action.payload.entityStatus
                }
            }
        ),
        createTodolistTC: create.asyncThunk(
            async (title: string, { dispatch, rejectWithValue }) => {
                try {
                    dispatch(setAppStatusAC({ status: 'loading' }))
                    const res = await todolistsApi.createTodolist(title)
                    const newTodolist = res.data.data.item
                    dispatch(setAppStatusAC({ status: 'succeeded' }))
                    return newTodolist
                } catch (error) {
                    dispatch(setAppStatusAC({ status: 'failed' }))
                    return rejectWithValue(null)
                }
            },
            {
                fulfilled: (state, action) => {
                    state.push({ ...action.payload, filter: 'all', entityStatus: 'idle' })
                },
            }
        ),
        deleteTodolistTC: create.asyncThunk(
            async (id: string, { dispatch, rejectWithValue }) => {
                try {
                    dispatch(setAppStatusAC({ status: 'loading' }))
                    dispatch(changeTodolistStatusAC({id , entityStatus: 'loading' }))
                    await todolistsApi.deleteTodolist(id)
                    dispatch(setAppStatusAC({ status: 'succeeded' }))
                    return { id }
                } catch (error) {
                    dispatch(setAppStatusAC({ status: 'failed' }))
                    return rejectWithValue(null)
                }
            },
            {
                fulfilled: (state, action) => {
                    const index = state.findIndex(todolist => todolist.id === action.payload.id)
                    if (index !== -1) {
                        state.splice(index, 1)
                    }
                },
            }
        ),
    }),
})

export const { changeTodolistStatusAC, deleteTodolistTC, createTodolistTC, changeTodolistFilterAC, fetchTodolistsTC, changeTodolistTitleTC } = todolistsSlice.actions

export const todolistsReducer = todolistsSlice.reducer

export const selectTodolists = (state: RootState): DomainTodolist[] => state.todolists
