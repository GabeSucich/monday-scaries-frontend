import { Button } from "@rneui/themed";
import React from "react";
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type Props<T> = {
    options: T[],
    selected: T[],
    setter: (s: T[]) => void,
    containerStyle?: StyleProp<ViewStyle>,
    buttonContainerStyle?: StyleProp<ViewStyle>,
    buttonStyle?: StyleProp<ViewStyle>,
    allowOverflow?: boolean
    colorMap?: (v: T) => string | undefined
    makeTitle?: (v: T) => string
    editable?: boolean
}

function MultipleButtonSelectionGroup<T>(props: Props<T>) {
    const editable = props.editable ?? true

    function handlePress(val: T) {
        if (!editable) {
            return
        }
        if (props.selected.includes(val)) {
            props.setter(props.selected.filter(v => v !== val))
        } else {
            props.setter([...props.selected].concat([val]))
        }
    }

    function Buttons() {
        return props.options.map((option, index) => {
            return <Button 
                color={props.colorMap ? props.colorMap(option) ?? "secondary" : "secondary"} 
                titleStyle={{fontSize: 13}} 
                buttonStyle={[props.buttonStyle ?? {}, {paddingVertical: 3}]} 
                type={props.selected?.includes(option) ? "solid" : "outline"} 
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


export default MultipleButtonSelectionGroup

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