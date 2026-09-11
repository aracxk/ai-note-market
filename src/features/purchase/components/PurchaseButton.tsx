"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { purchaseNoteAction } from "@/app/actions/purchaseNoteAction";
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

const schema = z.object({
	noteId: z.string().min(1),
});

export function PurchaseButton({
	noteId,
	price,
}: {
	noteId: string;
	price: number;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const form = useForm({
		resolver: zodResolver(schema),
		defaultValues: { noteId },
	});

	async function onSubmit(data: z.infer<typeof schema>) {
		setIsPending(true);
		setErrorMessage(null);

		try {
			// 例外をキャッチするのではなく、戻り値でエラーを判定する
			const result = await purchaseNoteAction(data.noteId);
			if (!result.success) {
				setErrorMessage(result.error || "購入に失敗しました。");
				return;
			}
			setIsOpen(false);
		} catch (error) {
			setErrorMessage("予期せぬ通信エラーが発生しました。");
			console.error(error);
		} finally {
			setIsPending(false);
		}
	}

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
