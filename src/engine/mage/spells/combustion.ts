import { MageSpell } from "../../state/utils/mage_utils";
import { WoWLua } from "../../wowutils/wow_utils";
import { Spell } from "./ispell";

export class Combustion extends Spell {
  isOnGCD = false;
  spellName = MageSpell.Combustion;
  isSelfCast = true;
  isInstant = true;

  canCastSpell(): boolean {
    return WoWLua.IsSpellUsable(this.spellName);
  }
}
