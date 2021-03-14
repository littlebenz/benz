import { UnitId } from "@wartoshika/wow-declarations";
import { Aura, UnitType } from "./wow_helpers";
import { SpellStopCasting, UnitReaction } from "./unlocked_functions";
import { MageAura, MageSpell } from "../state/utils/mage_utils";
import { DemonHunterAura, DemonHunterSpell } from "../state/utils/demon_hunter_utils";
import { DeathKnightAura, DeathKnightSpell } from "../state/utils/death_knight_utils";
import { DruidAura, DruidSpell } from "../state/utils/druid_utils";
import { HunterAura, HunterSpell } from "../state/utils/hunter_utils";
import { MonkAura, MonkSpell } from "../state/utils/monk_utils";
import { PaladinAura, PaladinSpell } from "../state/utils/paladin_utils";
import { PriestAura, PriestSpell } from "../state/utils/priest_utils";
import { RogueAura, RogueSpell } from "../state/utils/rogue_utils";
import { ShamanAura, ShamanSpell } from "../state/utils/shaman_utils";
import { WarlockAura, WarlockSpell } from "../state/utils/warlock_utils";
import { WarriorAura, WarriorSpell } from "../state/utils/warrior_utils";
import { NightFaeAura, NightFaeSpell } from "../state/utils/night_fae_utils";
import { NecrolordAura } from "../state/utils/necrolord_utils";
import { memoizeOne } from "../../utils/memoize";
import { CommonAura } from "../state/utils/common_utils";
import { DRType, SpellNameToDiminishingReturnSchool } from "../state/dr_tracker";
import { dbscan } from "../../utils/dbscan";
import { Point } from "../state/utils/point";

export type PlayerAura =
  | MageAura
  | DemonHunterAura
  | DeathKnightAura
  | DruidAura
  | HunterAura
  | MonkAura
  | PaladinAura
  | PriestAura
  | RogueAura
  | ShamanAura
  | WarlockAura
  | WarriorAura
  | NightFaeAura
  | NecrolordAura
  | CommonAura;

export type PlayerSpell =
  | MageSpell
  | DemonHunterSpell
  | DeathKnightSpell
  | DruidSpell
  | HunterSpell
  | MonkSpell
  | PaladinSpell
  | PriestSpell
  | RogueSpell
  | ShamanSpell
  | WarlockSpell
  | WarriorSpell
  | NightFaeSpell;

export interface CombatSpellInfo {
  timestamp: number;
  eventName: CombatEvent;
  hideCaster: boolean;
  sourceGUID: string;
  sourceName: string;
  sourceFlags: number;
  sourceRaidFlags: number;
  destGUID: string;
  destName: string;
  destFlags: number;
  destRaidFlags: number;
  spellId: number;
  spellName: PlayerSpell;
  spellSchool: string;
}

export class MemoizedLua {
  GetUnitAuras = memoizeOne(this.getUnitAuras);
  GetUnitAurasCacheBusted = memoizeOne(this.getUnitAuras, 0);
  GetObjects = memoizeOne(this.getObjects, 30);
  GetObjectByName = memoizeOne(this.getObjectByName);
  UnitMovingDirection = memoizeOne(this.unitMovingDirection);
  GetAuraRemainingTime = memoizeOne(this.getAuraRemainingTime);
  GetAuraRemainingTimeCacheBusted = memoizeOne(this.getAuraRemainingTime, 0);
  IsSpellCastable = memoizeOne(this.isSpellCastable);
  UnitChannelInfoTyped = memoizeOne(this.unitChannelInfoTyped);
  IsSpellUsable = memoizeOne(this.isSpellUsable);
  GetBags = memoizeOne(this.getBags);
  GetContainerItemInfoTyped = memoizeOne(this.getContainerItemInfoTyped);
  UnitIsMoving = memoizeOne(this.unitIsMoving);
  UnitCastingInfoTyped = memoizeOne(this.unitCastingInfoTyped);
  UnitCastingInfoTypedCacheBusted = memoizeOne(this.unitCastingInfoTyped, 0);
  IsPlayerMoving = memoizeOne(this.isPlayerMoving);
  IsUnitInOfLineOfSight = memoizeOne(this.isUnitInOfLineOfSight);
  TargetHasAuraFromSource = memoizeOne(this.targetHasAuraFromSource);
  IsPositionLineOfSight = memoizeOne(this.isPositionLineOfSight);
  DistanceFromUnit = memoizeOne(this.distanceFromUnit);
  IsUnitInOfLineOfSightNoMemoize = memoizeOne(this.isUnitInOfLineOfSight, 0);
  GetSpellChargesTyped = memoizeOne(this.getSpellChargesTyped);
  IsUnitCrowdControlled = memoizeOne(this.isUnitCrowdControlled);
  FindBestMeteorSpot = memoizeOne(this.findBestMeteorSpot, 30);
  FindPlayerClusters = memoizeOne(this.findPlayerClusters, 60);

  private findPlayerClusters() {
    let players = [];
    for (let i = 1; i <= GetNumGroupMembers(); i++) {
      players.push("raid" + i);
    }

    const playerPositions = players
      .filter((x) => !UnitIsDeadOrGhost(x))
      .map((x) => GetUnitPosition(x))
      .filter((x) => x[0] !== null && x[1] !== null)
      .map((x) => new Point(x[0], x[1], x[2]));

    const clusters = dbscan(playerPositions, 35, 2);

    const playerPositonByCluster = new Map<number, Point[]>();
    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i];
      if (!playerPositonByCluster.has(cluster) && cluster !== -1) {
        playerPositonByCluster.set(cluster, []);
      }

      console.log(
        "index: ",
        cluster,
        playerPositions[i].x,
        playerPositions[i].y,
        playerPositions[i].z
      );
      if (cluster !== -1) {
        playerPositonByCluster.get(cluster)!.push(playerPositions[i]);
      }
    }

    let largestSize = 0;
    let clusterIndex = 0;

    for (const [cluster, points] of playerPositonByCluster) {
      if (points.length > largestSize) {
        clusterIndex = cluster;
        largestSize = points.length;
      }
    }

    // let bestPlayers: number[][] = [];

    // for (let i = 0; i < playerPositions.length; i++) {
    //   let under30Yards = [];
    //   for (let j = 0; j < playerPositions.length; j++) {
    //     const playerA = playerPositions[i];
    //     const playerB = playerPositions[j];
    //     if (
    //       DistanceFromPoints(playerA.x, playerA.y, playerA.z, playerB.x, playerB.y, playerB.z) <= 30
    //     ) {
    //       under30Yards.push([playerB.x, playerB.y, playerB.z]);
    //     }
    //   }

    //   if (under30Yards.length > bestPlayers.length) {
    //     bestPlayers = under30Yards;
    //   }
    // }

    let centerX = 0;
    let centerY = 0;
    let centerZ = 0;
    const bestPlayers = playerPositonByCluster.get(clusterIndex);
    if (bestPlayers === undefined || bestPlayers === null) {
      const [x, y, z] = GetUnitPosition("player");
      return {
        x,
        y,
        z,
      };
    }
    for (let i = 0; i < bestPlayers.length; i++) {
      centerX += bestPlayers[i].x;
      centerY += bestPlayers[i].y;
      centerZ += bestPlayers[i].z;
    }

    return {
      x: centerX / bestPlayers.length,
      y: centerY / bestPlayers.length,
      z: centerZ / bestPlayers.length,
    };
  }

  private findBestMeteorSpot(targetGuid: string) {
    const [px, py, pz] = GetUnitPosition("player");
    const [tx, ty, tz] = GetUnitPosition(targetGuid);
    if (!px || !tx) {
      return null;
    }

    // Archimedean spiral points
    const lps = 5;
    let r = 0.0;
    const ai = 0.5;
    const ri = 0.1;

    let a = 0.0;
    let x = 0;
    let y = 0;
    const as = lps * 2 * Math.PI;

    const possiblePoints = [];
    for (let i = 1; i < as / ai; i++) {
      (x = r * Math.cos(a)), (y = r * Math.sin(a));
      if (WoWLua.IsPositionLineOfSight(px, py, pz, x + tx, y + ty, tz)) {
        possiblePoints.push({
          x: x + tx,
          y: y + ty,
          z: tz,
        });
      }
      r += ri;
      a += ai;
    }

    const viablePoints = [];
    for (const possiblePoint of possiblePoints) {
      let badPosition = false;
      for (const enemy of WoWLua.GetObjects().filter((x) => x !== targetGuid)) {
        const [ex, ey, ez] = GetUnitPosition(enemy);
        const type = ObjectType(enemy);
        const reaction = UnitReaction("player", SetMouseOver(enemy));

        if (
          (type === 5 || type === 6) &&
          reaction &&
          reaction < 5 &&
          ex !== null &&
          DistanceFromPoints(ex, ey, ez, possiblePoint.x, possiblePoint.y, possiblePoint.z) <= 8
        ) {
          badPosition = true;
        }
      }

      if (!badPosition) {
        viablePoints.push(possiblePoint);
      }
    }

    if (viablePoints.length > 0) {
      return viablePoints.sort(
        (a, b) =>
          DistanceFromPoints(tx, ty, tz, a.x, a.y, a.z) -
          DistanceFromPoints(tx, ty, tz, b.x, b.y, b.z)
      )[0];
    }

    return null;
  }

  private isUnitCrowdControlled(unit: UnitId, considerRoot = false) {
    const auras = WoWLua.GetUnitAuras(unit);
    for (const aura of auras) {
      if (SpellNameToDiminishingReturnSchool.has(aura.name)) {
        if (!considerRoot) {
          return SpellNameToDiminishingReturnSchool.get(aura.name) !== DRType.Root;
        }
        return true;
      }
    }
    return false;
  }

  private getSpellChargesTyped(spell: string | number) {
    const [
      currentCharges,
      maxCharges,
      cooldownStart,
      cooldownDuration,
      chargeModRate,
    ] = GetSpellCharges(spell);

    return {
      currentCharges,
      maxCharges,
      cooldownStart,
      cooldownDuration,
      chargeModRate,
    };
  }

  private getUnitAuras(unit: WoWAPI.UnitId): Aura[] {
    const buffs: Aura[] = [];
    for (let i = 1; i < 40; i++) {
      for (const type of ["HELPFUL", "HARMFUL", "PLAYER", "RAID", "CANCELABLE", "NOT_CANCELABLE"]) {
        const [
          name,
          icon,
          count,
          debuffType,
          duration,
          expirationTime,
          source,
          isStealable,
          nameplateShowPersonal,
          spellId,
          canApplyAura,
          isBossDebuff,
          castByPlayer,
          nameplateShowAll,
          timeMod,
        ] = UnitAura(unit, i, type as WoWAPI.BuffFilterType);
        if (name) {
          buffs.push({
            name,
            icon,
            count,
            debuffType,
            duration,
            expirationTime,
            source,
            isStealable,
            nameplateShowPersonal,
            spellId,
            canApplyAura,
            isBossDebuff,
            castByPlayer,
            nameplateShowAll,
            timeMod,
            index: i,
          });
        }
      }
    }

    return buffs;
  }

  private getObjects(): string[] {
    const guids: string[] = [];
    const objectCount = GetObjectCount();
    for (let i = 1; i <= objectCount; i++) {
      guids.push(GetObjectWithIndex(i));
    }

    return guids;
  }

  private getObjectByName(name: string) {
    const objects = WoWLua.GetObjects();
    for (const object of objects) {
      if (ObjectName(object) === name) {
        return object;
      }
    }

    return null;
  }

  private unitMovingDirection(unit: string): number | null {
    const R = UnitFacing(unit);

    let mod = 0;

    let flags = GetUnitMovementFlags(unit);

    if (!flags) return null;

    flags = bit.band(flags, 0xf);

    if (flags == 0x2) mod = math.pi;
    else if (flags == 0x4) mod = math.pi * 0.5;
    else if (flags == 0x8) mod = math.pi * 1.5;
    else if (flags == bit.bor(0x1, 0x4)) mod = math.pi * (1 / 8) * 2;
    else if (flags == bit.bor(0x1, 0x8)) mod = math.pi * (7 / 8) * 2;
    else if (flags == bit.bor(0x2, 0x4)) mod = math.pi * (3 / 8) * 2;
    else if (flags == bit.bor(0x2, 0x8)) mod = math.pi * (5 / 8) * 2;

    return (R + mod) % (math.pi * 2);
  }

  private getAuraRemainingTime(aura: Aura | null | undefined) {
    if (aura == null) {
      return 0;
    }

    return aura.expirationTime - GetTime();
  }

  private isSpellCastable(spell: string | number): SpellCastable {
    const [usable, nomana] = IsUsableSpell(spell);
    const [start, duration, enabled] = GetSpellCooldown(spell as any, BOOKTYPE_SPELL);
    return {
      usable,
      nomana,
      duration,
      enabled,
      start,
      usableIn: start !== null && duration !== null ? start + duration - GetTime() : 0,
    };
  }

  private unitChannelInfoTyped(unit: string) {
    const [
      spell,
      text,
      texture,
      startTimeMS,
      endTimeMS,
      isTradeSkill,
      interruptable,
      spellId,
    ] = UnitChannelInfo(unit);

    if (spell === null) {
      return null;
    }

    return {
      spell: spell as PlayerSpell,
      text,
      texture,
      startTimeMS,
      endTimeMS,
      isTradeSkill,
      interruptable: !interruptable,
      spellId,
      castType: "channel",
    };
  }

  private isSpellUsable(spell: string | number) {
    const castable = WoWLua.IsSpellCastable(spell);
    if (castable.nomana === true) {
      return false;
    }

    return (
      castable.usable &&
      (castable.duration === null || castable.duration === 0) &&
      !WoWLua.IsUnitCrowdControlled("player")
    );
  }

  GetCurrentEventLogInfo() {
    const [
      timestamp,
      eventName,
      hideCaster,
      sourceGUID,
      sourceName,
      sourceFlags,
      sourceRaidFlags,
      destGUID,
      destName,
      destFlags,
      destRaidFlags,
    ] = CombatLogGetCurrentEventInfo();

    return {
      timestamp,
      eventName: eventName as CombatEvent,
      hideCaster,
      sourceGUID,
      sourceName,
      sourceFlags,
      sourceRaidFlags,
      destGUID,
      destName,
      destFlags,
      destRaidFlags,
    };
  }

  private getBags() {
    const inv = [];
    for (let i = 0; i <= 4; i++) {
      for (let j = 0; j <= GetContainerNumSlots(i as WoWAPI.CONTAINER_ID); j++) {
        inv.push(WoWLua.GetContainerItemInfoTyped(i, j));
      }
    }

    return inv;
  }

  private getContainerItemInfoTyped(bag: number, slot: number) {
    const [
      icon,
      itemCount,
      locked,
      quality,
      readable,
      lootable,
      itemLink,
      isFiltered,
      noValue,
      itemID,
    ] = GetContainerItemInfo(bag as WoWAPI.CONTAINER_ID, slot);

    return {
      icon,
      itemCount,
      locked,
      quality,
      readable,
      lootable,
      itemLink,
      isFiltered,
      noValue,
      itemID,
    };
  }

  private unitIsMoving(unit: string): boolean {
    const [speed] = GetUnitSpeed(unit);
    return speed > 0;
  }

  GetCurrentSpellEventLogInfo(): CombatSpellInfo {
    const [
      timestamp,
      eventName,
      hideCaster,
      sourceGUID,
      sourceName,
      sourceFlags,
      sourceRaidFlags,
      destGUID,
      destName,
      destFlags,
      destRaidFlags,
      spellId,
      spellName,
      spellSchool,
    ] = CombatLogGetCurrentEventInfo();

    return {
      timestamp,
      eventName: eventName as CombatEvent,
      hideCaster,
      sourceGUID,
      sourceName,
      sourceFlags,
      sourceRaidFlags,
      destGUID,
      destName: destName,
      destFlags,
      destRaidFlags,
      spellId: spellId as number,
      spellName: spellName as PlayerSpell,
      spellSchool: spellSchool as string,
    };
  }

  private unitCastingInfoTyped(unit: string) {
    const [
      spell,
      text,
      texture,
      startTimeMS,
      endTimeMS,
      isTradeSkill,
      castID,
      interruptable,
      spellId,
    ] = UnitCastingInfo(unit);

    if (spell === null) {
      return null;
    }

    return {
      spell: spell as PlayerSpell,
      text,
      texture,
      startTimeMS,
      endTimeMS,
      isTradeSkill,
      castID,
      interruptable,
      spellId,
      castTimeRemaining: endTimeMS / 1000 - GetTime(),
      timeSpentCasting: (GetTime() * 1000 - startTimeMS) / 1000,
      castType: "cast",
    };
  }

  private isPlayerMoving(): boolean {
    const [currentSpeed, runSpeed, flightSpeed, swimSpeed] = GetUnitSpeed("player");
    return currentSpeed !== 0;
  }

  private isUnitInOfLineOfSight(unita: string, unitb: string): boolean {
    const [ax, ay, az] = GetUnitPosition(unita);
    const [bx, by, bz] = GetUnitPosition(unitb);

    if (!ax || !ay || !az || !bx || !by || !bz) {
      return false;
    }

    const losFlags = 0x100030;
    const [hit] = TraceLine(ax, ay, az + 2.25, bx, by, bz + 2.25, losFlags);
    return hit === 0;
  }

  private targetHasAuraFromSource(aura: PlayerAura, target: UnitId, source: UnitId) {
    const auras = WoWLua.GetUnitAuras(target);
    return auras.findIndex((x) => x.name === aura && x.source === source) >= 0;
  }

  private isPositionLineOfSight(
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number
  ): boolean {
    const losFlags = bit.bor(0x10, 0x100, 0x1);
    const [hit] = TraceLine(x1, y1, z1 + 2.25, x2, y2, z2 + 2.25, losFlags);
    return hit === 0;
  }

  private distanceFromUnit(unita: string, unitb: string): number {
    const [ax, ay, az] = GetUnitPosition(unita);
    const [bx, by, bz] = GetUnitPosition(unitb);

    if (!ax || !ay || !az || !bx || !by || !bz) {
      return 0;
    }

    return DistanceFromPoints(ax, ay, az, bx, by, bz);
  }
}

export const WoWLua = new MemoizedLua();

export function GetPlayerAuras(): Aura[] {
  return WoWLua.GetUnitAuras("player");
}

export function StopCast() {
  SpellStopCasting();
}

export function ClickAtTarget() {
  const [targetX, targetY, targetZ] = GetUnitPosition("target");
  if (targetX && targetY && targetZ) {
    ClickPosition(targetX, targetY, targetZ);
  }
}

export interface SpellCastable {
  usable: boolean;
  nomana: boolean | null;
  duration: number;
  enabled: WoWAPI.Flag;
  start: number;
  usableIn: number;
}

export interface PlayerCast {
  spell: PlayerSpell;
  text: string;
  texture: string;
  startTimeMS: number;
  endTimeMS: number;
  isTradeSkill: number;
  castID: boolean;
  interruptable: number;
  spellId: boolean;
  castTimeRemaining: number;
  timeSpentCasting: number;
  castType: string;
}

export interface PlayerChannel {
  spell: PlayerSpell;
  text: string;
  texture: string;
  startTimeMS: number;
  endTimeMS: number;
  isTradeSkill: boolean;
  interruptable: boolean;
  spellId: number;
  castType: string;
}

export function UnitCastOrChannel(unit: string): PlayerCast | PlayerChannel | null {
  const cast = WoWLua.UnitCastingInfoTyped(unit);
  if (cast) {
    return cast;
  }

  return WoWLua.UnitChannelInfoTyped(unit);
}

export function ShouldCastSpell(spell: string | number) {
  const currentCast = WoWLua.UnitCastingInfoTyped("player");
  if (currentCast !== null && currentCast.spell !== null) {
    return false;
  }
  return WoWLua.IsSpellUsable(spell);
}

export function AreWeOffGCD() {
  return WoWLua.IsSpellUsable(61304);
}

export function GCDRemaining() {
  const castable = WoWLua.IsSpellCastable(61304);
  return castable.usableIn;
}

export enum CombatEvent {
  SpellCastStart = "SPELL_CAST_START",
  SpellCastSuccess = "SPELL_CAST_SUCCESS",
  SpellCastFailed = "SPELL_CAST_FAILED",
  SpellAuraApplied = "SPELL_AURA_APPLIED",
  SpellAuraRefreshed = "SPELL_AURA_REFRESH",
}

// export function GetMissleList() {
//     const missleCount = GetMissileCount();
//     const missleList: MissleInFlight[] = [];
//     for (let i = 1; i <= missleCount; i++) {
//         missleList.push(GetMissleById(i));
//     }

//     return missleList;
// }

export interface MissleInFlight {
  spellId: number;
  visualId: number;
  x: number;
  y: number;
  z: number;
  caster: any;
  sx: number;
  sy: number;
  sz: number;
  target: object;
  tx: number;
  ty: number;
  tz: number;
}

// export function GetMissleById(id: number): MissleInFlight {
//     const [
//         spellId,
//         visualId,
//         x,
//         y,
//         z,
//         caster,
//         sx,
//         sy,
//         sz,
//         target,
//         tx,
//         ty,
//         tz,
//     ] = GetMissileWithIndex(id);
//     const missleObject = {
//         spellId,
//         visualId,
//         x,
//         y,
//         z,
//         caster,
//         sx,
//         sy,
//         sz,
//         target,
//         tx,
//         ty,
//         tz,
//     };
//     return missleObject;
// }

export function SpellCooldownRemainingSeconds(spellCastable: SpellCastable) {
  return spellCastable.start + spellCastable.duration - GetTime();
}

// export function CreateCountdownInSeconds(seconds: number) {
//     for(let i = 1; i < seconds; i++) {
//         C_Timer.After(i, )
//     }
// }

export function GetSpecializationInfoByIDObject(classId: number, specNumber?: number) {
  const [
    specID,
    name,
    description,
    iconID,
    role,
    isRecommended,
    isAllowed,
  ] = GetSpecializationInfoByID(classId, specNumber);

  return {
    specID,
    name,
    description,
    iconID,
    role,
    isRecommended,
    isAllowed,
  };
}

export function DistanceFromPoints(
  x1: number,
  y1: number,
  z1: number,
  x2: number,
  y2: number,
  z2: number
) {
  return math.sqrt(math.pow(x2 - x1, 2) + math.pow(y2 - y1, 2) + math.pow(z2 - z1, 2));
}

export function IsUnitDead(unit: UnitId): boolean {
  return UnitIsDead(unit) === 1;
}

export function GetPlayerAura(aura: PlayerAura): Aura | null {
  return GetUnitAura(aura, "player");
}

export function GetUnitAura(aura: PlayerAura, unit: UnitId): Aura | null {
  const playerAuras = WoWLua.GetUnitAuras(unit);
  const playerAura = playerAuras.find((x) => x.name === aura);

  if (playerAura) {
    return playerAura;
  }

  return null;
}

export function PlayerHasAura(aura: PlayerAura): boolean {
  const playerAuras = GetPlayerAuras();
  return playerAuras.findIndex((x) => x.name === aura) >= 0;
}

export function UnitHasAura(aura: PlayerAura, unit: UnitId): boolean {
  const unitAuras = WoWLua.GetUnitAuras(unit);
  return unitAuras.findIndex((x) => x.name === aura) >= 0;
}

export function GetObjectType(unit: string) {
  return ObjectType(unit) as UnitType;
}

// export function FindObjectGuidsByType(unitType: UnitType) {
//   const guids: string[] = [];
//   const objectCount = GetObjectCount();
//   for (let i = 1; i <= objectCount; i++) {
//     const guid = GetObjectWithIndex(i);
//     if (GetObjectType(guid) === unitType) {
//       guids.push(guid);
//     }
//   }

//   return guids;
// }

export function FaceUnit(unit: string) {
  const [ax, ay] = GetUnitPosition("player");
  const [bx, by] = GetUnitPosition(unit);
  if (!ax || !ay || !bx || !bx || !by) {
    return;
  }
  const dx = ax - bx;
  const dy = ay - by;
  let radians = math.atan2(-dy, -dx);
  if (radians < 0) radians = radians + math.pi * 2;
  if (radians < 0) return;
  FaceDirection(radians);
  UpdateMovement();
  FaceDirection(radians);
}

export function UnitHealthPercentage(unit: UnitId) {
  return (UnitHealth(unit) / UnitHealthMax(unit)) * 100;
}

export function GetSpellInfoTyped(spell: string | number) {
  const [name, rank, icon, castTime, minRange, maxRange, spellId] = GetSpellInfo(spell);
  return { name, icon, castTime, minRange, maxRange, spellId };
}

export function GetGroundZCoord(x: number, y: number) {
  const [hit, gx, gy, gz] = TraceLine(x, y, 10000, x, y, -10000, 0x111);
  if (hit === 1) {
    return gz;
  }

  return 0;
}

export function GetInstanceInfoTyped() {
  const [
    name,
    instanceType,
    difficultyID,
    difficultyName,
    maxPlayers,
    dynamicDifficulty,
    isDynamic,
    instanceID,
    instanceGroupSize,
    LfgDungeonID,
  ] = GetInstanceInfo();
  return {
    name,
    instanceType,
    difficultyID,
    difficultyName,
    maxPlayers,
    dynamicDifficulty,
    isDynamic,
    instanceID,
    instanceGroupSize,
    LfgDungeonID,
  };
}
