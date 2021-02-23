// declare interface LibCC {
//     /** @tupleReturn */
//     UnitCastingInfo(unitId: UnitId): ReturnType<typeof CastingInfo>;
//     /** @tupleReturn */
//     UnitChannelInfo(unitId: UnitId): ReturnType<typeof ChannelInfo>;
// }

/** @noSelf */
declare namespace LibDraw {
    function clearCanvas(): void;
    function Sync(callback: Function): void;
    function Remove(callback: Function): void;
    function SetWidth(width: number): void;
    function Enable(interval: number): void;
    function SetColor(r: number, g: number, b: number, a: number): void;
    function SetColorRaw(r: number, g: number, b: number, a: number): void;
    function Text(
        text: string,
        font: string,
        x: number,
        y: number,
        z: number
    ): void;
    function Line(
        sx: number,
        sy: number,
        sz: number,
        dx: number,
        dy: number,
        dz: number
    ): void;
    function Cross(
        x: number,
        y: number,
        z: number,
        width: number,
        rotation: number,
        reach: number
    ): void;
    function Box(
        x: number,
        y: number,
        z: number,
        width: number,
        height: number,
        rotation: number,
        offsetX?: number,
        offsetY?: number
    ): void;
}

// /** @noSelf */
// declare interface InstantHealth {
//     UnitHealth(unitId: UnitId): number;
//     UnitHealthMax(unitId: UnitId): number;
// }

// declare interface LibDuration {
//     /** @tupleReturn */
//     UnitAuraDirect: (
//         this: void,
//         unitId: UnitId,
//         index: number,
//         filter: BuffFilterType & string,
//         friendly: boolean
//     ) => ReturnType<typeof UnitBuff>;

//     RegisterCallback: (
//         this: void,
//         addon: string,
//         event: string,
//         callback: () => void
//     ) => void;

//     /** @tupleReturn */
//     GetAuraDurationByUnit(
//         unit: Guid,
//         spellId: number,
//         caster?: UnitId,
//         spellName?: string
//     ): [number, number];
// }

// declare interface LibBossIDs {
//     BossIDs: Record<number, boolean>;
// }

// declare namespace TomTom {
//     function GetClosestWaypoint(): [number, number, number];
// }

// declare namespace ZGV {
//     const Pointer: {
//         current_waypoint: {
//             map: number;
//             x: number;
//             y: number;
//         };
//     };
// }
