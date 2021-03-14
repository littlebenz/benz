import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { GetUnitAura, UnitCastOrChannel, UnitHasAura, WoWLua } from "../../wowutils/wow_utils";
import { HunterAura, HunterSpell } from "../utils/hunter_utils";
import { WoWClass } from "./WoWClass";
import { InterruptableSpell, InterruptSpell, PumpSpell } from "../utils/interrupt_spell";
import { TalentSpec } from "./TalentSpec";

export class Hunter extends PlayerState {
  class = WoWClass.Hunter;
  interruptSpells: InterruptSpell[] = [
    {
      name: HunterSpell.CounterShot,
      specs: [TalentSpec.Hunter_BeastMastery, TalentSpec.Hunter_Marksmanship],
      cooldown: 24,
      lockDuration: 3,
      range: 40,
    },
    {
      name: HunterSpell.Muzzle,
      specs: [TalentSpec.Hunter_Survival],
      cooldown: 15,
      lockDuration: 3,
      range: 5,
    },
  ];
  pumpSpells: PumpSpell[] = [
    {
      name: HunterSpell.Trueshot,
      cooldown: 120,
      specs: [TalentSpec.Hunter_Marksmanship],
    },
    {
      name: HunterSpell.BestialWrath,
      cooldown: 90,
      specs: [TalentSpec.Hunter_BeastMastery],
    },
  ];
  spellToInterrupt: InterruptableSpell[] = [];

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
  minimumRange() {
    return 25;
  }
  shouldStomp(): boolean {
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
}
