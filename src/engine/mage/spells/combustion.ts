import { MageSpell } from "../../state/utils/mage_utils";
import { IsSpellUsable } from "../../wowutils/wow_utils";
import { Spell } from "./ispell";

export class Combustion extends Spell {
  isOnGCD = false;
  spellName = MageSpell.Combustion;
  isSelfCast = true;

  canCastSpell(): boolean {
    return IsSpellUsable(this.spellName);
  }
}
