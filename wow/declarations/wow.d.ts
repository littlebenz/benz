/**
 * Stops the current spellcast.
 */
declare function SpellStopCasting(): void;

declare function CastSpellByID<T>(id: number, target?: T): void;
// declare function CastSpellByName(spell: string): void;

/**
 * @tupleReturn
 */
declare function IsUsableSpell(spell: string | number): [boolean, boolean | null];

/**
 * @tupleReturn
 */
declare function UnitCastingInfo(
  unit: string
): [string, string, string, number, number, number, boolean, number, boolean];

/**
 * @tupleReturn
 */
declare function CombatLogGetCurrentEventInfo(): [
  number,
  string,
  boolean,
  string,
  string,
  number,
  number,
  string,
  string,
  number,
  number,
  any, //12
  any, //13
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
];

declare namespace C_Timer {
  function NewTicker(interval: number, action: () => any): any;
  function After(durationSeconds: number, action: () => any): void;
}

// declare function UnitReaction(unit: string, otherUnit: string): number | null;

declare function IsMouseButtonDown(
  button: "LeftButton" | "RightButton" | "MiddleButton" | "BUTTON4"
): boolean;

declare function GetArenaOpponentSpec(unit: string): number | null;

/**
 * @tupleReturn
 */
declare function GetSpecializationInfoByID(
  classId: number,
  specNumber?: number
): [number, string, string, number, string, boolean, boolean];

/**
 * Returns information about the spell currently being channeled by the specified unit.
 * @param unitId The unit to query (e.g. "player", "party2", "pet", "target" etc.)
 * @see https://wow.gamepedia.com/API_UnitChannelInfo
 * @tupleReturn
 */
declare function ChannelInfo(
  unitId: string
): [string, string, string, number, number, boolean, boolean, number];

/**
 * Returns information about the spell currently being cast by the specified unit.
 * @param unitId The unit to query (e.g. "player", "party2", "pet", "target" etc.)
 * @see https://wow.gamepedia.com/API_UnitCastingInfo
 * @tupleReturn
 */
declare function CastingInfo(
  unitId: string
): [string, string, string, number, number, boolean, string, boolean, number];

/**
 * Returns a value representing the moving speed of a unit.
 * @param unitId Unit to query the speed of. This has not been tested with all units but does work for "player" units.
 * @see https://wow.gamepedia.com/API_GetUnitSpeed
 * @tupleReturn
 */
declare function GetUnitSpeed(unitId: string): [number, number, number, number];
declare function ExGetUnitSpeed(unit: string): number;

declare const WorldFrame: any;
declare namespace bit {
  function bor(...num: number[]): number;
  function band(x: number, y: number): number;
}

/**
 * @tupleReturn
 * @param x
 * @param y
 * @param z
 * @param x2
 * @param y2
 * @param z2
 * @param flags
 */
declare function TraceLine(
  x: number,
  y: number,
  z: number,
  x2: number,
  y2: number,
  z2: number,
  flags: any
): [number, number, number, number];

/**
 * @tupleReturn
 * @param spell
 */
declare function GetSpellCharges(spell: string | number): [number, number, number, number, number];

declare function UnitIsDead(unit: string): number;

/**
 * @tupleReturn
 */
declare function UnitCastingInfo(
  unit: string
): [string, string, string, string, number, number, boolean, number, boolean];

/**
 * @tupleReturn
 */
declare function GetSpecializationInfoByID(
  classId: number,
  specNumber?: number
): [number, string, string, number, string, boolean, boolean];

declare function GetArenaOpponentSpec(unit: string): number | null;

declare function GetInventoryItemID(unit: string, slotId: number): number;

declare function GetInventoryItemCount(unit: string, slotId: number): number;

declare namespace C_SpecializationInfo {
  /**
   * @tupleReturn
   */
  function GetAllSelectedPvpTalentIDs(): [number, number, number];
}

declare function UnitPower(unit: string, powerType?: number): number;

/**
 * @tupleReturn
 */
declare function UnitChannelInfo(
  unit: string
): [string, string, string, number, number, boolean, boolean, number];

declare function GetTimePreciseSec(): number;

declare let _Cast: (...args: Vararg<any>) => void;

/**
 * @tupleReturn
 */
declare function GetSpellInfo(
  spell: number | string
): [string, null, number, number, number, number, number];

declare function UnitIsVisible(unit: string): boolean;

declare function IsSpellInRange(spell: string | number, unit: string): number;
