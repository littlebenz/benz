import { IsSpellUsable } from "../../wowutils/wow_utils";
import { MageSpell } from "../../state/utils/mage_utils";
import { Spell } from "./ispell";

export class Counterspell extends Spell {
  isOnGCD = false;
  spellName = MageSpell.Counterspell;
  isSelfCast = false;

  canCastSpell(): boolean {
    return IsSpellUsable(this.spellName);
  }
}
