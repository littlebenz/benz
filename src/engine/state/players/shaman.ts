import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { GetObjects, UnitCastOrChannel, UnitHasAura } from "../../wowutils/wow_utils";
import { ShamanAura, ShamanSpell } from "../utils/shaman_utils";
import { WoWClass } from "./WoWClass";

export class Shaman extends PlayerState {
  class = WoWClass.Shaman;
  canBeIncapacitated(): boolean {
    return super.canBeIncapacitated();
  }
  canPump(): boolean {
    return false;
  }
  isPumping(): boolean {
    const objects = GetObjects().map((x) => ({ guid: x, name: ObjectName(x) }));
    const feralSpirit = objects.find((x) => x.name === "Feral Spirit");
    const fireEle = objects.find((x) => x.name === "Greater Fire Elemental");
    const stormEle = objects.find((x) => x.name === "Greater Storm Elemental");
    if (feralSpirit && !UnitIsDead(feralSpirit.guid)) {
      return true;
    }
    if (fireEle && !UnitIsDead(fireEle.guid)) {
      return true;
    }
    if (stormEle && !UnitIsDead(stormEle.guid)) {
      return true;
    }

    return false;
  }
  isDefensive(): Defensive {
    if (UnitHasAura(ShamanAura.AstralShift, this.unitId)) {
      return Defensive.CanStillDam;
    }

    return super.isDefensive();
  }
  shouldInterrupt(): boolean {
    const casting = this.currentCastOrChannel();
    if (casting) {
      if (
        casting.spell === ShamanSpell.LightningLasso ||
        casting.spell === ShamanSpell.HealingWave ||
        casting.spell === ShamanSpell.Hex ||
        casting.spell === ShamanSpell.HealingSurge
      ) {
        return true;
      }
    }
    return false;
  }
  shouldStomp(): boolean {
    return false;
  }
}
