/**
 * Combust
 * BOP
 * Freedom
 *
 */
import { PlayerState } from "../../state/players/player_state";
import { TalentSpec } from "../../state/players/TalentSpec";
import { Car } from "./car";
import { Spellsteal } from "../spells/spellsteal";
import { CancelUnitBuffUnlocked } from "../../wowutils/unlocked_functions";
import { GetPlayerAura, PlayerAura, WoWLua } from "../../wowutils/wow_utils";
import { MageAura } from "../../state/utils/mage_utils";
import { PaladinAura } from "../../state/utils/paladin_utils";
import { HunterAura } from "../../state/utils/hunter_utils";
import { PriestAura } from "../../state/utils/priest_utils";
import { DruidAura } from "../../state/utils/druid_utils";
import { WarlockAura } from "../../state/utils/warlock_utils";
import { PriorityAction } from "../../state/players/SpellstealPriority";

export class Spellstealer implements Car {
  private getEnemies: () => PlayerState[];
  private hasKlepto;
  private lastKleptoCombust: number = 0;

  constructor(getEnemies: () => PlayerState[]) {
    this.getEnemies = () => getEnemies();

    const pvpTalents = C_SpecializationInfo.GetAllSelectedPvpTalentIDs();

    // todo:: map spell enums to spell id, here is klepto of 3530
    this.hasKlepto = pvpTalents.includes(3530);
  }

  getNextSpell() {
    if (this.hasKlepto) {
      const maybeKlepto = this.klepto();
      if (maybeKlepto) {
        return maybeKlepto;
      }
    } else {
      const maybeSpellsteal = this.spellsteal();
      if (maybeSpellsteal) {
        return maybeSpellsteal;
      }
    }

    return null;
  }

  private klepto() {
    // most important thing is to klepto combustion, for now we can do some ghetto checks

    const maybeMage = this.getEnemies().find((x) => x.getSpecInfo() === TalentSpec.Mage_Fire);
    if (maybeMage) {
      if (maybeMage.shouldSpellsteal() === PriorityAction.Required) {
        this.lastKleptoCombust = GetTime();
        return new Spellsteal({ unitTarget: maybeMage.unitId, messageOnCast: "Klepto combust" });
      }
    }

    if (GetTime() - this.lastKleptoCombust <= 100) {
      for (const enemy of this.getEnemies()) {
        const spellstealPriority = enemy.shouldSpellsteal();
        if (
          spellstealPriority === PriorityAction.Required ||
          spellstealPriority === PriorityAction.High
        ) {
          const spells = enemy
            .spellStealAuras(PriorityAction.High)
            .map((x) => x.name)
            .join(", ");

          return new Spellsteal({
            unitTarget: enemy.unitId,
            messageOnCast: "Klepto " + spells + " from" + enemy.getSpecInfoEnglish(),
          });
        }
      }
    }
  }

  private spellsteal() {
    const mana = UnitPower("player");

    // check to see if we have enough mana + some buffer
    if (mana <= 16000) {
      return null;
    }

    for (const enemy of this.getEnemies()) {
      const spellstealPriority = enemy.shouldSpellsteal();
      if (
        spellstealPriority === PriorityAction.Required ||
        spellstealPriority === PriorityAction.High ||
        spellstealPriority === PriorityAction.Medium
      ) {
        const spells = enemy
          .spellStealAuras(PriorityAction.Medium)
          .map((x) => x.name)
          .join(", ");

        return new Spellsteal({
          unitTarget: enemy.unitId,
          messageOnCast: "Spellstealing [" + spells + "] from" + enemy.getSpecInfoEnglish(),
        });
      }
    }

    return null;
  }
}
