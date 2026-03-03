import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Global Monitor – Geospatial Intelligence Platform',
    description: 'Real-time tracking of aircraft, vessels, and geopolitical events on a high-performance world map.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
