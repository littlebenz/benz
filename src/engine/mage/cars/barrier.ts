/**
 * Activate barrier if...
 *
 * I have none and cooldown is 0
 * I'm not pumping and it has 10 seconds or less left
 * I'm pumping and being attacked and less than 80% health
 *
 * Gate is closed and there's about 20 seconds left before it opens
 * Gate is closed and there's more than 45 seconds left
 */
import { GetAuraRemainingTime, GetPlayerAura, IsSpellUsable } from "../../wowutils/wow_utils";
import { MageAura, MageSpell } from "../../state/utils/mage_utils";
import { Barrier as BarrierSkill } from "../spells/barrier";
import { Car } from "./car";
import { ArcaneIntellect } from "../spells/arcane_intellect";

export class Barrier implements Car {
  getNextSpell() {
    const arcaneInt = GetPlayerAura(MageAura.ArcaneIntellect);
    const arcaneIntTimeLeft = GetAuraRemainingTime(arcaneInt);

    if (!IsSpellUsable(MageSpell.ArcaneIntellect)) {
      return null;
    }

    if (arcaneIntTimeLeft <= 10) {
      return new ArcaneIntellect();
    }

    // assuming fire mage only right now
    const barrier = GetPlayerAura(MageAura.BlazingBarrier);
    const barrierTimeLeft = GetAuraRemainingTime(barrier);

    if (!IsSpellUsable(MageSpell.BlazingBarrier)) {
      return null;
    }

    if (barrierTimeLeft <= 7) {
      return new BarrierSkill();
    }

    return null;
  }
}
