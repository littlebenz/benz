import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { UnitHasAura, WoWLua } from "../../wowutils/wow_utils";
import { DruidAura, DruidSpell } from "../utils/druid_utils";
import { WoWClass } from "./WoWClass";

export class Druid extends PlayerState {
  class = WoWClass.Druid;

  private beastBuffIds = [
    5487, //		 Bear
    768, //		 Cat
    783, //	 Travel
    33891, //	 Tree
    24858, //	 Moonkin
    197625, //	 Balance Affinity Moonkin
  ];
  canBeIncapacitated(): boolean {
    // only if out CC'd out of form
    const auras = WoWLua.GetUnitAuras(this.unitId);

    for (const aura of auras) {
      for (const beastBuffId of this.beastBuffIds) {
        if (aura.spellId === beastBuffId) {
          return false;
        }
      }
    }

    const ccRemaining = this.remainingCC();

    // if they are not cc'd for at least the length of poly, don't cast
    if (ccRemaining.filter((x) => x.remaining >= 1.6).length === 0) {
      return false;
    }

    return super.canBeIncapacitated();
  }
  shouldStomp(): boolean {
    return false;
  }
  canPump(): boolean {
    return false;
  }
  isPumping(): boolean {
    if (UnitHasAura(DruidAura.IncarnBoomkin, this.unitId)) {
      return true;
    }

    if (UnitHasAura(DruidAura.IncarnFeral, this.unitId)) {
      return true;
    }

    if (UnitHasAura(DruidAura.Berserk, this.unitId)) {
      return true;
    }

    return false;
  }
  isDefensive(): Defensive {
    return super.isDefensive();
  }
  shouldInterrupt(): boolean {
    const casting = this.currentCastOrChannel();
    if (casting) {
      if (
        casting.spell === DruidSpell.Cyclone ||
        casting.spell === DruidSpell.ConvokeTheSpirits ||
        casting.spell === DruidSpell.Regrowth
      ) {
        return true;
      }
    }
    return false;
  }
}
