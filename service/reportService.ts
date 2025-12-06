import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import { ENV } from "../config/env";
import { getProfile } from "./authService";

export async function exportUserPdf() {
  try {
    let userId: string | number | null = null;

    try {
      const res = await getProfile();
      const profile = (res as any)?.data || (res as any)?.user || res || null;
      userId = profile?.id || profile?.usuario_id || profile?.userId || null;
    } catch {}

    if (!userId) {
      const storedId = await AsyncStorage.getItem("usuario_id");
      if (storedId) userId = storedId;
    }

    if (!userId) throw new Error("ID do usuário não encontrado");

    const base = (ENV.API_BASE_URL || "").replace(/\/+$/, "");
    const url = `${base}/export/pdf/${userId}`;

    const token = await AsyncStorage.getItem("token");
    const fileUri = FileSystem.documentDirectory + `relatorio-${Date.now()}.pdf`;

    try {
      const dl = await FileSystem.downloadAsync(url, fileUri, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!dl || dl.status !== 200) {
        await WebBrowser.openBrowserAsync(url);
        return;
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(dl.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Exportar PDF",
        });
      } else {
        await WebBrowser.openBrowserAsync(dl.uri);
      }
    } catch (err) {
      await WebBrowser.openBrowserAsync(url);
    }
  } catch (err: any) {

  }
}

export default { exportUserPdf };
