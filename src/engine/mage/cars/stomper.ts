import { PlayerState } from "../../state/players/player_state";
import { MageSpell } from "../../state/utils/mage_utils";
import { UnitReaction } from "../../wowutils/unlocked_functions";
import { WoWLua, StopCast } from "../../wowutils/wow_utils";
import { FireBlast } from "../spells/fire_blast";
import { PhoenixFlames } from "../spells/phoenix_flames";
import { Scorch } from "../spells/scorch";
import { Car } from "./car";

export class Stomper implements Car {
  private getEnemies: () => PlayerState[];

  constructor(getEnemies: () => PlayerState[]) {
    this.getEnemies = () => getEnemies();
  }

  getNextSpell() {
    for (const enemy of this.getEnemies()) {
      if (enemy.shouldStomp()) {
        return this.getSpellToCastAt(enemy.unitId);
      }
    }

    const objects = WoWLua.GetObjects().map((x) => ({ guid: x, name: ObjectName(x) }));
    const maybeSpiritLinkTotem = objects.find((x) => x.name === "Spirit Link Totem");
    if (maybeSpiritLinkTotem) {
      const reaction = UnitReaction("player", maybeSpiritLinkTotem.guid);
      if (reaction && reaction < 5 && !UnitIsDead(maybeSpiritLinkTotem.guid)) {
        return this.getSpellToCastAt(SetMouseOver(maybeSpiritLinkTotem.guid));
      }
    }

    const maybeGroundingTotem = objects.find((x) => x.name === "Grounding Totem");
    if (maybeGroundingTotem) {
      const reaction = UnitReaction("player", maybeGroundingTotem.guid);
      if (reaction && reaction < 5 && !UnitIsDead(maybeGroundingTotem.guid)) {
        StopCast();
        return this.getSpellToCastAt(SetMouseOver(maybeGroundingTotem.guid));
      }
    }

    const maybeCapTotem = objects.find((x) => x.name === "Capacitor Totem");
    if (maybeCapTotem) {
      const reaction = UnitReaction("player", maybeCapTotem.guid);
      if (reaction && reaction < 5 && !UnitIsDead(maybeCapTotem.guid)) {
        return this.getSpellToCastAt(SetMouseOver(maybeCapTotem.guid));
      }
    }

    const maybeWarBanner = objects.find((x) => x.name === "War Banner");
    if (maybeWarBanner) {
      const reaction = UnitReaction("player", maybeWarBanner.guid);
      if (reaction && reaction < 5 && !UnitIsDead(maybeWarBanner.guid)) {
        return this.getSpellToCastAt(SetMouseOver(maybeWarBanner.guid));
      }
    }

    return null;
  }

  private getSpellToCastAt(unit: string) {
    if (WoWLua.IsSpellUsable(MageSpell.FireBlast)) {
      return new FireBlast(true, unit as any);
    }

    return new Scorch(unit as any);
  }
}
