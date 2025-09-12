import React from 'react';

export const metadata = {
	title: 'pxlNav - Next',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				{/* Load pxlNav CSS */}
				<link rel="stylesheet" href="./pxlNavStyle.min.css" />
			</head>
			<body style={{ margin: 0, width: '100vw', height: '100vh' }}>{children}</body>
		</html>
	);
}
