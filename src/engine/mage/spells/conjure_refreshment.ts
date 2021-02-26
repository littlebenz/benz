import { MageSpell } from "../../state/utils/mage_utils";
import { GCDSpell } from "./gcd_spell";

export class ConjureRefreshment extends GCDSpell {
  spellName = MageSpell.ConjureRefreshment;
  isSelfCast = true;
  isInstant = false;
}
