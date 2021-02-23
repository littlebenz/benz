import { ClickAtTarget, IsSpellUsable, IsUnitInOfLineOfSight } from "../../wowutils/wow_utils";
import { MageSpell } from "../../state/utils/mage_utils";
import { Spell } from "./ispell";
import { CastSpellByName, TargetUnit } from "../../wowutils/unlocked_functions";

export class Meteor extends Spell {
  isOnGCD = true;
  spellName = MageSpell.Meteor;
  isSelfCast = false;

  cast() {
    // todo:: cancel current cast first?
    // const isLeftDown = IsMouseButtonDown("LeftButton");
    // const isRightDown = IsMouseButtonDown("RightButton");

    // if (isLeftDown) {
    //     SendClick(0x04);
    // }

    // if (isRightDown) {
    //     SendClick(0x10);
    // }

    CastSpellByName(MageSpell.Meteor, this.targetGuid);

    ClickAtTarget();

    // if (isLeftDown) {
    //     SendClick(0x02);
    // }

    // if (isRightDown) {
    //     SendClick(0x8);
    // }
  }

  // canCastSpell(): boolean {
  //   if (!this.isSelfCast) {
  //     if (!IsUnitInOfLineOfSight("player", SetMouseOver(this.targetGuid))) {
  //       return false;
  //     }

  //     if (IsSpellInRange(this.spellName, SetMouseOver(this.targetGuid)) === 0) {
  //       return false;
  //     }
  //   }

  //   const spellUsable = IsSpellUsable(this.spellName);

  //   return spellUsable;
  // }
}
