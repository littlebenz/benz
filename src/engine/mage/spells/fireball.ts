import { MageSpell } from "../../state/utils/mage_utils";
import { GCDSpell } from "./gcd_spell";

export class Fireball extends GCDSpell {
  spellName = MageSpell.Fireball;
  isSelfCast = false;
}
