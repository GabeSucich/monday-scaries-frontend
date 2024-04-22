import {createContext, useContext, ReactElement, PropsWithChildren} from "react"
import { AuthAPI, BettorAPI, WagerAPI } from "../apis"
import { useAuthDispatch } from "./authState"

export type ApiState = {
    auth: AuthAPI,
    wager: WagerAPI,
    bettor: BettorAPI
}

export const ApiContext = createContext<ApiState>({
    auth: new AuthAPI(),
    wager: new WagerAPI(),
    bettor: new BettorAPI()
})

export function useApiState() {
    return useContext(ApiContext)
}


export function ApiProvider({children}: PropsWithChildren) {

    const authDispatch = useAuthDispatch()
    
    function onNotLoggedIn() {
        return new Promise((resolve, reject) => {
            authDispatch({type: "REMOVE_USER"})
            resolve(true)
        })
    }

    const apiState = {
        auth: new AuthAPI(onNotLoggedIn),
        wager: new WagerAPI(onNotLoggedIn),
        bettor: new BettorAPI(onNotLoggedIn)
    }

    return(
        <ApiContext.Provider value={apiState}>
            {children}
        </ApiContext.Provider>
    )
    
}