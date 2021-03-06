import { DRTracker, SpellNameToDiminishingReturnSchool } from "./state/dr_tracker";
import { PlayerState } from "./state/players/player_state";
import { PlayerStateFactory } from "./state/players/player_state_factory";
import { UnitReaction } from "./wowutils/unlocked_functions";
import { InterruptSpells } from "./wowutils/wow_helpers";
import { CombatEvent, PlayerSpell, UnitCastOrChannel, WoWLua } from "./wowutils/wow_utils";

export class WowEventListener {
  enemiesDrTracker = new Map<string, DRTracker>();
  enemiesSpellTracker = new Map<string, Map<PlayerSpell, number>>();

  parse(combatEvent: BaseWowCombatEvent) {
    if (combatEvent.eventName === CombatEvent.SpellCastStart) {
      this.parseSpellCastStart();
    } else if (
      combatEvent.eventName === CombatEvent.SpellAuraApplied ||
      combatEvent.eventName === CombatEvent.SpellAuraRefreshed
    ) {
      this.parseSpellAuraApplied();
    } else if (combatEvent.eventName === CombatEvent.SpellCastFailed) {
      this.parseSpellCastFailed();
    } else if (combatEvent.eventName === CombatEvent.SpellCastSuccess) {
      this.parseSpellSuccess();
    }
  }

  private parseSpellSuccess() {
    const event = WoWLua.GetCurrentSpellEventLogInfo();
    if (event.destGUID && event.sourceGUID) {
      const reaction = UnitReaction("player", SetMouseOver(event.sourceGUID));
      if (
        reaction &&
        reaction < 5 &&
        InterruptSpells.map((x) => x as string).includes(event.spellName)
      ) {
        const spellCasting = UnitCastOrChannel(SetMouseOver(event.destGUID));
        if (spellCasting) {
          const interrupted = "" + (GetTime() * 1000 - spellCasting.startTimeMS) / 1000 + "\n";
          WriteFile(GetExeDirectory() + "interrupt.txt", interrupted, true);
        }
      }
    }

    if (event.sourceGUID) {
      if (!this.enemiesSpellTracker.has(event.sourceGUID)) {
        this.enemiesSpellTracker.set(event.sourceGUID, new Map());
      }

      const spelltracker = this.enemiesSpellTracker.get(event.sourceGUID)!;
      spelltracker.set(event.spellName, GetTime());
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
        const targetAuras = WoWLua.GetUnitAurasCacheBusted(SetMouseOver(event.destGUID) as any);
        const maybeAura = targetAuras.find((x) => x.spellId === event.spellId);

        const drTime = WoWLua.GetAuraRemainingTimeCacheBusted(maybeAura);
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
    if (unitGuid) {
      const possibleDr = this.enemiesDrTracker.get(unitGuid);
      if (possibleDr) {
        return possibleDr;
      }
    }

    const newDr = new DRTracker();
    this.enemiesDrTracker.set(unitGuid, newDr);
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
