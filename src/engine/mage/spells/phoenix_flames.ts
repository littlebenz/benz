import { MageSpell } from "../../state/utils/mage_utils";
import { GCDSpell } from "./gcd_spell";

export class PhoenixFlames extends GCDSpell {
  spellName = MageSpell.PhoenixFlames;
  isSelfCast = false;
}
