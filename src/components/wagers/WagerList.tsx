import React, { FunctionComponent, useState } from "react";
import { Bettor, BettorGroup, Wager } from "../../types";
import { FlatList, KeyboardAvoidingView, RefreshControl, ScrollView, StyleProp, View, ViewStyle } from "react-native";
import ErrorMessage from "../alerts/ErrorMessage";
import LoadingComponent from "../alerts/LoadingMessage";
import { GlobalStyleAttrs, GlobalStylesheet } from "../../../styles";
import { FAB, Text } from "@rneui/themed";
import EditWagerModal from "./EditWagerModal";
import DepositModal from "../banking/DepositModal";
import WagerView from "./WagerView";

interface Props {
    containerStyle: StyleProp<ViewStyle>
    wagers: Wager[]
    wagersLoading: boolean
    serverError?: string
    allowEdits: boolean
    bettor: Bettor
    bettorGroup: BettorGroup
    refreshing?: boolean
    newWagerDisabled?: boolean
    newWagerDisabledMessage?: string
    refresh: () => any
}

const WagerList: FunctionComponent<Props> = (props) => {
    const {bettor, bettorGroup, wagers, wagersLoading, allowEdits, serverError, refreshing, refresh, newWagerDisabled, newWagerDisabledMessage } = props

    const [showDepositModal, setShowDepositModal] = useState(false)
    const [showAddWagerModal, setShowAddWagerModal] = useState(false)

    return (
        <View style={{ "alignItems": "center" }}>
            {
                serverError
                    ? <ErrorMessage error={serverError} />
                    : null
            }
            {
                wagersLoading && !refreshing
                    ?
                    <View style={[{ width: "70%", marginTop: 20 }]}>
                        <LoadingComponent styles={[GlobalStylesheet.box, { backgroundColor: GlobalStyleAttrs.backgroundColors.neutral }]} message="Loading wagers..." />
                    </View>
                    :
                    <View
                        style={{ display: "flex", width: "100%", alignItems: "center" }}
                    >
                        {
                            allowEdits ?
                                <View style={{ width: "100%", marginVertical: 10 }}>
                                    <View style={{display: "flex", flexDirection: "row", justifyContent: "flex-end"}}>
                                        <FAB
                                            icon={{ name: 'bank', color: 'white', type: "font-awesome" }}
                                            visible={(!wagersLoading || refreshing) && !serverError}
                                            color={GlobalStyleAttrs.buttonColors.blue}
                                            onPress={() => setShowDepositModal(true)}
                                            size="small"
                                            disabledStyle={{backgroundColor: "red"}}
                                        />
                                        <FAB
                                            containerStyle={{
                                                marginLeft: 10,
                                                marginRight: 30
                                            }}
                                            visible={(!wagersLoading || refreshing) && !serverError}
                                            icon={{ name: 'add', color: 'white' }}
                                            color={GlobalStyleAttrs.buttonColors.green}
                                            size="small"
                                            onPress={() => setShowAddWagerModal(true)}
                                            disabled={newWagerDisabled}
                                        />
                                    
                            
                                    </View>
                                    <KeyboardAvoidingView>
                                        <EditWagerModal allowEdits={allowEdits} wager={undefined} visible={showAddWagerModal} handleClose={() => setShowAddWagerModal(false)} />
                                        <DepositModal
                                            bettor={bettor}
                                            bettorGroup={bettorGroup}
                                            wagers={wagers}
                                            visible={showDepositModal}
                                            handleClose={() => setShowDepositModal(false)}
                                        />
                                    </KeyboardAvoidingView>

                                </View>
                                : null
                        }
                        {
                            allowEdits && newWagerDisabled && newWagerDisabledMessage 
                            ?<Text style={{fontStyle: "italic", fontSize: 10, marginBottom: 2}}>{newWagerDisabledMessage}</Text> 
                            : undefined
                        }
                        <FlatList
                            keyExtractor={(item, index) => item._id}
                            contentContainerStyle={{ width: "90%", alignItems: "center" }}
                            data={wagers}
                            renderItem={w => <WagerView wager={w.item} allowEdits={allowEdits} key={w.item._id} />}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={refresh}/>
                            }
                        />
                        
                    </View>
            }
        </View>
    )
}

export default WagerList