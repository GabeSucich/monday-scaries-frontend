import { Button, Text } from "@rneui/themed";
import React, { FunctionComponent } from "react";
import { Pressable, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type Props<T> = {
    options: T[],
    selected?: T,
    setter: (s: T | undefined) => void,
    containerStyle?: StyleProp<ViewStyle>,
    buttonContainerStyle?: StyleProp<ViewStyle>,
    buttonStyle?: StyleProp<ViewStyle>,
    allowUnselect?: boolean
    allowOverflow?: boolean
    colorMap?: (v: T) => string | undefined
    makeTitle?: (v: T) => string
    editable?: boolean
}

function ButtonSelectionGroup<T>(props: Props<T>) {
    const allowUnselect = props.allowUnselect ?? true
    const editable = props.editable ?? true

    function handlePress(val: T) {
        if (!editable) {
            return
        }
        if (val === props.selected && allowUnselect) {
            props.setter(undefined)
        } else {
            props.setter(val)
        }
    }

    function Buttons() {
        return props.options.map((option, index) => {
            return <Button 
                color={props.colorMap ? props.colorMap(option) ?? "secondary" : "secondary"} 
                titleStyle={{fontSize: 13}} 
                buttonStyle={[props.buttonStyle ?? {}, {paddingVertical: 3}]} 
                type={option === props.selected ? "solid" : "outline"} 
                containerStyle={[props.buttonContainerStyle ?? {}, {marginRight: 2}]}
                title={props.makeTitle ? props.makeTitle(option): String(option)} 
                onPress={() => handlePress(option)} 
                key={index}
            />
        })
    }

    return (
        <View style={[styles.container, props.containerStyle ?? {}, {flexWrap: props.allowOverflow ? "nowrap" : "wrap"}]}> 
            {
                props.allowOverflow ?  
                <ScrollView 
                horizontal 
                style={{padding: 5}}>
                    { Buttons()}
                </ScrollView> : Buttons()


            }
           
        </View>
    
    )
}


export default ButtonSelectionGroup

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        rowGap: 2,
    },
    button: {
        fontSize: 8,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: "blue",
        color: "blue",
        padding: 2
    },
    selectedButton: {
        backgroundColor: "blue",
        color: "white"
    }
})