import { MageSpell } from "../../state/utils/mage_utils";
import { GCDSpell } from "./gcd_spell";

export class Frostbolt extends GCDSpell {
  spellName = MageSpell.Frostbolt;
  isSelfCast = false;
  isInstant = false;
}
