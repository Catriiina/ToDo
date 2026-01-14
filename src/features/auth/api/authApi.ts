import {BaseResponse} from "@/common/types";
import {instance} from "@/common/instance";
import {LoginInputs} from "@/features/auth/lib/schemas/loginSchema.ts";

export const authApi = {
    login(payload: LoginInputs) {
        return instance.post<BaseResponse<{ userId: number; token: string }>>('auth/login', payload)
    },
    logout() {
        return instance.delete<BaseResponse>('auth/login')
    },
}