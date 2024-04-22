import React, { FunctionComponent, PropsWithChildren, useEffect } from "react";
import { useAuthDispatch, useAuthState } from "../state/authState";
import { SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import Login from "./Login";
import Home from "./Home"
import { useApiState } from "../state/apiState";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ModifiedUser } from "../types";

interface Props extends PropsWithChildren {
    
}

export type EntryStackParamsList = {
    Login: undefined,
    Home: {user: ModifiedUser}
}

const Entry: FunctionComponent<Props> = (props) => {
    const authState = useAuthState()
    const apiState = useApiState()
    const authDispatch = useAuthDispatch()

    // useEffect(() => {
    //     apiState.auth.login("kmarshall", "testpassword").then(res => {
    //         if (res.data) {
    //             authDispatch({type: "SET_USER", user: res.data})
    //         }
    //     })
    // })

    const Stack = createNativeStackNavigator<EntryStackParamsList>()

    return (
        <SafeAreaView
            style={{
                display: "flex",
                height: "100%"
            }}
        >
        <Stack.Navigator screenOptions={{headerShown: false}}>
            {
                !authState.user
                ? <Stack.Screen name="Login" component={Login} />
                : <Stack.Screen name="Home" component={Home} initialParams={{user: authState.user}}/>
            }
        </Stack.Navigator>
        </SafeAreaView>
        
    )
}

const styles = StyleSheet.create({
    
})

export default Entry