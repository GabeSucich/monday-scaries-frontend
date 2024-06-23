import React, { FunctionComponent, PropsWithChildren, ReactElement, useEffect, useState } from "react";
import { Bettor, BettorGroup, CreateWagerData, ModifiedUser, Wager } from "../../types";
import { useApiState } from "../../state/apiState";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, View, StyleSheet } from "react-native";
import { Button, Text } from "@rneui/base";
import { useServerDataState } from "../../stateUtilities.ts/serverDataState";
import { useBettorGroupsDispatch, useBettorGroupsState } from "../../state/bettorGroupsState";
import LoadingComponent from "../../components/alerts/LoadingMessage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamsList } from "../Home";
import ErrorMessage from "../../components/alerts/ErrorMessage";
import { GlobalStyleAttrs, GlobalStylesheet } from "../../../styles";



type Props = NativeStackScreenProps<HomeStackParamsList, "BettorGroupSelection">

const BettorGroupSelectionView: FunctionComponent<Props> = (props) => {

    const {user} = props.route.params

    const apiState = useApiState()
    const bettorGroupDispatch = useBettorGroupsDispatch()

    const [bettors, getBettorsWrapper, loading, bettorsServerError] = useServerDataState<Bettor[]>()

    function loadBettorGroups() {
        getBettorsWrapper(() => {
            return apiState.bettor.bettors(user._id)  
        })
    }

    useEffect(() => {
        loadBettorGroups()
    }, [])

    function handleSelect(bettor: Bettor, bettorGroup: BettorGroup) {
        bettorGroupDispatch({type: "SELECT_BETTOR_GROUP", bettor, bettorGroup})
    }

    return (
        <View style={{width: "100%", alignItems: "center"}}>
            {bettorsServerError ? <ErrorMessage error={bettorsServerError}/> : null}
            {
                loading ? <View style={{width: "70%", marginTop: 20}}>
                    <LoadingComponent styles={[GlobalStylesheet.box, {backgroundColor: GlobalStyleAttrs.backgroundColors.neutral}]} message="Loading competitions..." /> 
                </View>  : null
            }
            <ScrollView contentContainerStyle={{marginTop: 5, alignItems: "center",}} style={{width: "100%", marginVertical: 10}}>
            {
                bettors?.flatMap((b, i) => {
                    return (
                        <BettorGroupComponent balance={b.balance} bettorGroup={b.bettorGroup as BettorGroup} handlePress={() => handleSelect(b, b.bettorGroup as BettorGroup)} key={i} />
                    )
                })
            }
            </ScrollView>
            
        </View>
    )

}

export default BettorGroupSelectionView


const BettorGroupComponent: FunctionComponent<{bettorGroup: BettorGroup, balance: number, handlePress: () => any}> = (props) => {
    return (
        <Pressable
        onPress={props.handlePress}
        style={[GlobalStylesheet.box, {
            backgroundColor:  GlobalStyleAttrs.backgroundColors.green,
            width: "90%",
            minHeight: 50,
            justifyContent: "center",
            padding: 5,
            marginBottom: 10
        }]}
        >
            <Text style={{textAlign: "center", width: "100%"}}>{props.bettorGroup.name} {`($${props.balance})`}</Text>
        </Pressable>
    )
}