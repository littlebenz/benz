import { MageSpell } from "../../state/utils/mage_utils";
import { GCDSpell } from "./gcd_spell";

export class ArcaneIntellect extends GCDSpell {
  spellName = MageSpell.ArcaneIntellect;
  isInstant = true;

  // not strictly true, but good enough
  isSelfCast = true;
}
