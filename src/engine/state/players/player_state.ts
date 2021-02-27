import { UnitReaction } from "../../wowutils/unlocked_functions";
import {
  GetSpecializationInfoByIDObject,
  UnitCastOrChannel,
  UnitHasAura,
  GetUnitAura,
  PlayerAura,
  WoWLua,
  PlayerSpell,
} from "../../wowutils/wow_utils";
import { WowEventListener } from "../../wow_event_listener";
import { DRTracker, DRType, SpellNameToDiminishingReturnSchool } from "../dr_tracker";
import { DruidAura } from "../utils/druid_utils";
import { MageAura } from "../utils/mage_utils";
import { PaladinAura } from "../utils/paladin_utils";
import { WarriorAura } from "../utils/warrior_utils";
import { Defensive } from "./Defensive";
import { WoWClass } from "./WoWClass";
import { TalentSpec, TalentSpecToString } from "./TalentSpec";
import { SpellstealPriority } from "./SpellstealPriority";
import { SpellstealPriorityMap } from "../utils/spellsteal_utils";
import { NecrolordAura } from "../utils/necrolord_utils";
import { DemonHunterAura } from "../utils/demon_hunter_utils";
import { DeathKnightAura } from "../utils/death_knight_utils";
import { InterruptSpell, PumpSpell } from "../utils/interrupt_spell";

export abstract class PlayerState {
  abstract interruptSpells: InterruptSpell[];
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

  spellUsedAtMap(): Map<PlayerSpell, number> {
    if (this.wowEventListener.enemiesSpellTracker.has(this.guid())) {
      return this.wowEventListener.enemiesSpellTracker.get(this.guid());
    }

    return new Map<PlayerSpell, number>();
  }

  abstract pumpSpells: PumpSpell[];

  canPump(): boolean {
    const spec = this.getSpecInfo();
    if (!spec) {
      return false;
    }

    for (const pumpSpell of this.pumpSpells.filter((x) => x.specs.includes(spec))) {
      if (this.spellUsedAtMap().has(pumpSpell.name)) {
        const lastCastedAt = this.spellUsedAtMap().get(pumpSpell.name)!;
        if (GetTime() - lastCastedAt + pumpSpell.cooldown >= 0) {
          return true;
        }
      } else {
        return true;
      }
    }

    return false;
  }

  interruptsAvailable(): InterruptSpell[] | null {
    const spec = this.getSpecInfo();
    if (!spec) {
      return null;
    }

    const interrupts: InterruptSpell[] = [];
    for (const interrupt of this.interruptSpells.filter((x) => x.specs.includes(spec))) {
      if (this.spellUsedAtMap().has(interrupt.name)) {
        const lastCastedAt = this.spellUsedAtMap().get(interrupt.name)!;
        if (GetTime() - lastCastedAt + interrupt.cooldown >= 0) {
          interrupts.push(interrupt);
        }
      } else {
        interrupts.push(interrupt);
      }
    }

    return interrupts.length > 0 ? interrupts : null;
  }

  abstract isPumping(): boolean;

  canBeIncapacitated(): boolean {
    if (!UnitIsVisible(this.unitId)) {
      return false;
    }

    if (WoWLua.GetAuraRemainingTime(GetUnitAura(MageAura.MeteorBurn, this.unitId)) >= 1.5) {
      return false;
    }

    if (WoWLua.GetAuraRemainingTime(GetUnitAura(WarriorAura.WarBanner, this.unitId)) >= 1.5) {
      return false;
    }

    if (WoWLua.GetAuraRemainingTime(GetUnitAura(NecrolordAura.UltimateForm, this.unitId)) >= 1.5) {
      return false;
    }

    // todo -- don't sheep if they're kicked
    const remainingCCList = this.remainingCC().sort((a, b) => a.remaining - b.remaining);
    const remainingCC = remainingCCList[remainingCCList.length - 1];
    if (remainingCC && remainingCC.remaining >= 1.9) {
      return false;
    }

    return this.incapacitateDr().drCount < 3;
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
    const auras = WoWLua.GetUnitAuras(this.unitId).filter((x) =>
      x.name === MageAura.Combustion ? WoWLua.GetAuraRemainingTime(x) >= 6 : true
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

  spellStealAuras(minPriority: SpellstealPriority) {
    return WoWLua.GetUnitAuras(this.unitId)
      .filter((x) => (x.name === MageAura.Combustion ? WoWLua.GetAuraRemainingTime(x) >= 6 : true))
      .filter((x) => SpellstealPriorityMap.has(x.name as PlayerAura))
      .filter((x) => SpellstealPriorityMap.get(x.name as PlayerAura)! >= minPriority);
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
    const playerAuras = WoWLua.GetUnitAuras(this.unitId);

    // this doesn't work exactly, but it's probably good enough?
    const ccList = new Set(SpellNameToDiminishingReturnSchool.keys());

    const existingCC = [];
    for (const aura of playerAuras) {
      if (ccList.has(aura.name)) {
        const remainingTime = WoWLua.GetAuraRemainingTime(aura);
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
    const [specId] = GetArenaOpponentSpec(this.unitId[this.unitId.length - 1]);
    if (specId && specId > 0) {
      return specId as TalentSpec;
    }

    return null;
  }

  getSpecInfoEnglish() {
    const spec = this.getSpecInfo();
    if (spec) {
      TalentSpecToString.get(spec)!;
    }

    return this.name;
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
