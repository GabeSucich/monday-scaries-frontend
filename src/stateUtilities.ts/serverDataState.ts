import { useState } from "react";
import { Result } from "../apis/AbstractAPI";
import { useAlertState } from "./alertState";

type ReturnType<T> = [T | undefined, (b: () => Promise<Result<T>>, t?: number) => void, boolean, string | null, () => void]

export function useServerDataState<T>(opts?: {initial?: T, defaultTimeout?: number, hideAlertsAutomatically?: boolean}): ReturnType<T> {

    const [serverErrorState, updateErrorState, clearErrorState] = useAlertState<string>(undefined, {defaultTimeout: opts?.defaultTimeout, hideAutomatically: opts?.hideAlertsAutomatically})

    const [serverData, setServerData] = useState<T | null>(opts?.initial ?? null)
    const [loading, setLoading] = useState(false)

    function clearState() {
        clearErrorState()
        setServerData(null)
        setLoading(false)
    }
    
    function fetchServerData(block: () => Promise<Result<T>>, errorTimeout?: number) {
        setLoading(true)
        block().then(res => {
            if (res.responseError) {
                updateErrorState(res.responseError, errorTimeout)
            } else if (res.data !== undefined) {
                setServerData(res.data)
            } else {
                updateErrorState(`The server responded with neither data or an error`, errorTimeout)
            }
        }).catch(e => {
            updateErrorState(`There was an unhandled server error: ${e}`, errorTimeout)
        }).finally(() => {
            setLoading(false)
        })
    }

    return [serverData as T | null, fetchServerData, loading, serverErrorState, clearState]
    
}