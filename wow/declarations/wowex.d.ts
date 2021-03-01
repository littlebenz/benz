type ReservedUnits = "player" | "target" | "mouseover" | "focus" | "arena1" | "arena2" | "arena3";

type Vararg<T extends unknown[]> = T & { __luaVararg?: never };

declare function ReadFile(path: string): string;
declare function WriteFile(path: string, contents: string, append?: boolean): number;
declare const CallSecureFunction: <T>(func: string, ...rest: Vararg<any>) => T;
declare function ObjectType<GUID extends string>(
  unit: GUID & (GUID extends ReservedUnits ? "Value is reserved!" : {})
): number;
declare function GetObjectCount(): number;
declare function GetObjectWithIndex<GUID extends string>(
  index: number
): GUID & (GUID extends ReservedUnits ? "Value is reserved!" : {});
/** @tupleReturn **/
declare function GetUnitPosition(unit: string): [number, number, number];
declare function ClickPosition(x: number, y: number, z: number, rightClick?: boolean): void;
declare function UnitFacing<GUID extends string>(
  unit: GUID & (GUID extends ReservedUnits ? "Value is reserved!" : {})
): number;
declare function ObjectName<GUID extends string>(
  unit: GUID & (GUID extends ReservedUnits ? "Value is reserved!" : {})
): string;
declare function FaceDirection(angle: number): void;
declare function GetUnitMovementFlags<GUID extends string>(
  unit: GUID & (GUID extends ReservedUnits ? "Value is reserved!" : {})
): number | null;
declare function ObjectField<GUID extends string>(
  unit: GUID & (GUID extends ReservedUnits ? "Value is reserved!" : {}),
  offset: number,
  type: number
): unknown;
declare function IsGuid<GUID extends string>(
  unit: GUID & (GUID extends ReservedUnits ? "Value is reserved!" : {})
): boolean;
declare function SetMouseOver<GUID extends string>(
  unit: GUID & (GUID extends ReservedUnits ? "Value is reserved!" : {})
): string;
declare function GetExeDirectory(): string;
declare function UpdateMovement(): void;

/** @tupleReturn **/
declare function WorldToScreen(x: number, y: number, z: number): [number, number];
declare function IsWindowActive(): boolean;
