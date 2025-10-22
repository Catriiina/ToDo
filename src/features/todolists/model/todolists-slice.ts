import {createAsyncThunk, createSlice, nanoid} from "@reduxjs/toolkit"
import {Todolist} from "@/features/todolists/api/todolistsApi.types.ts";
import {todolistsApi} from "@/features/todolists/api/todolistsApi.ts";

export type FilterValues = "all" | "active" | "completed"

export type DomainTodolist = Todolist & {
    filter: FilterValues
}


export const todolistsSlice = createSlice({
  name: 'todolists',
  initialState: [] as DomainTodolist[],
    extraReducers: builder => {
        builder
            .addCase(fetchTodolistsTC.fulfilled, (state, action) => {
                return action.payload.todolists.map(tl => {
                    return { ...tl, filter: 'all' }
                })
            })
            .addCase(fetchTodolistsTC.rejected, (state, action) => {
            })
            .addCase(changeTodolistTitleTC.fulfilled, (state, action) => {
                const index = state.findIndex(todolist => todolist.id === action.payload.id)
                if (index !== -1) {
                    state[index].title = action.payload.title
                }
            })
    },
  reducers: create => ({
    createTodolistAC: create.preparedReducer(
        (title: string) => ({ payload: { title, id: nanoid(), addedDate: new Date().toISOString(), order: 0 } }),
        (state, action) => {
          state.push({ ...action.payload, filter: 'all' })
        }
    ),
    deleteTodolistAC: create.reducer<{ id: string }>((state, action) => {
      const index = state.findIndex(todolist => todolist.id === action.payload.id)
      if (index !== -1) {
        state.splice(index, 1)
      }
    }),
    /* changeTodolistTitleAC: create.reducer<{ id: string; title: string }>((state, action) => {
      const index = state.findIndex(todolist => todolist.id === action.payload.id)
      if (index !== -1) {
        state[index].title = action.payload.title
      }
    }), */
    changeTodolistFilterAC: create.reducer<{ id: string; filter: FilterValues }>(
        (state, action) => {
          const todolist = state.find(todolist => todolist.id === action.payload.id)
          if (todolist) {
            todolist.filter = action.payload.filter
          }
        }
    ),
  }),
})

export const { deleteTodolistAC,
    createTodolistAC,
    changeTodolistFilterAC} =
    todolistsSlice.actions

export const todolistsReducer = todolistsSlice.reducer

export const fetchTodolistsTC = createAsyncThunk(
    `${todolistsSlice.name}/fetchTodolistsTC`,
    async (_, thunkAPI) => {
        try {
            const res = await todolistsApi.getTodolists()
            return { todolists: res.data }
        } catch (error) {
            return thunkAPI.rejectWithValue(null)
        }
    }
)

export const changeTodolistTitleTC = createAsyncThunk(
    `${todolistsSlice.name}/changeTodolistTitleTC`,
    async (payload: { id: string; title: string }, thunkAPI) => {
        try {
            await todolistsApi.changeTodolistTitle(payload)
            return payload
        } catch (error) {
            return thunkAPI.rejectWithValue(error)
        }
    }
)