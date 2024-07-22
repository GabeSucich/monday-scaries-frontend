import React, { FunctionComponent } from "react";
import BettorProvider from "../../state/bettorState";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamsList } from "../Home";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AccountWagerListView from "./AccountWagerListView";
import StandingsView from "./StandingsView";
import AnalyticsView from "./AnalyticsView";

type Props = NativeStackScreenProps<HomeStackParamsList, "Bettor">

export type BettorTabStackParamsList = {
    Wagers: undefined,
    Analytics: undefined,
    Standings: undefined
}

const BettorView: FunctionComponent<Props> = (props) => {

    const {user, bettor, bettorGroup} = props.route.params

    const TabStack = createBottomTabNavigator<BettorTabStackParamsList>()

    return (
        <BettorProvider user={user} bettor={bettor} bettorGroup={bettorGroup}>
            <TabStack.Navigator initialRouteName="Wagers" screenOptions={{headerShown: false}}>
                <TabStack.Screen name="Wagers" component={AccountWagerListView}/>
                <TabStack.Screen name="Analytics" component={AnalyticsView} />
                <TabStack.Screen name="Standings" component={StandingsView} />
            </TabStack.Navigator>
        </BettorProvider>
        
    )

}

export default BettorView