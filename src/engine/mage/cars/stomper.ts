import { Mage } from "../../state/players/mage";
import { PlayerState } from "../../state/players/player_state";
import { MageSpell } from "../../state/utils/mage_utils";
import { UnitReaction } from "../../wowutils/unlocked_functions";
import { WoWLua, StopCast } from "../../wowutils/wow_utils";
import { WowEventListener } from "../../wow_event_listener";
import { FireBlast } from "../spells/fire_blast";
import { PhoenixFlames } from "../spells/phoenix_flames";
import { Scorch } from "../spells/scorch";
import { Car } from "./car";

enum StompObjects {
  SpiritLink = "Spirit Link Totem",
  Grounding = "Grounding Totem",
  Capacitor = "Capacitor Totem",
  WarBanner = "War Banner",
}
export class Stomper implements Car {
  private getEnemies: () => PlayerState[];
  private objectsToStomp = [
    StompObjects.Capacitor,
    StompObjects.Grounding,
    StompObjects.SpiritLink,
    StompObjects.WarBanner,
  ];

  constructor(getEnemies: () => PlayerState[]) {
    this.getEnemies = () => getEnemies();
  }

  getNextSpell() {
    if (!WoWLua.IsSpellUsable(MageSpell.Scorch) && !WoWLua.IsSpellCastable(MageSpell.FireBlast)) {
      return null;
    }

    for (const enemy of this.getEnemies()) {
      if (enemy.shouldStomp()) {
        return this.getSpellToCastAt(enemy.unitId, enemy.getSpecInfoEnglish());
      }
    }

    // this entire function is ugly and duplicated logic, needs to be cleaned up
    const objects = WoWLua.GetObjects()
      .map((x) => ({ guid: x, name: ObjectName(x) as StompObjects }))
      .filter((x) => !!x.name)
      .filter((x) => this.objectsToStomp.includes(x.name))
      .filter((x) => WoWLua.IsUnitInOfLineOfSightNoMemoize("player", SetMouseOver(x.guid)));

    const maybeSpiritLinkTotem = objects.find((x) => x.name === StompObjects.SpiritLink);
    if (maybeSpiritLinkTotem) {
      const reaction = UnitReaction("player", maybeSpiritLinkTotem.guid);
      if (reaction && reaction < 5 && !UnitIsDead(maybeSpiritLinkTotem.guid)) {
        return this.getSpellToCastAt(
          SetMouseOver(maybeSpiritLinkTotem.guid),
          StompObjects.SpiritLink
        );
      }
    }

    const maybeGroundingTotem = objects.find((x) => x.name === StompObjects.Grounding);
    if (maybeGroundingTotem) {
      const reaction = UnitReaction("player", maybeGroundingTotem.guid);
      if (reaction && reaction < 5 && !UnitIsDead(maybeGroundingTotem.guid)) {
        if (WoWLua.GetSpellChargesTyped(MageSpell.FireBlast).currentCharges === 0) {
          StopCast();
        }
        return this.getSpellToCastAt(
          SetMouseOver(maybeGroundingTotem.guid),
          StompObjects.Grounding
        );
      }
    }

    const maybeCapTotem = objects.find((x) => x.name === StompObjects.Capacitor);
    if (maybeCapTotem) {
      const reaction = UnitReaction("player", maybeCapTotem.guid);
      if (reaction && reaction < 5 && !UnitIsDead(maybeCapTotem.guid)) {
        return this.getSpellToCastAt(SetMouseOver(maybeCapTotem.guid), StompObjects.Capacitor);
      }
    }

    const maybeWarBanner = objects.find((x) => x.name === StompObjects.WarBanner);
    if (maybeWarBanner) {
      const reaction = UnitReaction("player", maybeWarBanner.guid);
      if (reaction && reaction < 5 && !UnitIsDead(maybeWarBanner.guid)) {
        return this.getSpellToCastAt(SetMouseOver(maybeWarBanner.guid), StompObjects.WarBanner);
      }
    }

    return null;
  }

  private getSpellToCastAt(unit: string, name: string) {
    if (WoWLua.IsSpellUsable(MageSpell.FireBlast)) {
      return new FireBlast({
        hardCast: true,
        unitTarget: unit as any,
        messageOnCast: "Stomping " + name,
      });
    }

    return new Scorch(unit as any);
  }
}
