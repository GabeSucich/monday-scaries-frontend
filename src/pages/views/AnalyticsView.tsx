import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import React, { FunctionComponent } from "react";
import { BettorTabStackParamsList } from "./BettorView";
import { View } from "react-native";
import { Text } from "@rneui/themed";
import { useBettorDispatch, useBettorState, useBettorStateUtilities } from "../../state/bettorState";
import { useApiState } from "../../state/apiState";
import { LineChart } from "react-native-chart-kit";
import { wagersToLineChartData } from "../../../utilities/bettorUtilities";

type Props = BottomTabScreenProps<BettorTabStackParamsList, "Analytics">

const AnalyticsView: FunctionComponent<Props> = (props) => {

    const {
        bettorState,
        bettorGroupBettorsServerData,
        allBettorWagersLoaded,
        sortedBettorWagerData,
        bettorWagerErrors
    } = useBettorStateUtilities({useEffects: true})

    const [bettorGroupBettors, _, bettorGroupBettorsLoading, serverError] = bettorGroupBettorsServerData

    function wagerChartData(bettorId: string) {
        const wagers = bettorState.allBettorWagers[bettorId]?.wagers
        const deposits = bettorState.allBettorWagers[bettorId]?.bettor.deposits
        if (!wagers || !deposits) {
            return undefined
        }
        return wagersToLineChartData(wagers, deposits)
    }
    
    return (
        <View style={{paddingTop: 10, alignItems: "center"}}>
            <Text>Analytics!</Text>
            {
                wagerChartData(bettorState.bettor._id) ?
                <LineChart 
                    data={{
                        labels: ["1", "2", "3"],
                        datasets: [{
                            data: wagerChartData(bettorState.bettor._id)
                        }],
                    }}
                    width={400}
                    height={400}
                    chartConfig={{
                        color: () => "red"
                    }}
                />
                : <Text>Loading...</Text>

            }
            
        </View>
    )
}

export default AnalyticsView


