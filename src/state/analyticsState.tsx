import { Dispatch, PropsWithChildren, createContext, useContext, useReducer } from "react"
import { QuarterNum, nowDate } from "../../utilities/dateUtilities"
import { BettorWagerSortOpts, BettorWagerSorter, WagerFilterOpts, useBettorStateUtilities } from "./bettorState"

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
    const {selectedYear, selectedQuarter, selectedSports, selectedBetTypes} = analyticsState

    function analyticsSortedBettorWagerData(opts?: {filterByDate?: boolean, filterByDetails?: boolean, bettorWagerSorter?: BettorWagerSorter}) {
        const filterOpts: WagerFilterOpts = {}
        if (opts?.filterByDate) {
            filterOpts.dateDes = {quarterNum: selectedQuarter, year: selectedYear}
        }
        if (opts?.filterByDetails) {
            if (selectedSports.length > 0) {
                filterOpts.sports = selectedSports
            }
            if (selectedBetTypes.length > 0) {
                filterOpts.betTypes = selectedBetTypes
            }
            
        }
        const sortOpts: BettorWagerSortOpts = opts?.bettorWagerSorter ? {
            sorter: opts.bettorWagerSorter
        } : undefined
        return allSortedBettorWagerData(filterOpts, sortOpts)
    }
    
    // function filteredAnalyticsSortedBettorWagerData() {
    //     const unfiltered = analyticsSortedBettorWagerData()
    //     return unfiltered.map()
    // }
    

    return {
        analyticsDataLoaded: allBettorWagersLoaded,
        analyticsDataError: bettorWagerErrors,
        analyticsSortedBettorWagerData,
        getAnalyticsWagers: getBettorWagers,
        analyticsState
    }
}