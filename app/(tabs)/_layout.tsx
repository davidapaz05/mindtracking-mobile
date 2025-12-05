import { Slot, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect } from "react";
import BottomNavbar from "../components/navbar/navbar";
import { useProfilePhoto } from "../hooks/useProfilePhoto";

export default function TabsLayout() {
  const { photo, name, loadPhotoFromServer } = useProfilePhoto();

  // Recarrega foto quando qualquer aba ganha foco
  useFocusEffect(
    useCallback(() => {
      loadPhotoFromServer();
      return () => {};
    }, [loadPhotoFromServer])
  );

  // Recarrega foto a cada 5 segundos para sincronização em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      loadPhotoFromServer();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadPhotoFromServer]);

  return (
    <>
      <Slot />
      <BottomNavbar userPhoto={photo ?? undefined} userName={name ?? undefined} />
    </>
  );
}
