import {
  GetPlayerAura,
  PlayerHasAura,
  SpellCooldownRemainingSeconds,
  StopCast,
  UnitHealthPercentage,
  WoWLua,
} from "../../wowutils/wow_utils";
import { MageAura, MageSpell } from "../../state/utils/mage_utils";
import { Fireball } from "../spells/fireball";
import { FireBlast } from "../spells/fire_blast";
import { Spell } from "../spells/ispell";
import { PhoenixFlames } from "../spells/phoenix_flames";
import { Pyroblast } from "../spells/pyroblast";
import { Scorch } from "../spells/scorch";
import { Car } from "./car";
import { Frostbolt } from "../spells/frostbolt";
import { PlayerState } from "../../state/players/player_state";
import { DRType } from "../../state/dr_tracker";
import { GetPumpingState, PumpingStatus } from "../../state/utils/pumping_status";
import { GetKillTarget } from "../../state/utils/kill_target_utils";

export class Pump implements Car {
  private getEnemies: () => PlayerState[];
  private firestarter: boolean;

  constructor(getEnemies: () => PlayerState[]) {
    this.getEnemies = () => getEnemies();
    const [, talentColumn] = GetTalentTierInfo(1, 1);
    this.firestarter = talentColumn === 1;
  }

  getNextSpell(): Spell | null {
    const target = this.getEnemies().find((x) => UnitGUID("target") === UnitGUID(x.unitId));
    const doNotTouchTarget = target ? !target.shouldDamage() : false;
    if (doNotTouchTarget) {
      return null;
    }

    const pumpingState = GetPumpingState();
    if (WoWLua.IsUnitInOfLineOfSight("player", "target")) {
      if (pumpingState === PumpingStatus.WarmingUp) {
        return this.warmUp();
      }
      if (pumpingState === PumpingStatus.Pumping) {
        return this.pump();
      }
      if (pumpingState === PumpingStatus.Dumped) {
        return this.kite();
      }
      if (pumpingState === PumpingStatus.Hot) {
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
    const fireBlastCharges = WoWLua.GetSpellChargesTyped(MageSpell.FireBlast);

    if (hotStreak) {
      if (WoWLua.GetAuraRemainingTime(hotStreak) <= 1) {
        return new Pyroblast();
      }
      return new Frostbolt();
    }

    if (this.firestarter) {
      const enemiesAbove90 = this.getEnemies()
        .filter((x) => x.shouldDamage() && UnitHealthPercentage(x.unitId) >= 90)
        .sort((a, b) => b.distanceFromPlayer() - a.distanceFromPlayer());

      if (enemiesAbove90.length > 0) {
        if (heatingUp) {
          if (WoWLua.GetAuraRemainingTime(heatingUp) >= 2.5) {
            return new Fireball({
              unitTarget: enemiesAbove90[0].unitId,
              shouldStopCasting: () => {
                const cast = WoWLua.UnitCastingInfoTypedCacheBusted("player");
                if (cast) {
                  const percentRemaining =
                    ((GetTime() * 1000 - cast.startTimeMS) / (cast.endTimeMS - cast.startTimeMS)) *
                    100;
                  if (
                    UnitHealthPercentage(enemiesAbove90[0].unitId) < 90 &&
                    percentRemaining >= 90 &&
                    !PlayerHasAura(MageAura.HotStreak)
                  ) {
                    const fireBlastCharges = WoWLua.GetSpellChargesTyped(MageSpell.FireBlast);
                    if (fireBlastCharges.currentCharges === fireBlastCharges.maxCharges) {
                      new FireBlast({
                        unitTarget: enemiesAbove90[0].unitId,
                        hardCast: false,
                      }).cast();
                    } else {
                      // stop casting when we're casting a non crit and we dont have full fire blast charges
                      return true;
                    }
                  }
                }

                return false;
              },
            });
          } else if (fireBlastCharges.currentCharges === fireBlastCharges.maxCharges) {
            return new FireBlast();
          }
        } else {
          return new Fireball({
            unitTarget: enemiesAbove90[0].unitId,
          });
        }
      }
    } else if (heatingUp) {
      if (fireBlastCharges.currentCharges === fireBlastCharges.maxCharges) {
        return new FireBlast();
      }
    }

    if (heatingUp) {
      if (fireBlastCharges.currentCharges === fireBlastCharges.maxCharges) {
        return new FireBlast();
      }
    } else if (!WoWLua.IsPlayerMoving() && !heatingUp) {
      return new Fireball();
    }

    return null;
  }

  pump() {
    const killTarget = GetKillTarget(this.getEnemies());
    const killTargetUnitId = killTarget ? killTarget.unitId : "target";
    const currentCast = WoWLua.UnitCastingInfoTyped("player");
    if (currentCast && currentCast.spell === MageSpell.Frostbolt) {
      StopCast();
    }

    const hotStreak = GetPlayerAura(MageAura.HotStreak);
    if (hotStreak) {
      return new Pyroblast({
        unitTarget: killTargetUnitId,
      });
    }

    if (WoWLua.IsSpellUsable(MageSpell.FireBlast) && !PlayerHasAura(MageAura.HotStreak)) {
      return new FireBlast({ hardCast: true, unitTarget: killTargetUnitId });
    }

    // todo:: dont break CC
    if (WoWLua.IsSpellUsable(MageSpell.PhoenixFlames)) {
      return new PhoenixFlames({ unitTarget: killTargetUnitId });
    }

    return new Scorch({ unitTarget: killTargetUnitId });
  }

  hot() {
    // TODO :: Surface this information better. Maybe make it optional to combust when healer CC
    // if (pumpingState === PumpingStatus.WarmingUp) {
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

    const hotStreak = GetPlayerAura(MageAura.HotStreak);
    if (hotStreak && WoWLua.GetAuraRemainingTime(hotStreak) <= 1) {
      if (currentCast && currentCast.spell === MageSpell.Frostbolt) {
        StopCast();
      }
      return new Pyroblast();
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
        const fireBlastCharges = WoWLua.GetSpellChargesTyped(MageSpell.FireBlast);
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

  private findBestFireballTarget() {}
}
