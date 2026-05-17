/// <reference types="vite/client" />

import type { ElectronAPI } from '../../preload/index.d'

declare global {
  interface Window {
    api: ElectronAPI
  }
}
