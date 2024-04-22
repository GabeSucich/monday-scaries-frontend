import React, { FunctionComponent, useState } from "react";
import { Wager } from "../types";
import { KeyboardAvoidingView, Modal, Pressable, View } from "react-native";
import { Button, Chip, Divider, Icon, Text } from "@rneui/themed";
import { GlobalStyleAttrs, GlobalStylesheet } from "../../styles";
import EditWagerModal from "./EditWagerModal";
import { oddsToString } from "../../utilities/stringUtilities";

interface Props {
    wager: Wager,
    allowEdits: boolean
}

const WagerView: FunctionComponent<Props> = (props) => {

    const {wager, allowEdits} = props
    const [modalVisible, setModalVisible] = useState(false)


    function chipColor() {
        if (wager.result === "Win") {
            return "green"
        } else if (wager.result === "Loss") {
            return "red"
        } else if (wager.result === "Cash Out") {
            if (wager.payout) {
                return wager.payout >= wager.amount ? "green" : "red"
            }
        }
        return GlobalStyleAttrs.backgroundColors.neutral
    }

    return (
        <Pressable onPress={() => setModalVisible(true)} style={[GlobalStylesheet.box, {backgroundColor: GlobalStyleAttrs.backgroundColors.neutral, marginBottom: 5, padding: 5, minWidth: "100%", "alignItems": "flex-start"}]}>
            <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                <View style={{flex: 10, paddingHorizontal: 2}}>
                    <Text style={{fontSize: 10}}>{wager.contestDate}</Text>
                    <Text style={{fontSize: 12, marginVertical: 5}}>{wager.description}</Text>
                    <Text style={{fontSize: 10, fontWeight: "bold"}}>({oddsToString(wager.odds)})</Text>
                    <View style={{display: "flex", flexDirection: "row", marginTop: 2}}>
                        <Text style={{ fontSize: 10, fontWeight: "bold" }}>Wager: ${wager.amount}</Text>
                        {
                            wager.payout !== undefined
                            ? <Text style={{ fontSize: 10, marginLeft: 20, fontWeight: "bold" }}>Payout: ${wager.payout}</Text>
                            : null
                        }
            
                    </View>

                </View>
                <View style={{flex: 3, alignItems: "flex-end"}}>
                    
                    <Chip titleStyle={{fontSize: 10}} buttonStyle={{padding: 1}} containerStyle={{ padding: 1, opacity: 0.7, marginBottom: 3}} color={chipColor()} title={wager.result ?? "Pending"}/>
                    {
                        wager.payout !== undefined
                        ? <Text style={{fontSize: 10, fontWeight: "bold"}}>{wager.payout < wager.amount ? "-" : "+"} ${Math.abs(wager.payout - wager.amount).toFixed(2)} </Text>
                        : null
                    }
        
                    <KeyboardAvoidingView>
                        <EditWagerModal 
                            wager={wager}
                            visible={modalVisible}
                            handleClose={() => setModalVisible(false)}
                            allowEdits={allowEdits}
                        />
                    </KeyboardAvoidingView>
                    
                </View>
            </View>

        </Pressable>
    )
}

export default WagerView