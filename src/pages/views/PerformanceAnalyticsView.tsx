import { FunctionComponent } from "react";
import { useAnalyticsDispatch, useAnalyticsState } from "../../state/analyticsState";
import { View } from "react-native";
import TimeFrameSelection from "../../components/timeFrames/TimeFrameSelection";
import AnalyticsWagerFilterSelection from "../../components/wagers/AnalyticsWagerFilterSelection";

const PerformanceAnalyticsView: FunctionComponent<{}> = () => {

    const analyticsDispatch = useAnalyticsDispatch()
    const analyticsState = useAnalyticsState()

    return (
        <View>
            <TimeFrameSelection 
                onYearChange={(year) => analyticsDispatch({type: "SET_TIME_FRAME", year, quarter: analyticsState.selectedQuarter})}
                onQuarterChange={(quarter) => analyticsDispatch({type: "SET_TIME_FRAME", year: analyticsState.selectedYear, quarter})}
            />
            <AnalyticsWagerFilterSelection/>
        </View>
    )

}

export default PerformanceAnalyticsView