import React from 'react';

export const metadata = {
  title: 'Fonts Collection | Raindrop.io',
  description: 'All your bookmarks in one place. Organize, read and share.',
  icons: {
    icon: '/favicon.ico'
  },
};

export default function OutlookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
