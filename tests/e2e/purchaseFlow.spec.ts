import { expect, test } from "@playwright/test";

test.describe("Note Purchase Flow", () => {
	test("ユーザーが記事一覧から記事を購入し、有料エリアが読めるようになる", async ({
		page,
	}) => {
		// 1. トップページにアクセス
		await page.goto("/");
		await expect(page).toHaveTitle(/AI-Note Market/);

		// 2. 記事一覧から「詳細を見る」をクリック
		const articleLink = page.getByRole("link", { name: "詳細を見る" }).first();
		await expect(articleLink).toBeVisible();
		await articleLink.click();

		// 3. 詳細ページに遷移したことを確認
		await expect(page).toHaveURL(/.*\/notes\/demo-note-1/);
		await expect(
			page.getByRole("heading", {
				name: "AIを活用した次世代フロントエンドアーキテクチャ",
			}),
		).toBeVisible();

		// 4. 未購入状態の確認
		const contentLocator = page.locator(".prose");
		await expect(contentLocator).toContainText("無料エリアです");
		await expect(contentLocator).not.toContainText("具体的なプロンプトは");

		// 購入トリガーボタンが存在することを確認（例: ¥500 で購入する）
		const purchaseTriggerButton = page
			.getByRole("button", { name: /で購入する/ })
			.first();
		await expect(purchaseTriggerButton).toBeVisible();

		// 5. 購入モーダルを開く
		await purchaseTriggerButton.click();

		// 6. モーダル内の「確定する」ボタンをクリック
		const confirmButton = page.getByRole("button", { name: "確定する" });
		await expect(confirmButton).toBeVisible();
		await confirmButton.click();

		// 7. 購入処理の完了を待機し、有料エリアのコンテンツが表示されたことを確認
		// ボタンが消える
		await expect(purchaseTriggerButton).toBeHidden({ timeout: 10000 });
		// 有料テキストが表示される
		await expect(contentLocator).toContainText("具体的なプロンプトは");
	});
});
