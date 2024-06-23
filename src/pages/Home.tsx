import React, { FunctionComponent, PropsWithChildren, useEffect } from "react";
import { useServerDataState } from "../stateUtilities.ts/serverDataState";
import { Bettor, BettorGroup, ModifiedUser, User } from "../types";
import { View } from "react-native";
import { Header, Text } from "@rneui/themed";
import UserHeader from "../components/misc/UserHeader";
import BettorGroupSelectionView from "./views/BettorGroupSelectionView";
import { useBettorGroupsState } from "../state/bettorGroupsState";
import BettorProvider from "../state/bettorState";
import BettorView from "./views/BettorView";
import { NativeStackScreenProps, createNativeStackNavigator } from "@react-navigation/native-stack";
import { EntryStackParamsList } from "./Entry";

type Props = NativeStackScreenProps<EntryStackParamsList, "Home">

export type HomeStackParamsList = {
    BettorGroupSelection: {user: ModifiedUser},
    Bettor: {user: ModifiedUser, bettor: Bettor, bettorGroup: BettorGroup}
}
 

const Home: FunctionComponent<Props> = (props) => {

    const {user} = props.route.params

    const bettorGroupState = useBettorGroupsState()

    const userInitials = `${user.firstName[0]?.toUpperCase() ?? ''}${user.lastName[0]?.toUpperCase() ?? ''}`

    const Stack = createNativeStackNavigator<HomeStackParamsList>()

    return (
        <View style={{flex: 1, backgroundColor: "gray"}}>
            <UserHeader userInitials={userInitials} />
            <Stack.Navigator screenOptions={{headerShown: false}}>
                {
                    bettorGroupState.selected 
                    ?  <Stack.Screen name="Bettor" component={BettorView} initialParams={{user, bettor: bettorGroupState.selected.bettor, bettorGroup: bettorGroupState.selected.bettorGroup}} />
                    : <Stack.Screen name="BettorGroupSelection" component={BettorGroupSelectionView} initialParams={{user}} />
                }
                </Stack.Navigator>
            
        </View>
    )

}

export default Home