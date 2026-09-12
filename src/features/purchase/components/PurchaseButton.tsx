"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { usePurchaseNote } from "../hooks/usePurchaseNote";

export function PurchaseButton({
	noteId,
	price,
}: {
	noteId: string;
	price: number;
}) {
	// ロジックを完全にHooksへ委譲（Custom Hook パターン）
	const { form, isOpen, setIsOpen, isPending, errorMessage, onSubmit } =
		usePurchaseNote(noteId);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger>
				<Button type="button" className="w-full md:w-auto" size="lg">
					{price === 0
						? "無料で手に入れる"
						: `¥${price.toLocaleString()} で購入する`}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>購入の確認</DialogTitle>
					<DialogDescription>
						この記事を購入します。よろしいですか？
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					{errorMessage && (
						<div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
							{errorMessage}
						</div>
					)}
					<DialogFooter className="mt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsOpen(false)}
						>
							キャンセル
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "処理中..." : "確定する"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
