import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { DeathKnightAura, DeathKnightSpell } from "../utils/death_knight_utils";
import { GetUnitAura, UnitHasAura, WoWLua } from "../../wowutils/wow_utils";
import { WoWClass } from "./WoWClass";
import { InterruptSpell, PumpSpell } from "../utils/interrupt_spell";
import { TalentSpec } from "./TalentSpec";

export class DeathKnight extends PlayerState {
  class = WoWClass.DeathKnight;
  interruptSpells: InterruptSpell[] = [
    {
      name: DeathKnightSpell.MindFreeze,
      specs: [TalentSpec.DK_Blood, TalentSpec.DK_Frost, TalentSpec.DK_Unholy],
      cooldown: 15,
      lockDuration: 3,
      range: 15,
    },
    {
      name: DeathKnightSpell.Strangulate,
      specs: [TalentSpec.DK_Blood, TalentSpec.DK_Frost, TalentSpec.DK_Unholy],
      cooldown: 60,
      lockDuration: 5,
      range: 30,
    },
  ];
  pumpSpells: PumpSpell[] = [
    {
      name: DeathKnightSpell.DarkTransformation,
      cooldown: 60,
      specs: [TalentSpec.DK_Unholy],
    },
    {
      name: DeathKnightSpell.PillarOfFrost,
      cooldown: 60,
      specs: [TalentSpec.DK_Frost],
    },
  ];

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

  isPumping(): boolean {
    // todo - check ghoul for this, not the dk
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
