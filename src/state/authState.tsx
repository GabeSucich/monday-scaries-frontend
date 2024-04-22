import {Dispatch, PropsWithChildren, createContext, useContext, useReducer} from "react"
import { ModifiedUser } from "../types"

type AuthState = {
    user?: ModifiedUser,
}

type SetUserAction = {
    type: "SET_USER"
    user: ModifiedUser
}

type RemoveUserAction = {
    type: "REMOVE_USER"
}

type AuthAction = SetUserAction | RemoveUserAction

export const AuthStateContext = createContext<AuthState>({})
export const AuthDispatchContext = createContext<Dispatch<AuthAction>>(() => {})

export function useAuthState() {
    return useContext(AuthStateContext)
}

export function useAuthDispatch() {
    return useContext(AuthDispatchContext)
}

function authReducer(authState: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "REMOVE_USER":
            return {...authState, user: undefined}
        case "SET_USER":
            return {...authState, user: action.user}
        default:
            return authState
    }
}

export default function AuthProvider({children}: PropsWithChildren) {
    const initialAuthState: AuthState = {}
    const [state, dispatch] = useReducer(authReducer, initialAuthState)

    return (
        <AuthStateContext.Provider value={state}>
            <AuthDispatchContext.Provider value={dispatch}>
                { children }
            </AuthDispatchContext.Provider>
        </AuthStateContext.Provider>
    )
}

