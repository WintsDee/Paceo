/// <reference types="vite/client" />

declare module 'virtual:pwa-register' {
  export function registerSW(options?: { immediate?: boolean }): (reload?: boolean) => void
}

declare module 'virtual:pwa-register/vanilla' {
  export function registerSW(options?: { immediate?: boolean }): (reload?: boolean) => void
}

declare module 'virtual:pwa-register/react' {
  export function useRegisterSW(options?: { immediate?: boolean }): { needRefresh: { value: boolean }, offlineReady: { value: boolean }, updateServiceWorker: (reload?: boolean) => void }
}

