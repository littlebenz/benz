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
import { Priest } from "./priest";
import { Rogue } from "./rogue";
import { Shaman } from "./shaman";
import { Warlock } from "./warlock";
import { Warrior } from "./warrior";
import { WoWClass } from "./WoWClass";

export class PlayerStateFactory {
  static create(unit: UnitId, wowEventListener: WowEventListener) {
    const [classId] = UnitClass(unit);

    if (classId === WoWClass.Warrior) {
      console.log("war");
      return new Warrior(unit, wowEventListener);
    } else if (classId === WoWClass.Paladin) {
      console.log("pal");
      return new Paladin(unit, wowEventListener);
    } else if (classId === WoWClass.Hunter) {
      console.log("hubt");
      return new Hunter(unit, wowEventListener);
    } else if (classId === WoWClass.Warlock) {
      console.log("lock");
      return new Warlock(unit, wowEventListener);
    } else if (classId === WoWClass.Rogue) {
      console.log("r");
      return new Rogue(unit, wowEventListener);
    } else if (classId === WoWClass.Priest) {
      console.log("priest");
      return new Priest(unit, wowEventListener);
    } else if (classId === WoWClass.DeathKnight) {
      console.log("dk");
      return new DeathKnight(unit, wowEventListener);
    } else if (classId === WoWClass.Shaman) {
      console.log("sham");
      return new Shaman(unit, wowEventListener);
    } else if (classId === WoWClass.Mage) {
      console.log("mage");
      return new Mage(unit, wowEventListener);
    } else if (classId === WoWClass.Monk) {
      console.log("monk");
      return new Monk(unit, wowEventListener);
    } else if (classId === WoWClass.Druid) {
      console.log("dru");
      return new Druid(unit, wowEventListener);
    } else if (classId === WoWClass.DemonHunter) {
      console.log("dh");
      return new DemonHunter(unit, wowEventListener);
    } else {
      console.log("empty");
      return null;
    }
  }
}
