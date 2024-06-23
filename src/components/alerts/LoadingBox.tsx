import { FunctionComponent } from "react";
import { View } from "react-native";
import LoadingComponent from "./LoadingMessage";
import { GlobalStylesheet, GlobalStyleAttrs } from "../../../styles";

const LoadingBox: FunctionComponent<{message: string}> = ({message}) => {
    return (
        <View style={[{ width: "70%", marginTop: 20 }]}>
            <LoadingComponent styles={[GlobalStylesheet.box, { backgroundColor: GlobalStyleAttrs.backgroundColors.neutral }]} message={message} />
        </View>
    )
}

export default LoadingBox