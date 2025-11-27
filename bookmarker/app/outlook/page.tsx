import React from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled to ensure client component is loaded properly
const OutlookLayout = dynamic(() => import('../../components/outlook/Layout'), { ssr: false });

// Using layout.tsx file for metadata

export default function OutlookPage() {
  return <OutlookLayout />;
}
