import { Slot } from "expo-router";
import BottomNavbar from "../components/navbar/navbar";

export default function TabsLayout() {
  return (
    <>
      <Slot />
      <BottomNavbar />
    </>
  );
}
