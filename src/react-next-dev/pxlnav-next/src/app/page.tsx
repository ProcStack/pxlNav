"use client";
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the client wrapper to ensure it runs only in the browser
const PxlNavClient = dynamic(() => import('../components/PxlNavClient'), { ssr: false });

export default function Page() {
	return (
		<main style={{ width: '100vw', height: '100vh' }}>
			<PxlNavClient />
		</main>
	);
}