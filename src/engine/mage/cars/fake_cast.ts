/**
 *
 * If no interrupts available, do nothing
 *
 * If no interrupt in range, do nothing
 *
 * If casting interruptable skill
 *  - Poly
 *  - Ring of Frost
 *
 * Cast 25%.
 * Cancel.
 * Only allow global to be casted.
 * Cast 50% cancel.
 * Only allow global to be casted.
 *
 * If I want to pump, we need the CC.
 * If they haven't attempted to very interrupt me yet, just hardcast.
 * Otherwise, do one more short 33% cast then just hard cast and accept the interrupt
 */
import { PlayerState } from "../../state/players/player_state";
import { MageAura, MageSpell } from "../../state/utils/mage_utils";
import { PaladinAura } from "../../state/utils/paladin_utils";
import { PlayerHasAura, StopCast, UnitCastOrChannel, WoWLua } from "../../wowutils/wow_utils";
import { Polymorph } from "../spells/polymorph";
import { Car } from "./car";

export class FakeCast implements Car {
  private getEnemies: () => PlayerState[];
  private setCastAt: (time: number) => void;
  private lastFakeCast: number = 0;

  // static for right now, but should be dynamic based off the data we collect
  private stopCastingAt = 0.75;

  constructor(setCastAt: (time: number) => void, getEnemies: () => PlayerState[]) {
    this.getEnemies = () => getEnemies();
    this.setCastAt = (time) => setCastAt(time);
  }

  getNextSpell() {
    if (PlayerHasAura(MageAura.Combustion) || GetTime() - this.lastFakeCast < 5) {
      return null;
    }

    if (PlayerHasAura(PaladinAura.AuraMastery)) {
      return null;
    }

    let canBeInterrupted = false;
    for (const enemy of this.getEnemies()) {
      const maybeInterrupts = enemy.interruptsAvailable();
      if (maybeInterrupts) {
        for (const interrupt of maybeInterrupts) {
          // if we're in line of sight
          // and we're in distance of interrupt plus small buffer
          // and interrupt is off CD
          if (
            WoWLua.IsUnitInOfLineOfSight("player", enemy.unitId) &&
            WoWLua.DistanceFromUnit("player", enemy.unitId) <= interrupt.range + 1.5
          ) {
            canBeInterrupted = true;
            break;
          }
        }
      }
    }

    if (canBeInterrupted) {
      const targets = this.getEnemies().filter((x) =>
        WoWLua.IsUnitInOfLineOfSight("player", x.unitId)
      );

      if (targets.length > 0) {
        return new Polymorph({
          unitTarget: targets[0].unitId,
          afterCast: () => {
            C_Timer.After(this.stopCastingAt, () => {
              if (this.isFakeCastingPoly()) {
                StopCast();
                this.setCastAt(GetTime() + 0.4);
              }
            });

            this.lastFakeCast = GetTime();
          },
          messageOnCast:
            "Fake casting poly. Bait interrupt from " + targets[0].getSpecInfoEnglish(),
        });
      }
    }

    return null;
  }

  private isFakeCastingPoly(): boolean {
    const currentCast = WoWLua.UnitCastingInfoTyped("player");
    if (!currentCast) {
      return false;
    }

    if (currentCast.spell !== MageSpell.Polymorph) {
      return false;
    }

    // check to see if the current cast is the fake cast we started, with some tolerance
    if (math.abs(GetTime() - (this.lastFakeCast + currentCast.timeSpentCasting)) <= 0.1) {
      return true;
    }

    return false;
  }
}
