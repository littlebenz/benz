import { MageSpell } from "../../state/utils/mage_utils";
import { Spell } from "./ispell";

export class IceBlock extends Spell {
  isOnGCD = true;
  spellName = MageSpell.IceBlock;
  isSelfCast = true;
  isInstant = true;

  canCastSpell(): boolean {
    // TODO:: cancel cast
    if (!super.canCastSpell()) {
      return false;
    }

    return true;
  }
}
