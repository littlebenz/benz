import { MageAura, MageSpell } from "../../state/utils/mage_utils";
import { GetPlayerAura } from "../../wowutils/wow_utils";
import { GCDSpell } from "./gcd_spell";

export class Pyroblast extends GCDSpell {
  private forceCast: boolean;
  spellName = MageSpell.Pyroblast;
  isSelfCast = false;

  // ehhh, we should make isInstant a function and check if we are hard casting it or not, but w/e
  isInstant = true;

  constructor(hardCast = false) {
    super();
    this.forceCast = hardCast;
  }

  canCastSpell(): boolean {
    if (this.forceCast === false) {
      const hotStreak = GetPlayerAura(MageAura.HotStreak);

      if (hotStreak === null) {
        return false;
      }
    }

    return super.canCastSpell();
  }
}
