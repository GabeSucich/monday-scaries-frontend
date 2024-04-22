import React, {FunctionComponent, PropsWithChildren, RefObject, createRef, useContext, useEffect, useRef, useState} from "react"
import {Pressable, SafeAreaView, StyleSheet, Text,  View, TextInput, KeyboardAvoidingView} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { ApiContext } from "../state/apiState"
import { useAuthDispatch } from "../state/authState"
import { Button, CheckBox, Input, InputProps} from "@rneui/themed"
import { useServerDataState } from "../stateUtilities.ts/serverDataState"
import { ModifiedUser } from "../types"


interface Props extends PropsWithChildren {
}

const Login: FunctionComponent<Props> = (props) => {

    const apiState = useContext(ApiContext)
    const authDispatch = useAuthDispatch()

    const [user, attemptLoginWrapper, loginLoading, loginError] = useServerDataState<ModifiedUser>()

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const usernameInputRef = createRef<TextInput>()
    const passwordInputRef = createRef<TextInput>()

    async function retrieveCredentials(): Promise<[string | null, string | null]> {
        return AsyncStorage.getItem("USERNAME").then(username => {
            return AsyncStorage.getItem("PASSWORD").then(password => [username, password])
        })
    }

    async function saveCredentials(_username: string, _password: string) {
        return AsyncStorage.setItem("USERNAME", _username)
            .then(() => AsyncStorage.setItem("PASSWORD", _password)
            .then(() => true))
            .catch(() => false)
    }

    useEffect(() => {
        retrieveCredentials().then(([_username, _password]) => {
            if (_username && _password) {
                setUsername(_username)
                setPassword(_password)
                attemptLogin(_username, _password, false)
            }
        })
    }, [])

    useEffect(() => {
        if (loginError) {
            passwordInputRef.current?.clear();
            (passwordInputRef.current as any)?.shake()
            setPassword("")
        }
    }, [loginError])

    useEffect(() => {
        if (user) {
           authDispatch({type: "SET_USER", user}) 
        }
    }, [user])



    function attemptLogin(_username: string, _password: string, saveData: boolean) {
        function block() {
            attemptLoginWrapper(() => {
                return apiState.auth.login(_username, _password)
            })
        }
        if (saveData) {
            saveCredentials(_username, _password).then(saved => {
                block()
                retrieveCredentials().then(console.log)
        })
        } else {
            block()
        }
        
    }

    const LoginButton = () => {
        return (
            <Button 
                title="Login"
                loading={loginLoading}
                disabled={!username || !password}
                buttonStyle={{
                    borderRadius: 30
                }}
                onPress={() => attemptLogin(username, password, true)}
                color="green"
            />
        )
    }

    return (
        <KeyboardAvoidingView>
            <View style={[styles.container, {alignSelf: "center", justifyContent: "space-around", 
        alignItems: "center",
        flexDirection: "column", width: "60%"}]}>
           <Input 
            ref={usernameInputRef as any}
            value={username}
            textAlign="center"
            placeholder="username"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setUsername}
            />
            <Input
                ref={passwordInputRef as any}
                secureTextEntry={true}
                onChangeText={setPassword}
                value={password}
                textAlign="center"
                style={styles.textInput}
                placeholder="password"
                autoCapitalize="none"
                autoCorrect={false}
                errorMessage={loginError ?? undefined}
                errorStyle={{
                    color: "red",
                    textAlign: "center",
                    fontSize: 10,
                    marginBottom: 20
                }}
            /> 
            <LoginButton />
        </View>
        </KeyboardAvoidingView>
     
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: "33%",
    },
    textInput: {
        width: "50%",
        justifyContent: "center",
        height: 30
    }
})

export default Login