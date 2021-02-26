import { GetUnitAura, UnitCastOrChannel, UnitHasAura, WoWLua } from "../../wowutils/wow_utils";
import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { MageAura, MageSpell } from "../utils/mage_utils";
import { WoWClass } from "./WoWClass";
import { InterruptSpell, PumpSpell } from "../utils/interrupt_spell";
import { TalentSpec } from "./TalentSpec";

export class Mage extends PlayerState {
  class = WoWClass.Mage;

  interruptSpells: InterruptSpell[] = [
    {
      name: MageSpell.Counterspell,
      specs: [TalentSpec.Mage_Arcane, TalentSpec.Mage_Fire, TalentSpec.Mage_Frost],
      cooldown: 24, // can be shorter with night fae
      lockDuration: 6,
      range: 40,
    },
  ];
  pumpSpells: PumpSpell[] = [
    {
      name: MageSpell.Combustion,
      cooldown: 90, // cut to 90 with all the bullshit night fae and pyrokin
      specs: [TalentSpec.Mage_Fire],
    },
    {
      name: MageSpell.IcyVeins,
      cooldown: 90,
      specs: [TalentSpec.Mage_Frost],
    },
    {
      name: MageSpell.ArcanePower,
      cooldown: 90,
      specs: [TalentSpec.Mage_Arcane],
    },
  ];

  canBeIncapacitated(): boolean {
    if (WoWLua.GetAuraRemainingTime(GetUnitAura(MageAura.IceBlock, this.unitId)) >= 1.5) {
      return false;
    }

    return super.canBeIncapacitated();
  }

  isPumping(): boolean {
    if (UnitHasAura(MageAura.Combustion, this.unitId)) {
      return true;
    }

    if (UnitHasAura(MageAura.IcyVeins, this.unitId)) {
      return true;
    }

    if (UnitHasAura(MageAura.ArcanePower, this.unitId)) {
      return true;
    }

    return false;
  }

  shouldStomp(): boolean {
    return false;
  }
  isDefensive(): Defensive {
    if (UnitHasAura(MageAura.IceBlock, this.unitId)) {
      return Defensive.DoNotTouch;
    }

    return super.isDefensive();
  }
  shouldInterrupt(): boolean {
    const casting = this.currentCastOrChannel();
    if (casting) {
      if (casting.spell === MageSpell.Polymorph) {
        return true;
      }
    }
    return false;
  }
}
