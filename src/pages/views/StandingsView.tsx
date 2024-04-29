import React, { FunctionComponent, useEffect, useState } from "react";
import { Pressable, RefreshControl, SafeAreaView, ScrollView, View  } from "react-native";
import { useBettorStateUtilities } from "../../state/bettorState";
import { Button, ButtonGroup, Divider, Header, Text } from "@rneui/themed";
import { Bettor, User, Wager } from "../../types";
import LoadingComponent from "../../components/LoadingMessage";
import ErrorMessage from "../../components/ErrorMessage";
import { bettorIsQuarterDQed, bettorProfit, sortWagers, wagersProfit } from "../../../utilities/bettorUtilities";
import { NativeStackScreenProps, createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { GlobalStyleAttrs, GlobalStylesheet } from "../../../styles";
import WagerList from "../../components/WagerList";
import { ContestDate, QuarterNum, monthToQuarter, parseQuarterDateString } from "../../../utilities/dateUtilities";
import ButtonSelectionGroup from "../../components/ButtonSelectionGroup";

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
        bettorState,
        bettorGroupBettorsServerData,
        bettorWagerErrors,
        allBettorWagersLoaded,
        sortedBettorWagerData,
        refreshingState,
        refreshBettorWagerData
    } = useBettorStateUtilities({useEffects: true})

    const [bettorGroupBettors, _, loadingBettors, serverError] = bettorGroupBettorsServerData

    function nowQuarter() {
        return monthToQuarter(new Date().getMonth() + 1)
    }

    const [selectedYear, setSelectedYear] = useState<number>(2024)
    const [selectedQuarter, setSelectedQuarter] = useState<QuarterNum | undefined>(nowQuarter())

    function qualifiedBettorWagerData() {
        return sortedBettorWagerData({year: selectedYear, quarterNum: selectedQuarter}).filter(b => {
            if (!selectedQuarter) return true
            return !bettorIsQuarterDQed(b.bettor, selectedYear, selectedQuarter)
        })
    }

    function disqualifiedBettorWagerData() {
        return sortedBettorWagerData({year: selectedYear, quarterNum: selectedQuarter}).filter(b => {
            if (!selectedQuarter) return false
            return bettorIsQuarterDQed(b.bettor, selectedYear, selectedQuarter)
        })
    }

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
                <View style={{display: "flex", flexDirection: "row"}}>
                <ButtonSelectionGroup 
                    options={[2024]}
                    selected={selectedYear}
                    setter={setSelectedYear}
                    allowUnselect={false}
                    allowOverflow={true}
                    containerStyle={{alignSelf: "flex-start", flex: 1}}
                    colorMap={() => "primary"}
                />
                <ButtonSelectionGroup 
                    options={[1, 2, 3, 4] as QuarterNum[]}
                    selected={selectedQuarter}
                    setter={setSelectedQuarter}
                    allowUnselect={true}
                    allowOverflow={true}
                    makeTitle={q => `Q${q}`}
                    containerStyle={{flex: 1, justifyContent: "flex-end"}}
                    colorMap={() => "primary"}
                />
                </View>
                <ScrollView
                    style={{alignSelf: "center", minHeight: "100%"}}
                    refreshControl={
                        <RefreshControl refreshing={refreshingState[0]} onRefresh={refreshBettorWagerData}/>
                    }
                >
                    {qualifiedBettorWagerData().map((b, index) => {
                        return (
                            <BettorStanding 
                                bettor={b.bettor}
                                user={b.user as User}
                                placement={index + 1}
                                wagers={b.wagers}
                                key={`qualified-${index}`}
                            />
                        )
                    })}
                    {
                        disqualifiedBettorWagerData().length > 0 ?
                            <View style={{marginTop: 15}}>
                                <Divider width={5} style={{marginTop: 5}}/>
                                {
                                    disqualifiedBettorWagerData().map((b, index) => {
                                    return (
                                        <BettorStanding 
                                            bettor={b.bettor}
                                            user={b.user as User}
                                            wagers={b.wagers}
                                            key={`disqualified-${index}`}
                                            disqualified={true}
                                        />
                                    )
                                })
                                }

                            </View> : null
                    }
                    
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
    placement?: number,
    bettor: Bettor,
    user: User,
    wagers: Wager[],
    disqualified?: boolean
}

const BettorStanding: FunctionComponent<BettorStandingProps> = (props) => {
    const {bettor, user, wagers} = props

    const navigator = useNavigation<NavigationProp<StandingStackParamsList>>()

    function profit() {
        if (!wagers) {
            return undefined
        } else {
            return wagersProfit(wagers)
        }
    }

    return (
        <Pressable
            onPress={() => navigator.navigate("WagerView", {bettor, user})}
        >
            <View style={[
                GlobalStylesheet.box, 
                { 
                    backgroundColor: props.disqualified ? "#c7c7c7" : GlobalStyleAttrs.backgroundColors.neutral, 
                    // justifyContent: "center",
                    alignItems: "center", 
                    // minWidth: "70%",
                    marginTop: 20,
                    padding: 10,
                    opacity: props.disqualified ? 0.5 : 1
                }
            ]}
            >
                <View >
                    <Text
                        // onPress={() => navigator.navigate("WagerView", {bettor, user, wagers, refresh, refreshing})}
                        style={{
                            fontWeight: "bold",
                        }}
                    >{props.placement ? `${props.placement}.` : '' } {user.firstName} {user.lastName}  ({profit() >= 0 ? '+' : '-'}${Math.abs(profit())})</Text>
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