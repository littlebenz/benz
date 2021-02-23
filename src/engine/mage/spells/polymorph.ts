import { MageSpell } from "../../state/utils/mage_utils";
import { Spell } from "./ispell";

export class Polymorph extends Spell {
  isOnGCD = true;
  spellName = MageSpell.Polymorph;
  isSelfCast = false;

  canCastSpell(): boolean {
    if (!this.targetGuid) {
      return false;
    }

    return super.canCastSpell();
  }
}
