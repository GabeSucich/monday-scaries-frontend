import React, { FunctionComponent, useEffect, useState } from "react";
import { Wager, WagerResult } from "../types";
import { useBettorDispatch, useBettorState } from "../state/bettorState";
import { KeyboardAvoidingView, Modal, StyleSheet, TextInput, View } from "react-native";
import { useApiState } from "../state/apiState";
import { useServerDataState } from "../stateUtilities.ts/serverDataState";
import { Button, CheckBox, Icon, Overlay, Switch, Text } from "@rneui/themed";
import { GlobalStyleAttrs, GlobalStylesheet } from "../../styles";
import ErrorMessage from "./ErrorMessage";
import SuccessMessage from "./SuccessMessage";
import ButtonSelectionGroup from "./ButtonSelectionGroup";
import { Divider } from "@rneui/base";
import { amountToString, dateFormatter, oddsToString } from "../../utilities/stringUtilities";
import { useFormattedState, usePrefixState } from "../stateUtilities.ts/prefixState";
import {Calendar} from "react-native-calendars"
import { SafeAreaView } from "react-native-safe-area-context";


type Props = {
    wager?: Wager
    allowEdits?: boolean
    visible: boolean
    handleClose: () => void
}

const EditWagerModal: FunctionComponent<Props> = (props => {

    const allowEdits = props.allowEdits ?? true

    const apiState = useApiState()
    const bettorState = useBettorState()
    const bettorDispatch = useBettorDispatch()

    const [workingWager, setWorkingWager] = useState<Wager | undefined>(props.wager)

    // Info
    const [contestDate, setContestDate] = useState<string>(workingWager?.contestDate ?? "")
    const [description, setDescription] = useState<string>(workingWager?.description ?? "")
    const [betType, setBetType] = useState<string | undefined>(workingWager?.details?.betType)
    const [live, setLive] = useState<boolean | undefined>(workingWager?.live ?? undefined)
    const [sport, setSport] = useState<string | undefined>(workingWager?.details?.sport)

    // Results
    const [amount, setAmount] = usePrefixState("$", workingWager?.amount.toString())
    const [odds, setOdds] = usePrefixState("+", workingWager?.odds.toString(), (v: string) => !v.startsWith("-"))
    const [result, setResult] = useState<WagerResult | undefined>(workingWager?.result as WagerResult ?? undefined)
    const [cashoutValue, setCashoutValue] = usePrefixState("$", (workingWager?.result === "Cash Out" && workingWager.payout !== undefined) ? workingWager.payout.toString() : "")

    const [calendarDisplayed, setCalendarDisplayed] = useState(workingWager?.contestDate ? false : true)

    function handleCalendarSelect(dateString: string) {
        setContestDate(dateString)
        setTimeout(() => {
            setCalendarDisplayed(false)
        }, 1000)  
    }

    function resetWagerState(_wager: Wager) {
        setContestDate(_wager.contestDate)
        setDescription(_wager.description)
        setBetType(_wager.details?.betType)
        setSport(_wager.details?.sport)
        setLive(_wager.live)
        setAmount(amountToString(_wager.amount))
        setOdds(oddsToString(_wager.odds))
        setResult(_wager.result as WagerResult | undefined)
        setCashoutValue(_wager.result === "Cash Out" && _wager.payout ? amountToString(_wager.payout) : "")
    }

    function resetEmptyState() {
        setContestDate("")
        setDescription("")
        setBetType(undefined)
        setLive(undefined)
        setSport(undefined)
        setAmount("")
        setOdds("")
        setResult(undefined)
        setCashoutValue("")
    }

    useEffect(() => {
        if (props.wager) {
            if (workingWager) {
               resetWagerState(workingWager) 
            } else {
                resetWagerState(props.wager)
            }
        } else {
            setWorkingWager(undefined)
            resetEmptyState()
        }
        setCalendarDisplayed(workingWager?.contestDate ? false: true)
        
    }, [props.visible])

    useEffect(() => {
        if (result !== "Cash Out") {
            setCashoutValue("")
        }
    }, [result])

    function parsedOdds() {
        if (!odds) {
            return undefined
        }
        const _asNum = Number(odds.startsWith("+") ? odds.slice(1) : odds)
        if (isNaN(_asNum)) {
            return undefined
        }
        if (_asNum < 100 && _asNum >= -100) {
            return undefined
        }
        return _asNum
    }

    function handleAmountChange(val: string) {
        val = val.trim()
        if (!val || val.startsWith("$")) {
            setAmount(val)
        } else {
            setAmount(`$${val}`)
        }
    }

    function handleOddsChange(val: string) {
        val = val.trim()
        if (!val || val.startsWith("-") || val.startsWith("+")) {
            setOdds(val)
        } else {
            setOdds(`+${val}`)
        }
    }

    function handleCashOutValueChange(val: string) {
        val = val.trim()
        if (!val || val.startsWith("$")) {
            setCashoutValue(val)
        } else {
            setCashoutValue(`$${val}`)
        }
    }

    function parsedAmount() {
        if (!amount) {
            return undefined
        }
        const _asNum = Number(amount.startsWith("$") ? amount.slice(1) : amount)
        return isNaN(_asNum) ? undefined : _asNum
    }

    function parsedCashoutValue() {
        if (!cashoutValue) {
            return undefined
        }
        const _asNum = Number(cashoutValue.startsWith("$") ? cashoutValue.slice(1) : cashoutValue)
        return isNaN(_asNum) ? undefined : _asNum
    }

    function infoHasChanged() {
        const cond1 = (workingWager?.contestDate ?? "") !== contestDate
        const cond2 = (workingWager?.description ?? "") !== description
        const cond3 = (workingWager?.live !== live)
        const cond4 = workingWager?.details?.betType !== betType
        const cond5 = workingWager?.details?.sport !== sport
        // console.log("INFO: ", cond1, cond2, cond3, cond4, cond5)
        return cond1 || cond2 || cond3 || cond4 || cond5
    }

    function resultsHaveChanged() {
        const cond1 = workingWager?.result !== result
        const cond2 = workingWager?.odds !== parsedOdds()
        const cond3 = workingWager?.amount !== parsedAmount()
        const cond4 = (workingWager?.result === "Cash Out" && workingWager?.payout !== parsedCashoutValue())
        // console.log("Results: ", cond1, cond2, cond3, cond4)
        return cond1 || cond2 || cond3 || cond4
    }

    function hasChanged() {
        return infoHasChanged() || resultsHaveChanged()
    }

    const [savedWager, saveWagerWrapper, wagerSaving, saveError] = useServerDataState<Wager>()
    const [showStatus, setShowStatus] = useState(false)

    useEffect(() => {
        if (workingWager) {
            resetWagerState(workingWager)
        } else {
            resetEmptyState()
        }
    }, [workingWager])

    useEffect(() => {
        if (savedWager) {
            bettorDispatch({type: "UPDATE_WAGER", wager: savedWager})
            setWorkingWager(savedWager)
            setShowStatus(true)
            setTimeout(() => {
                setShowStatus(false)
                props.handleClose()
            }, 1000)
        }
    }, [savedWager])

    useEffect(() => {
        if (saveError) {
            setShowStatus(true)
            setTimeout(() => {
                setShowStatus(false)
            }, 5000)
            if (workingWager) {
                resetWagerState(workingWager)
            }
        }
        
    }, [saveError])

    function _createWager() {
        return apiState.wager.createWager({
            contestDate,
            description,
            bettor: bettorState.bettor._id,
            amount: parsedAmount() as number,
            odds: parsedOdds() as number,
            details: {
                betType: betType || undefined,
                sport: sport || undefined
            },
            live,
        })
    }

    function _updateWagerInfo(_wager: Wager) {
        return apiState.wager.updateWagerInfo({
            wager: _wager._id,
            contestDate,
            description,
            betType: betType || undefined,
            sport: sport || undefined,
            live
        })
    }

    function _updateWagerResults(_wager: Wager) {
        return apiState.wager.updateWagerResults({
            wager: _wager._id,
            amount: parsedAmount(),
            result: _wager.result ? result ?? null : result ?? undefined,
            odds: parsedOdds(),
            cashOutValue: result === "Cash Out" ? parsedCashoutValue() : undefined
        })
    }


    function inputsValid() {
        const cond1 = contestDate || false
        const cond2 = description || false
        const cond3 = parsedAmount() ?? false
        const cond4 = parsedOdds() ?? false
        const cond5 = result === "Cash Out" || result === "Win" || result === "Loss" || result === "Push" || result === undefined
        const cond6 = result !== "Cash Out" || (parsedCashoutValue() ?? false)
        // console.log("Validity: ", cond1, cond2, cond3, cond4, cond5, cond6)
        return cond1 && cond2 && cond3 && cond4 && cond5 && cond6
    }

    function handleSubmit() {
        if (hasChanged()) {
            saveWagerWrapper(
                () => {
                    if (workingWager) {
                        if (infoHasChanged()) {
                            let p = _updateWagerInfo(workingWager)
                            if (resultsHaveChanged()) {
                                p = p.then(res => {
                                    if (res.data) {
                                        return _updateWagerResults(workingWager)
                                    } else {
                                        return res
                                    }
                                })
                            }
                            return p
                        } else {
                            return _updateWagerResults(workingWager)
                        }
                    } else {
                        let p = _createWager()
                        if (result) {
                            p = p.then((res) =>{
                                if (res.data) {
                                    return _updateWagerResults(res.data)
                                } else {
                                    return res
                                }
                            })
                        }
                        return p
                    }
                }
            )
        }
    }

    return (
            <Overlay
            overlayStyle={[GlobalStylesheet.box, {
                padding: 5,
                width: "100%"
            }]}
            transparent={true}
            animationType="slide"
            isVisible={props.visible}
            onRequestClose={props.handleClose}
            onBackdropPress={props.handleClose}
            >   
                <SafeAreaView>
                    {
                        calendarDisplayed ? <View style={{width: "100%"}}>
                        <Calendar
                            onDayPress={d => handleCalendarSelect(d.dateString)}
                            markedDates={{
                                [contestDate]: {selected: true, color: "green"}
                            }}

                            theme={{
                                textDayFontSize: 12,
                                todayTextColor: "black",
                                selectedDayBackgroundColor: "green",
                                // textMonthFontSize: 8,
                                weekVerticalMargin: 0,
                                // text
                            }}
                            
                            
                    
                        />
                        </View> : null
                    }
                    
                    <View style={[ {backgroundColor: "white", width: "100%", display: "flex", flexDirection: "row"}]}>

                        <View style={[styles.inputContainer, {flex: 3}]}>
                            <View style={{display: "flex", flexDirection: "row", justifyContent: "flex-start", height: 30}}>
                            <TextInput
                                editable={false}
                                value={contestDate}
                                placeholder="Contest Date"
                                style={[styles.input, {flex: 2}]}
                            />
                            <Icon 
                                containerStyle={{alignItems: "center", marginLeft: 2}}
                                name="calendar"
                                type="antdesign"
                                onPress={() => allowEdits ? setCalendarDisplayed(!calendarDisplayed) : null}
                            />
                            </View>
                            
                            <TextInput 
                                style={styles.input}
                                value={description}
                                editable={allowEdits}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                placeholder="Description"
                            />
                             <CheckBox 
                                containerStyle={{padding: 0}}
                                title={"Live"}
                                checked={live ?? false} 
                                onPress={() => setLive(!live)}
                                disabled={!allowEdits}
                                // textStyle={}
                                // wrapperStyle={{margin: 2}}
                                // style={{margin: 2}}
            
                            />
                        </View>
                        <View style={[styles.inputContainer, {flex: 2}]}>
                            <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                            <TextInput
                                keyboardType="decimal-pad"
                                style={[styles.input]}
                                value={amount}
                                editable={allowEdits}
                                onChangeText={handleAmountChange}
                                placeholder="Wager amount ($)"
                            />
                            </View>
                            
                            <TextInput
                                keyboardType="numbers-and-punctuation"
                                style={[styles.input]}
                                editable={allowEdits}
                                value={odds}
                                onChangeText={handleOddsChange}
                                placeholder="Odds"
                            />
                            <ButtonSelectionGroup 
                                editable={allowEdits}
                                containerStyle={{marginTop: 5}}
                                allowOverflow={false}
                                allowUnselect={true}
                                options={["Win", "Loss", "Push", "Cash Out"]}
                                selected={result}
                                setter={setResult as (s: string | undefined) => void}
                            />
                            {
                                result === "Cash Out" ?
                                <TextInput
                                    editable={allowEdits}
                                    style={[styles.input, {marginTop: 5}]}
                                    value={cashoutValue}
                                    onChangeText={handleCashOutValueChange}
                                    placeholder="Cash Out Value"
                                    keyboardType="numeric"
                                /> : null
                            }
                        </View>
                    </View>
                    {
                        bettorState.betTypes.data
                        ? <ButtonSelectionGroup 
                            editable={allowEdits} 
                            allowOverflow={true} 
                            containerStyle={{paddingTop: 5, paddingRight: 5}} 
                            options={bettorState.betTypes.data} 
                            selected={betType} 
                            setter={setBetType}
                            />
                        : null
                    }
                    {
                        bettorState.sports.data
                        ? <ButtonSelectionGroup 
                            editable={allowEdits} 
                            allowOverflow={true} 
                            containerStyle={{paddingBottom: 5, paddingRight: 5}} 
                            options={bettorState.sports.data} 
                            selected={sport} 
                            setter={setSport} />
                        : null
                    }
                    <Divider />
                    <View style={{alignItems: "center", marginVertical: 2}}>
                        {
                        showStatus ? (
                            saveError 
                                ? <ErrorMessage error={`There was an error saving the wager: ${saveError}`}/> 
                                : <SuccessMessage success="The wager was successfully saved!" />
                        ) : null
                        }
                    </View>
                    
                    {
                        allowEdits ?
                        <View style={{display: "flex", flexDirection: "row", justifyContent: "flex-end", marginTop: 3}}>
                            <Button titleStyle={{fontSize: 10}} buttonStyle={{padding: 5}} title={"Close"} color={"warning"} onPress={props.handleClose} />
                            <Button containerStyle={{marginLeft: 2}} buttonStyle={{padding: 5}} titleStyle={{fontSize: 10}} disabled={!hasChanged() || !inputsValid()} title={"Save"} onPress={handleSubmit} loading={wagerSaving} />
                        </View> : null
                    }
                    
                </SafeAreaView>

                
            </Overlay>
        
    )

})

export default EditWagerModal

const styles = StyleSheet.create({
    input: {
        borderColor: "blue",
        borderRadius: 3,
        borderWidth: 1,
        padding: 4,
        width: "100%",
        marginBottom: 4
    },
    inputContainer: {
        flexDirection: "column", 
        alignItems: "flex-start", 
        justifyContent: "flex-start", 
        padding: 5
    }
})