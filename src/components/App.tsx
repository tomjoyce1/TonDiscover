import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { routes } from '@/constants/routes.ts';

type TelegramWindow = Window & {
    Telegram?: {
        WebApp?: {
            setBgColor?: (color: string) => void;
            setHeaderColor?: (color: string) => void;
            ready?: () => void;
            expand?: () => void;
        };
    };
};

function useTelegramWebAppSetup() {
    useEffect(() => {
        const webApp = (window as TelegramWindow).Telegram?.WebApp;
        if (!webApp) {
            return;
        }

        webApp.setBgColor?.('#17212B');
        webApp.setHeaderColor?.('#17212B');
        webApp.ready?.();
        webApp.expand?.();
    }, []);
}

export function App() {
    useTelegramWebAppSetup();

    return (
        <BrowserRouter>
            <Routes>
                {routes.map((route) => <Route key={route.path} {...route} />)}
                <Route path="*" element={<Navigate to="/"/>}/>
            </Routes>
        </BrowserRouter>
    );
}
