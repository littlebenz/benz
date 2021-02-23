import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { UnitCastOrChannel, UnitHasAura } from "../../wowutils/wow_utils";
import { PriestAura, PriestSpell } from "../utils/priest_utils";
import { WoWClass } from "./WoWClass";

export class Priest extends PlayerState {
  class = WoWClass.Priest;
  canBeIncapacitated(): boolean {
    return super.canBeIncapacitated();
  }
  canPump(): boolean {
    return false;
  }
  isPumping(): boolean {
    if (UnitHasAura(PriestAura.Voidform, this.unitId)) {
      return true;
    }

    if (UnitHasAura(PriestAura.PowerInfusion, this.unitId)) {
      return true;
    }

    return false;
  }
  isDefensive(): Defensive {
    if (UnitHasAura(PriestAura.Dispersion, this.unitId)) {
      return Defensive.DoNotTouch;
    }
    if (UnitHasAura(PriestAura.GreaterFade, this.unitId)) {
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
      if (
        casting.spell === PriestSpell.Penance ||
        casting.spell === PriestSpell.FlashHeal ||
        casting.spell === PriestSpell.DivineHymn ||
        casting.spell === PriestSpell.Mindgames
      ) {
        return true;
      }
    }
    return false;
  }
}
