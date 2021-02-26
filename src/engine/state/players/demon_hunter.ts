import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { UnitCastOrChannel, UnitHasAura } from "../../wowutils/wow_utils";
import { DemonHunterAura, DemonHunterSpell } from "../utils/demon_hunter_utils";
import { WoWClass } from "./WoWClass";
import { InterruptSpell, PumpSpell } from "../utils/interrupt_spell";
import { TalentSpec } from "./TalentSpec";

export class DemonHunter extends PlayerState {
  class = WoWClass.DemonHunter;
  interruptSpells: InterruptSpell[] = [
    {
      name: DemonHunterSpell.Disrupt,
      specs: [TalentSpec.DH_Havoc, TalentSpec.DH_Vengeance],
      cooldown: 15,
      lockDuration: 3,
      range: 5,
    },
  ];
  pumpSpells: PumpSpell[] = [
    {
      name: DemonHunterSpell.Metamorphosis,
      cooldown: 60,
      specs: [TalentSpec.DH_Havoc, TalentSpec.DH_Vengeance],
    },
  ];

  shouldStomp(): boolean {
    return false;
  }
  canBeIncapacitated(): boolean {
    return super.canBeIncapacitated();
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
