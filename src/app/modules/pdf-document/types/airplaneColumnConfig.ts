/**
 * Configurable columns for AirplaneSection: built-in data fields + user-defined text columns.
 */

export type AirplaneBuiltinColumnKey =
  | "date"
  | "time"
  | "airlineCompany"
  | "fromAirport"
  | "toAirport"
  | "travelers"
  | "luggage";

export type AirplaneColumnConfigItem =
  | {
      kind: "builtin";
      key: AirplaneBuiltinColumnKey;
      labelAr: string;
      labelEn: string;
    }
  | {
      kind: "custom";
      id: string;
      labelAr: string;
      labelEn: string;
    };

/** Default order and labels (AR + EN). */
export function getDefaultAirplaneColumnConfig(): AirplaneColumnConfigItem[] {
  return [
    { kind: "builtin", key: "date", labelAr: "التاريخ", labelEn: "Date" },
    { kind: "builtin", key: "time", labelAr: "الوقت", labelEn: "Time" },
    {
      kind: "builtin",
      key: "airlineCompany",
      labelAr: "شركة الطيران",
      labelEn: "Airline Company",
    },
    { kind: "builtin", key: "fromAirport", labelAr: "من مطار", labelEn: "From Airport" },
    { kind: "builtin", key: "toAirport", labelAr: "الى مطار", labelEn: "To Airport" },
    { kind: "builtin", key: "travelers", labelAr: "المسافرين", labelEn: "Travelers" },
    { kind: "builtin", key: "luggage", labelAr: "الأمتعه", labelEn: "Luggage" },
  ];
}

export const ALL_BUILTIN_KEYS: AirplaneBuiltinColumnKey[] = [
  "date",
  "time",
  "airlineCompany",
  "fromAirport",
  "toAirport",
  "travelers",
  "luggage",
];

export function columnLabel(
  col: AirplaneColumnConfigItem,
  language: "ar" | "en"
): string {
  return language === "ar" ? col.labelAr : col.labelEn;
}

/** Merge stored config with legacy single-language columnLabels. */
export function resolveAirplaneColumnConfig(
  columnConfig: AirplaneColumnConfigItem[] | undefined | null,
  legacyColumnLabels?: {
    date?: string;
    time?: string;
    airlineCompany?: string;
    fromAirport?: string;
    toAirport?: string;
    travelers?: string;
    luggage?: string;
  } | null
): AirplaneColumnConfigItem[] {
  if (columnConfig && columnConfig.length > 0) {
    return columnConfig;
  }
  const base = getDefaultAirplaneColumnConfig();
  if (!legacyColumnLabels) {
    return base;
  }
  return base.map((col) => {
    if (col.kind !== "builtin") {
      return col;
    }
    const legacy = legacyColumnLabels[col.key];
    if (legacy && typeof legacy === "string" && legacy.trim()) {
      return { ...col, labelAr: legacy, labelEn: legacy };
    }
    return col;
  });
}

export function syncFlightsCustomColumnValues<T extends { customColumnValues?: Record<string, string> }>(
  flights: T[],
  columnConfig: AirplaneColumnConfigItem[]
): T[] {
  const customIds = columnConfig
    .filter((c): c is Extract<AirplaneColumnConfigItem, { kind: "custom" }> => c.kind === "custom")
    .map((c) => c.id);
  return flights.map((f) => {
    const next: Record<string, string> = {};
    for (const id of customIds) {
      next[id] = f.customColumnValues?.[id] ?? "";
    }
    const customColumnValues = Object.keys(next).length ? next : undefined;
    return { ...f, customColumnValues } as T;
  });
}

export function generateCustomAirplaneColumnId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getMissingBuiltinKeys(
  config: AirplaneColumnConfigItem[]
): AirplaneBuiltinColumnKey[] {
  const present = new Set(
    config.filter((c): c is Extract<AirplaneColumnConfigItem, { kind: "builtin" }> => c.kind === "builtin").map((c) => c.key)
  );
  return ALL_BUILTIN_KEYS.filter((k) => !present.has(k));
}

export function defaultBuiltinColumnItem(
  key: AirplaneBuiltinColumnKey
): Extract<AirplaneColumnConfigItem, { kind: "builtin" }> {
  const d = getDefaultAirplaneColumnConfig().find(
    (c): c is Extract<AirplaneColumnConfigItem, { kind: "builtin" }> =>
      c.kind === "builtin" && c.key === key
  );
  if (!d) {
    throw new Error(`Unknown builtin column: ${key}`);
  }
  return { ...d };
}
