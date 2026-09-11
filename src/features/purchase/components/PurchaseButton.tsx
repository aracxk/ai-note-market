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

	const form = useForm({
		resolver: zodResolver(schema),
		defaultValues: { noteId },
	});

	async function onSubmit(data: z.infer<typeof schema>) {
		setIsPending(true);
		try {
			await purchaseNoteAction(data.noteId);
			setIsOpen(false);
		} catch (error) {
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
