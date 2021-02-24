import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { GetUnitAura, UnitCastOrChannel, UnitHasAura, WoWLua } from "../../wowutils/wow_utils";
import { HunterAura } from "../utils/hunter_utils";
import { WoWClass } from "./WoWClass";

export class Hunter extends PlayerState {
  class = WoWClass.Hunter;

  canBeIncapacitated(): boolean {
    if (WoWLua.GetAuraRemainingTime(GetUnitAura(HunterAura.Deterrence, this.unitId)) >= 1.5) {
      return false;
    }
    if (
      WoWLua.GetAuraRemainingTime(GetUnitAura(HunterAura.AspectOfTheTurtle, this.unitId)) >= 1.5
    ) {
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
    if (UnitHasAura(HunterAura.Trueshot, this.unitId)) {
      return true;
    }

    if (UnitHasAura(HunterAura.BestialWrath, this.unitId)) {
      return true;
    }

    return false;
  }
  isDefensive(): Defensive {
    if (UnitHasAura(HunterAura.Deterrence, this.unitId)) {
      return Defensive.DoNotTouch;
    }
    if (UnitHasAura(HunterAura.AspectOfTheTurtle, this.unitId)) {
      return Defensive.DoNotTouch;
    }
    return super.isDefensive();
  }
  shouldInterrupt(): boolean {
    return false;
  }
}
