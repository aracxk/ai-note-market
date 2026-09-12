import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
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
	// GA4のトラッキングID（環境変数が未設定の場合はデモ用のダミーID）
	const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX";

	return (
		<html lang="ja" className={cn("font-sans antialiased", inter.variable)}>
			<body>
				<AppShell>{children}</AppShell>
			</body>
			{/* Vercel公式のGA4連携コンポーネント（SPA遷移時のPVも自動計測） */}
			<GoogleAnalytics gaId={gaId} />
		</html>
	);
}
