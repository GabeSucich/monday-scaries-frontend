import { Text } from "@rneui/themed";
import React, { FunctionComponent } from "react";
import { View } from "react-native";

interface Props {
    success: string
}

const SuccessMessage: FunctionComponent<Props> = (props) => {
    const {success} = props
    if (success) {
        return <View
            style={{
                marginTop: 5,
                backgroundColor: "white",
                borderWidth: 3,
                borderColor: "green",
                opacity: 0.8,
                borderRadius: 5,
                width: "90%",
                padding: 5,
            }}
        >
            <Text
            style={{
                // opacity: 0.8,
                borderRadius: 100,
                textAlign: "center",
                color: "green"
            }}
            >
            {success}
            </Text>
        </View>
        
    }
    return null
}

export default SuccessMessage