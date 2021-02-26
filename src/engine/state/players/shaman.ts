import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { WoWLua, UnitCastOrChannel, UnitHasAura } from "../../wowutils/wow_utils";
import { ShamanAura, ShamanSpell } from "../utils/shaman_utils";
import { WoWClass } from "./WoWClass";
import { InterruptSpell, PumpSpell } from "../utils/interrupt_spell";
import { TalentSpec } from "./TalentSpec";

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

  canBeIncapacitated(): boolean {
    return super.canBeIncapacitated();
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
  shouldInterrupt(): boolean {
    const casting = this.currentCastOrChannel();
    if (casting) {
      if (
        casting.spell === ShamanSpell.LightningLasso ||
        casting.spell === ShamanSpell.HealingWave ||
        casting.spell === ShamanSpell.Hex ||
        casting.spell === ShamanSpell.HealingSurge
      ) {
        return true;
      }
    }
    return false;
  }
  shouldStomp(): boolean {
    return false;
  }
}
