/**
 *
 */
import { PlayerState } from "../../state/players/player_state";
import { PriorityAction } from "../../state/players/SpellstealPriority";
import { MageSpell } from "../../state/utils/mage_utils";
import { PlayerSpell, WoWLua } from "../../wowutils/wow_utils";
import { Counterspell } from "../spells/counterspell";
import { Car } from "./car";

export class Interrupt implements Car {
  private getEnemies: () => PlayerState[];

  constructor(getEnemies: () => PlayerState[]) {
    this.getEnemies = () => getEnemies();
  }

  getNextSpell() {
    if (!WoWLua.IsSpellUsable(MageSpell.Counterspell)) {
      return null;
    }

    const listOfRequiredInterrupt = [];
    for (const enemy of this.getEnemies()) {
      const requiredInterrupts = enemy.spellToInterrupt.filter(
        (x) => x.priority === PriorityAction.Required
      );
      for (const requiredInterrupt of requiredInterrupts) {
        if (enemy.canCastSpell(requiredInterrupt.name, requiredInterrupt.cooldown)) {
          listOfRequiredInterrupt.push(requiredInterrupt.name);
        }
      }
    }

    // pretty dumb interrupts for now, we should save for certain abilities / when we're pumping...?
    for (const enemy of this.getEnemies()) {
      const casting = enemy.currentCastOrChannel();
      if (casting) {
        const canInterrupt =
          (listOfRequiredInterrupt.length > 0 &&
            listOfRequiredInterrupt.includes(casting.spell as PlayerSpell)) ||
          listOfRequiredInterrupt.length === 0;
        if (canInterrupt) {
          const percentRemaining =
            ((GetTime() * 1000 - casting.startTimeMS) / (casting.endTimeMS - casting.startTimeMS)) *
            100;
          if (casting.castType === "cast") {
            if (enemy.shouldInterrupt(casting) && percentRemaining >= 90) {
              return new Counterspell({
                unitTarget: enemy.unitId,
                messageOnCast:
                  "Interrupted " + casting.spell + " from " + enemy.getSpecInfoEnglish(),
              });
            }
          } else {
            if (enemy.shouldInterrupt(casting) && percentRemaining >= 5) {
              return new Counterspell({
                unitTarget: enemy.unitId,
                messageOnCast:
                  "Stopped channel " + casting.spell + " from " + enemy.getSpecInfoEnglish(),
              });
            }
          }
        }
      }
    }

    return null;
  }
}

/**
 *
 * Let's play a game. How dumb am I?
 *
 * Spell cast = 2 seconds
 *
 * Start = 100,000
 * End = 102,000
 *
 * GetTime = 101,000
 *
 * 102,000 - 100,000 = 2,000 -> 2 second cast
 *
 *
 * 102 - 100 = 2
 * 101 - 100 = 1
 *
 * 1/2 -> 50%
 */
