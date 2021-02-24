import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { TalentSpec } from "./TalentSpec";
import { WoWClass } from "./WoWClass";
import { UnitHasAura } from "../../wowutils/wow_utils";
import { MonkAura } from "../utils/monk_utils";

export class Monk extends PlayerState {
  class = WoWClass.Monk;
  canBeIncapacitated(): boolean {
    return super.canBeIncapacitated();
  }
  canPump(): boolean {
    return false;
  }
  isPumping(): boolean {
    // todo
    // const objects = GetObjects().map((x) => ({ guid: x, name: ObjectName(x) }));
    // const xuen = objects.find(x => x.name === )
    if (UnitHasAura(MonkAura.StormEarthFire, this.unitId)) {
      return true;
    }
    return false;
  }
  shouldStomp(): boolean {
    return false;
  }
  isDefensive(): Defensive {
    if (UnitHasAura(MonkAura.DiffuseMagic, this.unitId)) {
      return Defensive.DoNotTouch;
    }
    if (UnitHasAura(MonkAura.TouchOfKarma, this.unitId)) {
      return Defensive.CanStillDam;
    }
    return super.isDefensive();
  }
  shouldInterrupt(): boolean {
    return false;
  }
}
