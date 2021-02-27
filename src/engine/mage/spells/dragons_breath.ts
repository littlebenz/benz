import { MageSpell } from "../../state/utils/mage_utils";
import { GCDSpell } from "./gcd_spell";

export class DragonsBreath extends GCDSpell {
  spellName = MageSpell.DragonsBreath;
  isSelfCast = true;
  isInstant = true;
}
