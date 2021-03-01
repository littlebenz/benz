import { UnitId } from "@wartoshika/wow-declarations";
import { MageSpell } from "../../state/utils/mage_utils";
import { PriestAura } from "../../state/utils/priest_utils";
import { UnitHasAura } from "../../wowutils/wow_utils";
import { Spell, SpellParameters } from "./ispell";

export interface PolymorphParameters extends SpellParameters {
  unitTarget: UnitId;
}
export class Polymorph extends Spell {
  isOnGCD = true;
  spellName = MageSpell.Polymorph;
  isSelfCast = false;
  isInstant = false;

  constructor(parameters: PolymorphParameters) {
    super({
      shouldStopCasting: () => UnitHasAura(PriestAura.ShadowWordDeath, parameters.unitTarget),
      ...parameters,
    });
  }

  canCastSpell(): boolean {
    if (!this.targetGuid) {
      return false;
    }

    return super.canCastSpell();
  }
}
