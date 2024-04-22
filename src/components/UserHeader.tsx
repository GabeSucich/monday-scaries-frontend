import React, { FunctionComponent, PropsWithChildren, useEffect, useState } from "react";
import { Bettor, BettorGroup, ModifiedUser } from "../types";
import { Avatar, Chip, Header } from "@rneui/themed";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ViewBase } from "react-native";
import { useBettorGroupsState } from "../state/bettorGroupsState";
import { GlobalStyleAttrs } from "../../styles";

interface Props extends PropsWithChildren {
    userInitials: string
}

const UserHeader: FunctionComponent<Props> = (props) => {
    const {userInitials } = props

    const bettorGroupsState = useBettorGroupsState()

    const balance = bettorGroupsState.selected?.bettor.balance
    const groupName = bettorGroupsState.selected?.bettorGroup.name

    return (
        <View
            style={{
                // height: 70,
                backgroundColor:"black",
                margin: 0,
                paddingVertical: 5,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
        }}>
            <Avatar 
                rounded
                title={userInitials}
                containerStyle={{
                    backgroundColor: GlobalStyleAttrs.backgroundColors.lightGreen,
                }}
            />
            {
                balance !== undefined
                ? <Chip 
                    type="outline" 
                    size="sm" 
                    title={`$${balance}`} 
                    titleStyle={{color: GlobalStyleAttrs.backgroundColors.lightGreen}} 
                    containerStyle={{
                        marginLeft: 10, 
                        borderColor: GlobalStyleAttrs.backgroundColors.lightGreen, 
                        borderWidth: 2,
                        width: 80
                    }} 
                    /> 
                : null
            }
            {
                groupName
                ? <Chip 
                    title={`${groupName}`}
                    color={GlobalStyleAttrs.backgroundColors.lightGreen}
                    containerStyle={{
                        marginLeft: 10
                    }}
                /> : null
            }
        </View> 
    )
}

export default UserHeader