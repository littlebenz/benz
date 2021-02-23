/**
 * Logic is as follows
 *
 * If I'm at a high HP %, say 80 or higher
 * If the enemy players are targeting me
 * If they have their goes available
 *
 * THEN EITHER
 * If my healer gets CC
 *      OR
 * The enemy players pop offensive cooldowns
 *
 * Alter time
 *
 * Reactive Alter Time if I lose ~50% of health or 25% and I'm being purged
 *
 */

import { PlayerState } from "../../state/players/player_state";
import { Car } from "./car";

let alterTimePercentage = 0;
export class AlterTime implements Car {
  private getEnemies: () => PlayerState[];

  constructor(getEnemies: () => PlayerState[]) {
    this.getEnemies = () => getEnemies();
  }

  getNextSpell() {
    return null;
  }
}
