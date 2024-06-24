import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import React, { FunctionComponent, PropsWithChildren, useEffect, useState } from "react";
import { BettorTabStackParamsList } from "./BettorView";
import { useApiState } from "../../state/apiState";
import { useBettorDispatch, useBettorState } from "../../state/bettorState";
import { useServerDataState } from "../../stateUtilities.ts/serverDataState";
import { Wager } from "../../types";
import WagerList from "../../components/wagers/WagerList";
import { getEndOfQuarterTimestamp } from "../../../utilities/dateUtilities";


type Props = BottomTabScreenProps<BettorTabStackParamsList, "Wagers">

const AccountWagerListView: FunctionComponent<Props> = (props) => {

    const apiState = useApiState()
    const bettorState = useBettorState()
    const bettorDispatch = useBettorDispatch()

    const [wagers, getWagersWrapper, wagersLoading, serverError] = useServerDataState<Wager[]>({initial: []})
    const [refreshing, setRefreshing] = useState(false)

    function refresh() {
        setRefreshing(true)
        getWagersWrapper(
            () => apiState.wager.bettorWagers(bettorState.bettor._id).then(res => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        setRefreshing(false)
                        resolve(res)
                    }, 2000)
                })
            })
        )
    }

    useEffect(() => {
        if (bettorState.wagers.length === 0) {
            getWagersWrapper(
            () => apiState.wager.bettorWagers(bettorState.bettor._id)
            )
        }
        
    }, [])

    useEffect(() => {
        if (wagers) {
            bettorDispatch({type: "SET_WAGERS", wagers: wagers})
        }
    }, [wagers])

    const LOCKED_TIME_INTERVAL_SECS = 6*60*60 // Lock betting for the last 6 hours of the quarter
    const [disabledMessage, setDisabledMessage] = useState("")
    const [wagerLockCheckIntervalId, setWagerLockCheckIntervalId] = useState<NodeJS.Timeout | undefined>(undefined)

    function nowWithinLockedInterval() {
        const now = Date.now()
        const eoq = getEndOfQuarterTimestamp()
        return now < eoq && Math.abs(now - eoq) <= LOCKED_TIME_INTERVAL_SECS*1000
    }

    function checkForLock() {
        const shouldLock = nowWithinLockedInterval()
        if (shouldLock) {
            setDisabledMessage(`Wagers cannot be placed with 6 hours of the end of the quarter.`)
        } else {
            setDisabledMessage("")
        }
    }

    useEffect(() => {
        checkForLock()
        setWagerLockCheckIntervalId(setInterval(checkForLock, 30000))
        return () => {
            clearInterval(wagerLockCheckIntervalId)
        }
    }, [])



    return (
        <WagerList
            containerStyle={{"alignItems": "center"}}
            wagers={bettorState.wagers}
            wagersLoading={wagersLoading}
            serverError={serverError}
            bettor={bettorState.bettor}
            bettorGroup={bettorState.bettorGroup}
            allowEdits={true}
            refreshing={refreshing}
            refresh={refresh}
            newWagerDisabled={!!disabledMessage}
            newWagerDisabledMessage={disabledMessage}
        />
    )
}

export default AccountWagerListView