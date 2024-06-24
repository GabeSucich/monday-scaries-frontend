import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import React, { FunctionComponent, useEffect, useState } from "react";
import { BettorTabStackParamsList } from "./BettorView";
import { View } from "react-native";
import { Text } from "@rneui/themed";
import { useBettorDispatch, useBettorState, useBettorStateUtilities } from "../../state/bettorState";
import { useApiState } from "../../state/apiState";
import { wagersToLineChartData } from "../../../utilities/bettorUtilities";
import { useTimeFrameSelection } from "../../../utilities/dateUtilities";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import AnalyticsProvider from "../../state/analyticsState";
import PerformanceAnalyticsView from "./PerformanceAnalyticsView";
import LoadingComponent from "../../components/alerts/LoadingMessage";
import LoadingBox from "../../components/alerts/LoadingBox";

type Props = BottomTabScreenProps<BettorTabStackParamsList, "Analytics">

export const AnalyticsView: FunctionComponent<Props> = (props) => {

    const {
        bettorState,
        bettorGroupBettorsServerData,
        allBettorWagersLoaded
    } = useBettorStateUtilities({useEffects: true})

    const Tab = createMaterialTopTabNavigator()

    const [bettorGroupBettors, _, bettorGroupBettorsLoading, serverError] = bettorGroupBettorsServerData

    function wagerChartData(bettorId: string) {
        const wagers = bettorState.allBettorWagers[bettorId]?.wagers
        const deposits = bettorState.allBettorWagers[bettorId]?.bettor.deposits
        if (!wagers || !deposits) {
            return undefined
        }
        return wagersToLineChartData(wagers, deposits)
    }
    
    return (
        <AnalyticsProvider>
            <View style={{alignItems: "center"}}>
            {
                allBettorWagersLoaded() ?
                    <PerformanceAnalyticsView /> : 
                     <LoadingBox message="Loading wager analytics..."/>
            }
            </View>
        </AnalyticsProvider>
    )
}

export default AnalyticsView
