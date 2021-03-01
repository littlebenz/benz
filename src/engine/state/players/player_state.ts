import { UnitReaction } from "../../wowutils/unlocked_functions";
import {
  GetSpecializationInfoByIDObject,
  UnitCastOrChannel,
  UnitHasAura,
  GetUnitAura,
  PlayerAura,
  WoWLua,
  PlayerSpell,
  PlayerCast,
  PlayerChannel,
  DistanceFromPoints,
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
import { PriorityAction } from "./SpellstealPriority";
import { SpellstealPriorityMap } from "../utils/spellsteal_utils";
import { NecrolordAura } from "../utils/necrolord_utils";
import { DemonHunterAura } from "../utils/demon_hunter_utils";
import { DeathKnightAura } from "../utils/death_knight_utils";
import { InterruptableSpell, InterruptSpell, PumpSpell } from "../utils/interrupt_spell";
import { UnitId } from "@wartoshika/wow-declarations";

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

  isKillTarget() {
    return UnitGUID(Benz_KillTarget as UnitId) === this.guid();
  }

  statusToString() {
    if (this.isKillTarget()) {
      return "Kill Target";
    }

    const remainingCC = this.remainingCC();

    let result = "";

    if (this.isPumping()) {
      result += "PUMPING! ";
    }

    if (this.isDefensive()) {
      result += "Defensive. ";
    }

    if (remainingCC.length > 0) {
      const longestCC = remainingCC.sort((a, b) => b.remaining - a.remaining)[0];
      result += longestCC.type + ": " + longestCC.remaining + ". ";
    }

    if (result === "") {
      if (this.isHealer()) {
        result += "Healer";
      } else {
        result += "Damage";
      }
    }

    return result;
  }

  abstract pumpSpells: PumpSpell[];
  abstract spellToInterrupt: InterruptableSpell[];

  shouldInterrupt(cast: PlayerCast | PlayerChannel): boolean {
    // const spec = this.getSpecInfo();
    // if (cast && spec) {
    //   const interrupt = this.spellToInterrupt
    //     .filter((x) => x.specs.includes(spec))
    //     .find((x) => x.name === (cast.spell as PlayerSpell));
    //   if (interrupt) {
    //     if (this.isPumping()) {
    //       return interrupt.priority >= PriorityAction.Medium;
    //     } else {
    //       return interrupt.priority >= PriorityAction.High;
    //     }
    //   }
    // }

    if (cast) {
      return this.spellToInterrupt.map((x) => x.name).includes(cast.spell);
    }

    return false;
  }

  canPump(big = false): boolean {
    const spec = this.getSpecInfo();
    if (!spec) {
      return false;
    }

    let pumpSpellsForSpec = this.pumpSpells.filter((x) => x.specs.includes(spec));
    if (big) {
      pumpSpellsForSpec = pumpSpellsForSpec.filter((x) => x.cooldown >= 100);
    }

    for (const pumpSpell of pumpSpellsForSpec) {
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
      if (this.canCastSpell(interrupt.name, interrupt.cooldown)) {
        interrupts.push(interrupt);
      }
    }

    return interrupts.length > 0 ? interrupts : null;
  }

  canCastSpell(spell: PlayerSpell, cooldown: number): boolean {
    if (this.spellUsedAtMap().has(spell)) {
      const lastCastedAt = this.spellUsedAtMap().get(spell)!;
      if (GetTime() - lastCastedAt + cooldown >= 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
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

  abstract shouldStomp(): boolean;
  abstract class: WoWClass;

  shouldSpellsteal(): PriorityAction {
    const auras = WoWLua.GetUnitAuras(this.unitId).filter((x) =>
      x.name === MageAura.Combustion ? WoWLua.GetAuraRemainingTime(x) >= 8 : true
    );
    const highestPriority = auras
      .filter((x) => SpellstealPriorityMap.has(x.name as PlayerAura))
      .map((x) => SpellstealPriorityMap.get(x.name as PlayerAura)!)
      .sort((a, b) => b - a);

    if (highestPriority.length > 0) {
      return highestPriority[0];
    }

    return PriorityAction.None;
  }

  spellStealAuras(minPriority: PriorityAction) {
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
    return UnitCastOrChannel(this.unitId);
  }

  distanceFromPlayer() {
    return WoWLua.DistanceFromUnit("player", this.unitId);
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
      return TalentSpecToString.get(spec)!;
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
