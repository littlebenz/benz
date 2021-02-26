import { MageSpell } from "../../state/utils/mage_utils";
import { GCDSpell } from "./gcd_spell";

export class Spellsteal extends GCDSpell {
  spellName = MageSpell.Spellsteal;
  isSelfCast = false;
  isInstant = true;
}
