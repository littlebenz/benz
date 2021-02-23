import { Event, Guid } from "@wartoshika/wow-declarations";

declare namespace Events {
    function InitialiseCounters(callback: CombatLogEventCallback): void;
    function Register(
        event: Event | "PLAYER_TARGET_CHANGED" | "PLAYER_EQUIPMENT_CHANGED",
        callback: EventCallback
    ): void;
    function Register(
        event: "COMBAT_LOG_EVENT_UNFILTERED",
        callback: CombatLogEventCallback
    ): void;
}

declare type EventCallback = (this: void, ...args: string[]) => void;
declare type CombatLogEventCallback = (
    this: void,
    event: CombatLogEventArgs
) => void;

declare type CombatLogEventArg = string | boolean | number | Guid;

declare type CombatLogEventArgs = [
    number,
    CombatLogEvent,
    boolean,
    Guid,
    string,
    number,
    number,
    Guid,
    string,
    number,
    number,
    ...CombatLogEventArg[]
];

declare type CombatLogEvent =
    | "ENVIRONMENTAL_DAMAGE"
    | "SWING_DAMAGE"
    | "SWING_MISSED"
    | "RANGE_DAMAGE"
    | "RANGE_MISSED"
    | "SPELL_CAST_START"
    | "SPELL_CAST_SUCCESS"
    | "SPELL_CAST_FAILED"
    | "SPELL_MISSED"
    | "SPELL_DAMAGE"
    | "SPELL_HEAL"
    | "SPELL_ENERGIZE"
    | "SPELL_DRAIN"
    | "SPELL_LEECH"
    | "SPELL_SUMMON"
    | "SPELL_RESURRECT"
    | "SPELL_CREATE"
    | "SPELL_INSTAKILL"
    | "SPELL_INTERRUPT"
    | "SPELL_EXTRA_ATTACKS"
    | "SPELL_DURABILITY_DAMAGE"
    | "SPELL_DURABILITY_DAMAGE_ALL"
    | "SPELL_AURA_APPLIED"
    | "SPELL_AURA_APPLIED_DOSE"
    | "SPELL_AURA_REMOVED"
    | "SPELL_PERIODIC_AURA_REMOVED"
    | "SPELL_AURA_REMOVED_DOSE"
    | "SPELL_AURA_BROKEN"
    | "SPELL_AURA_BROKEN_SPELL"
    | "SPELL_AURA_REFRESH"
    | "SPELL_DISPEL"
    | "SPELL_STOLEN"
    | "ENCHANT_APPLIED"
    | "ENCHANT_REMOVED"
    | "SPELL_PERIODIC_MISSED"
    | "SPELL_PERIODIC_DAMAGE"
    | "SPELL_PERIODIC_HEAL"
    | "SPELL_PERIODIC_ENERGIZE"
    | "SPELL_PERIODIC_DRAIN"
    | "SPELL_PERIODIC_LEECH"
    | "SPELL_DISPEL_FAILED"
    | "DAMAGE_SHIELD"
    | "DAMAGE_SHIELD_MISSED"
    | "DAMAGE_SPLIT"
    | "PARTY_KILL"
    | "UNIT_DIED"
    | "UNIT_DESTROYED"
    | "SPELL_BUILDING_DAMAGE"
    | "SPELL_BUILDING_HEAL"
    | "UNIT_DISSIPATES";
