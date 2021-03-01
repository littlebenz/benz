import { MageAura, MageSpell } from "../../state/utils/mage_utils";
import { GetPlayerAura } from "../../wowutils/wow_utils";
import { GCDSpell } from "./gcd_spell";
import { SpellParameters } from "./ispell";

export interface PyroblastParameters extends SpellParameters {
  hardCast?: boolean;
}

export class Pyroblast extends GCDSpell {
  private forceCast: boolean;
  spellName = MageSpell.Pyroblast;
  isSelfCast = false;

  // ehhh, we should make isInstant a function and check if we are hard casting it or not, but w/e
  isInstant = true;

  constructor(parameters?: PyroblastParameters) {
    super(parameters);

    if (parameters && parameters.hardCast !== undefined) {
      this.forceCast = parameters.hardCast;
    } else {
      this.forceCast = false;
    }
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
