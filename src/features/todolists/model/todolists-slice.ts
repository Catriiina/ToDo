import {createAsyncThunk} from "@reduxjs/toolkit"
import {Todolist} from "@/features/todolists/api/todolistsApi.types.ts";
import {todolistsApi} from "@/features/todolists/api/todolistsApi.ts";
import {RootState} from "@/app/store.ts";
import {createAppSlice} from "@/common/utils/createAppSlice.ts";
import {setAppStatusAC} from "@/app/app-slice.ts";

export type FilterValues = "all" | "active" | "completed"

export type DomainTodolist = Todolist & {
    filter: FilterValues
}

export const changeTodolistTitleTC = createAsyncThunk(
    `todolists/changeTodolistTitleTC`,
    async (payload: { id: string; title: string }, thunkAPI) => {
        try {
            await todolistsApi.changeTodolistTitle(payload)
            return payload
        } catch (error) {
            return thunkAPI.rejectWithValue(error)
        }
    }
)

export const createTodolistTC = createAsyncThunk(
    `todolists/createTodolistTC`,
    async (title: string, thunkAPI) => {
        try {
            const res = await todolistsApi.createTodolist(title)
            const newTodolist = res.data.data.item
            return newTodolist
        } catch (error) {
            return thunkAPI.rejectWithValue(error)
        }
    }
)

export const deleteTodolistTC = createAsyncThunk(
    `todolists/deleteTodolistTC`,
    async (id: string, thunkAPI) => {
        try {
            await todolistsApi.deleteTodolist(id)
            return { id }
        } catch (error) {
            return thunkAPI.rejectWithValue(error)
        }
    }
)


export const todolistsSlice = createAppSlice({
    name: 'todolists',
    initialState: [] as DomainTodolist[],
    extraReducers: builder => {
        builder
            .addCase(changeTodolistTitleTC.fulfilled, (state, action) => {
                const index = state.findIndex(todolist => todolist.id === action.payload.id)
                if (index !== -1) {
                    state[index].title = action.payload.title
                }
            })
            .addCase(createTodolistTC.fulfilled, (state, action) => {
                state.push({ ...action.payload, filter: 'all' })
            })
            .addCase(deleteTodolistTC.fulfilled, (state, action) => {
                const index = state.findIndex(todolist => todolist.id === action.payload.id)
                if (index !== -1) {
                    state.splice(index, 1)
                }
            })
    },
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
                        state.push({ ...tl, filter: 'all' })
                    })
                },
            }
        ),
    }),
})

export const { changeTodolistFilterAC, fetchTodolistsTC } = todolistsSlice.actions

export const todolistsReducer = todolistsSlice.reducer

export const selectTodolists = (state: RootState): DomainTodolist[] => state.todolists
