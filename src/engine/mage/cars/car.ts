import { Spell } from "../spells/ispell";

export interface Car {
  getNextSpell(lastTargetGuid?: string | null): Spell | null;
}
