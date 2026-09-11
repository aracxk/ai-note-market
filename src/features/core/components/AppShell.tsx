import Link from "next/link";
import type React from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
			<header className="fixed bottom-0 w-full md:w-64 md:h-screen md:relative bg-white border-t md:border-r border-gray-200 z-50">
				<div className="flex flex-row md:flex-col h-16 md:h-full items-center md:items-start justify-around md:justify-start md:p-6">
					<div className="hidden md:block font-bold text-xl mb-8">
						AI-Note Market
					</div>
					<nav className="flex flex-row md:flex-col gap-4 md:gap-6 w-full md:w-auto px-4 md:px-0">
						<Link
							href="/"
							className="flex flex-col md:flex-row items-center gap-1 md:gap-3 text-sm md:text-base font-medium text-gray-700 hover:text-black"
						>
							<span className="text-xl">🏠</span>
							<span>ホーム</span>
						</Link>
						<Link
							href="/history"
							className="flex flex-col md:flex-row items-center gap-1 md:gap-3 text-sm md:text-base font-medium text-gray-700 hover:text-black"
						>
							<span className="text-xl">📚</span>
							<span>購入履歴</span>
						</Link>
						<Link
							href="/profile"
							className="flex flex-col md:flex-row items-center gap-1 md:gap-3 text-sm md:text-base font-medium text-gray-700 hover:text-black"
						>
							<span className="text-xl">👤</span>
							<span>マイページ</span>
						</Link>
					</nav>
				</div>
			</header>
			<main className="flex-1 pb-16 md:pb-0">
				<div className="max-w-4xl mx-auto p-4 md:p-8">{children}</div>
			</main>
		</div>
	);
}
