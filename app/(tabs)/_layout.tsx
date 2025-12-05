import { Slot, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
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

  return (
    <>
      <Slot />
      <BottomNavbar userPhoto={photo ?? undefined} userName={name ?? undefined} />
    </>
  );
}
