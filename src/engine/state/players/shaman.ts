import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { WoWLua, UnitCastOrChannel, UnitHasAura } from "../../wowutils/wow_utils";
import { ShamanAura, ShamanSpell } from "../utils/shaman_utils";
import { WoWClass } from "./WoWClass";
import { InterruptableSpell, InterruptSpell, PumpSpell } from "../utils/interrupt_spell";
import { TalentSpec } from "./TalentSpec";
import { PriorityAction } from "./SpellstealPriority";

export class Shaman extends PlayerState {
  class = WoWClass.Shaman;
  interruptSpells: InterruptSpell[] = [
    {
      name: ShamanSpell.WindShear,
      specs: [
        TalentSpec.Shaman_Elemental,
        TalentSpec.Shaman_Enhancement,
        TalentSpec.Shaman_Restoration,
      ],
      cooldown: 12,
      lockDuration: 3,
      range: 30,
    },
  ];

  pumpSpells: PumpSpell[] = [
    {
      name: ShamanSpell.FeralSpirit,
      cooldown: 120,
      specs: [TalentSpec.Shaman_Enhancement],
    },
    {
      name: ShamanSpell.Ascendance,
      cooldown: 180,
      specs: [TalentSpec.Shaman_Enhancement],
    },
    {
      name: ShamanSpell.Stormkeeper,
      cooldown: 60,
      specs: [TalentSpec.Shaman_Elemental],
    },
  ];

  spellToInterrupt: InterruptableSpell[] = [
    {
      name: ShamanSpell.LightningLasso,
      cooldown: 30,
      specs: [TalentSpec.Shaman_Elemental],
      priority: PriorityAction.Medium,
    },
    {
      name: ShamanSpell.HealingWave,
      cooldown: 0,
      specs: [TalentSpec.Shaman_Restoration],
      priority: PriorityAction.High,
    },
    {
      name: ShamanSpell.HealingSurge,
      cooldown: 0,
      specs: [TalentSpec.Shaman_Restoration],
      priority: PriorityAction.High,
    },
    {
      name: ShamanSpell.Hex,
      cooldown: 0,
      specs: [
        TalentSpec.Shaman_Restoration,
        TalentSpec.Shaman_Elemental,
        TalentSpec.Shaman_Enhancement,
      ],
      priority: PriorityAction.High,
    },
  ];

  canBeIncapacitated(): boolean {
    return super.canBeIncapacitated();
  }
  minimumRange() {
    const spec = this.getSpecInfo();
    if (spec === TalentSpec.Shaman_Enhancement) {
      return 3;
    }

    return 25;
  }
  isPumping(): boolean {
    const objects = WoWLua.GetObjects().map((x) => ({ guid: x, name: ObjectName(x) }));
    const feralSpirit = objects.find((x) => x.name === "Feral Spirit");
    const fireEle = objects.find((x) => x.name === "Greater Fire Elemental");
    const stormEle = objects.find((x) => x.name === "Greater Storm Elemental");
    if (feralSpirit && !UnitIsDead(feralSpirit.guid)) {
      return true;
    }
    if (fireEle && !UnitIsDead(fireEle.guid)) {
      return true;
    }
    if (stormEle && !UnitIsDead(stormEle.guid)) {
      return true;
    }

    return false;
  }
  isDefensive(): Defensive {
    if (UnitHasAura(ShamanAura.AstralShift, this.unitId)) {
      return Defensive.CanStillDam;
    }

    return super.isDefensive();
  }

  shouldStomp(): boolean {
    return false;
  }
}
