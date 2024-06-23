import { Text } from "@rneui/themed";
import React, { FunctionComponent } from "react";
import { View } from "react-native";

interface Props {
    error: string
}

const ErrorMessage: FunctionComponent<Props> = (props) => {
    const {error} = props
    if (error ?? true) {
        return <View
            style={{
                marginTop: 5,
                backgroundColor: "white",
                borderWidth: 3,
                borderColor: "red",
                opacity: 0.8,
                borderRadius: 5,
                width: "90%",
                paddingVertical: 5,
            }}
        >
            <Text
            style={{
                // opacity: 0.8,
                borderRadius: 100,
                textAlign: "center",
                color: "red"
            }}
            >
            {error}
            </Text>
        </View>
        
    }
    return null
}

export default ErrorMessage