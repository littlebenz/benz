import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { UnitHasAura } from "../../wowutils/wow_utils";
import { WarriorAura } from "../utils/warrior_utils";
import { WoWClass } from "./WoWClass";
import { SpellstealPriority } from "./SpellstealPriority";

export class Warrior extends PlayerState {
  class = WoWClass.Warrior;
  canBeIncapacitated(): boolean {
    if (UnitHasAura(WarriorAura.Bladestorm, this.unitId)) {
      return false;
    }
    return super.canBeIncapacitated();
  }
  canPump(): boolean {
    return false;
  }
  isPumping(): boolean {
    if (UnitHasAura(WarriorAura.Avatar, this.unitId)) {
      return true;
    }

    if (UnitHasAura(WarriorAura.Warbreaker, this.unitId)) {
      return true;
    }

    return false;
  }
  isDefensive(): Defensive {
    if (UnitHasAura(WarriorAura.ShieldWall, this.unitId)) {
      return Defensive.CanStillDam;
    }

    if (UnitHasAura(WarriorAura.DefensiveStance, this.unitId)) {
      return Defensive.CanStillDam;
    }

    if (UnitHasAura(WarriorAura.DieByTheSword, this.unitId)) {
      return Defensive.DoNotTouch;
    }

    return super.isDefensive();
  }

  shouldInterrupt(): boolean {
    return false;
  }
  shouldStomp(): boolean {
    return UnitHasAura(WarriorAura.SpellReflection, this.unitId);
  }
}
