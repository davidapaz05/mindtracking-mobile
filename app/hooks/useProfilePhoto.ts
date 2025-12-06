import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { getProfile } from "../../service/authService";

const PHOTO_CACHE_KEY = "profile_photo_url";
const NAME_CACHE_KEY = "profile_name";

// Armazena listeners globais para sincronização entre hooks
let photoListeners: Set<(photo: string | null, name: string | null) => void> = new Set();

export function useProfilePhoto() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const appState = useRef(AppState.currentState);
  const subscription = useRef<any>(null);

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
          setName(serverName ? String(serverName) : null);
          await AsyncStorage.setItem(PHOTO_CACHE_KEY, busted);
          if (serverName) {
            await AsyncStorage.setItem(NAME_CACHE_KEY, String(serverName));
          }
          // Notifica todos os listeners
          photoListeners.forEach(listener => listener(busted, serverName ? String(serverName) : null));
          return busted;
        } else {
          setPhoto(null);
          // Atualiza nome mesmo sem foto (importante para sincronizar mudanças de nome)
          setName(serverName ? String(serverName) : null);
          await AsyncStorage.removeItem(PHOTO_CACHE_KEY);
          if (serverName) {
            await AsyncStorage.setItem(NAME_CACHE_KEY, String(serverName));
          }
          // Notifica todos os listeners mesmo sem foto
          photoListeners.forEach(listener => listener(null, serverName ? String(serverName) : null));
          return null;
        }
      }
    } catch (error) {
    }
    return null;
  }, []);

  // Carrega foto do cache local
  const loadPhotoFromCache = useCallback(async () => {
    try {
      const cachedPhoto = await AsyncStorage.getItem(PHOTO_CACHE_KEY);
      const cachedName = await AsyncStorage.getItem(NAME_CACHE_KEY);
      if (cachedPhoto) {
        setPhoto(cachedPhoto);
        setName(cachedName);
        photoListeners.forEach(listener => listener(cachedPhoto, cachedName));
      }
      return cachedPhoto;
    } catch (error) {
    }
    return null;
  }, []);



  // Inicializa e monitora
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      // Primeiro tenta cache
      await loadPhotoFromCache();
      // Depois carrega do servidor
      if (mounted) {
        await loadPhotoFromServer();
        setLoading(false);
      }
    };

    init();

    // Monitora mudanças no app state (quando volta para foreground)
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        // App está retornando para foreground
        loadPhotoFromServer();
      }
      appState.current = nextAppState;
    };

    subscription.current = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      mounted = false;
      if (subscription.current) {
        subscription.current.remove();
      }
    };
  }, []);



  // Registra este hook como listener
  useEffect(() => {
    const listener = (newPhoto: string | null, newName: string | null) => {
      setPhoto(newPhoto);
      setName(newName);
    };
    photoListeners.add(listener);
    return () => {
      photoListeners.delete(listener);
    };
  }, []);

  // Função para atualizar foto localmente e no cache
  const updatePhoto = useCallback(async (newPhotoUrl: string) => {
    if (newPhotoUrl) {
      const busted = `${String(newPhotoUrl)}?t=${Date.now()}`;
      setPhoto(busted);
      await AsyncStorage.setItem(PHOTO_CACHE_KEY, busted);
      photoListeners.forEach(listener => listener(busted, name));
    } else {
      setPhoto(null);
      await AsyncStorage.removeItem(PHOTO_CACHE_KEY);
      photoListeners.forEach(listener => listener(null, null));
    }
  }, [name]);

  // Função para limpar cache (logout)
  const clearPhoto = useCallback(async () => {
    setPhoto(null);
    setName(null);
    await AsyncStorage.removeItem(PHOTO_CACHE_KEY);
    await AsyncStorage.removeItem(NAME_CACHE_KEY);
    photoListeners.forEach(listener => listener(null, null));
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
