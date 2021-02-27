import {
  GetPlayerAura,
  GetSpellChargesTyped,
  PlayerHasAura,
  SpellCooldownRemainingSeconds,
  StopCast,
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
import { UIStatusFrame } from "../../ui/status_frame";
import { PumpingStatus } from "../../state/utils/pumping_status";

export class Pump implements Car {
  pumpingState;
  private getEnemies: () => PlayerState[];

  constructor(getEnemies: () => PlayerState[]) {
    this.getEnemies = () => getEnemies();
    this.pumpingState = PumpingStatus.Dumped;
  }

  getNextSpell(): Spell | null {
    const target = this.getEnemies().find((x) => UnitGUID("target") === UnitGUID(x.unitId));
    const doNotTouchTarget = target ? !target.shouldDamage() : false;
    if (doNotTouchTarget) {
      return null;
    }

    if (PlayerHasAura(MageAura.Combustion)) {
      this.pumpingState = PumpingStatus.Pumping;
    } else if (!WoWLua.IsSpellUsable(MageSpell.Combustion) && !PlayerHasAura(MageAura.Combustion)) {
      this.pumpingState = PumpingStatus.Dumped;
    } else if (WoWLua.IsSpellUsable(MageSpell.Combustion)) {
      const fireBlastCharges = GetSpellChargesTyped(MageSpell.FireBlast);
      const hotStreak = GetPlayerAura(MageAura.HotStreak);

      if (hotStreak && fireBlastCharges.maxCharges === fireBlastCharges.currentCharges) {
        this.pumpingState = PumpingStatus.Hot;
      } else {
        this.pumpingState = PumpingStatus.WarmingUp;
      }
    }

    UIStatusFrame.pumpStatus(this.pumpingState);

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
      if (this.pumpingState === PumpingStatus.Hot) {
        return this.hot();
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
      return new Frostbolt();
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
    const currentCast = WoWLua.UnitCastingInfoTyped("player");
    if (currentCast && currentCast.spell === MageSpell.Frostbolt) {
      StopCast();
    }

    const hotStreak = GetPlayerAura(MageAura.HotStreak);
    if (hotStreak) {
      return new Pyroblast();
    }

    if (WoWLua.IsSpellUsable(MageSpell.FireBlast) && !PlayerHasAura(MageAura.HotStreak)) {
      return new FireBlast({ hardCast: true });
    }

    if (WoWLua.IsSpellUsable(MageSpell.PhoenixFlames)) {
      return new PhoenixFlames();
    }

    return new Scorch();
  }

  hot() {
    // TODO :: Surface this information better. Maybe make it optional to combust when healer CC
    // if (this.pumpingState === PumpingStatus.WarmingUp) {
    //   for (const arena of this.getEnemies()) {
    //     if (arena.isHealer()) {
    //       const remainingCC = arena.remainingCC();
    //       if (remainingCC.filter((x) => x.remaining >= 3).length === 0) {
    //         return null;
    //       }
    //     }
    //   }
    // }

    // cast frostbolt, it's actually decent damage plus it's in a spell book
    // we don't care about getting interrupted if they do kick it
    const currentCast = WoWLua.UnitCastingInfoTyped("player");
    if (currentCast && currentCast.spell === MageSpell.Fireball) {
      StopCast();
    }

    return new Frostbolt();
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
