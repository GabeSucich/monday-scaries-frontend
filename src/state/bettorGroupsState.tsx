import { Dispatch, PropsWithChildren, createContext, useContext, useReducer } from "react"
import { Bettor, BettorGroup } from "../types"

type BettorGroupsState = {
    bettorGroups: BettorGroup[]
    selected?: {
        bettor: Bettor,
        bettorGroup: BettorGroup
    }
}

type SetBettorGroupsAction = {
    type: "SET_BETTOR_GROUPS"
    bettorGroups: BettorGroup[]
}

type SelectBettorGroupAction = {
    type: "SELECT_BETTOR_GROUP"
    bettorGroup: BettorGroup
    bettor: Bettor
}

type UpdateBettorAction = {
    type: "UPDATE_BETTOR"
    bettor: Bettor
}

type UnselectBettorGroupAction = {
    type: "UNSELECT_BETTOR_GROUP"
}

type BettorGroupsAction = SetBettorGroupsAction | SelectBettorGroupAction | UnselectBettorGroupAction | UpdateBettorAction

const BettorGroupsStateContext = createContext<BettorGroupsState>({bettorGroups: []})
const BettorGroupsDispatchContext = createContext<Dispatch<BettorGroupsAction>>(() => {})

export function useBettorGroupsState() {
    return useContext(BettorGroupsStateContext)
}

export function useBettorGroupsDispatch() {
    return useContext(BettorGroupsDispatchContext)
}

function bettorGroupsReducer(state: BettorGroupsState, action: BettorGroupsAction): BettorGroupsState {
    switch (action.type) {
        case "SELECT_BETTOR_GROUP":
            return {...state, selected: {bettor: action.bettor, bettorGroup: action.bettorGroup}}
        case "SET_BETTOR_GROUPS":
            return {...state, bettorGroups: [], selected: undefined}
        case "UNSELECT_BETTOR_GROUP":
            return {...state, selected: undefined}
        case "UPDATE_BETTOR":
            if (state.selected) {
                return {...state, selected: {bettorGroup: state.selected.bettorGroup, bettor: action.bettor}}
            }
            return state
            
        default:
            return state
    }
}

export default function BettorGroupsProvider({children}: PropsWithChildren) {
    const [state, dispatch] = useReducer(bettorGroupsReducer, {bettorGroups: []})

    return (
        <BettorGroupsStateContext.Provider value={state}>
            <BettorGroupsDispatchContext.Provider value={dispatch}>
                { children }
            </BettorGroupsDispatchContext.Provider>
        </BettorGroupsStateContext.Provider>
    )
}