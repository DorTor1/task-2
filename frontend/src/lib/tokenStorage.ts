const TOKEN_KEY = 'sistema_control_token';

const isBrowser = typeof window !== 'undefined';

const storage = (): Storage => {
  if (!isBrowser) {
    return {
      getItem: () => null,
      setItem: (_key: string, _value: string) => undefined,
      removeItem: (_key: string) => undefined,
      length: 0,
      clear: () => undefined,
      key: (_index: number) => null,
    } as Storage;
  }
  return window.localStorage;
};

export const tokenStorage = {
  get(): string | null {
    return storage().getItem(TOKEN_KEY);
  },
  set(token: string) {
    storage().setItem(TOKEN_KEY, token);
  },
  clear() {
    storage().removeItem(TOKEN_KEY);
  },
};

