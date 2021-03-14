import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { GetUnitAura, UnitHasAura, WoWLua } from "../../wowutils/wow_utils";
import { WarlockAura, WarlockSpell } from "../utils/warlock_utils";
import { WoWClass } from "./WoWClass";
import { InterruptableSpell, InterruptSpell, PumpSpell } from "../utils/interrupt_spell";
import { TalentSpec } from "./TalentSpec";
import { PriorityAction } from "./SpellstealPriority";

export class Warlock extends PlayerState {
  class = WoWClass.Warlock;
  pumpSpells: PumpSpell[] = [
    {
      name: WarlockSpell.DarkSoulMisery,
      cooldown: 120,
      specs: [TalentSpec.Warlock_Afflication],
    },
    {
      name: WarlockSpell.SummonDemonicTyrant,
      cooldown: 90,
      specs: [TalentSpec.Warlock_Demonology],
    },
    {
      name: WarlockSpell.DarkSoulInstability,
      cooldown: 120,
      specs: [TalentSpec.Warlock_Destruction],
    },
  ];

  // going to leave this empty until I figure out how to handle checking for pet
  interruptSpells: InterruptSpell[] = [];

  spellToInterrupt: InterruptableSpell[] = [
    {
      name: WarlockSpell.Fear,
      cooldown: 0,
      specs: [
        TalentSpec.Warlock_Afflication,
        TalentSpec.Warlock_Demonology,
        TalentSpec.Warlock_Destruction,
      ],
      priority: PriorityAction.Medium,
    },
    {
      name: WarlockSpell.ChaosBolt,
      cooldown: 0,
      specs: [TalentSpec.Warlock_Destruction],
      priority: PriorityAction.Medium,
    },
  ];
  minimumRange() {
    return 25;
  }
  canBeIncapacitated(): boolean {
    if (WoWLua.GetAuraRemainingTime(GetUnitAura(WarlockAura.NetherWard, this.unitId)) >= 1.5) {
      return false;
    }

    return super.canBeIncapacitated();
  }
  isPumping(): boolean {
    if (UnitHasAura(WarlockAura.DarkSoulInstability, this.unitId)) {
      return true;
    }
    return false;
  }
  isDefensive(): Defensive {
    if (UnitHasAura(WarlockAura.UnendingResolve, this.unitId)) {
      return Defensive.CanStillDam;
    }
    return super.isDefensive();
  }

  shouldStomp(): boolean {
    return false;
  }
}
