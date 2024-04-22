import React, { FunctionComponent, useState, useEffect } from "react";
import { Bettor, BettorGroup, Wager } from "../types";
import { Overlay, Text, Divider, Button } from "@rneui/themed";
import { StyleProp, TextInput, View, ViewStyle } from "react-native";
import { GlobalStylesheet } from "../../styles";
import { amountToString, parsedAmount } from "../../utilities/stringUtilities";
import { usePrefixState } from "../stateUtilities.ts/prefixState";
import { useApiState } from "../state/apiState";
import { useServerDataState } from "../stateUtilities.ts/serverDataState";
import { useAlertState } from "../stateUtilities.ts/alertState";
import ErrorMessage from "./ErrorMessage";
import SuccessMessage from "./SuccessMessage";
import { useBettorDispatch } from "../state/bettorState";

type Props = {
    bettor: Bettor
    wagers: Wager[]
    bettorGroup: BettorGroup
    visible: boolean
    handleClose: () => void,
    containerStyle?: StyleProp<ViewStyle>
}

const DepositModal: FunctionComponent<Props> = (props) => {

    const [deposit, setDeposit] = usePrefixState("$", props.bettorGroup.maxDeposit.toString())
    const apiState = useApiState()
    const bettorDispatch = useBettorDispatch()

    const [success, makeDepositWrapper, depositLoading, depositError, clearDepositState] = useServerDataState<boolean>()
    const [showStatus, setShowStatus] = useState(false)

    useEffect(() => {
        if (!props.visible) {
            clearDepositState()
        }
    }, [props.visible])

    useEffect(() => {
        if (success || depositError) {
            setShowStatus(true)
            if (success) {
                props.handleClose()
            } else {
                setTimeout(() => {
                    setShowStatus(false)
                }, 5000)
            }
            
        }
    }, [success, depositError])

    function attemptDeposit() {
        setShowStatus(false)
        const depositAmount = parsedDeposit()
        if (depositAmount) {
            makeDepositWrapper(
                () => {
                    return apiState.bettor.deposit({bettor: props.bettor._id, amount: depositAmount}).then((res) => {
                        if (res.data === undefined) {
                            return res
                        } else {
                            return apiState.bettor.byId(props.bettor._id).then(res2 => {
                                if (res2.data) {
                                    bettorDispatch({type: "UPDATE_BETTOR", bettor: res2.data})
                                }
                                return res
                            })
                        }
                    })
                }
            )
        }
    }

    function parsedDeposit() {
        return parsedAmount(deposit, "$")
    }

    function openWagerLength() {
        return props.wagers.filter(wager => !wager.result).length
    }

    function balanceTooHigh() {
        return props.bettorGroup.maxDepositBalance && props.bettor.balance > props.bettorGroup.maxDepositBalance
    }

    function depositTooHigh() {
        const depositAmount = parsedDeposit()
        return depositAmount && depositAmount > props.bettorGroup.maxDeposit
    }

    function validInput() {
        return openWagerLength() === 0 && !balanceTooHigh() && !depositTooHigh()
    }


    return (
    <Overlay
        isVisible={props.visible}
        onRequestClose={props.handleClose}
        onBackdropPress={props.handleClose}
        animationType="slide"
    >
       <View style={[props.containerStyle, GlobalStylesheet.box, {width: "100%", padding: 10, alignItems: "center"}]}>
            {
               openWagerLength() > 0 ? <Text style={{textAlign: "center", fontWeight: "bold"}}>Deposits are not allowed when there are unsettled wagers. Deposit may be made after results are entered for the {openWagerLength()} active wager{openWagerLength() > 2 ? 's' : ''}.</Text> : null
            }
            {
                balanceTooHigh()
                ? <Text style={{textAlign: "center", fontWeight: "bold"}}>The current bettor balance of ${props.bettor.balance} is too high to deposit. The maximum balance to deposit is ${props.bettorGroup.maxDepositBalance}.</Text>
                : null
            }
            {
                !openWagerLength() && !balanceTooHigh()
                ? <View style={{alignItems: "center"}}>
                    <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}> 
                        <Text>Deposit:  </Text>
                        <TextInput placeholder="Deposit Amount" value={deposit} onChangeText={setDeposit} style={{width: "80%", borderColor: "blue", padding: 5, borderWidth: 1, borderRadius: 3}} />
    
                    </View>
                    {
                                depositTooHigh() ? <Text style={{ marginTop: 5, color: "red", textAlign: "center", fontWeight: "bold"}}>The maximum deposit is ${props.bettorGroup.maxDeposit}.</Text> : null
                            }
                    
                </View> : null
            }
            {
                showStatus ? 
                    depositError ? <ErrorMessage error={`There was an error while trying to save the deposit: ${depositError}`} /> : (
                        success ? <SuccessMessage success={`The deposit was successful!`} /> : null
                    )
                : null
            }
            <Divider style={{marginVertical: 10}}/>
            <View style={{display: "flex", flexDirection: "row", justifyContent: "flex-end"}}>
                <Button color={"warning"} titleStyle={{fontSize: 10}} buttonStyle={{padding: 5}} title={"Cancel"} onPress={props.handleClose} />
                <Button  onPress={attemptDeposit} loading={depositLoading} color={"primary"} containerStyle={{marginLeft: 5}} titleStyle={{fontSize: 10}} buttonStyle={{padding: 5}} title={"Deposit"} disabled={!validInput()}/>
            </View>
       </View>

    </Overlay>
    )
    
}

export default DepositModal