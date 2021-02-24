import { DRTracker, SpellNameToDiminishingReturnSchool } from "./state/dr_tracker";
import { CombatEvent, WoWLua } from "./wowutils/wow_utils";

export class WowEventListener {
  private playerName: string;

  arenaNameMap = new Map<string, DRTracker>();

  constructor() {
    this.playerName = GetUnitName("player", false);
  }

  parse(combatEvent: BaseWowCombatEvent) {
    if (combatEvent.eventName === CombatEvent.SpellCastStart) {
      this.parseSpellCastStart();
    } else if (combatEvent.eventName === CombatEvent.SpellAuraApplied) {
      this.parseSpellAuraApplied();
    } else if (combatEvent.eventName === CombatEvent.SpellCastFailed) {
      this.parseSpellCastFailed();
    }
  }

  private parseSpellCastStart() {
    // const event = WoWLua.GetCurrentSpellEventLogInfo();
  }

  private parseSpellAuraApplied() {
    const event = WoWLua.GetCurrentSpellEventLogInfo();
    if (SpellNameToDiminishingReturnSchool.has(event.spellName)) {
      const drTracker = this.addOrGetDrTracker(event.destGUID);
      if (event.destName && IsGuid(event.destGUID)) {
        const targetAuras = WoWLua.GetUnitAuras(SetMouseOver(event.destGUID) as any);
        const maybeAura = targetAuras.find(
          (x) => x.spellId === event.spellId
          // && UnitGUID(x.source) === event.sourceGUID
        );

        const drTime = WoWLua.GetAuraRemainingTime(maybeAura);

        console.log(
          `spell success of: ${event.spellName} from ${event.sourceName} to ${event.destName} for duration: ${drTime}`
        );
        drTracker.addDiminishingReturn(
          SpellNameToDiminishingReturnSchool.get(event.spellName)!,
          drTime
        );
      }
    }
  }

  private parseSpellCastFailed() {
    // const event = GetCurrentSpellEventLogInfo();
  }

  addOrGetDrTracker(unitGuid: string) {
    if (!unitGuid) {
      return new DRTracker();
    }

    const possibleDr = this.arenaNameMap.get(unitGuid);
    if (possibleDr) {
      return possibleDr;
    }
    const newDr = new DRTracker();
    this.arenaNameMap.set(unitGuid, newDr);
    return newDr;
  }
}

export interface BaseWowCombatEvent {
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
}

export interface SpellWowCombatEvent extends BaseWowCombatEvent {
  spellId: number;
  spellName: string;
  spellSchool: string;
}
