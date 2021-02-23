import { UnitReaction } from "../../wowutils/unlocked_functions";
import {
  GetUnitAuras,
  GetSpecializationInfoByIDObject,
  UnitCastOrChannel,
  UnitHasAura,
  GetAuraRemainingTime,
  GetUnitAura,
  PlayerAura,
} from "../../wowutils/wow_utils";
import { WowEventListener } from "../../wow_event_listener";
import { DRTracker, DRType, SpellNameToDiminishingReturnSchool } from "../dr_tracker";
import { DruidAura } from "../utils/druid_utils";
import { MageAura } from "../utils/mage_utils";
import { PaladinAura } from "../utils/paladin_utils";
import { WarriorAura } from "../utils/warrior_utils";
import { Defensive } from "./Defensive";
import { WoWClass } from "./WoWClass";
import { TalentSpec } from "./TalentSpec";
import { SpellstealPriority } from "./SpellstealPriority";
import { SpellstealPriorityMap } from "../utils/spellsteal_utils";
import { NightFaeAura } from "../utils/night_fae_utils";
import { NecrolordAura } from "../utils/necrolord_utils";
import { DemonHunter } from "./demon_hunter";
import { DemonHunterAura } from "../utils/demon_hunter_utils";
import { DeathKnightAura } from "../utils/death_knight_utils";

export abstract class PlayerState {
  isHealer() {
    const specInfo = this.getSpecInfo();
    if (
      specInfo === TalentSpec.Druid_Restoration ||
      specInfo === TalentSpec.Monk_Mistweaver ||
      specInfo === TalentSpec.Paladin_Holy ||
      specInfo === TalentSpec.Priest_Discipline ||
      specInfo === TalentSpec.Priest_Holy ||
      specInfo === TalentSpec.Shaman_Restoration
    ) {
      return true;
    }

    return false;
  }

  abstract canPump(): boolean;
  abstract isPumping(): boolean;
  canBeIncapacitated(): boolean {
    if (!UnitIsVisible(this.unitId)) {
      return false;
    }

    if (GetAuraRemainingTime(GetUnitAura(MageAura.MeteorBurn, this.unitId)) >= 1.5) {
      return false;
    }

    if (GetAuraRemainingTime(GetUnitAura(WarriorAura.WarBanner, this.unitId)) >= 1.5) {
      return false;
    }

    if (GetAuraRemainingTime(GetUnitAura(NecrolordAura.UltimateForm, this.unitId)) >= 1.5) {
      return false;
    }

    // todo -- don't sheep if they're kicked
    const remainingCCList = this.remainingCC().sort((x) => x.remaining);
    const remainingCC = remainingCCList[remainingCCList.length - 1];
    if (remainingCC && remainingCC.remaining >= 1.9) {
      return false;
    }

    return true;
  }

  isDefensive(): Defensive {
    if (UnitHasAura(DruidAura.Cyclone, this.unitId)) {
      return Defensive.DoNotTouch;
    }

    if (UnitHasAura(PaladinAura.BlessingOfSacrifice, this.unitId)) {
      const spec = this.getSpecInfo();
      if (spec === TalentSpec.Paladin_Holy) {
        return Defensive.None;
      }

      return Defensive.CanStillDam;
    }

    if (UnitHasAura(DemonHunterAura.Darkness, this.unitId)) {
      return Defensive.DoNotTouch;
    }

    if (UnitHasAura(DeathKnightAura.AntiMagicZone, this.unitId)) {
      return Defensive.DoNotTouch;
    }

    return Defensive.None;
  }

  abstract shouldInterrupt(): boolean;
  abstract shouldStomp(): boolean;
  abstract class: WoWClass;

  shouldSpellsteal(): SpellstealPriority {
    const auras = GetUnitAuras(this.unitId).filter((x) =>
      x.name === MageAura.Combustion ? GetAuraRemainingTime(x) >= 6 : true
    );
    const highestPriority = auras
      .filter((x) => SpellstealPriorityMap.has(x.name as PlayerAura))
      .map((x) => SpellstealPriorityMap.get(x.name as PlayerAura)!)
      .sort((a, b) => b - a);

    if (highestPriority.length > 0) {
      return highestPriority[0];
    }

    return SpellstealPriority.None;
  }

  incapacitateDr() {
    return this.wowEventListener
      .addOrGetDrTracker(UnitGUID(this.unitId))
      .getDiminishingReturns()
      .get(DRType.Incapacitate)!;
  }

  rootDr() {
    return this.drTracker.getDiminishingReturns().get(DRType.Root)!;
  }

  disorientDr() {
    return this.drTracker.getDiminishingReturns().get(DRType.Disorient)!;
  }

  currentCastOrChannel() {
    const currentCast = UnitCastOrChannel(this.unitId);
    return currentCast;
  }

  remainingCC() {
    const playerAuras = GetUnitAuras(this.unitId);

    // this doesn't work exactly, but it's probably good enough?
    const ccList = new Set(SpellNameToDiminishingReturnSchool.keys());

    const existingCC = [];
    for (const aura of playerAuras) {
      if (ccList.has(aura.name)) {
        const remainingTime = GetAuraRemainingTime(aura);
        existingCC.push({
          type: SpellNameToDiminishingReturnSchool.get(aura.name)!,
          remaining: remainingTime,
          aura,
        });
      }
    }

    return existingCC;
  }

  protected drTracker: DRTracker;
  name: string;
  protected wowEventListener: WowEventListener;

  constructor(unitId: WoWAPI.UnitId, wowEventListener: WowEventListener) {
    this.unitId = unitId;
    this.wowEventListener = wowEventListener;
    this.drTracker = wowEventListener.addOrGetDrTracker(UnitGUID(this.unitId));
    this.name = GetUnitName(this.unitId, true);
  }

  unitId: WoWAPI.UnitId;

  guid() {
    return UnitGUID(this.unitId);
  }

  getSpecInfo() {
    const specId = GetArenaOpponentSpec(this.unitId);
    if (specId && specId > 0) {
      const spec = GetSpecializationInfoByIDObject(specId);
      return spec.specID as TalentSpec;
    }

    return null;
  }

  shouldDamage(): boolean {
    const remainingCC = this.remainingCC();
    for (const cc of remainingCC) {
      if (cc.type === DRType.Disorient || cc.type === DRType.Incapacitate) {
        if (cc.remaining >= 0.5) {
          return false;
        }
      }
    }

    if (this.isDefensive() === Defensive.DoNotTouch) {
      return false;
    }
    const reaction = UnitReaction("player", this.unitId);
    if (!reaction) {
      return false;
    }

    if (reaction >= 5) {
      return false;
    }

    return true;
  }
}
