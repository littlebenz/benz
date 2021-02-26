import { MageSpell } from "../../state/utils/mage_utils";
import { GCDSpell } from "./gcd_spell";

export class Scorch extends GCDSpell {
  spellName = MageSpell.Scorch;
  isSelfCast = false;
  isInstant = false;
}
