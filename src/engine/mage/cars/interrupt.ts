/**
 *
 */
import { PlayerState } from "../../state/players/player_state";
import { MageSpell } from "../../state/utils/mage_utils";
import { IsSpellUsable } from "../../wowutils/wow_utils";
import { Counterspell } from "../spells/counterspell";
import { Car } from "./car";

export class Interrupt implements Car {
  private getEnemies: () => PlayerState[];

  constructor(getEnemies: () => PlayerState[]) {
    this.getEnemies = () => getEnemies();
  }

  getNextSpell() {
    if (!IsSpellUsable(MageSpell.Counterspell)) {
      return null;
    }

    // pretty dumb interrupts for now, we should save for certain abilities / when we're pumping...?
    for (const enemy of this.getEnemies()) {
      const casting = enemy.currentCastOrChannel();
      if (casting) {
        const percentRemaining =
          ((GetTime() * 1000 - casting.startTimeMS) / (casting.endTimeMS - casting.startTimeMS)) *
          100;

        if (casting.castType === "cast") {
          if (enemy.shouldInterrupt() && percentRemaining >= 90) {
            return new Counterspell(enemy.unitId);
          }
        } else {
          if (enemy.shouldInterrupt() && percentRemaining >= 5) {
            return new Counterspell(enemy.unitId);
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
