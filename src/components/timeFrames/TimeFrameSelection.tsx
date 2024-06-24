import { FunctionComponent, useEffect } from "react";
import ButtonSelectionGroup from "../utilities/ButtonSelectionGroup";
import { View } from "react-native";
import { QuarterNum, useTimeFrameSelection } from "../../../utilities/dateUtilities";

interface Props {
    setInitialQuarter?: boolean
    onYearChange: (year: undefined | any) => any,
    onQuarterChange: (quarter: QuarterNum | undefined) => any
}

const TimeFrameSelection: FunctionComponent<Props> = (props) => {
    const {
        selectedQuarter,
        selectedYear,
        setSelectedQuarter,
        setSelectedYear
    } = useTimeFrameSelection(props.setInitialQuarter ?? true)

    useEffect(() => {
        props.onYearChange(selectedYear)
    }, [selectedYear])

    useEffect(() => {
        props.onQuarterChange(selectedQuarter)
    }, [selectedQuarter])


    return (
        <View style={{display: "flex", flexDirection: "row"}}>
            <ButtonSelectionGroup
                options={[2024]}
                selected={selectedYear}
                setter={setSelectedYear}
                allowUnselect={false}
                allowOverflow={true}
                containerStyle={{alignSelf: "flex-start", flex: 1}}
                colorMap={() => "primary"}
            />
            <ButtonSelectionGroup 
                options={[1, 2, 3, 4] as QuarterNum[]}
                selected={selectedQuarter}
                setter={setSelectedQuarter}
                allowUnselect={true}
                allowOverflow={true}
                makeTitle={q => `Q${q}`}
                containerStyle={{flex: 1, justifyContent: "flex-end"}}
                colorMap={() => "primary"}
            />
        </View>
    )
}

export default TimeFrameSelection