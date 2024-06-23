import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import React, { FunctionComponent, PropsWithChildren, useEffect, useState } from "react";
import { BettorTabStackParamsList } from "./BettorView";
import { useApiState } from "../../state/apiState";
import { useBettorDispatch, useBettorState } from "../../state/bettorState";
import { useServerDataState } from "../../stateUtilities.ts/serverDataState";
import { Wager } from "../../types";
import WagerList from "../../components/wagers/WagerList";


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
        />
    )
}

export default AccountWagerListView