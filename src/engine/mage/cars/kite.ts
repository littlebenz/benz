import {
  GetPlayerAura,
  GetSpellChargesTyped,
  IsPlayerMoving,
  IsSpellCastable,
  IsUnitInOfLineOfSight,
  SpellCooldownRemainingSeconds,
} from "../../wowutils/wow_utils";
import { MageAura, MageSpell } from "../../state/utils/mage_utils";
import { Fireball } from "../spells/fireball";
import { FireBlast } from "../spells/fire_blast";
import { Pyroblast } from "../spells/pyroblast";
import { Scorch } from "../spells/scorch";
import { Car } from "./car";
import { PlayerState } from "../../state/players/player_state";
import { DRType } from "../../state/dr_tracker";

export class Kite implements Car {
  private getEnemies: () => PlayerState[];

  constructor(getEnemies: () => PlayerState[]) {
    this.getEnemies = () => getEnemies();
  }

  getNextSpell() {
    if (!IsUnitInOfLineOfSight("player", "target")) {
      return null;
    }

    const target = this.getEnemies().find((x) => x.guid() === UnitGUID("target"));
    if (target) {
      for (const targetCC of target.remainingCC()) {
        if (
          targetCC &&
          (targetCC.type === DRType.Incapacitate || targetCC.type === DRType.Disorient) &&
          targetCC.remaining >= 1.5
        ) {
          return null;
        }
      }
    }

    const heatingUp = GetPlayerAura(MageAura.HeatingUp);
    if (heatingUp) {
      const combustion = IsSpellCastable(MageSpell.Combustion);
      // 9 seconds per 3 = 27
      if (combustion.duration !== 0 && SpellCooldownRemainingSeconds(combustion) >= 27) {
        const fireBlastCharges = GetSpellChargesTyped(MageSpell.FireBlast);
        if (fireBlastCharges.currentCharges >= 1) {
          return new FireBlast();
        }
      }
    }

    const hotstreak = GetPlayerAura(MageAura.HotStreak);
    if (hotstreak) {
      return new Pyroblast();
    }

    if (IsPlayerMoving()) {
      // return new Scorch();
    }

    return new Fireball();
  }
}
