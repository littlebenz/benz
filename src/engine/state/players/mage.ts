import { GetUnitAura, UnitCastOrChannel, UnitHasAura, WoWLua } from "../../wowutils/wow_utils";
import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { MageAura, MageSpell } from "../utils/mage_utils";
import { WoWClass } from "./WoWClass";

export class Mage extends PlayerState {
  class = WoWClass.Mage;
  canBeIncapacitated(): boolean {
    if (WoWLua.GetAuraRemainingTime(GetUnitAura(MageAura.IceBlock, this.unitId)) >= 1.5) {
      return false;
    }

    return super.canBeIncapacitated();
  }
  private isCombusting = false;
  private lastCombustedAt = 0;

  canPump(): boolean {
    return GetTime() - this.lastCombustedAt >= 100;
  }
  isPumping(): boolean {
    const hasCombustAura = UnitHasAura(MageAura.Combustion, this.unitId);
    if (!this.isCombusting && hasCombustAura) {
      this.lastCombustedAt = GetTime();
    }

    return (this.isCombusting = hasCombustAura);
  }
  shouldStomp(): boolean {
    return false;
  }
  isDefensive(): Defensive {
    if (UnitHasAura(MageAura.IceBlock, this.unitId)) {
      return Defensive.DoNotTouch;
    }

    return super.isDefensive();
  }
  shouldInterrupt(): boolean {
    const casting = this.currentCastOrChannel();
    if (casting) {
      if (casting.spell === MageSpell.Polymorph) {
        return true;
      }
    }
    return false;
  }
}
