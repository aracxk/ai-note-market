import { z } from "zod";
import { Result } from "@/shared/core/Result";
import { SchemaValidationError } from "./ValidationError";

/**
 * Zod スキーマで外部入力（unknown）を安全に検証し、Result 型で返却する共通ユーティリティ
 *
 * 責務:
 * - Zod の safeParse を実行し、成功時は Result.ok(T)、失敗時は Result.err(SchemaValidationError) を返す。
 * - UI や API ルートの最前線で呼び出され、型安全なデータだけをユースケース層へ通す門番となる。
 */
export function validateSchema<T>(
  schema: z.ZodType<T>,
  data: unknown
): Result<T, SchemaValidationError> {
  const parseResult = schema.safeParse(data);

  if (!parseResult.success) {
    return Result.err(new SchemaValidationError(parseResult.error));
  }

  return Result.ok(parseResult.data);
}
