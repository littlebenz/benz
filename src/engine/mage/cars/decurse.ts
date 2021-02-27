import { UnitId } from "@wartoshika/wow-declarations";
import { ShamanAura } from "../../state/utils/shaman_utils";
import { UnitHasAura } from "../../wowutils/wow_utils";
import { RemoveCurse } from "../spells/remove_curse";
import { Car } from "./car";

export class Decurse implements Car {
  getNextSpell() {
    // only dispell hex for now

    for (const player of ["party1" as UnitId, "party2" as UnitId, "party3" as UnitId]) {
      if (UnitHasAura(ShamanAura.Hex, player)) {
        return new RemoveCurse({
          unitTarget: player,
          messageOnCast: "Decurse Hex from " + GetUnitName(player, false),
        });
      }
    }
    return null;
  }
}
