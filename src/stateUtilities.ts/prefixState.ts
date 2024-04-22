
import React, {useState} from "react"

export function usePrefixState(prefix: string, initialVal?: string, _addPrefixCond?: (val: string) => boolean): [string, (s: string) => void] {
    function addPrefixCond(val: string)  {
        const cond1 = val
        const cond2 = !val.startsWith(prefix)
        const cond3 = _addPrefixCond ? _addPrefixCond(val) : true
        return cond1 && cond2 && cond3
    }

    function converter(val: string) {
        if (addPrefixCond(val)) {
            return `${prefix}${val}`
        }
        return val
    }

    function setState(val: string) {
        _setRawState(converter(val))
    }

    const [state, _setRawState] = useState<string>(initialVal ? converter(initialVal) : '')

    return [state, setState]
}

export function useFormattedState(formatter: (s: string) => string, initialVal?: string, _formatCond?: (val: string) => string): [string, (s: string) => void] {
    function formatCond(val: string) {
        const cond1 = val
        const cond2 = formatter(val) !== val
        const cond3 = _formatCond ? _formatCond(val) : true
        return cond1 && cond2 && cond3
    }

    function converter(val: string) {
        if (formatCond(val)) {
            return formatter(val)
        }
        return val
    }

    const [state, _setRawState] = useState<string>(initialVal ? converter(initialVal): '')

    function setState(val: string) {
        _setRawState(converter(val))
    }

    return [state, setState]
}