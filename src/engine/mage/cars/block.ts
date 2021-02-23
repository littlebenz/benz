import { MageSpell } from "../../state/utils/mage_utils";
import { IsSpellUsable } from "../../wowutils/wow_utils";
import { IceBlock } from "../spells/ice_block";
import { Car } from "./car";

export class Block implements Car {
  getNextSpell() {
    const currentHealth = UnitHealth("player");
    const healthMax = UnitHealthMax("player");
    const percentage = (currentHealth / healthMax) * 100;

    if (percentage <= 10 && IsSpellUsable(MageSpell.IceBlock)) {
      return new IceBlock();
    }

    return null;
  }
}
