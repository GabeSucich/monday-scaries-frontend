import {Dispatch, PropsWithChildren, createContext, useCallback, useContext, useEffect, useReducer, useState} from "react"
import { Bettor, BettorGroup, ModifiedUser, User, Wager } from "../types"
import { useServerDataState } from "../stateUtilities.ts/serverDataState"
import { ApiState, useApiState } from "./apiState"
import { useBettorGroupsDispatch } from "./bettorGroupsState"
import { bettorProfit, sortWagers } from "../../utilities/bettorUtilities"

export type BettorWagerData = {
    bettor: Bettor,
    user: User,
    wagers?: Wager[],
    loading?: boolean,
    error?: string
}

type BettorState = {
    user: ModifiedUser
    bettor: Bettor
    bettorGroup: BettorGroup
    wagers: Wager[]
    allBettorWagers: {[key: string]: BettorWagerData}
    betTypes: {
        loading?: boolean,
        data?: string[],
        error?: string 
    }
    sports: {
        loading?: boolean,
        data?: string[],
        error?: string
    }
}

type SetWagersAction = {
    type: "SET_WAGERS"
    wagers: Wager[]
}

type SetBetTypesAction = {
    type: "SET_BET_TYPES",
    betTypes: {
        loading?: boolean,
        data?: string[],
        error?: string
    }
}

type SetSportsAction = {
    type: "SET_SPORTS",
    sports: {
        loading?: boolean
        data?: string[],
        error?: string
    }
}

type UpdateWagerAction = {
    type: "UPDATE_WAGER",
    wager: Wager
}

type UpdateBettorAction = {
    type: "UPDATE_BETTOR",
    bettor: Bettor
}

type UpdateBettorWagerData = {
    type: "UPDATE_BETTOR_WAGER_DATA"
    bettorWagerData: BettorWagerData[]
}

type BettorAction = SetWagersAction | SetBetTypesAction | SetSportsAction | UpdateWagerAction | UpdateBettorAction | UpdateBettorWagerData

const BettorStateContext = createContext<BettorState>({} as BettorState)
const BettorDispatchContext = createContext<Dispatch<BettorAction>>(() => {})

export function useBettorState() {
    return useContext(BettorStateContext)
}

export function useBettorDispatch() {
    return useContext(BettorDispatchContext)
}


function bettorReducer(state: BettorState, action: BettorAction): BettorState {
    switch (action.type) {
        case "SET_WAGERS":
            return {...state, wagers: sortWagers(action.wagers)}
        case "SET_BET_TYPES":
            return {...state, betTypes: action.betTypes}
        case "SET_SPORTS":
            return {...state, sports: action.sports}
        case "UPDATE_WAGER":
            const updatedWagers = [] as Wager[]
            let replaced = false;
            state.wagers.forEach(w => {
                if (w._id === action.wager._id) {
                    updatedWagers.push(action.wager)
                    replaced = true
                } else {
                    updatedWagers.push(w)
                }
            })
            if (!replaced) {
                updatedWagers.push(action.wager)
            }
            return {...state, wagers: sortWagers(updatedWagers)}
        case "UPDATE_BETTOR":
            return {...state, bettor: action.bettor}
        case "UPDATE_BETTOR_WAGER_DATA":
            let newBettorWagers = {...state.allBettorWagers}
            for (const data of action.bettorWagerData) {
                newBettorWagers[data.bettor._id] = data
            }
            return {...state, allBettorWagers: newBettorWagers}
        default:
            return state
    }
}

interface BettorProviderProps extends PropsWithChildren {
    user: ModifiedUser
    bettor: Bettor
    bettorGroup: BettorGroup
}

export default function BettorProvider({user, bettor, children, bettorGroup}: BettorProviderProps) {
    const initialState = {
        user,
        bettor,
        bettorGroup,
        wagers: [],
        allBettorWagers: {

        },
        betTypes: {
            loading: true
        },
        sports: {
            loading: true
        }
    } as BettorState
    const [state, dispatch] = useReducer(bettorReducer, initialState)

    const apiState = useApiState()
    const bettorGroupsDispatch = useBettorGroupsDispatch()
    const [betTypes, getBetTypesWrapper, betTypesLoading, betTypesError] = useServerDataState<string[]>()
    const [sports, getSportsWrapper, sportsLoading, sportsError] = useServerDataState<string[]>()

    useEffect(() => {
        getBetTypesWrapper(
            () => apiState.wager.getBetTypes()
        )
        getSportsWrapper(
            () => apiState.wager.getSports()
        )
    }, [])

    useEffect(() => {
        apiState.bettor.byId(state.bettor._id).then(({data, responseError}) => {
            if (data) {
                dispatch({type:"UPDATE_BETTOR", bettor: data})
            }
        })
    }, [state.wagers])

    useEffect(() => {
        if (state.bettor) {
            bettorGroupsDispatch({type: "UPDATE_BETTOR", bettor: state.bettor})
        }
    }, [state.bettor])

    useEffect(() => {
        if (betTypes || betTypesError) {
            dispatch({type: "SET_BET_TYPES", betTypes: {data: betTypes ?? undefined, error: betTypesError ?? undefined} })
        }
    }, [betTypes, betTypesError])

    useEffect(() => {
        if (sports || sportsError) {
            dispatch({type: "SET_SPORTS", sports: {data: sports ?? undefined, error: sportsError ?? undefined}})
        }
    }, [sports, sportsError])

    return (
        <BettorStateContext.Provider value={state}>
            <BettorDispatchContext.Provider value={dispatch}>
                {children}
            </BettorDispatchContext.Provider>
        </BettorStateContext.Provider>
    )

}

export function useBettorStateUtilities(opts?: {useEffects?: boolean}) {

    const bettorState = useBettorState()
    const bettorDispatch = useBettorDispatch()
    const apiState = useApiState()

    const [bettorGroupBettors, getterWrapper, loadingBettors, serverError] = useServerDataState<Bettor[]>({hideAlertsAutomatically: false})
    const [refreshing, setRefreshing] = useState(false)

    async function updateBettorWagerData(bettor: Bettor) {
        return apiState.wager.bettorWagers(bettor._id).then(result => {
            bettorDispatch({type: "UPDATE_BETTOR_WAGER_DATA", bettorWagerData: [{
                bettor,
                user: bettor.user as User,
                wagers: result.data,
                loading: false,
                error: result.axiosError || result.responseError
            }]})
            return result
        })
    }

    function refreshBettorWagerData() {
        const bettors = Object.values(bettorState.allBettorWagers).map(d => d.bettor)
        setRefreshing(true)
        if (bettors.length === 0) {
            return
        }
        let updatePromises = bettors.map(updateBettorWagerData)
        Promise.all(updatePromises).then(() => {
            setRefreshing(false)
        })
    }

    if (opts?.useEffects) {
        useEffect(() => {
            getterWrapper(
                () => apiState.bettor.bettorGroupBettors(bettorState.bettorGroup._id)
            )
        }, [])
    
        useEffect(() => {
            if (bettorGroupBettors?.length > 0) {
                bettorDispatch({type: "UPDATE_BETTOR_WAGER_DATA", bettorWagerData: bettorGroupBettors.map(b => ({
                    bettor: b,
                    user: b.user as User,
                    loading: true,
                }))})
                bettorGroupBettors.forEach(updateBettorWagerData)
            }
        }, [bettorGroupBettors])
    }

    function allBettorWagersLoaded() {
        return bettorGroupBettors?.every(b => {
            return bettorState.allBettorWagers[b._id]?.wagers !== undefined
        })
    }

    function bettorWagerErrors() {
        const errors: string[] = []
        Object.values(bettorState.allBettorWagers).forEach(b => {
            if (b.error) {
                errors.push(`There was an error loading the data for user ${b.user.firstName} ${b.user.lastName}: ${b.error}`)
            }
        })
        return errors
    }

    function sortedBettors(bettors: BettorWagerData[]) {
        return [...bettors].sort((b1, b2) => bettorProfit(b2.bettor, b2.wagers ?? []) - bettorProfit(b1.bettor, b1.wagers ?? []))
    }

    function sortedBettorWagerData() {
        return sortedBettors(Object.values(bettorState.allBettorWagers)).map(d => ({
            bettor: d.bettor,
            user: d.user,
            wagers: d.wagers ?? []
        }))
    }

    return {
        bettorGroupBettorsServerData: [bettorGroupBettors, getterWrapper, loadingBettors, serverError],
        allBettorWagersLoaded,
        bettorWagerErrors,
        sortedBettorWagerData,
        refreshBettorWagerData,
        refreshingState: [refreshing, setRefreshing] as [boolean, Dispatch<boolean>],
        bettorState
    }

}