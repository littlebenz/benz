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

import { UnitId } from "@wartoshika/wow-declarations";
import { DRType } from "../../state/dr_tracker";
import { PlayerState } from "../../state/players/player_state";
import { MageAura } from "../../state/utils/mage_utils";
import { UIStatusFrame } from "../../ui/status_frame";
import { CancelUnitBuffUnlocked } from "../../wowutils/unlocked_functions";
import {
  GetPlayerAura,
  PlayerHasAura,
  UnitHasAura,
  UnitHealthPercentage,
  WoWLua,
} from "../../wowutils/wow_utils";
import { AlterTime } from "../spells/alter_time";
import { Car } from "./car";

let alterTimePercentage = 0;
export class AutoAlterTime implements Car {
  private getEnemies: () => PlayerState[];
  private getAllies: () => PlayerState[];

  constructor(getEnemies: () => PlayerState[], getAllies: () => PlayerState[]) {
    this.getEnemies = () => getEnemies();
    this.getAllies = () => getAllies();
  }

  getNextSpell() {
    // todo :: create reactive car that handles things like being purged or stormbolt in air and immediately cancel and alter.

    if (PlayerHasAura(MageAura.AlterTime)) {
      if (alterTimePercentage - UnitHealthPercentage("player") >= 50) {
        return new AlterTime({
          messageOnCast: "Altering back. We lost a lot of health. Let's do it again",
        });
      }

      const alterAura = GetPlayerAura(MageAura.AlterTime);
      if (
        alterAura &&
        WoWLua.GetAuraRemainingTime(alterAura) < 2 &&
        alterTimePercentage >= UnitHealthPercentage("player")
      ) {
        UIStatusFrame.addMessage("Canceling Alter Time");
        CancelUnitBuffUnlocked("player", alterAura.index);
      }

      return null;
    }

    const healer = this.getAllies().find((x) => x.isHealer());
    let healerCCOrMIA = true;
    if (healer) {
      const remainingCC = healer.remainingCC();
      healerCCOrMIA =
        remainingCC.findIndex((x) => x.remaining > 4 && x.type !== DRType.Root) !== -1;
    }

    if (healerCCOrMIA) {
      for (const enemy of this.getEnemies()) {
        if (
          enemy.isPumping() &&
          UnitGUID("player") === UnitGUID((enemy.unitId + "target") as UnitId) &&
          UnitHealthPercentage("player") >= 75 &&
          !PlayerHasAura(MageAura.BlazingBarrier)
        ) {
          return new AlterTime({
            messageOnCast:
              "Altering time. Healer CC and " + enemy.getSpecInfoEnglish() + " is pumping on me",
            afterCast: () => (alterTimePercentage = UnitHealthPercentage("player")),
          });
        }
      }
    }
    return null;
  }
}
