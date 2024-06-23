import { FunctionComponent } from "react"
import {SingleMetricBarComparison} from "./BarGraphMetricComparison"
import { useAnalyticsStateUtilities } from "../../state/analyticsState"
import { wagersProfit } from "../../../utilities/bettorUtilities"


export const ProfitComparison: FunctionComponent<{}> = (props) => {
    
    const {analyticsSortedBettorWagerData} = useAnalyticsStateUtilities()
    
    return (
        <SingleMetricBarComparison 
            bettorMetrics={analyticsSortedBettorWagerData()}
            metricCalculator={wagersProfit}
            metricName="Profit"
            sortByMetric
        />
    )
}