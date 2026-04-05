import type { FlightData } from "../components/AddAirplaneModal";

/**
 * Declarative airplane table columns: built-in fields vs user-defined custom keys on each flight row.
 */
export type AirplaneColumnConfigItem =
  | { kind: "builtin"; id: string }
  | { kind: "custom"; id: string; label?: string };

/**
 * Normalizes stored column config from document JSON. Unknown shapes yield an empty list (safe default).
 */
export function resolveAirplaneColumnConfig(
  columnConfig: unknown,
  _columnLabels?: unknown
): AirplaneColumnConfigItem[] {
  if (!columnConfig || !Array.isArray(columnConfig)) {
    return [];
  }
  const out: AirplaneColumnConfigItem[] = [];
  for (const item of columnConfig) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (o.kind === "custom" && typeof o.id === "string") {
      out.push({
        kind: "custom",
        id: o.id,
        label: typeof o.label === "string" ? o.label : undefined,
      });
    } else if (o.kind === "builtin" && typeof o.id === "string") {
      out.push({ kind: "builtin", id: o.id });
    }
  }
  return out;
}

/**
 * Ensures each flight object has a value for every custom column id (default empty string).
 */
export function syncFlightsCustomColumnValues(
  flights: FlightData[],
  cfg: AirplaneColumnConfigItem[]
): FlightData[] {
  const customIds = cfg
    .filter(
      (c): c is Extract<AirplaneColumnConfigItem, { kind: "custom" }> =>
        c.kind === "custom"
    )
    .map((c) => c.id);
  if (customIds.length === 0) return flights;

  return flights.map((flight) => {
    const row = flight as FlightData & Record<string, unknown>;
    const next: FlightData & Record<string, unknown> = { ...row };
    for (const id of customIds) {
      if (!(id in next) || next[id] === undefined) {
        next[id] = "";
      }
    }
    return next as FlightData;
  });
}
