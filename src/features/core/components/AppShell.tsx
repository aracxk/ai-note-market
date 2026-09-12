"use client";

import { Book, Home, Menu, PenSquare, User } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

export function AppShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-white text-gray-900 font-sans">
			<header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
				<div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
					{/* 左側：ロゴ */}
					<div className="flex items-center gap-6">
						<Link href="/" className="font-extrabold text-lg tracking-tight">
							AI-Note
						</Link>
					</div>

					{/* 右側：PCレイアウト (md以上) */}
					<nav className="hidden md:flex items-center gap-4">
						<Link href="/history">
							<Button variant="ghost" className="text-sm font-medium">
								購入履歴
							</Button>
						</Link>
						<Link href="/profile">
							<Button variant="ghost" className="text-sm font-medium">
								マイページ
							</Button>
						</Link>
						{/* PCはテキスト＋アイコン */}
						<Button
							className="rounded-full px-5 font-bold flex items-center gap-2"
							size="sm"
						>
							<PenSquare className="w-4 h-4" />
							<span>記事を書く</span>
						</Button>
					</nav>

					{/* 右側：モバイルレイアウト (md未満) */}
					<div className="flex items-center gap-3 md:hidden">
						{/* モバイルは極限まで削ぎ落としてアイコンのみ */}
						<Button
							size="icon"
							variant="ghost"
							className="rounded-full w-9 h-9"
							aria-label="記事を書く"
						>
							<PenSquare className="w-5 h-5 text-gray-700" />
						</Button>

						{/* ハンバーガーメニュー (Sheet) */}
						<Sheet>
							<SheetTrigger>
								<Button
									size="icon"
									variant="ghost"
									className="rounded-full w-9 h-9"
								>
									<Menu className="w-6 h-6 text-gray-700" />
								</Button>
							</SheetTrigger>
							<SheetContent side="right" className="w-[300px] sm:w-[400px]">
								<SheetHeader className="text-left mb-8">
									<SheetTitle className="font-extrabold text-2xl">
										Menu
									</SheetTitle>
								</SheetHeader>
								<nav className="flex flex-col gap-6">
									<Link
										href="/"
										className="flex items-center gap-4 text-lg font-medium text-gray-600 hover:text-black"
									>
										<Home className="w-6 h-6" /> ホーム
									</Link>
									<Link
										href="/history"
										className="flex items-center gap-4 text-lg font-medium text-gray-600 hover:text-black"
									>
										<Book className="w-6 h-6" /> 購入履歴
									</Link>
									<Link
										href="/profile"
										className="flex items-center gap-4 text-lg font-medium text-gray-600 hover:text-black"
									>
										<User className="w-6 h-6" /> マイページ
									</Link>
								</nav>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</header>

			{/* メインコンテンツ領域 */}
			<main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
				{children}
			</main>
		</div>
	);
}
