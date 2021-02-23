import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { UnitCastOrChannel, UnitHasAura } from "../../wowutils/wow_utils";
import { DemonHunterAura, DemonHunterSpell } from "../utils/demon_hunter_utils";
import { WoWClass } from "./WoWClass";

export class DemonHunter extends PlayerState {
  class = WoWClass.DemonHunter;

  shouldStomp(): boolean {
    return false;
  }
  canBeIncapacitated(): boolean {
    return super.canBeIncapacitated();
  }
  canPump(): boolean {
    return false;
  }
  isPumping(): boolean {
    if (UnitHasAura(DemonHunterAura.Metamorphosis, this.unitId)) {
      return true;
    }

    return false;
  }
  isDefensive(): Defensive {
    if (UnitHasAura(DemonHunterAura.Blur, this.unitId)) {
      return Defensive.CanStillDam;
    }
    return super.isDefensive();
  }
  shouldInterrupt(): boolean {
    const casting = this.currentCastOrChannel();
    if (
      casting &&
      casting.spell === DemonHunterSpell.EyeBeam &&
      UnitHasAura(DemonHunterAura.Metamorphosis, this.unitId)
    ) {
      return true;
    }
    return false;
  }
}
