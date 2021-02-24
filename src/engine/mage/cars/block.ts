import { MageSpell } from "../../state/utils/mage_utils";
import { WoWLua } from "../../wowutils/wow_utils";
import { IceBlock } from "../spells/ice_block";
import { Car } from "./car";

export class Block implements Car {
  getNextSpell() {
    const currentHealth = UnitHealth("player");
    const healthMax = UnitHealthMax("player");
    const percentage = (currentHealth / healthMax) * 100;

    if (percentage <= 10 && WoWLua.IsSpellUsable(MageSpell.IceBlock)) {
      return new IceBlock();
    }

    return null;
  }
}
