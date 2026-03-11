/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SNCF_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
