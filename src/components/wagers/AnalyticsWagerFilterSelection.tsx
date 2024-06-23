import { FunctionComponent, useEffect } from "react";
import { useAnalyticsDispatch, useAnalyticsState, useAnalyticsStateUtilities } from "../../state/analyticsState";
import { View } from "react-native";
import MultipleButtonSelectionGroup from "../utilities/ButtonMultipleSelectionGroup";
import { Divider } from "@rneui/base";

const AnalyticsWagerFilterSelection: FunctionComponent<{}> = () => {

    const analyticsDispatch = useAnalyticsDispatch()
    const { analyticsSortedBettorWagerData, analyticsState } = useAnalyticsStateUtilities()

    function allBettorWagersInPeriod() {
        return analyticsSortedBettorWagerData().flatMap(d => d.wagers)
    }

    useEffect(() => {
        const _allBetTypes = availableBetTypes()
        const _allSports = availableSports()
        analyticsDispatch({
            type: "SET_SELECTED_BET_TYPES",
            betTypes: analyticsState.selectedBetTypes.filter(b => _allBetTypes.includes(b))
        })
        analyticsDispatch({
            type: "SET_SELECTED_SPORTS",
            sports: analyticsState.selectedSports.filter(s => _allSports.includes(s))
        })

    }, [analyticsState.selectedYear, analyticsState.selectedQuarter])


    function availableSports() {
        const sportsCounts = {} as Record<string, number>
        allBettorWagersInPeriod().forEach(w => {
            if (w.details?.sport) {
                sportsCounts[w.details.sport] = (sportsCounts[w.details.sport] ?? 0) + 1
            }
        })
        return   Object.entries(sportsCounts).sort((a, b) => b[1] - a[1]).map(pair => pair[0])
    }

    function availableBetTypes() {
        const betTypeCounts = {} as Record<string, number>
        allBettorWagersInPeriod().forEach(w => {
            if (w.details?.betType) {
                betTypeCounts[w.details.betType] = (betTypeCounts[w.details.betType] ?? 0) + 1
            }
        })
        return  Object.entries(betTypeCounts).sort((a, b) => b[1] - a[1]).map(pair => pair[0])
    }

    return (
        <View>
            <MultipleButtonSelectionGroup 
                options={availableSports()}
                allowOverflow={false}
                selected={analyticsState.selectedSports}
                setter={(sports) => analyticsDispatch({type: "SET_SELECTED_SPORTS", sports})}
            />
            <Divider/>
            <MultipleButtonSelectionGroup 
                options={availableBetTypes()}
                allowOverflow={false}
                selected={analyticsState.selectedBetTypes}
                setter={betTypes => analyticsDispatch({type: "SET_SELECTED_BET_TYPES", betTypes})}
            />
        </View>
    )


}

export default AnalyticsWagerFilterSelection