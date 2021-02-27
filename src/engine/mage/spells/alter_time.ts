import { MageSpell } from "../../state/utils/mage_utils";
import { GCDSpell } from "./gcd_spell";

export class AlterTime extends GCDSpell {
  spellName = MageSpell.AlterTime;
  isInstant = true;
  isSelfCast = true;
}
