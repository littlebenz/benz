import {
  GetPlayerAura,
  GetSpellChargesTyped,
  PlayerHasAura,
  SpellCooldownRemainingSeconds,
  WoWLua,
} from "../../wowutils/wow_utils";
import { MageAura, MageSpell } from "../../state/utils/mage_utils";
import { Combustion } from "../spells/combustion";
import { Fireball } from "../spells/fireball";
import { FireBlast } from "../spells/fire_blast";
import { Spell } from "../spells/ispell";
import { Meteor } from "../spells/meteor";
import { PhoenixFlames } from "../spells/phoenix_flames";
import { Pyroblast } from "../spells/pyroblast";
import { Scorch } from "../spells/scorch";
import { Car } from "./car";
import { FrostNova } from "../spells/frost_nova";
import { Frostbolt } from "../spells/frostbolt";
import { PlayerState } from "../../state/players/player_state";
import { Defensive } from "../../state/players/Defensive";
import { DRType } from "../../state/dr_tracker";

export enum PumpingStatus {
  WarmingUp,
  Pumping,
  Dumped,
}

export class Pump implements Car {
  pumpingState = PumpingStatus.Dumped;
  private getEnemies: () => PlayerState[];

  constructor(getEnemies: () => PlayerState[]) {
    this.getEnemies = () => getEnemies();
  }

  getNextSpell(): Spell | null {
    const target = this.getEnemies().find((x) => UnitGUID("target") === UnitGUID(x.unitId));
    const doNotTouchTarget = target ? !target.shouldDamage() : false;
    if (doNotTouchTarget) {
      return null;
    }

    if (PlayerHasAura(MageAura.Combustion)) {
      this.pumpingState = PumpingStatus.Pumping;
    } else if (
      WoWLua.IsSpellUsable(MageSpell.Combustion) &&
      this.pumpingState === PumpingStatus.Dumped
    ) {
      this.pumpingState = PumpingStatus.WarmingUp;
    } else if (!WoWLua.IsSpellUsable(MageSpell.Combustion) && !PlayerHasAura(MageAura.Combustion)) {
      this.pumpingState = PumpingStatus.Dumped;
    }

    if (WoWLua.IsUnitInOfLineOfSight("player", "target")) {
      if (this.pumpingState === PumpingStatus.WarmingUp) {
        return this.warmUp();
      }
      if (this.pumpingState === PumpingStatus.Pumping) {
        return this.pump();
      }
      if (this.pumpingState === PumpingStatus.Dumped) {
        return this.kite();
      }
    }

    return null;
  }

  /**
   * Warming up will get a hotstreak proc and wait for all cooldowns to be available to pump
   */
  warmUp() {
    const hotStreak = GetPlayerAura(MageAura.HotStreak);
    const heatingUp = GetPlayerAura(MageAura.HeatingUp);
    const fireBlastCharges = GetSpellChargesTyped(MageSpell.FireBlast);

    if (hotStreak) {
      if (
        WoWLua.GetAuraRemainingTime(hotStreak) >= 7 ||
        WoWLua.GetAuraRemainingTime(hotStreak) === 0
        // fireBlastCharges.currentCharges !== fireBlastCharges.maxCharges
      ) {
        // cast frostbolt, it's actually decent damage plus it's in a spell book
        // we don't care about getting interrupted if they do kick it
        return new Frostbolt();
      } else {
        // we're fucking ready, let's go
        this.pumpingState = PumpingStatus.Pumping;
        return this.pump();
      }
    } else if (heatingUp) {
      if (fireBlastCharges.currentCharges === fireBlastCharges.maxCharges) {
        return new FireBlast();
      }
    }

    // we have nothing, let's get heating up
    if (!WoWLua.IsPlayerMoving()) {
      return new Fireball();
    }

    return null;
  }

  pump() {
    if (this.pumpingState === PumpingStatus.WarmingUp) {
      for (const arena of this.getEnemies()) {
        if (arena.isHealer()) {
          const remainingCC = arena.remainingCC();
          if (remainingCC.filter((x) => x.remaining >= 3).length === 0) {
            return null;
          }
        }
      }
    }

    // const missleList = GetMissleList();

    // only cast if target can't get out of nova
    // if (IsSpellUsable(MageSpell.FrostNova) && IsSpellUsable(MageSpell.Meteor)) {
    //   const [playerX, playerY] = GetUnitPosition("player");
    //   const [targetX, targetY] = GetUnitPosition("target");

    //   const distance = math.sqrt(math.pow(targetX - playerX, 2) + math.pow(targetY - playerY, 2));
    //   if (distance <= 12) {
    //     return new FrostNova();
    //   }
    // }

    // is it worth casting meteor if they can just walk out of if? should we try to DB?
    // if (IsSpellUsable(MageSpell.Meteor)) {
    //   return new Meteor();
    // }

    const hotStreak = GetPlayerAura(MageAura.HotStreak);
    if (hotStreak) {
      return new Pyroblast();
    } else if (WoWLua.IsSpellUsable(MageSpell.Combustion) && !PlayerHasAura(MageAura.Combustion)) {
      return new Combustion();
    }

    // const heatingUp = GetPlayerAura(MageAura.HeatingUp);
    // if (heatingUp) {
    // if (missleList.filter((x) => x.spellId === 257541).length >= 1) {
    //     return new Pyroblast();
    // }

    if (WoWLua.IsSpellUsable(MageSpell.FireBlast) && !PlayerHasAura(MageAura.HotStreak)) {
      return new FireBlast(true);
    }

    if (WoWLua.IsSpellUsable(MageSpell.PhoenixFlames)) {
      return new PhoenixFlames();
    }
    // }

    const combustion = GetPlayerAura(MageAura.Combustion);
    if (combustion === null) {
      this.pumpingState = PumpingStatus.Dumped;
    }

    return new Scorch();
  }

  kite() {
    if (!WoWLua.IsUnitInOfLineOfSight("player", "target")) {
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
      const combustion = WoWLua.IsSpellCastable(MageSpell.Combustion);
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

    if (WoWLua.IsPlayerMoving()) {
      // return new Scorch();
    }

    return new Fireball();
  }
}
