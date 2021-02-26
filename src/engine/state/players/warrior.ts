import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { UnitHasAura } from "../../wowutils/wow_utils";
import { WarriorAura, WarriorSpell } from "../utils/warrior_utils";
import { WoWClass } from "./WoWClass";
import { SpellstealPriority } from "./SpellstealPriority";
import { InterruptSpell, PumpSpell } from "../utils/interrupt_spell";
import { TalentSpec } from "./TalentSpec";

export class Warrior extends PlayerState {
  class = WoWClass.Warrior;

  interruptSpells: InterruptSpell[] = [
    {
      name: WarriorSpell.Pummel,
      specs: [TalentSpec.Warrior_Arms, TalentSpec.Warrior_Fury, TalentSpec.Warrior_Protection],
      cooldown: 15,
      lockDuration: 4,
      range: 5,
    },
  ];

  pumpSpells: PumpSpell[] = [
    {
      name: WarriorSpell.Avatar,
      cooldown: 90,
      specs: [TalentSpec.Warrior_Arms],
    },
    {
      name: WarriorSpell.Recklessness,
      cooldown: 90,
      specs: [TalentSpec.Warrior_Fury],
    },
  ];

  canBeIncapacitated(): boolean {
    if (UnitHasAura(WarriorAura.Bladestorm, this.unitId)) {
      return false;
    }
    return super.canBeIncapacitated();
  }

  isPumping(): boolean {
    if (UnitHasAura(WarriorAura.Avatar, this.unitId)) {
      return true;
    }

    if (UnitHasAura(WarriorAura.Warbreaker, this.unitId)) {
      return true;
    }

    return false;
  }
  isDefensive(): Defensive {
    if (UnitHasAura(WarriorAura.ShieldWall, this.unitId)) {
      return Defensive.CanStillDam;
    }

    if (UnitHasAura(WarriorAura.DefensiveStance, this.unitId)) {
      return Defensive.CanStillDam;
    }

    if (UnitHasAura(WarriorAura.DieByTheSword, this.unitId)) {
      return Defensive.DoNotTouch;
    }

    return super.isDefensive();
  }

  shouldInterrupt(): boolean {
    return false;
  }
  shouldStomp(): boolean {
    return UnitHasAura(WarriorAura.SpellReflection, this.unitId);
  }
}
