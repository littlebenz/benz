import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import {
  GetAuraRemainingTime,
  GetUnitAura,
  UnitCastOrChannel,
  UnitHasAura,
} from "../../wowutils/wow_utils";
import { WarlockAura, WarlockSpell } from "../utils/warlock_utils";
import { WoWClass } from "./WoWClass";

export class Warlock extends PlayerState {
  class = WoWClass.Warlock;
  canBeIncapacitated(): boolean {
    if (GetAuraRemainingTime(GetUnitAura(WarlockAura.NetherWard, this.unitId)) >= 1.5) {
      return false;
    }

    return super.canBeIncapacitated();
  }
  canPump(): boolean {
    return false;
  }
  isPumping(): boolean {
    if (UnitHasAura(WarlockAura.DarkSoul, this.unitId)) {
      return true;
    }
    return false;
  }
  isDefensive(): Defensive {
    if (UnitHasAura(WarlockAura.UnendingResolve, this.unitId)) {
      return Defensive.CanStillDam;
    }
    return super.isDefensive();
  }

  shouldInterrupt(): boolean {
    const casting = this.currentCastOrChannel();

    if (casting) {
      if (casting.spell === WarlockSpell.Fear || casting.spell === WarlockSpell.ChaosBolt) {
        return true;
      }
    }
    return false;
  }
  shouldStomp(): boolean {
    return false;
  }
}
