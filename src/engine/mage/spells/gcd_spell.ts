import { Spell } from "./ispell";
import { AreWeOffGCD, UnitCastOrChannel } from "../../wowutils/wow_utils";

export abstract class GCDSpell extends Spell {
  isOnGCD = true;

  canCastSpell(): boolean {
    const castInfo = UnitCastOrChannel("player");
    if (castInfo !== null) {
      return false;
    }

    if (!super.canCastSpell()) {
      return false;
    }

    return AreWeOffGCD();
  }
}
