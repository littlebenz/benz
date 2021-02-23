import { MageSpell } from "../../state/utils/mage_utils";
import { GCDSpell } from "./gcd_spell";

export class Barrier extends GCDSpell {
  spellName = MageSpell.BlazingBarrier;
  isSelfCast = true;
}
