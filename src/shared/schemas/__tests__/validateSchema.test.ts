import { describe, it, expect } from "vitest";
import { z } from "zod";
import { SchemaValidationError } from "../ValidationError";
import { validateSchema } from "../validateSchema";

describe("validateSchema (Zod 境界防御共通ヘルパー)", () => {
  const sampleSchema = z.object({
    name: z.string().min(2, "名前は2文字以上です"),
    age: z.number().int().min(0, "年齢は0以上です"),
  });

  it("正常なデータが渡された場合、Result.ok でパース済みデータが返ること", () => {
    const rawData: unknown = { name: "Alice", age: 25 };

    const result = validateSchema(sampleSchema, rawData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.name).toBe("Alice");
      expect(result.value.age).toBe(25);
    }
  });

  it("不正なデータ（型不一致・制約違反）が渡された場合、Result.err で SchemaValidationError が返ること", () => {
    const rawData: unknown = { name: "A", age: -5 };

    const result = validateSchema(sampleSchema, rawData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(SchemaValidationError);
      expect(result.error.code).toBe("SCHEMA_VALIDATION_ERROR");
      expect(result.error.fieldErrors).toHaveLength(2);

      const fieldNames = result.error.fieldErrors.map((f) => f.field);
      expect(fieldNames).toContain("name");
      expect(fieldNames).toContain("age");
    }
  });

  it("オブジェクト以外の不正な生データ（文字列など）が渡された場合も安全にエラーを返すこと", () => {
    const rawData: unknown = "invalid raw json string";

    const result = validateSchema(sampleSchema, rawData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(SchemaValidationError);
      expect(result.error.fieldErrors.length).toBeGreaterThan(0);
    }
  });
});
