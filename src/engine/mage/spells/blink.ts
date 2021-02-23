import { IsSpellUsable } from "../../wowutils/wow_utils";
import { MageSpell } from "../../state/utils/mage_utils";
import { Spell } from "./ispell";

export class Blink extends Spell {
  isOnGCD = false;
  spellName = MageSpell.Blink;
  isSelfCast = true;

  canCastSpell(): boolean {
    return IsSpellUsable(this.spellName);
  }
}
