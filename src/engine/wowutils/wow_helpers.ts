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
