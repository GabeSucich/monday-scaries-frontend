import { FunctionComponent } from "react";
import { useAnalyticsDispatch, useAnalyticsState, useAnalyticsStateUtilities } from "../../state/analyticsState";
import { View } from "react-native";
import TimeFrameSelection from "../../components/timeFrames/TimeFrameSelection";
import AnalyticsWagerFilterSelection from "../../components/wagers/AnalyticsWagerFilterSelection";
import { User } from "../../types";
import { Text } from "@rneui/themed";

const PerformanceAnalyticsView: FunctionComponent<{}> = () => {

    const analyticsDispatch = useAnalyticsDispatch()
    const analyticsState = useAnalyticsState()

    const {analyticsSortedBettorWagerData} = useAnalyticsStateUtilities()

    return (
        <View style={{width: "100%"}}>
            <TimeFrameSelection 
                onYearChange={(year) => analyticsDispatch({type: "SET_TIME_FRAME", year, quarter: analyticsState.selectedQuarter})}
                onQuarterChange={(quarter) => analyticsDispatch({type: "SET_TIME_FRAME", year: analyticsState.selectedYear, quarter})}
            />
            <AnalyticsWagerFilterSelection/>
            {
                analyticsSortedBettorWagerData({filterByDate: true, filterByDetails: true, bettorWagerSorter: (b1, b2) => b1.wagers?.length - b2.wagers?.length}).map(data => {
                    return <Text>{(data.bettor.user as User).firstName}: { data.wagers.length } </Text>
                })
            }
        </View>
    )

}

export default PerformanceAnalyticsView