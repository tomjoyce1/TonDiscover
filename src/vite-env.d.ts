/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHARED_FEED_URL?: string;
  readonly VITE_SHARED_FEED_READ_URL?: string;
  readonly VITE_SHARED_FEED_WRITE_URL?: string;
  readonly VITE_SHARED_FEED_WRITE_METHOD?: 'POST' | 'PUT' | 'PATCH';
  readonly VITE_SHARED_FEED_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
