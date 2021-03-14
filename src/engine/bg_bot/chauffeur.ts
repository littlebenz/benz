import { PlayerState } from "../state/players/player_state";
import { PlayerStateFactory } from "../state/players/player_state_factory";
import { Point } from "../state/utils/point";
import {
  AcceptBattlefieldPort,
  CastSpellByName,
  ClearTarget,
  JoinBattlefield,
  TargetUnit,
  UnitReaction,
} from "../wowutils/unlocked_functions";
import {
  DistanceFromPoints,
  FaceUnit,
  GetInstanceInfoTyped,
  PlayerHasAura,
  UnitCastOrChannel,
  WoWLua,
} from "../wowutils/wow_utils";
import { CommonAura } from "../state/utils/common_utils";
import { WowEventListener } from "../wow_event_listener";

export let ChauffeurPoint: Point | null = null;
declare namespace TimerTrackerTimer1 {
  const time: number;
}

export class Chauffeur {
  private player: PlayerState;
  private goalPoint: Point | null;
  private nodeIndex: number;
  private movingToPoint: Point | null;
  private mountId: number | null;
  private lastLookedAtTarget: number;

  constructor(wowEventListener: WowEventListener) {
    this.player = PlayerStateFactory.create("player", wowEventListener)!;
    this.goalPoint = null;
    this.movingToPoint = null;
    this.nodeIndex = 1;
    this.mountId = null;
    this.lastLookedAtTarget = GetTime();
  }

  cycle() {
    ResetHardwareAction();

    if (!this.canMove()) {
      this.maybeJoinBG();
      return;
    }

    const checks = [() => this.shouldMoveToTarget(), () => this.shouldMoveToGroup()];
    for (const check of checks) {
      const maybePosition = check();
      if (maybePosition !== null) {
        this.updateGoal(maybePosition);
        break;
      }
    }

    if (this.maybeMount()) {
      if (this.mountId === null) {
        this.findMount();
      }

      if (this.mountId !== null) {
        const [spell] = GetSpellInfo(this.mountId);
        CastSpellByName(spell);
        return;
      }
    }

    if (!UnitIsDead("target") && GetTime() - this.lastLookedAtTarget > 0.3) {
      UpdateMovement();
      FaceUnit("target");
      UpdateMovement();
      this.lastLookedAtTarget = GetTime();
    }

    this.maybeTarget();
    this.moveToGoal();
  }

  private maybeJoinBG() {
    if (PlayerHasAura(CommonAura.Deserter)) {
      return;
    }

    const [status] = GetBattlefieldStatus(1);
    if (status === "confirm") {
      AcceptBattlefieldPort(1, true);
      return;
    } else if (status === "queued") {
      return;
    } else if (status === "active") {
      return;
    } else if (status === "none") {
      if (UnitInBattleground("player") === null) {
        JoinBattlefield(32);
      }
    }

    if (GetBattlefieldWinner() !== null) {
      LeaveBattlefield();
    }
  }

  private findMount() {
    // for (let i = 0; i < 10000; i++) {
    //   const [, spellId, , , usable] = C_MountJournal.GetMountInfoByID(i);
    //   if (usable) {
    //     this.mountId = spellId;
    //   }
    // }

    this.mountId = 253004;
  }

  private maybeTarget() {
    if (UnitIsDead("target")) {
      ClearTarget();
    }

    let players = [];
    for (let i = 1; i <= GetNumGroupMembers(); i++) {
      players.push("raid" + i);
    }

    const playersNearby = [];
    for (const player of players) {
      if (WoWLua.DistanceFromUnit("player", player) <= 25) {
        playersNearby.push(player);
      }
    }

    const targetUnitByCount = new Map<string, number>();
    for (const player of playersNearby) {
      const target = UnitGUID((player + "target") as any);
      const reaction = UnitReaction("player", SetMouseOver(target));
      if (reaction && reaction < 5 && WoWLua.DistanceFromUnit("player", target) <= 65) {
        if (!targetUnitByCount.has(target)) {
          targetUnitByCount.set(target, 0);
        }

        targetUnitByCount.set(target, targetUnitByCount.get(target)! + 1);
      }
    }

    let mostTargetted = null;
    let targettedTimes = 0;
    for (const [target, amount] of targetUnitByCount) {
      if (amount > targettedTimes) {
        mostTargetted = target;
        targettedTimes = amount;
      }
    }

    if (mostTargetted !== null) {
      TargetUnit(mostTargetted);
    }
  }

  private getNextNodePoint() {
    const [playerX, playerY, playerZ] = GetUnitPosition("player");
    const [x, y, z] = GetActiveNodeByIndex(this.nodeIndex);
    const distanceToNextPoint = DistanceFromPoints(x, y, playerZ, playerX, playerY, playerZ);

    if (distanceToNextPoint > 3) {
      return new Point(x, y, z);
    }

    if (this.nodeIndex >= 1 && this.nodeIndex < GetActiveNodeCount()) {
      this.nodeIndex++;
      return new Point(x, y, z);
    }

    return null;
  }

  private maybeMount() {
    if (IsIndoors()) {
      return false;
    }
    if (UnitAffectingCombat("player")) {
      return false;
    }

    const [, maxSpeed] = GetUnitSpeed("player");
    if (maxSpeed > 7) {
      return false;
    }

    return true;
  }

  private moveToGoal() {
    const nextPoint = this.getNextNodePoint();
    if (nextPoint === null) {
      return;
    }

    const [speed] = GetUnitSpeed("player");
    if (!nextPoint.equals(this.movingToPoint) || speed === 0) {
      this.movingToPoint = nextPoint;
      console.log(nextPoint.x, nextPoint.y, nextPoint.z);
      ChauffeurPoint = nextPoint;
      MoveTo(nextPoint.x, nextPoint.y, nextPoint.z);
    }
  }

  private canMove() {
    const casting = UnitCastOrChannel("player");
    if (casting !== null) {
      return false;
    }

    if (UnitIsDead("player")) {
      RepopMe();
      return false;
    }

    if (UnitIsDeadOrGhost("player")) {
      this.nodeIndex = GetActiveNodeCount() + 1;
      return false;
    }

    if (UnitInBattleground("player") === null) {
      return false;
    }

    if (
      TimerTrackerTimer1 !== null &&
      TimerTrackerTimer1.time !== null &&
      TimerTrackerTimer1.time >= 45
    ) {
      return false;
    }

    const distanceToTarget = WoWLua.DistanceFromUnit("player", "target");
    if (
      distanceToTarget <= this.player.minimumRange() &&
      WoWLua.IsUnitInOfLineOfSight("player", "target")
    ) {
      return false;
    }

    return true;
  }

  private shouldMoveToGroup() {
    // const [x, y, z] = GetUnitPosition("player");
    // if (this.nodeIndex !== GetActiveNodeCount()) {
    //   const [a, b, c] = GetActiveNodeByIndex(this.nodeIndex);
    //   const distance = DistanceFromPoints(x, y, z, a, b, c);
    //   if (distance < 5) {
    //     return null;
    //   }
    // }

    const clusters = WoWLua.FindPlayerClusters();

    // const dist = DistanceFromPoints(x, y, z, clusters.x, clusters.y, clusters.z);

    // if (dist <= this.player.minimumRange()) {
    //   return null;
    // }

    return new Point(clusters.x, clusters.y, clusters.z);
  }

  private shouldMoveToTarget() {
    const target = UnitGUID("target");

    if (!IsGuid(target) || UnitIsDead("target")) {
      return null;
    }

    if (!WoWLua.IsUnitInOfLineOfSight("player", "target")) {
      return null;
    }

    const [x, y, z] = GetUnitPosition("target");
    return new Point(x, y, z);
  }

  private updateGoal(point: Point) {
    if (this.goalPoint === null) {
      this.goalPoint = point;
    } else {
      const distanceFromGoal = DistanceFromPoints(
        point.x,
        point.y,
        point.z,
        this.goalPoint.x,
        this.goalPoint.y,
        this.goalPoint.z
      );

      if (distanceFromGoal > 2) {
        this.goalPoint = point;
      } else {
        return;
      }
    }

    const instanceInfo = GetInstanceInfoTyped();
    const [x, y, z] = GetUnitPosition("player");
    FindPath(
      instanceInfo.instanceID,
      x,
      y,
      z,
      this.goalPoint.x,
      this.goalPoint.y,
      this.goalPoint.z,
      false,
      false
    );
    this.nodeIndex = 1;
  }
}
