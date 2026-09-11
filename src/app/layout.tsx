import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { AppShell } from "@/features/core/components/AppShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
	title: "AI-Note Market",
	description: "AI-Note Market - DDD Learning Project",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="ja" className={cn("font-sans", inter.variable)}>
			<body>
				<AppShell>{children}</AppShell>
			</body>
		</html>
	);
}
