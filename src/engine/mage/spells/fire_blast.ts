import { FaceUnit, GetPlayerAura, PlayerHasAura, WoWLua } from "../../wowutils/wow_utils";
import { MageAura, MageSpell } from "../../state/utils/mage_utils";
import { Spell } from "./ispell";
import { UnitId } from "@wartoshika/wow-declarations";

let lastFireBlast: number = 0;

export class FireBlast extends Spell {
  private forceCast: boolean;
  isOnGCD = false;
  spellName = MageSpell.FireBlast;
  isSelfCast = false;

  constructor(hardCast = false, target?: UnitId) {
    super(target);
    this.forceCast = hardCast;
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
    UpdateMovement();
    FaceUnit(this.targetGuid);
    UpdateMovement();

    lastFireBlast = GetTime();
    super.cast();
  }
}
