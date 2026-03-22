/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHARED_FEED_URL?: string;
  readonly VITE_SHARED_FEED_READ_URL?: string;
  readonly VITE_SHARED_FEED_WRITE_URL?: string;
  readonly VITE_SHARED_FEED_WRITE_METHOD?: 'POST' | 'PUT' | 'PATCH';
  readonly VITE_SHARED_FEED_TOKEN?: string;
  readonly VITE_TONCONNECT_MANIFEST_URL?: string;
  readonly VITE_TWA_RETURN_URL?: string;
  readonly VITE_CREATOR_REPUTATION_CONTRACT_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
