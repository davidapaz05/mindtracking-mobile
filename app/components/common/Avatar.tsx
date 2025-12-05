import React from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

const { width, height } = Dimensions.get("window");

interface AvatarProps {
  photo?: string | null;
  name?: string | null;
  size?: "small" | "medium" | "large";
}

const sizes = {
  small: width * 0.12,
  medium: width * 0.25,
  large: width * 0.442,
};

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0]?.[0]?.toUpperCase() || "";
  const second = parts.length > 1 ? parts[1]?.[0]?.toUpperCase() : "";
  return `${first}${second}` || "?";
}

export default function Avatar({ photo, name, size = "medium" }: AvatarProps) {
  const avatarSize = sizes[size];
  const fontSize = size === "small" ? width * 0.04 : size === "medium" ? width * 0.08 : width * 0.12;

  if (photo) {
    return (
      <Image
        source={{ uri: photo }}
        style={[
          styles.photo,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.initialsContainer,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
        },
      ]}
    >
      <Text style={[styles.initialsText, { fontSize }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: {
    resizeMode: "cover",
  },
  initialsContainer: {
    backgroundColor: "#93C5FD",
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    color: "#0F172A",
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
});
