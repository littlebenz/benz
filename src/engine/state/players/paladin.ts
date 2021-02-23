import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import {
  GetAuraRemainingTime,
  GetUnitAura,
  UnitCastOrChannel,
  UnitHasAura,
} from "../../wowutils/wow_utils";
import { PaladinAura, PaladinSpell } from "../utils/paladin_utils";
import { WoWClass } from "./WoWClass";
import { TalentSpec } from "./TalentSpec";

export class Paladin extends PlayerState {
  class = WoWClass.Paladin;

  canBeIncapacitated(): boolean {
    if (GetAuraRemainingTime(GetUnitAura(PaladinAura.DivineShield, this.unitId)) >= 1.5) {
      return false;
    }

    // todo - take in the other players somehow rather than this jank
    for (const player of ["arena1", "arena2", "arena3"]) {
      if (player !== this.unitId) {
        const aura = GetUnitAura(PaladinAura.BlessingOfSacrifice, player as WoWAPI.UnitId);
        if (aura && aura.source === this.unitId) {
          return false;
        }
      }
    }

    return super.canBeIncapacitated();
  }
  canPump(): boolean {
    return false;
  }

  isPumping(): boolean {
    if (
      UnitHasAura(PaladinAura.AvengingWrath, this.unitId) &&
      this.getSpecInfo() === TalentSpec.Paladin_Retribution
    ) {
      return true;
    }

    return false;
  }
  isDefensive(): Defensive {
    if (UnitHasAura(PaladinAura.DivineShield, this.unitId)) {
      return Defensive.DoNotTouch;
    }
    return super.isDefensive();
  }
  shouldStomp(): boolean {
    return false;
  }
  shouldInterrupt(): boolean {
    const casting = this.currentCastOrChannel();
    if (casting) {
      if (casting.spell === PaladinSpell.FlashOfLight) {
        return true;
      }
    }
    return false;
  }
}
