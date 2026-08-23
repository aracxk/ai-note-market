/**
 * 記事のライフサイクル状態（ステータス）
 */
export const NOTE_STATUS = {
  /** 下書き（非公開） */
  DRAFT: "DRAFT",
  /** 公開中（販売中） */
  PUBLISHED: "PUBLISHED",
  /** 販売停止（アーカイブ：新規購入不可・既存購入者は閲覧可） */
  ARCHIVED: "ARCHIVED",
} as const;

export type NoteStatus = (typeof NOTE_STATUS)[keyof typeof NOTE_STATUS];
