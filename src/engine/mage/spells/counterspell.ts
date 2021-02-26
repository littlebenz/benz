import { MageSpell } from "../../state/utils/mage_utils";
import { WoWLua } from "../../wowutils/wow_utils";
import { Spell } from "./ispell";

export class Counterspell extends Spell {
  isOnGCD = false;
  spellName = MageSpell.Counterspell;
  isSelfCast = false;
  isInstant = true;

  canCastSpell(): boolean {
    return WoWLua.IsSpellUsable(this.spellName);
  }
}
