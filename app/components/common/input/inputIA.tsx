import React from "react";
import { Image, StyleSheet, TouchableOpacity, View, Dimensions } from "react-native";
import InputBase from "./inputBase";
const { width, height } = Dimensions.get("window");

interface InputIAProps {
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	onIconPress?: () => void;
	[key: string]: any;
}

export default function InputIA({ value, onChangeText, placeholder, onIconPress, ...rest }: InputIAProps) {
	return (
		<View style={styles.wrapper}>
			<InputBase
				value={value}
				onChangeText={onChangeText}
				placeholder="Tire alguma dúvida"
				{...rest}
			/>
			<TouchableOpacity onPress={onIconPress} style={styles.iconButton}>
				<Image source={require("@assets/icons/up.png")} style={styles.icon} resizeMode="contain" />
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		position: "relative",
		justifyContent: "center",
	},
	iconButton: {
		position: "absolute",
		right: 16,
		top: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		height: "100%",
	},
	icon: {
		width: width * 0.08,
		height: height * 0.04,

	},
});

