import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { DeathKnightAura } from "../utils/death_knight_utils";
import { GetUnitAura, UnitHasAura, WoWLua } from "../../wowutils/wow_utils";
import { WoWClass } from "./WoWClass";

export class DeathKnight extends PlayerState {
  class = WoWClass.DeathKnight;
  shouldStomp(): boolean {
    return false;
  }
  canBeIncapacitated(): boolean {
    if (
      WoWLua.GetAuraRemainingTime(GetUnitAura(DeathKnightAura.AntiMagicShell, this.unitId)) >= 1.5
    ) {
      return false;
    }

    return super.canBeIncapacitated();
  }
  canPump(): boolean {
    return false;
  }

  isPumping(): boolean {
    if (UnitHasAura(DeathKnightAura.DarkTransformation, this.unitId)) {
      return true;
    }
    if (UnitHasAura(DeathKnightAura.PillarOfFrost, this.unitId)) {
      return true;
    }
    return false;
  }
  isDefensive(): Defensive {
    return super.isDefensive();
  }
  shouldInterrupt(): boolean {
    return false;
  }
}
