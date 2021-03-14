import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { UnitHasAura, WoWLua } from "../../wowutils/wow_utils";
import { DruidAura, DruidSpell } from "../utils/druid_utils";
import { WoWClass } from "./WoWClass";
import { InterruptableSpell, InterruptSpell, PumpSpell } from "../utils/interrupt_spell";
import { TalentSpec } from "./TalentSpec";
import { PriorityAction } from "./SpellstealPriority";

export class Druid extends PlayerState {
  class = WoWClass.Druid;
  interruptSpells: InterruptSpell[] = [
    {
      name: DruidSpell.SkullBash,
      specs: [TalentSpec.Druid_Feral, TalentSpec.Druid_Guardian],
      cooldown: 15,
      lockDuration: 4,
      range: 13,
    },
  ];

  pumpSpells: PumpSpell[] = [
    {
      name: DruidSpell.ConvokeTheSpirits,
      cooldown: 120,
      specs: [TalentSpec.Druid_Balance, TalentSpec.Druid_Feral],
    },
    {
      name: DruidSpell.IncarnBoomkin,
      cooldown: 180,
      specs: [TalentSpec.Druid_Balance],
    },
    {
      name: DruidSpell.IncarnFeral,
      cooldown: 180,
      specs: [TalentSpec.Druid_Feral],
    },
  ];

  spellToInterrupt: InterruptableSpell[] = [
    {
      name: DruidSpell.Cyclone,
      cooldown: 0,
      specs: [
        TalentSpec.Druid_Balance,
        TalentSpec.Druid_Feral,
        TalentSpec.Druid_Guardian,
        TalentSpec.Druid_Restoration,
      ],
      priority: PriorityAction.Medium,
    },
    {
      name: DruidSpell.ConvokeTheSpirits,
      cooldown: 120,
      specs: [TalentSpec.Druid_Balance, TalentSpec.Druid_Feral],
      priority: PriorityAction.Required,
    },
    {
      name: DruidSpell.Regrowth,
      cooldown: 0,
      specs: [TalentSpec.Druid_Restoration],
      priority: PriorityAction.High,
    },
  ];

  private beastBuffIds = [
    5487, //		 Bear
    768, //		 Cat
    783, //	 Travel
    33891, //	 Tree
    24858, //	 Moonkin
    197625, //	 Balance Affinity Moonkin
  ];
  canBeIncapacitated(): boolean {
    // only if out CC'd out of form
    const auras = WoWLua.GetUnitAuras(this.unitId);

    for (const aura of auras) {
      for (const beastBuffId of this.beastBuffIds) {
        if (aura.spellId === beastBuffId) {
          return false;
        }
      }
    }

    const ccRemaining = this.remainingCC();

    // if they are not cc'd for at least the length of poly, don't cast
    if (ccRemaining.filter((x) => x.remaining >= 1.6).length === 0) {
      return false;
    }

    return super.canBeIncapacitated();
  }
  minimumRange() {
    const spec = this.getSpecInfo();
    if (spec === TalentSpec.Druid_Balance || spec === TalentSpec.Druid_Restoration) {
      return 25;
    }

    return 3;
  }
  shouldStomp(): boolean {
    return false;
  }
  isPumping(): boolean {
    if (UnitHasAura(DruidAura.IncarnBoomkin, this.unitId)) {
      return true;
    }

    if (UnitHasAura(DruidAura.IncarnFeral, this.unitId)) {
      return true;
    }

    if (UnitHasAura(DruidAura.Berserk, this.unitId)) {
      return true;
    }

    return false;
  }
  isDefensive(): Defensive {
    return super.isDefensive();
  }
}
