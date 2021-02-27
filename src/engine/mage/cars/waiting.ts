import { WoWLua } from "../../wowutils/wow_utils";
import { Car } from "./car";
import { ConjureRefreshment } from "../spells/conjure_refreshment";
import { InteractUnit } from "../../wowutils/unlocked_functions";

export class Waiting implements Car {
  lastInteractedWithTable: number = 0;
  getNextSpell() {
    // conjure refreshment
    // click table
    // click soulwell?
    const inventory = WoWLua.GetBags();
    if (inventory.findIndex((x) => x.itemID === 113509) === -1) {
      const table = WoWLua.GetObjectByName("Refreshment Table");
      if (table && GetTime() - this.lastInteractedWithTable >= 5) {
        this.lastInteractedWithTable = GetTime();
        InteractUnit(table);
      } else {
        return new ConjureRefreshment();
      }
    }

    return null;
  }
}
