import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { GetAuraRemainingTime, GetUnitAura, UnitHasAura } from "../../wowutils/wow_utils";
import { RogueAura } from "../utils/rogue_utils";
import { WoWClass } from "./WoWClass";

export class Rogue extends PlayerState {
  class = WoWClass.Rogue;
  canBeIncapacitated(): boolean {
    if (GetAuraRemainingTime(GetUnitAura(RogueAura.CloakOfShadows, this.unitId)) >= 1.5) {
      return false;
    }

    return super.canBeIncapacitated();
  }
  canPump(): boolean {
    return false;
  }
  isPumping(): boolean {
    if (UnitHasAura(RogueAura.ShadowBlades, this.unitId)) {
      return true;
    }
    return false;
  }
  isDefensive(): Defensive {
    if (UnitHasAura(RogueAura.CloakOfShadows, this.unitId)) {
      return Defensive.DoNotTouch;
    }
    return super.isDefensive();
  }
  shouldInterrupt(): boolean {
    return false;
  }
  shouldStomp(): boolean {
    return false;
  }
}
