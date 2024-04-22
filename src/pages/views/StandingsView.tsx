import React, { FunctionComponent, useEffect } from "react";
import { Pressable, RefreshControl, SafeAreaView, ScrollView, View  } from "react-native";
import { useBettorStateUtilities } from "../../state/bettorState";
import { Text } from "@rneui/themed";
import { Bettor, User, Wager } from "../../types";
import LoadingComponent from "../../components/LoadingMessage";
import ErrorMessage from "../../components/ErrorMessage";
import { bettorProfit, sortWagers } from "../../../utilities/bettorUtilities";
import { NativeStackScreenProps, createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { GlobalStyleAttrs, GlobalStylesheet } from "../../../styles";
import WagerList from "../../components/WagerList";

export type StandingStackParamsList = {
    StandingsList: undefined,
    WagerView: {
        bettor: Bettor
        user: User
    }
}

interface Props {}

const StandingsView: FunctionComponent<Props> = (props) => {
    const Stack = createNativeStackNavigator<StandingStackParamsList>()

    return (
        <Stack.Navigator>
            <Stack.Screen name="StandingsList" component={StandingsList} options={{headerShown: false}} />
            <Stack.Screen name="WagerView" component={BettorWagerView} options={{headerBackTitle: "Back"}} />
        </Stack.Navigator>    
    )
}

export default StandingsView

type StandingsListProps = NativeStackScreenProps<StandingStackParamsList, "StandingsList">

const StandingsList: FunctionComponent<StandingsListProps> = (props) => {

    const {
        bettorGroupBettorsServerData,
        bettorWagerErrors,
        allBettorWagersLoaded,
        sortedBettorWagerData,
        refreshingState,
        refreshBettorWagerData
    } = useBettorStateUtilities({useEffects: true})

    const [bettorGroupBettors, _, loadingBettors, serverError] = bettorGroupBettorsServerData


    if (loadingBettors) {
        return (
            <View style={{alignItems: "center"}}>
                <LoadingComponent message="Loading all bettors..." styles={[GlobalStylesheet.box, {width: "70%", marginTop: 20, backgroundColor: GlobalStyleAttrs.backgroundColors.neutral}]}/>
            </View>
        )
    } else if (serverError) {
        return (
            <View style={{alignItems: "center"}}>
                <ErrorMessage error={`There was an error loading the bettors: ${serverError}`}/>
            </View>
        )
    } else if (bettorWagerErrors().length > 0) {
        return <View style={{alignItems: "center"}}>
            {
                bettorWagerErrors().map(error => {
                    return (
                        <View style={{alignItems: "center"}}>
                            <ErrorMessage error={`${error}`}/>
                        </View>
                    )
                })
            }
        </View>
    } else if (!allBettorWagersLoaded()) {
        return (
            <View style={{alignItems: "center"}}>
                <LoadingComponent message="Loading all bettors..." styles={[GlobalStylesheet.box, {width: "70%", marginTop: 20, backgroundColor: GlobalStyleAttrs.backgroundColors.neutral}]}/>
            </View>
        )
    } else if (bettorGroupBettors) {
        return (
            <SafeAreaView>
                <ScrollView
                    style={{alignSelf: "center", minHeight: "100%"}}
                    refreshControl={
                        <RefreshControl refreshing={refreshingState[0]} onRefresh={refreshBettorWagerData}/>
                    }
                >
                    {sortedBettorWagerData().map((b, index) => {
                        return (
                            <BettorStanding 
                                bettor={b.bettor}
                                user={b.user as User}
                                placement={index + 1}
                                wagers={b.wagers}
                                key={index}
                            />
                        )
                    })}
                </ScrollView>
                 
            </SafeAreaView>  
        )
    } 
    return (
        <View style={{alignItems: "center"}}>
            <ErrorMessage error={`There was an issue rending the Standings...`}/>
        </View>
    )

}

type BettorStandingProps = {
    placement: number,
    bettor: Bettor,
    user: User,
    wagers: Wager[]
}

const BettorStanding: FunctionComponent<BettorStandingProps> = (props) => {
    const {bettor, user, wagers} = props

    const navigator = useNavigation<NavigationProp<StandingStackParamsList>>()

    function profit() {
        if (!wagers) {
            return undefined
        } else {
            return bettorProfit(bettor, wagers)
        }
    }


    return (
        <Pressable
            onPress={() => navigator.navigate("WagerView", {bettor, user})}
        >
            <View style={[
                GlobalStylesheet.box, 
                { 
                    backgroundColor: GlobalStyleAttrs.backgroundColors.neutral, 
                    // justifyContent: "center",
                    alignItems: "center", 
                    // minWidth: "70%",
                    marginTop: 20,
                    padding: 10
                }
            ]}
            >
                <View >
                    <Text
                        // onPress={() => navigator.navigate("WagerView", {bettor, user, wagers, refresh, refreshing})}
                        style={{
                            fontWeight: "bold",
                        }}
                    >{props.placement}. {user.firstName} {user.lastName}  ({profit() >= 0 ? '+' : '-'}${Math.abs(profit())})</Text>
                </View>
            </View>
        </Pressable>
        
    )
    
}

type BettorWagerViewProps = NativeStackScreenProps<StandingStackParamsList, "WagerView">

const BettorWagerView: FunctionComponent<BettorWagerViewProps> = (props) => {


    const bettor = props.route.params.bettor
    const user = props.route.params.user

    const {bettorState, refreshingState, allBettorWagersLoaded, refreshBettorWagerData} = useBettorStateUtilities({useEffects: false})

    const wagers = bettorState.allBettorWagers[bettor._id].wagers ?? []

    const navigator = useNavigation<NavigationProp<StandingStackParamsList>>()
    const profit = bettorProfit(bettor, wagers)

    useEffect(() => {
        navigator.setOptions({
            title: `${user.firstName} ${user.lastName}  (${profit >= 0 ? '+' : '-'}$${Math.abs(profit)})`
        })
    }, [])

    function sortedWagers() {
        return sortWagers(wagers)
    }

    return (
        <View style={{marginTop: 10}}>
            <WagerList 
                wagers={sortedWagers()} 
                containerStyle={{}} 
                bettorGroup={bettorState.bettorGroup}
                wagersLoading={allBettorWagersLoaded()}
                bettor={bettor}
                allowEdits={false}
                refreshing={refreshingState[0]}
                refresh={refreshBettorWagerData}
            />
            <Text style={{fontWeight: "bold"}}>Wager View: {(bettor.user as User).firstName}</Text>
        </View>
    )
}