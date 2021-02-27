import { FaceUnit, GetSpellInfoTyped, WoWLua } from "../../wowutils/wow_utils";
import { MageSpell } from "../../state/utils/mage_utils";
import { CastSpellByName } from "../../wowutils/unlocked_functions";
import { UnitId } from "@wartoshika/wow-declarations";

let lastUpdatedDirection: number = 0;
export abstract class Spell {
  abstract isOnGCD: boolean;
  abstract isInstant: boolean;
  abstract spellName: MageSpell;
  abstract isSelfCast: boolean;

  targetGuid: string;
  protected castTime() {
    return GetSpellInfoTyped(this.spellName).castTime;
  }

  protected afterCast: () => void;

  constructor(unitTarget?: UnitId, afterCast = () => {}) {
    this.targetGuid = unitTarget ? UnitGUID(unitTarget) : UnitGUID("target");
    this.afterCast = () => afterCast();
  }

  cast() {
    if (GetTime() - lastUpdatedDirection > 0.5) {
      lastUpdatedDirection = GetTime();
      const direction = UnitFacing("player" as string);
      UpdateMovement();
      FaceUnit(this.targetGuid);
      UpdateMovement();

      CastSpellByName(this.spellName, this.targetGuid);

      UpdateMovement();
      FaceDirection(direction);
      UpdateMovement();
    } else {
      CastSpellByName(this.spellName, this.targetGuid);
    }

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
