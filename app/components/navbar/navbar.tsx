import { usePathname, useRouter } from "expo-router";
import React from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "../common/Avatar";

const { width, height } = Dimensions.get("window");

const TABS = [
  { name: "Home", route: "/(tabs)/home", icon: require("@assets/icons/home.png") },
  { name: "Notes", route: "/(tabs)/diario", icon: require("@assets/icons/Frame.png") },
  { name: "Brain", route: "/(tabs)/ia", icon: require("@assets/icons/logo.png") },
  { name: "Grid", route: "/(tabs)/dashboard", icon: require("@assets/icons/dashboard.png") },
  { name: "Profile", route: "/(tabs)/perfil", icon: require("@assets/icons/perfil.png") }, // Corrigi o ícone para seguir o padrão
];

type Props = {
  userPhoto?: string;
  userName?: string;
};

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0]?.toUpperCase() || "";
  const second = parts.length > 1 ? parts[1]?.[0]?.toUpperCase() : "";
  return `${first}${second}` || "?";
}

export default function BottomNavbar({ userPhoto, userName }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const hideOnPaths = ["/(tabs)/editarperfil", "/editarperfil"];
  if (pathname && hideOnPaths.some(p => pathname.includes(p))) return null;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {TABS.map((tab, index) => {
        const isActive = pathname.includes(tab.route) || tab.route.includes(pathname);

        return (
          <TouchableOpacity
            key={index}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => router.push(tab.route as any)}
          >
            {tab.name === "Profile" ? (
              <Avatar photo={userPhoto} name={userName} size="small" />
            ) : (
              <Image
                source={tab.icon}
                style={[
                  styles.icon,
                  isActive && styles.iconActive,
                  tab.name === "Brain" && styles.logoIcon,
                ]}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderTopWidth: height * 0.004,
    borderTopColor: "#2563EA",
    paddingHorizontal: width * 0.06,
  },
  tab: {
    minWidth: width * 0.12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    paddingVertical: height * 0.006,
  },
  activeTab: {
    backgroundColor: "#2563eb",
    paddingHorizontal: width * 0.03,
  },
  icon: {
    width: width * 0.065,
    height: height * 0.04,
    tintColor: "#fff",
  },
  logoIcon: {
    width: width * 0.12,
    height: height * 0.06,
  },
  iconActive: {
    tintColor: "#fff",
  },
});