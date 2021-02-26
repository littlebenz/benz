import { FaceUnit, UnitCastOrChannel, WoWLua } from "../../wowutils/wow_utils";
import { MageSpell } from "../../state/utils/mage_utils";
import { CastSpellByName, TargetUnit } from "../../wowutils/unlocked_functions";
import { UnitId } from "@wartoshika/wow-declarations";

export abstract class Spell {
  abstract isOnGCD: boolean;
  abstract isInstant: boolean;
  abstract spellName: MageSpell;
  abstract isSelfCast: boolean;

  targetGuid: string;
  protected afterCast: () => void;

  constructor(unitTarget?: UnitId, afterCast = () => {}) {
    this.targetGuid = unitTarget ? UnitGUID(unitTarget) : UnitGUID("target");
    this.afterCast = () => afterCast();
  }

  cast() {
    CastSpellByName(this.spellName, this.targetGuid);

    this.afterCast();
  }

  canCastSpell() {
    if (!this.isSelfCast) {
      if (!WoWLua.IsUnitInOfLineOfSight("player", SetMouseOver(this.targetGuid))) {
        return false;
      }

      if (IsSpellInRange(this.spellName, SetMouseOver(this.targetGuid)) === 0) {
        return false;
      }
    }

    const spellUsable = WoWLua.IsSpellUsable(this.spellName);

    return spellUsable;
  }
}
