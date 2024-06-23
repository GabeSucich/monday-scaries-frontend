import { FunctionComponent, useEffect, useState } from "react"
import { Bettor, User, Wager } from "../../types"
import { CartesianChart, Bar } from "victory-native"
import { useBettorState, useBettorStateUtilities } from "../../state/bettorState"
import { Dimensions, SafeAreaView, View } from "react-native"
import { Text } from "@rneui/themed"

interface ChartConfig {

}

interface SingleMetricBarComparisonProps {
    bettorMetrics: {
        bettor: Bettor,
        wagers: Wager[]
    }[],
    metricName: string,
    metricCalculator: (ws: Wager[]) => number,
    sortByMetric?: boolean,
    sortAscending?: boolean,
    chartConfig?: Partial<ChartConfig>
}

export const SingleMetricBarComparison: FunctionComponent<SingleMetricBarComparisonProps> = (props) => {

    const sortByMetric = props.sortByMetric ?? false
    const sortAscending = props.sortAscending ?? false

    const {bettorState, allBettorWagersLoaded} = useBettorStateUtilities()
    

    const screenWidth = Dimensions.get("window").width

    const [data, setData] = useState<ReturnType<typeof sortedBettorMetrics>>([])

    const [ready, setReady] = useState(false)
    
    useEffect(() => {
        setReady(allBettorWagersLoaded())
    }, [allBettorWagersLoaded()])


    function sortedBettorMetrics(): {bettor: Bettor, name: string, metric: number}[] {
        function sorter(a: {bettor: Bettor, metric: number}, b: {bettor: Bettor, metric: number}) {
            if (sortByMetric) {
                return sortAscending ? a.metric - b.metric : b.metric - a.metric
            }
            return a.bettor._id === bettorState.bettor._id ? -1 : a.bettor._id.localeCompare(b.bettor._id)
        }

        return props.bettorMetrics
            .map(data => ({bettor: data.bettor, name: extractBettorName(data.bettor), metric: props.metricCalculator(data.wagers)}))
            .sort(sorter)
    }

    function extractBettorName(bettor: Bettor) {
        return `${(bettor.user as User).firstName}`
    }

    const chartConfig = {
        ...(props.chartConfig ?? undefined)
    }

    return (
        <View
            style={{
                height: 300,
            }}
        >
            {
                ready ?
                <CartesianChart 
                data={sortedBettorMetrics()}
                xKey="name"
                yKeys={["metric"]}
                domainPadding={{
                    left: 100,
                    right: 100
                }}
            
                >
                {({points, chartBounds}) => 
                    <Bar color={"red"}  points={points.metric} chartBounds={chartBounds}/>
                }
                 </CartesianChart> : <Text>Loading!</Text>
            }

        </View>
    )
}