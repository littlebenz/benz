import { UnitId } from "@wartoshika/wow-declarations";
import { MageSpell } from "../../state/utils/mage_utils";
import { CastSpellByName } from "../../wowutils/unlocked_functions";
import { WoWLua } from "../../wowutils/wow_utils";
import { Spell } from "./ispell";

let lastBlink: number = 0;

export class Blink extends Spell {
  isOnGCD = false;
  spellName = MageSpell.Blink;
  isSelfCast = true;

  private direction: number;

  constructor(direction: number, unitTarget?: UnitId, afterCast = () => {}) {
    super(unitTarget, afterCast);
    this.direction = direction;
  }

  canCastSpell(): boolean {
    if (GetTime() - lastBlink <= 0.5) {
      return false;
    }

    return WoWLua.IsSpellUsable(this.spellName);
  }

  cast() {
    lastBlink = GetTime();

    FaceDirection(this.direction);
    UpdateMovement();
    FaceDirection(this.direction);

    CastSpellByName(this.spellName, this.targetGuid);

    this.afterCast();
  }
}
