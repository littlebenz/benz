import { UnitId } from "@wartoshika/wow-declarations";
import { WowEventListener } from "../../wow_event_listener";
import { DeathKnight } from "./death_knight";
import { DemonHunter } from "./demon_hunter";
import { Druid } from "./druid";
import { Hunter } from "./hunter";
import { Mage } from "./mage";
import { Monk } from "./monk";
import { NPC } from "./npc";
import { Paladin } from "./paladin";
import { PlayerState } from "./player_state";
import { Priest } from "./priest";
import { Rogue } from "./rogue";
import { Shaman } from "./shaman";
import { Warlock } from "./warlock";
import { Warrior } from "./warrior";
import { WoWClass } from "./WoWClass";

export class PlayerStateFactory {
  static create(unit: UnitId, wowEventListener: WowEventListener): PlayerState | null {
    const [classId] = UnitClass(unit);

    if (classId === WoWClass.Warrior) {
      return new Warrior(unit, wowEventListener);
    } else if (classId === WoWClass.Paladin) {
      return new Paladin(unit, wowEventListener);
    } else if (classId === WoWClass.Hunter) {
      return new Hunter(unit, wowEventListener);
    } else if (classId === WoWClass.Warlock) {
      return new Warlock(unit, wowEventListener);
    } else if (classId === WoWClass.Rogue) {
      return new Rogue(unit, wowEventListener);
    } else if (classId === WoWClass.Priest) {
      return new Priest(unit, wowEventListener);
    } else if (classId === WoWClass.DeathKnight) {
      return new DeathKnight(unit, wowEventListener);
    } else if (classId === WoWClass.Shaman) {
      return new Shaman(unit, wowEventListener);
    } else if (classId === WoWClass.Mage) {
      return new Mage(unit, wowEventListener);
    } else if (classId === WoWClass.Monk) {
      return new Monk(unit, wowEventListener);
    } else if (classId === WoWClass.Druid) {
      return new Druid(unit, wowEventListener);
    } else if (classId === WoWClass.DemonHunter) {
      return new DemonHunter(unit, wowEventListener);
    } else {
      return null;
    }
  }
}
