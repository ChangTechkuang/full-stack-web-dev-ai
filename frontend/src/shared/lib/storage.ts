const ACCESS_KEY = "taskflow.accessToken";
const REFRESH_KEY = "taskflow.refreshToken";

const safeWindow = (): Storage | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

export const tokenStorage = {
  getAccess(): string | null {
    return safeWindow()?.getItem(ACCESS_KEY) ?? null;
  },
  getRefresh(): string | null {
    return safeWindow()?.getItem(REFRESH_KEY) ?? null;
  },
  set(access: string, refresh: string): void {
    const store = safeWindow();
    if (!store) return;
    store.setItem(ACCESS_KEY, access);
    store.setItem(REFRESH_KEY, refresh);
  },
  clear(): void {
    const store = safeWindow();
    if (!store) return;
    store.removeItem(ACCESS_KEY);
    store.removeItem(REFRESH_KEY);
  },
};
