import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { TalentSpec } from "./TalentSpec";
import { WoWClass } from "./WoWClass";
import { UnitHasAura } from "../../wowutils/wow_utils";
import { MonkAura, MonkSpell } from "../utils/monk_utils";
import { InterruptableSpell, InterruptSpell, PumpSpell } from "../utils/interrupt_spell";
import { PriorityAction } from "./SpellstealPriority";

export class Monk extends PlayerState {
  class = WoWClass.Monk;

  interruptSpells: InterruptSpell[] = [
    {
      name: MonkSpell.SpearHandStrike,
      specs: [TalentSpec.Monk_Brewmaster, TalentSpec.Monk_Windwalker],
      cooldown: 15,
      lockDuration: 4,
      range: 5,
    },
  ];
  pumpSpells: PumpSpell[] = [
    {
      name: MonkSpell.Xuen,
      cooldown: 120,
      specs: [TalentSpec.Monk_Windwalker],
    },
  ];
  spellToInterrupt: InterruptableSpell[] = [
    {
      name: MonkSpell.Vivify,
      cooldown: 0,
      specs: [TalentSpec.Monk_Windwalker],
      priority: PriorityAction.Low,
    },
    {
      name: MonkSpell.Vivify,
      cooldown: 0,
      specs: [TalentSpec.Monk_Mistweaver],
      priority: PriorityAction.High,
    },
  ];

  canBeIncapacitated(): boolean {
    return super.canBeIncapacitated();
  }
  isPumping(): boolean {
    // todo
    // const objects = GetObjects().map((x) => ({ guid: x, name: ObjectName(x) }));
    // const xuen = objects.find(x => x.name === )
    if (UnitHasAura(MonkAura.StormEarthFire, this.unitId)) {
      return true;
    }
    return false;
  }
  shouldStomp(): boolean {
    return false;
  }
  isDefensive(): Defensive {
    if (UnitHasAura(MonkAura.DiffuseMagic, this.unitId)) {
      return Defensive.DoNotTouch;
    }
    if (UnitHasAura(MonkAura.TouchOfKarma, this.unitId)) {
      return Defensive.CanStillDam;
    }
    return super.isDefensive();
  }
}
