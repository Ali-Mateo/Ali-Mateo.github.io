/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_GOOGLE_FORM_ID: string;
  readonly REACT_APP_ENTRY_NAME: string;
  readonly REACT_APP_ENTRY_PASES: string;
  readonly REACT_APP_ENTRY_ESTADO: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
