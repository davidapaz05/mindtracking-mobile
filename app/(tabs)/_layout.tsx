import { Slot, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { getProfile } from "../../service/authService";
import BottomNavbar from "../components/navbar/navbar";

export default function TabsLayout() {
  const [userPhoto, setUserPhoto] = useState<string | undefined>(undefined);
  const [userName, setUserName] = useState<string | undefined>(undefined);

  const loadFromProfile = useCallback(async () => {
    try {
      const res = await getProfile();
      const profile = res?.data || res?.user || res || null;
      const p = profile?.foto_perfil_url || profile?.foto || undefined;
      setUserPhoto(p ? `${String(p)}?t=${Date.now()}` : undefined);
      setUserName(profile?.nome || profile?.name || undefined);
    } catch (err: any) {
      console.log("TabsLayout: getProfile failed:", err?.message || err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    loadFromProfile();
    return () => { mounted = false; };
  }, [loadFromProfile]);

  // Recarrega foto quando a aba ganha foco
  useFocusEffect(
    useCallback(() => {
      loadFromProfile();
      return () => {};
    }, [loadFromProfile])
  );

  return (
    <>
      <Slot />
      <BottomNavbar userPhoto={userPhoto} userName={userName} />
    </>
  );
}
