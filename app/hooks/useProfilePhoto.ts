import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { getProfile } from "../../service/authService";

const PHOTO_CACHE_KEY = "profile_photo_url";
const NAME_CACHE_KEY = "profile_name";

export function useProfilePhoto() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega foto do servidor e atualiza cache
  const loadPhotoFromServer = useCallback(async () => {
    try {
      const res = await getProfile();
      const profile = res?.data || res?.user || res || null;
      if (profile) {
        const serverPhoto = profile.foto_perfil_url || profile.foto || null;
        const serverName = profile.nome || profile.name || null;

        if (serverPhoto) {
          const busted = `${String(serverPhoto)}?t=${Date.now()}`;
          setPhoto(busted);
          await AsyncStorage.setItem(PHOTO_CACHE_KEY, busted);
          if (serverName) {
            setName(String(serverName));
            await AsyncStorage.setItem(NAME_CACHE_KEY, String(serverName));
          }
          return busted;
        } else {
          setPhoto(null);
          await AsyncStorage.removeItem(PHOTO_CACHE_KEY);
          return null;
        }
      }
    } catch (error) {
      console.log("useProfilePhoto: Failed to load from server:", error);
    }
    return null;
  }, []);

  // Carrega foto do cache local
  const loadPhotoFromCache = useCallback(async () => {
    try {
      const cachedPhoto = await AsyncStorage.getItem(PHOTO_CACHE_KEY);
      const cachedName = await AsyncStorage.getItem(NAME_CACHE_KEY);
      if (cachedPhoto) setPhoto(cachedPhoto);
      if (cachedName) setName(cachedName);
      return cachedPhoto;
    } catch (error) {
      console.log("useProfilePhoto: Failed to load from cache:", error);
    }
    return null;
  }, []);

  // Inicializa: tenta cache, depois servidor
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      // Primeiro tenta cache
      await loadPhotoFromCache();
      // Depois carrega do servidor (com ou sem cache)
      if (mounted) {
        await loadPhotoFromServer();
        setLoading(false);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  // Função para atualizar foto localmente e no cache
  const updatePhoto = useCallback(async (newPhotoUrl: string) => {
    if (newPhotoUrl) {
      const busted = `${String(newPhotoUrl)}?t=${Date.now()}`;
      setPhoto(busted);
      await AsyncStorage.setItem(PHOTO_CACHE_KEY, busted);
    } else {
      setPhoto(null);
      await AsyncStorage.removeItem(PHOTO_CACHE_KEY);
    }
  }, []);

  // Função para limpar cache (logout)
  const clearPhoto = useCallback(async () => {
    setPhoto(null);
    setName(null);
    await AsyncStorage.removeItem(PHOTO_CACHE_KEY);
    await AsyncStorage.removeItem(NAME_CACHE_KEY);
  }, []);

  return {
    photo,
    name,
    loading,
    loadPhotoFromServer,
    loadPhotoFromCache,
    updatePhoto,
    clearPhoto,
  };
}
