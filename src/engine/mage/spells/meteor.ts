import { ClickAtTarget, DistanceFromPoints, WoWLua } from "../../wowutils/wow_utils";
import { MageSpell } from "../../state/utils/mage_utils";
import { Spell, SpellParameters } from "./ispell";
import { CastSpellByName, TargetUnit, UnitReaction } from "../../wowutils/unlocked_functions";
import { PlayerState } from "../../state/players/player_state";

export class Meteor extends Spell {
  isOnGCD = true;
  spellName = MageSpell.Meteor;
  isSelfCast = false;
  isInstant = true;

  cast() {
    if (this.canCastSpell()) {
      const point = WoWLua.FindBestMeteorSpot(this.targetGuid);
      if (point) {
        CastSpellByName(MageSpell.Meteor);
        ClickPosition(point.x, point.y, point.z);
      }
    }
  }

  canCastSpell() {
    return WoWLua.IsSpellUsable(this.spellName);
  }
}
