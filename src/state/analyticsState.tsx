import { Dispatch, PropsWithChildren, createContext, useContext, useReducer } from "react"
import { QuarterNum, nowDate } from "../../utilities/dateUtilities"
import { useBettorStateUtilities } from "./bettorState"

type AnalyticsState = {
    selectedYear?: number,
    selectedQuarter?: QuarterNum,
    selectedSports: string[],
    selectedBetTypes: string[]
}

type SetTimeFrameAction = {
    type: "SET_TIME_FRAME",
    year: number | undefined,
    quarter: QuarterNum | undefined
}


type SetSelectedSports = {
    type: "SET_SELECTED_SPORTS",
    sports: string[]
}

type SetSelectedBetTypes = {
    type: "SET_SELECTED_BET_TYPES"
    betTypes: string[]
}

type AnalyticsAction = SetTimeFrameAction | SetSelectedSports | SetSelectedBetTypes

export const AnalyticsStateContext = createContext<AnalyticsState>({selectedSports: [], selectedBetTypes: []})
export const AnalyticsDispatchContext = createContext<Dispatch<AnalyticsAction>>(() => {})

export function useAnalyticsState() {
    return useContext(AnalyticsStateContext)
}

export function useAnalyticsDispatch() {
    return useContext(AnalyticsDispatchContext)
}

function analyticsReducer(state: AnalyticsState, action: AnalyticsAction): AnalyticsState {
    switch (action.type) {
        case "SET_TIME_FRAME":
            return {...state, selectedYear: action.year, selectedQuarter: action.quarter}
        case "SET_SELECTED_SPORTS":
            return {...state, selectedSports: action.sports}
        case "SET_SELECTED_BET_TYPES":
            return {...state, selectedBetTypes: action.betTypes}
        default:
            return state
    }
}

export default function AnalyticsProvider({children}: PropsWithChildren) {
    
    const initialState: AnalyticsState = {selectedYear: nowDate().year, selectedBetTypes: [], selectedSports: []}
    const [state, dispatch] = useReducer(analyticsReducer, initialState)

    return (
        <AnalyticsStateContext.Provider value={state}>
            <AnalyticsDispatchContext.Provider value={dispatch}>
                { children }
            </AnalyticsDispatchContext.Provider>
        </AnalyticsStateContext.Provider>
    )
}

export function useAnalyticsStateUtilities() {
    const { allSortedBettorWagerData, allBettorWagersLoaded, bettorWagerErrors , getBettorWagers} = useBettorStateUtilities()
    const analyticsState = useAnalyticsState()
    const {selectedYear, selectedQuarter} = analyticsState

    function analyticsSortedBettorWagerData() {
        return allSortedBettorWagerData({year: selectedYear, quarterNum: selectedQuarter})
    }

    return {
        analyticsDataLoaded: allBettorWagersLoaded,
        analyticsDataError: bettorWagerErrors,
        analyticsSortedBettorWagerData,
        getAnalyticsWagers: getBettorWagers,
        analyticsState
    }
}