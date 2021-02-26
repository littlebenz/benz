import { MageSpell } from "../../state/utils/mage_utils";
import { GCDSpell } from "./gcd_spell";

export class FrostNova extends GCDSpell {
  spellName = MageSpell.FrostNova;
  isSelfCast = true;
  isInstant = true;
}
