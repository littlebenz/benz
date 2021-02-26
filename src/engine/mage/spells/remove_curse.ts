import { MageSpell } from "../../state/utils/mage_utils";
import { GCDSpell } from "./gcd_spell";

export class RemoveCurse extends GCDSpell {
  spellName = MageSpell.RemoveCurse;
  isSelfCast = false;
  isInstant = true;
}
