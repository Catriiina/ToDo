import type { RootState } from "@/app/store"
import {DomainTodolist} from "./todolists-slice.ts";

export const selectTodolists = (state: RootState): DomainTodolist[] => state.todolists
