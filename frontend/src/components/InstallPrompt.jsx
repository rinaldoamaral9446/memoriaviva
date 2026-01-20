import { useState, useEffect } from 'react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            console.log('✨ PWA Install Prompt captured');
        };

        window.addEventListener('beforeinstallprompt', handler);

        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed');
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
    };

    if (!deferredPrompt) return null;

    return (
        <button
            onClick={handleInstallClick}
            className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-purple-700 text-white px-4 py-3 rounded-full shadow-lg hover:bg-purple-800 transition-all animate-bounce"
        >
            <span>📲</span>
            <span className="font-medium">Instalar App</span>
        </button>
    );
}
