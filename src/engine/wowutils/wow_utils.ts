import { UnitId } from "@wartoshika/wow-declarations";
import { Aura, UnitType } from "./wow_helpers";
import { SpellStopCasting } from "./unlocked_functions";
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
import { NightFaeAura } from "../state/utils/night_fae_utils";
import { NecrolordAura } from "../state/utils/necrolord_utils";
import { memoizeOne } from "../../utils/memoize";

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
  | NecrolordAura;

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
  | WarriorSpell;

export class MemoizedLua {
  GetUnitAuras = memoizeOne(this.getUnitAuras);
  GetObjects = memoizeOne(this.getObjects, 30);
  GetObjectByName = memoizeOne(this.getObjectByName);
  UnitMovingDirection = memoizeOne(this.unitMovingDirection);
  GetAuraRemainingTime = memoizeOne(this.getAuraRemainingTime);
  IsSpellCastable = memoizeOne(this.isSpellCastable);
  UnitChannelInfoTyped = memoizeOne(this.unitChannelInfoTyped);
  IsSpellUsable = memoizeOne(this.isSpellUsable);
  GetCurrentEventLogInfo = memoizeOne(this.getCurrentEventLogInfo);
  GetBags = memoizeOne(this.getBags);
  GetContainerItemInfoTyped = memoizeOne(this.getContainerItemInfoTyped);
  UnitIsMoving = memoizeOne(this.unitIsMoving);
  GetCurrentSpellEventLogInfo = memoizeOne(this.getCurrentSpellEventLogInfo);
  UnitCastingInfoTyped = memoizeOne(this.unitCastingInfoTyped);
  IsPlayerMoving = memoizeOne(this.isPlayerMoving);
  IsUnitInOfLineOfSight = memoizeOne(this.isUnitInOfLineOfSight);
  TargetHasAuraFromSource = memoizeOne(this.targetHasAuraFromSource);
  IsPositionLineOfSight = memoizeOne(this.isPositionLineOfSight);
  CanPlayerBlinkToXYZ = memoizeOne(this.canPlayerBlinkToXYZ);
  DistanceFromUnit = memoizeOne(this.distanceFromUnit);
  IsUnitInOfLineOfSightNoMemoize = memoizeOne(this.isUnitInOfLineOfSight, 0);

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
      spell,
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

    return castable.usable && (castable.duration === null || castable.duration === 0);
  }

  private getCurrentEventLogInfo() {
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

  private getCurrentSpellEventLogInfo() {
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
      spellName: spellName as string,
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
      spell,
      text,
      texture,
      startTimeMS,
      endTimeMS,
      isTradeSkill,
      castID,
      interruptable,
      spellId,
      castTimeRemaining: endTimeMS / 1000 - GetTime(),
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

    const losFlags = bit.bor(0x10, 0x100, 0x1);
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

  private canPlayerBlinkToXYZ(x: number, y: number, z: number): boolean {
    const [playerX, playerY, playerZ] = GetUnitPosition("player");

    if (!playerX || !playerY || !playerZ) {
      return false;
    }

    const losFlags = bit.bor(0x10, 0x100, 0x1);
    const [hit] = TraceLine(playerX, playerY, playerZ + 2.25, x, y, z + 2.25, losFlags);
    return hit === 0;
  }

  private distanceFromUnit(unita: string, unitb: string): number {
    const [ax, ay, az] = GetUnitPosition(unita);
    const [bx, by, bz] = GetUnitPosition(unitb);

    if (!ax || !ay || !az || !bx || !by || !bz) {
      return 9999999;
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
  } else {
    console.log("failed to click");
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

export function UnitCastOrChannel(unit: string) {
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
  return math.sqrt(math.pow(x1 - x2, 2) + math.pow(y1 - y2, 2));
}

export function GetSpellChargesTyped(spell: string | number) {
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
