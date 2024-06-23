import { Text } from "@rneui/themed"
import { FunctionComponent, PropsWithChildren } from "react"
import { ActivityIndicator, StyleProp, View, ViewStyle } from "react-native"

interface Props extends PropsWithChildren {
    message: string,
    styles?: StyleProp<ViewStyle>
}
const LoadingComponent: FunctionComponent<Props> = (props) => {
    return (
    <View style={[{
        alignItems: "center",
        backgroundColor: "white",
        width: "100%",
        borderRadius: 3,
        padding: 10
    }, props.styles ?? {}]}>
        <Text style={{marginBottom: 5, fontWeight: "bold"}}>{props.message}</Text>
        <ActivityIndicator color="black" />
    </View>)
}

export default LoadingComponent