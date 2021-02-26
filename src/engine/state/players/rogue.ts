import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { GetUnitAura, UnitHasAura, WoWLua } from "../../wowutils/wow_utils";
import { RogueAura, RogueSpell } from "../utils/rogue_utils";
import { WoWClass } from "./WoWClass";
import { InterruptSpell, PumpSpell } from "../utils/interrupt_spell";
import { TalentSpec } from "./TalentSpec";

export class Rogue extends PlayerState {
  class = WoWClass.Rogue;

  interruptSpells: InterruptSpell[] = [
    {
      name: RogueSpell.Kick,
      specs: [TalentSpec.Rogue_Assassination, TalentSpec.Rogue_Subtlety, TalentSpec.Rogue_Outlaw],
      cooldown: 15,
      lockDuration: 5,
      range: 5,
    },
  ];

  pumpSpells: PumpSpell[] = [
    {
      name: RogueSpell.Vendetta,
      cooldown: 90,
      specs: [TalentSpec.Rogue_Assassination],
    },
    {
      name: RogueSpell.KillingSpree,
      cooldown: 120,
      specs: [TalentSpec.Rogue_Outlaw],
    },
    {
      name: RogueSpell.ShadowBlades,
      cooldown: 180,
      specs: [TalentSpec.Rogue_Subtlety],
    },
  ];

  canBeIncapacitated(): boolean {
    if (WoWLua.GetAuraRemainingTime(GetUnitAura(RogueAura.CloakOfShadows, this.unitId)) >= 1.5) {
      return false;
    }

    return super.canBeIncapacitated();
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
