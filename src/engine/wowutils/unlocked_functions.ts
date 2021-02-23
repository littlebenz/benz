import { Guid, UnitId } from "@wartoshika/wow-declarations";

declare const C_Timer: any;

export const UnitHealth = (unit: UnitId | Guid): number => CallSecureFunction("UnitHealth", unit);

export const SpellStopCasting = (): void => CallSecureFunction("SpellStopCasting");

export const TargetUnit = (unit: string): void => CallSecureFunction("TargetUnit", unit);

export const CastSpellByName = (spell: string, target?: string) => {
  return CallSecureFunction<void>("CastSpellByName", spell, target);
};

export const UnitReaction = (unit: string, otherUnit: string): number | null =>
  CallSecureFunction("UnitReaction", unit, otherUnit);

export const IsMouseButtonDown = (
  button: "LeftButton" | "RightButton" | "MiddleButton" | "BUTTON4"
): boolean => CallSecureFunction("IsMouseButtonDown", button);

export const InteractUnit = (unit: string): void => CallSecureFunction("InteractUnit", unit);

export const CancelUnitBuffUnlocked = (unit: string, buffIndex: number) =>
  CallSecureFunction("CancelUnitBuff", unit, buffIndex);
