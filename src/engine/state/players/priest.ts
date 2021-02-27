import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { UnitCastOrChannel, UnitHasAura } from "../../wowutils/wow_utils";
import { PriestAura, PriestSpell } from "../utils/priest_utils";
import { WoWClass } from "./WoWClass";
import { InterruptableSpell, InterruptSpell, PumpSpell } from "../utils/interrupt_spell";
import { TalentSpec } from "./TalentSpec";
import { PriorityAction } from "./SpellstealPriority";

export class Priest extends PlayerState {
  class = WoWClass.Priest;

  // should we even try to juke this? maybe remove for now
  interruptSpells: InterruptSpell[] = [
    {
      name: PriestSpell.Silence,
      specs: [TalentSpec.Priest_Shadow],
      cooldown: 45,
      lockDuration: 4,
      range: 30,
    },
  ];

  pumpSpells: PumpSpell[] = [
    {
      name: PriestSpell.VoidEruption,
      cooldown: 90,
      specs: [TalentSpec.Priest_Shadow],
    },
  ];

  /*
          casting.spell === PriestSpell.Penance ||
        casting.spell === PriestSpell.FlashHeal ||
        casting.spell === PriestSpell.DivineHymn ||
        casting.spell === PriestSpell.Mindgames 
  */
  spellToInterrupt: InterruptableSpell[] = [
    {
      name: PriestSpell.Penance,
      cooldown: 9,
      specs: [TalentSpec.Priest_Discipline],
      priority: PriorityAction.High,
    },
    {
      name: PriestSpell.FlashHeal,
      cooldown: 0,
      specs: [TalentSpec.Priest_Discipline, TalentSpec.Priest_Holy],
      priority: PriorityAction.Low,
    },
    {
      name: PriestSpell.DivineHymn,
      cooldown: 180,
      specs: [TalentSpec.Priest_Holy],
      priority: PriorityAction.High,
    },
    {
      name: PriestSpell.Mindgames,
      cooldown: 45,
      specs: [TalentSpec.Priest_Holy, TalentSpec.Priest_Discipline, TalentSpec.Priest_Shadow],
      priority: PriorityAction.High,
    },
    {
      name: PriestSpell.VampiricTouch,
      cooldown: 0,
      specs: [TalentSpec.Priest_Shadow],
      priority: PriorityAction.Medium,
    },
  ];

  canBeIncapacitated(): boolean {
    return super.canBeIncapacitated();
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
}
