import { FunctionComponent, useEffect, useState } from "react";
import { useAnalyticsDispatch, useAnalyticsState, useAnalyticsStateUtilities } from "../../state/analyticsState";
import { View } from "react-native";
import MultipleButtonSelectionGroup from "../utilities/ButtonMultipleSelectionGroup";
import { Divider } from "@rneui/base";
import { Icon, ListItem, Text } from "@rneui/themed";
import { GlobalStyleAttrs, GlobalStylesheet } from "../../../styles";

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

    const [sportFilterExpanded, setSportFilterExpanded] = useState(false)
    const [betTypeFilterExpanded, setBetTypeFilterExpanded] = useState(false)

    return (
        <View>
            <ListItem.Accordion
                containerStyle={[GlobalStylesheet.box, {marginBottom: 2, padding: 2, backgroundColor: GlobalStyleAttrs.backgroundColors.neutral}]}
                content={
                    <>
                        <Icon name="filter" type="antdesign" style={{marginRight: 10}}/>
                        <Text>Sports</Text>
                    </>
                }
                isExpanded={sportFilterExpanded}
                onPress={() => setSportFilterExpanded(!sportFilterExpanded)}
            >
             <MultipleButtonSelectionGroup 
                containerStyle={{padding: 5}}
                options={availableSports()}
                allowOverflow={false}
                selected={analyticsState.selectedSports}
                setter={(sports) => analyticsDispatch({type: "SET_SELECTED_SPORTS", sports})}
            />
            </ListItem.Accordion>
            <ListItem.Accordion 
                containerStyle={[GlobalStylesheet.box, {marginBottom: 2, padding: 2, backgroundColor: GlobalStyleAttrs.backgroundColors.neutral}]}
                content={
                    <>
                        <Icon name="filter" type="antdesign" style={{marginRight: 10}}/>
                        <Text>Bet types</Text>
                    </>
                }
                isExpanded={betTypeFilterExpanded}
                onPress={() => setBetTypeFilterExpanded(!betTypeFilterExpanded)}
            >
                <MultipleButtonSelectionGroup 
                    containerStyle={{padding: 5}}
                    options={availableBetTypes()}
                    allowOverflow={false}
                    selected={analyticsState.selectedBetTypes}
                    setter={betTypes => analyticsDispatch({type: "SET_SELECTED_BET_TYPES", betTypes})}
                />
            </ListItem.Accordion>
        </View>
    )


}

export default AnalyticsWagerFilterSelection