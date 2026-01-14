import {LoginInputs} from "@/features/auth/lib/schemas/loginSchema.ts";
import {createAppSlice} from "@/common/utils/createAppSlice.ts";
import {setAppStatusAC} from "@/app/app-slice.ts";
import {authApi} from "@/features/auth/api/authApi.ts";
import {handleServerAppError, handleServerNetworkError} from "@/common/utils";
import {RootState} from "@/app/store.ts";
import { AUTH_TOKEN } from '@/common/constants'
import {ResultCode} from "@/common/enums";


export const authSlice = createAppSlice({
    name: 'auth',
    initialState: {
        isLoggedIn: false,
    },
    reducers: create => ({
        loginTC: create.asyncThunk(
            async (data: LoginInputs, { dispatch, rejectWithValue }) => {
                try {
                    dispatch(setAppStatusAC({ status: 'loading' }))
                    const res = await authApi.login(data)

                    if (res.data.resultCode === 0) {
                        dispatch(setAppStatusAC({ status: 'succeeded' }))
                        localStorage.setItem(AUTH_TOKEN, res.data.data.token)
                        return { isLoggedIn: true }
                    } else {
                        handleServerAppError(res.data, dispatch)
                        return rejectWithValue(null)
                    }
                } catch (error) {
                    handleServerNetworkError(error, dispatch)
                    return rejectWithValue(null)
                }
            },
            {
                fulfilled: (state, action) => {
                    state.isLoggedIn = action.payload.isLoggedIn
                },
            }
        ),
        logoutTC: create.asyncThunk(
            async (_, { dispatch, rejectWithValue }) => {
                try {
                    dispatch(setAppStatusAC({ status: 'loading' }))
                    const res = await authApi.logout()

                    if (res.data.resultCode === ResultCode.Success) {
                        dispatch(setAppStatusAC({ status: 'succeeded' }))
                        localStorage.removeItem(AUTH_TOKEN)
                        return { isLoggedIn: false }
                    } else {
                        handleServerAppError(res.data, dispatch)
                        return rejectWithValue(null)
                    }
                } catch (error) {
                    handleServerNetworkError(error, dispatch)
                    return rejectWithValue(null)
                }
            },
            {
                fulfilled: (state, action) => {
                    state.isLoggedIn = action.payload.isLoggedIn
                },
            }
        ),
    }),
})

export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const { loginTC, logoutTC } = authSlice.actions
export const authReducer = authSlice.reducer