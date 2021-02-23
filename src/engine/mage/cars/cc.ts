/**
 *
 * BUGS:
 * Polys into fucking everything LOL.
 * Polys even if someone else is attacking the target, kinda hard, but possible.
 *
 * Sometimes still spams poly twice even tho we've already casted it successfully
 * Doesn't RE very well
 * Should draw a line to the poly target to let user know who we want to poly
 *
 * Need to add DB poly.
 *
 * need to add Ring of Frost
 *
 * need to add frost nova
 */
import { PlayerState } from "../../state/players/player_state";
import { Car } from "./car";
import { Polymorph } from "../spells/polymorph";
import {
  DistanceFromUnit,
  GetUnitAuras,
  IsSpellCastable,
  IsSpellUsable,
  IsUnitDead,
  IsUnitInOfLineOfSight,
  PlayerHasAura,
  StopCast,
  UnitCastingInfoTyped,
  UnitCastOrChannel,
  UnitHealthPercentage,
} from "../../wowutils/wow_utils";
import { MageAura, MageSpell } from "../../state/utils/mage_utils";
import { UnitId } from "@wartoshika/wow-declarations";
import { NightFaeSpell } from "../../state/utils/night_fae_utils";
import { RingOfFrost } from "../spells/ring_of_frost";
import { WoWClass } from "../../state/players/WoWClass";
import { DRType } from "../../state/dr_tracker";
import { UnitType } from "../../wowutils/wow_helpers";

export class CC implements Car {
  private getEnemies: () => PlayerState[];

  constructor(getEnemies: () => PlayerState[]) {
    this.getEnemies = () => getEnemies();
  }

  getNextSpell() {
    const validPlayers = this.getEnemies().filter(
      (x) =>
        IsGuid(UnitGUID(x.unitId)) &&
        !IsUnitDead(x.unitId) &&
        IsUnitInOfLineOfSight("player", x.unitId) &&
        DistanceFromUnit("player", x.unitId) <= 40
    );

    for (const player of validPlayers) {
      const rof = new RingOfFrost(player.unitId);
      if (this.shouldRing(player) && rof.canCastSpell()) {
        return rof;
      }
    }

    const shouldPolyFuctions = [
      (player: PlayerState) => this.shouldPolyOnPump(player),
      (player: PlayerState) => this.shouldPolyHealer(player),
      (player: PlayerState) => this.shouldPolyOffTarget(player),
    ];

    const polyTargets = validPlayers.filter((player) => player.canBeIncapacitated());
    for (const shouldPolyFn of shouldPolyFuctions) {
      for (const player of polyTargets) {
        if (shouldPolyFn(player)) {
          const poly = new Polymorph(player.unitId);
          const casting = UnitCastOrChannel("player");
          if (poly.canCastSpell() && casting && casting.spell !== MageSpell.Polymorph) {
            const percentRemaining =
              ((GetTime() * 1000 - casting.startTimeMS) /
                (casting.endTimeMS - casting.startTimeMS)) *
              100;

            if (percentRemaining <= 10 && casting.spell !== NightFaeSpell.ShiftingPower) {
              StopCast();
            }
          }
          return poly;
        }
      }
    }

    return null;
  }

  private stopCastIfNeeded() {
    const playerCast = UnitCastingInfoTyped("player");
    if (
      playerCast &&
      playerCast.spell !== MageSpell.Polymorph &&
      playerCast.spell !== MageSpell.RingOfFrost
    ) {
      StopCast();
    }
  }

  private shouldRing(playerState: PlayerState): boolean {
    if (playerState.guid() === UnitGUID("target")) {
      return false;
    }

    const dr = playerState.incapacitateDr();
    if (dr.drCount !== 0) {
      return false;
    }
    const remainingCCs = playerState.remainingCC().filter((x) => x.type !== DRType.Silence);
    for (const cc of remainingCCs) {
      if (cc.aura.name === MageAura.DB && cc.remaining >= 1.8) {
        this.stopCastIfNeeded();
        return true;
      }

      if (
        cc.remaining >= 1.8 &&
        playerState.class === WoWClass.Druid &&
        !playerState.canBeIncapacitated()
      ) {
        this.stopCastIfNeeded();
        return true;
      }

      if (!IsSpellUsable(MageSpell.Polymorph) && cc.remaining >= 1.8) {
        this.stopCastIfNeeded();
        return true;
      }
    }

    return false;
  }

  private shouldPolyOnPump(playerState: PlayerState): boolean {
    if (PlayerHasAura(MageAura.Combustion)) {
      return false;
    }

    if (UnitHealthPercentage(playerState.unitId) <= 85) {
      return false;
    }

    if (playerState.isPumping()) {
      return this.shouldPoly(playerState);
    }

    return false;
  }

  private shouldPolyHealer(playerState: PlayerState): boolean {
    if (!playerState.isHealer()) {
      return false;
    }

    // if combust CD is less than 25 do not poly.

    const combustCastable = IsSpellCastable(MageSpell.Combustion);

    if (combustCastable.usableIn < 25) {
      return false;
    }

    if (combustCastable.duration === 0 && combustCastable.usable) {
      return this.shouldPoly(playerState);
    } else {
      return false;
    }
  }

  private shouldPolyOffTarget(playerState: PlayerState): boolean {
    // we should have got this poly off before, this is a dumb check
    // we should actually check to see if we've pumped all our dam out first
    // so check to see if we have 0 fire blast?
    if (PlayerHasAura(MageAura.Combustion)) {
      return false;
    }

    // // if I'm heating up and combust is off CD I don't want to now poly and ruin that
    // if (
    //   (PlayerHasAura(MageAura.HotStreak) || PlayerHasAura(MageAura.HeatingUp)) &&
    //   IsSpellUsable(MageSpell.Combustion)
    // ) {
    //   return false;
    // }

    if (UnitHealthPercentage(playerState.unitId) <= 85) {
      return false;
    }

    if (UnitGUID(playerState.unitId) === UnitGUID("target")) {
      return false;
    }

    for (const teammate of ["party1", "party2", "party3"]) {
      if (UnitGUID(playerState.unitId) === UnitGUID(teammate as UnitId)) {
        return false;
      }
    }

    if (playerState.isHealer()) {
      return false;
    }

    return this.shouldPoly(playerState);
  }

  private shouldPoly(playerState: PlayerState): boolean {
    if (this.haveWePolymorphedAnythingElse(playerState)) {
      return false;
    }

    const incaps = playerState.incapacitateDr();

    if (incaps.drCount === 0 || incaps.timeRemaining <= 1) {
      return true;
    }

    if (incaps.drCount <= 2 && incaps.timeRemaining >= 12) {
      return true;
    }

    return false;
  }

  private haveWePolymorphedAnythingElse(playerState: PlayerState): boolean {
    for (const player of this.getEnemies().filter((x) => x.unitId !== playerState.unitId)) {
      const auras = GetUnitAuras(player.unitId);
      if (
        auras.findIndex(
          (x) => x.name === MageSpell.Polymorph && UnitGUID(x.source) === UnitGUID("player")
        ) !== -1
      ) {
        return true;
      }
    }

    return false;
  }
}
