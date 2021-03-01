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
  IsUnitDead,
  PlayerHasAura,
  StopCast,
  UnitCastOrChannel,
  UnitHealthPercentage,
  WoWLua,
} from "../../wowutils/wow_utils";
import { MageAura, MageSpell } from "../../state/utils/mage_utils";
import { UnitId } from "@wartoshika/wow-declarations";
import { NightFaeSpell } from "../../state/utils/night_fae_utils";
import { RingOfFrost } from "../spells/ring_of_frost";
import { WoWClass } from "../../state/players/WoWClass";
import { DRType } from "../../state/dr_tracker";
import { UIStatusFrame } from "../../ui/status_frame";
import { DragonsBreath } from "../spells/dragons_breath";
import { GetPumpingState, PumpingStatus } from "../../state/utils/pumping_status";

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
        WoWLua.IsUnitInOfLineOfSight("player", x.unitId) &&
        WoWLua.DistanceFromUnit("player", x.unitId) <= 30
    );

    for (const player of validPlayers) {
      const rof = new RingOfFrost({ unitTarget: player.unitId });
      if (this.shouldRing(player) && rof.canCastSpell()) {
        return rof;
      }
    }

    for (const player of validPlayers) {
      const db = new DragonsBreath({ unitTarget: player.unitId });
      if (this.shouldDB(player) && db.canCastSpell()) {
        return db;
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
        const maybePoly = shouldPolyFn(player);
        if (maybePoly) {
          const casting = UnitCastOrChannel("player");
          if (maybePoly.canCastSpell() && casting && casting.spell !== MageSpell.Polymorph) {
            this.stopCastIfNeeded(player, 1.5);
          }

          return maybePoly;
        }
      }
    }

    return null;
  }

  private stopCastIfNeeded(player: PlayerState, castDuration: number) {
    const playerCast = UnitCastOrChannel("player");
    if (!playerCast) {
      return;
    }

    const playerRemaingCC = player.remainingCC();
    const nonRootCCForChainLength = playerRemaingCC
      .filter((x) => x.type !== DRType.Root)
      .sort((a, b) => b.remaining - a.remaining);
    let shouldStopCastBecauseWeWantToPoly = false;
    if (nonRootCCForChainLength.length > 0) {
      shouldStopCastBecauseWeWantToPoly = nonRootCCForChainLength[0].remaining < castDuration;
    }

    if (
      playerCast &&
      playerCast.spell !== MageSpell.Polymorph &&
      playerCast.spell !== MageSpell.RingOfFrost &&
      playerCast.spell !== NightFaeSpell.ShiftingPower &&
      shouldStopCastBecauseWeWantToPoly
    ) {
      StopCast();
      UIStatusFrame.addMessage("Stopping cast of " + playerCast.spell + " in order to cast poly");
    }
  }

  private shouldDB(playerState: PlayerState): boolean {
    if (!playerState.isHealer()) {
      return false;
    }

    const dr = playerState.incapacitateDr();
    if (dr.drCount !== 0) {
      return false;
    }

    if (!playerState.canBeIncapacitated()) {
      return false;
    }

    const distance = WoWLua.DistanceFromUnit("player", playerState.unitId);
    if (distance > 12) {
      return false;
    }

    if (!WoWLua.IsUnitInOfLineOfSight("player", playerState.unitId)) {
      return false;
    }

    return true;
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
        this.stopCastIfNeeded(playerState, 1.8);
        return true;
      }

      if (
        cc.remaining >= 1.8 &&
        playerState.class === WoWClass.Druid &&
        !playerState.canBeIncapacitated()
      ) {
        this.stopCastIfNeeded(playerState, 1.8);
        return true;
      }

      if (!WoWLua.IsSpellUsable(MageSpell.Polymorph) && cc.remaining >= 1.8) {
        this.stopCastIfNeeded(playerState, 1.8);
        return true;
      }
    }

    return false;
  }

  private shouldPolyOnPump(playerState: PlayerState): Polymorph | null {
    if (PlayerHasAura(MageAura.Combustion)) {
      return null;
    }

    if (UnitHealthPercentage(playerState.unitId) <= 85) {
      return null;
    }

    if (!playerState.isPumping()) {
      return null;
    }

    if (this.shouldPoly(playerState)) {
      return new Polymorph({
        unitTarget: playerState.unitId,
        messageOnCast:
          "Polying " + playerState.getSpecInfoEnglish() + " because they are pumping dam.",
      });
    }

    return null;
  }

  private shouldPolyHealer(playerState: PlayerState): Polymorph | null {
    if (!playerState.isHealer()) {
      return null;
    }

    if (playerState.guid() === UnitGUID("target")) {
      return null;
    }

    // if combust CD is less than 25 do not poly.
    const combustCastable = WoWLua.IsSpellCastable(MageSpell.Combustion);

    if (combustCastable.usableIn < 23 && combustCastable.usableIn > 0) {
      return null;
    }

    const pumpingState = GetPumpingState();
    if (pumpingState === PumpingStatus.WarmingUp) {
      return null;
    }

    if (pumpingState === PumpingStatus.Pumping) {
      const fireBlastCharges = WoWLua.GetSpellChargesTyped(MageSpell.FireBlast);
      if (fireBlastCharges.currentCharges !== 0) {
        return null;
      }
    }

    if (this.shouldPoly(playerState)) {
      return new Polymorph({
        unitTarget: playerState.unitId,
        messageOnCast: "Polying " + playerState.getSpecInfoEnglish() + " as healer.",
      });
    }

    return null;
  }

  private shouldPolyOffTarget(playerState: PlayerState): Polymorph | null {
    // we should have got this poly off before, this is a dumb check
    // we should actually check to see if we've pumped all our dam out first
    // so check to see if we have 0 fire blast?
    if (PlayerHasAura(MageAura.Combustion)) {
      return null;
    }

    // // if I'm heating up and combust is off CD I don't want to now poly and ruin that
    // if (
    //   (PlayerHasAura(MageAura.HotStreak) || PlayerHasAura(MageAura.HeatingUp)) &&
    //   IsSpellUsable(MageSpell.Combustion)
    // ) {
    //   return false;
    // }

    // we don't want to waste poly DRs when they can pump big dam into us
    // save polys for when they're doing damage so we can negate as much dam as we can
    if (playerState.canPump(true)) {
      return null;
    }

    if (UnitHealthPercentage(playerState.unitId) <= 85) {
      return null;
    }

    if (UnitGUID(playerState.unitId) === UnitGUID("target")) {
      return null;
    }

    for (const teammate of ["party1", "party2", "party3"].map((x) => x + "target")) {
      if (UnitGUID(playerState.unitId) === UnitGUID(teammate as UnitId)) {
        return null;
      }
    }

    if (playerState.isHealer()) {
      return null;
    }

    if (this.shouldPoly(playerState)) {
      return new Polymorph({
        unitTarget: playerState.unitId,
        messageOnCast:
          "Polying " + playerState.getSpecInfoEnglish() + " as off target for cross CC.",
      });
    }

    return null;
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
      const auras = WoWLua.GetUnitAuras(player.unitId);
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
