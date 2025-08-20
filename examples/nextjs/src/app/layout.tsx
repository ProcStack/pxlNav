import React from 'react';

export const metadata = {
	title: 'pxlNav - Next',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				{/* Load legacy public CSS to mimic react-app behaviour */}
				<link rel="stylesheet" href="/style/pxlNavStyle.css" />
			</head>
			<body style={{ margin: 0, width: '100vw', height: '100vh' }}>{children}</body>
		</html>
	);
}
