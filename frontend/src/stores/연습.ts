
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MeResponse, LoginUser, Tokens } from "@/types/auth";

interface AuthState{
    user: LoginUser |  MeResponse | null;
    tokens: Tokens | null;
    setUser: (user)=>void;
    setToken: (user)=>void;
    setClear: ()=>void;
}

export const useAuthStore = create<AuthState>(
    persist(
        (set)=>{
            user: null;
            tokens: null;
            (setUser)=>{user: setUser};
            (tokens)=>{tokens: tokens};
            setClear: ()=>{user: null, tokens: null
                localStorage.removeItem('auth-store')
            };
        }
        name = ('auth-store')
    )
)