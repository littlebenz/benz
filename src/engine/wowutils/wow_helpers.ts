import { DeathKnight } from "../state/players/death_knight";
import { DemonHunter } from "../state/players/demon_hunter";
import { Druid } from "../state/players/druid";
import { Hunter } from "../state/players/hunter";
import { Mage } from "../state/players/mage";
import { Monk } from "../state/players/monk";
import { Paladin } from "../state/players/paladin";
import { Priest } from "../state/players/priest";
import { Rogue } from "../state/players/rogue";
import { Shaman } from "../state/players/shaman";
import { Warlock } from "../state/players/warlock";
import { Warrior } from "../state/players/warrior";
import { DeathKnightSpell } from "../state/utils/death_knight_utils";
import { DemonHunterSpell } from "../state/utils/demon_hunter_utils";
import { DruidSpell } from "../state/utils/druid_utils";
import { HunterSpell } from "../state/utils/hunter_utils";
import { MageSpell } from "../state/utils/mage_utils";
import { MonkSpell } from "../state/utils/monk_utils";
import { PaladinSpell } from "../state/utils/paladin_utils";
import { PriestSpell } from "../state/utils/priest_utils";
import { RogueSpell } from "../state/utils/rogue_utils";
import { ShamanSpell } from "../state/utils/shaman_utils";
import { WarriorSpell } from "../state/utils/warrior_utils";

export interface Aura {
  name: string;
  icon: WoWAPI.TexturePath;
  count: number;
  debuffType: WoWAPI.DebuffType;
  duration: number;
  expirationTime: number;
  source: WoWAPI.UnitId;
  isStealable: boolean;
  nameplateShowPersonal: boolean;
  spellId: number;
  canApplyAura: boolean;
  isBossDebuff: boolean;
  castByPlayer: boolean;
  nameplateShowAll: boolean;
  timeMod: number;
  index: number;
}

export enum UnitType {
  object = 0,
  item = 1,
  container = 2,
  azeriteEmpoweredItem = 3,
  azeriteItem = 4,
  unit = 5,
  player = 6,
  activePlayer = 7,
  gameObject = 8,
  dynamicObject = 9,
  corpse = 10,
  areaTrigger = 11,
  sceneObject = 12,
  conversation = 13,
  aiGroup = 14,
  scenario = 15,
  loot = 16,
  invalid = 17,
}

export const InterruptSpells = [
  DeathKnightSpell.MindFreeze,
  DeathKnightSpell.Strangulate,
  DemonHunterSpell.Disrupt,
  DruidSpell.SkullBash,
  HunterSpell.CounterShot,
  HunterSpell.Muzzle,
  MageSpell.Counterspell,
  MonkSpell.SpearHandStrike,
  PaladinSpell.Rebuke,
  PriestSpell.Silence,
  RogueSpell.Kick,
  ShamanSpell.WindShear,
  WarriorSpell.Pummel,
];
