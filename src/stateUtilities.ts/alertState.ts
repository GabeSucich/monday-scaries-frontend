import { useState } from "react";

export function useAlertState<T>(initial?: T, opts?: {defaultTimeout?: number, hideAutomatically?: boolean}): [T | null, (a: T, t?: number | false | undefined) => void, () => void] {
    const defaultTimeout = opts?.defaultTimeout ?? 5000
    const hideAutomatically = opts?.hideAutomatically ?? false
    const [alert, setAlert] = useState<T | null>(initial ?? null)
    const [alertTimeout, setAlertTimeout] = useState<NodeJS.Timeout | null>(null)

    function clearAlertTimeout() {
        if (alertTimeout){
            clearTimeout(alertTimeout)
            setAlertTimeout(null)
        }
    }

    function clearAlert() {
        setAlert(null)
        clearAlertTimeout()
    }

    function startAlertTimeout(timeout: number) {
        setAlertTimeout(setTimeout(() => {
            clearAlert()
        }, timeout))
    }

    function updateAlert(alert: T, useTimeout?: number | false) {
        clearAlertTimeout()
        setAlert(alert)
        if (hideAutomatically && useTimeout !== false) {
            const timeout = useTimeout ?? defaultTimeout
            startAlertTimeout(timeout)
        }
    }


    return [alert, updateAlert, clearAlert]

}