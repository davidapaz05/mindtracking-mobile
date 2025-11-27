import AsyncStorage from "@react-native-async-storage/async-storage";
import { Slot } from "expo-router";
import React, { useEffect, useState } from "react";
import BottomNavbar from "../components/navbar/navbar";

export default function TabsLayout() {
  const [userPhoto, setUserPhoto] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    const loadPhoto = async () => {
      try {
        const f = await AsyncStorage.getItem("foto");
        if (mounted) setUserPhoto(f ?? undefined);
      } catch {}
    };
    loadPhoto();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <Slot />
      <BottomNavbar userPhoto={userPhoto} />
    </>
  );
}
