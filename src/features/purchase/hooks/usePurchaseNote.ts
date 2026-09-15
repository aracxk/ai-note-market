import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { purchaseNoteAction } from "@/app/actions/purchaseNoteAction";
import {
	type PurchaseFormData,
	purchaseFormSchema,
} from "../schemas/purchaseFormSchema";

export function usePurchaseNote(noteId: string) {
	const [isOpen, setIsOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const form = useForm<PurchaseFormData>({
		resolver: zodResolver(purchaseFormSchema),
		defaultValues: { noteId },
	});

	async function onSubmit(data: PurchaseFormData) {
		setIsPending(true);
		setErrorMessage(null);

		try {
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

	return {
		form,
		isOpen,
		setIsOpen,
		isPending,
		errorMessage,
		onSubmit,
	};
}
