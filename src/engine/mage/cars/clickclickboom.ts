import { DRType } from "../../state/dr_tracker";
import { PlayerState } from "../../state/players/player_state";
import { WoWClass } from "../../state/players/WoWClass";
import { TalentSpec } from "../../state/players/TalentSpec";
import { MageAura, MageSpell } from "../../state/utils/mage_utils";
import { Meteor } from "../spells/meteor";
import { Car } from "./car";
import { WoWLua } from "../../wowutils/wow_utils";
import { WarlockAura } from "../../state/utils/warlock_utils";
import { PriestAura } from "../../state/utils/priest_utils";

export class ClickClickBoom implements Car {
  private getEnemies: () => PlayerState[];

  constructor(getEnemies: () => PlayerState[]) {
    this.getEnemies = () => getEnemies();
  }

  getNextSpell() {
    const combustCD = WoWLua.IsSpellCastable(MageSpell.Combustion);
    if (combustCD.usableIn <= 45 && combustCD.usableIn !== 0) {
      return null;
    }
    const target = this.getEnemies().find((player) => UnitGUID("target") === player.guid());
    if (target) {
      for (const cc of target.remainingCC()) {
        if (cc.aura.name !== WarlockAura.Fear && cc.aura.name !== PriestAura.PsychicScream) {
          if (cc.type === DRType.Disorient || cc.type === DRType.Incapacitate) {
            if (cc.remaining >= 2.7 && cc.remaining <= 4) {
              return new Meteor({
                messageOnCast:
                  "Meteor on " + target.getSpecInfoEnglish() + " coming out of CC " + cc.aura.name,
              });
            }
          }
          if (
            cc.type === DRType.Stun ||
            (cc.type === DRType.Root && target.class !== WoWClass.Druid)
          ) {
            if (cc.remaining >= 2.7) {
              return new Meteor({
                messageOnCast:
                  "Meteor on " + target.getSpecInfoEnglish() + " in CC " + cc.aura.name,
              });
            }
          }
        }
      }
    }

    return null;
  }
}
