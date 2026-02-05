type SuiMoveField =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>
  | unknown[];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getBytesField = (value: Record<string, unknown>): unknown => {
  const fields = value.fields;
  if (isRecord(fields) && "bytes" in fields) {
    return fields.bytes;
  }
  if ("bytes" in value) {
    return value.bytes;
  }
  return undefined;
};

const decodeStringField = (value: SuiMoveField): string => {
  if (typeof value === "string") {
    return value;
  }
  if (!value || !isRecord(value)) {
    return "";
  }
  const bytes = getBytesField(value);
  if (!bytes) {
    return "";
  }
  if (Array.isArray(bytes)) {
    const numericBytes = bytes.filter(
      (item): item is number => typeof item === "number"
    );
    if (numericBytes.length === 0) {
      return "";
    }
    return new TextDecoder().decode(Uint8Array.from(numericBytes));
  }
  if (typeof bytes === "string") {
    if (bytes.startsWith("0x")) {
      const hex = bytes.slice(2);
      const pairs = hex.match(/.{1,2}/g) ?? [];
      const arr = pairs.map((b) => parseInt(b, 16));
      return new TextDecoder().decode(Uint8Array.from(arr));
    }
    try {
      if (typeof Buffer !== "undefined") {
        const arr = Uint8Array.from(Buffer.from(bytes, "base64"));
        return new TextDecoder().decode(arr);
      }
    } catch {
      // ignore decode failure
    }
    return bytes;
  }
  return "";
};

const toNumber = (value: SuiMoveField): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
};

const normalizeId = (value: SuiMoveField): string => {
  if (typeof value === "string") return value;
  if (isRecord(value) && typeof value.id === "string") {
    return value.id;
  }
  if (isRecord(value) && typeof value.bytes === "string") {
    return value.bytes;
  }
  return "";
};

const normalizeVector = (value: SuiMoveField): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeId(item as SuiMoveField)).filter(Boolean);
  }
  if (isRecord(value) && isRecord(value.fields)) {
    const inner = value.fields.contents ?? value.fields.vec;
    if (Array.isArray(inner)) {
      return inner
        .map((item) => normalizeId(item as SuiMoveField))
        .filter(Boolean);
    }
  }
  return [];
};

const getObjectFields = (object: unknown): Record<string, unknown> => {
  if (!isRecord(object)) return {};
  if (isRecord(object.content) && isRecord(object.content.fields)) {
    return object.content.fields;
  }
  if (isRecord(object.fields)) {
    return object.fields;
  }
  return {};
};

const getObjectId = (object: unknown): string => {
  if (!isRecord(object)) return "";
  if (typeof object.objectId === "string") return object.objectId;
  if (typeof object.id === "string") return object.id;
  return "";
};

export const parseContentObject = (object: unknown) => {
  const fields = getObjectFields(object);
  return {
    objectId: getObjectId(object),
    title: decodeStringField(fields.title as SuiMoveField),
    description: decodeStringField(fields.description as SuiMoveField),
    pdfUri: decodeStringField(fields.pdf_uri as SuiMoveField),
    ratePer10s: toNumber(fields.rate_per_10s as SuiMoveField),
    creator: typeof fields.creator === "string" ? fields.creator : "",
    vaultId: normalizeId(fields.vault_id as SuiMoveField),
    createdAtMs: toNumber(fields.created_at_ms as SuiMoveField),
    tags: [],
  };
};

export const parsePlatformContentIds = (object: unknown) => {
  const fields = getObjectFields(object);
  return normalizeVector(fields.contents as SuiMoveField);
};
