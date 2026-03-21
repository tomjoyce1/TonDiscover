import { useEffect, useMemo } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

import { App } from '@/components/App.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { TonClientProvider } from '@/context/ton-client-context.tsx';
import { AppStateProvider } from '@/context/app-context.tsx';

function ErrorBoundaryError({ error }: { error: unknown }) {
    return (
        <div>
            <p>An unhandled error occurred:</p>
            <blockquote>
                <code>
                    {error instanceof Error
                        ? error.message
                        : typeof error === 'string'
                            ? error
                            : JSON.stringify(error)}
                </code>
            </blockquote>
        </div>
    );
}

function Inner() {
    const debug = typeof window !== 'undefined'
        && new URLSearchParams(window.location.search).get('startapp') === 'debug';
    const trim = (value: string | undefined): string => (value ?? '').trim();
    const defaultTwaReturnUrl: `${string}://${string}` = 'https://t.me/tondiscover';
    const manifestUrl = useMemo(() => {
        const configuredManifestUrl = trim(import.meta.env.VITE_TONCONNECT_MANIFEST_URL);
        if (configuredManifestUrl) {
            return configuredManifestUrl;
        }
        return `${window.location.origin}/tonconnect-manifest.json`;
    }, []);
    const twaReturnUrl = useMemo(() => {
        const configuredTwaReturnUrl = trim(import.meta.env.VITE_TWA_RETURN_URL);
        return configuredTwaReturnUrl
            ? (configuredTwaReturnUrl as `${string}://${string}`)
            : defaultTwaReturnUrl;
    }, []);

    // Enable debug mode to see all the methods sent and events received.
    useEffect(() => {
        if (debug) {
            import('eruda').then((lib) => lib.default.init());
        }
    }, [debug]);

    return (
        <TonConnectUIProvider
            manifestUrl={manifestUrl}
            actionsConfiguration={{ twaReturnUrl }}
        >
            <TonClientProvider>
                <AppStateProvider>
                    <App/>
                </AppStateProvider>
            </TonClientProvider>
        </TonConnectUIProvider>
    );
}

export function Root() {
    return (
        <ErrorBoundary fallback={ErrorBoundaryError}>
            <Inner/>
        </ErrorBoundary>
    );
}
