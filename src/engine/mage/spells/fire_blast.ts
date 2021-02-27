import { FaceUnit, GetPlayerAura, PlayerHasAura, WoWLua } from "../../wowutils/wow_utils";
import { MageAura, MageSpell } from "../../state/utils/mage_utils";
import { Spell, SpellParameters } from "./ispell";
import { UnitId } from "@wartoshika/wow-declarations";

let lastFireBlast: number = 0;

export interface FireBlastParameters extends SpellParameters {
  hardCast: boolean;
}

export class FireBlast extends Spell {
  private forceCast: boolean;
  isOnGCD = false;
  spellName = MageSpell.FireBlast;
  isSelfCast = false;
  isInstant = true;

  constructor(parameters?: FireBlastParameters) {
    super(parameters);

    if (parameters) {
      this.forceCast = parameters.hardCast;
    } else {
      this.forceCast = false;
    }
  }

  canCastSpell(): boolean {
    if (lastFireBlast + 0.2 >= GetTime()) {
      return false;
    }

    if (PlayerHasAura(MageAura.HotStreak)) {
      return false;
    }

    if (this.forceCast === false) {
      const heatingUp = GetPlayerAura(MageAura.HeatingUp);

      if (!heatingUp) {
        return false;
      }
    }

    return WoWLua.IsSpellUsable(this.spellName);
  }

  cast() {
    lastFireBlast = GetTime();
    super.cast();
  }
}
