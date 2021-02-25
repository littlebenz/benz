import { Pump, PumpingStatus } from "./cars/pump";
import { AlterTime } from "./cars/alter_time";
import { Barrier } from "./cars/barrier";
import { CC } from "./cars/cc";
import { Decurse } from "./cars/decurse";
import { FakeCast } from "./cars/fake_cast";
import { Interrupt } from "./cars/interrupt";
import { Spellstealer } from "./cars/spellstealer";
import { Block } from "./cars/block";
import { Waiting } from "./cars/waiting";
import { Car } from "./cars/car";
import {
  DistanceFromPoints,
  GetGroundZCoord,
  GetPlayerAura,
  PlayerFaction,
  WoWLua,
  GetBattlegroundPlayers,
} from "../wowutils/wow_utils";
import { MageAura, MageSpell } from "../state/utils/mage_utils";
import { Meteor } from "./spells/meteor";
import { PlayerState } from "../state/players/player_state";
import { PlayerStateFactory } from "../state/players/player_state_factory";
import { WowEventListener } from "../wow_event_listener";
import { Spell } from "./spells/ispell";
import { Stomper } from "./cars/stomper";
import { Blink } from "./spells/blink";
import { ClickClickBoom } from "./cars/clickclickboom";
import { UnitReaction } from "../wowutils/unlocked_functions";
import { UnitId } from "@wartoshika/wow-declarations";

export class Mage {
  pump: Pump;
  alterTime: AlterTime;
  shield: Barrier;
  spellsteal: Spellstealer;
  interrupt: Interrupt;
  fakeCast: FakeCast;
  decurse: Decurse;
  cc: CC;
  block: Block;
  waiting: Waiting;
  stomper: Stomper;
  clickclickboom: ClickClickBoom;

  private wowEventListener: WowEventListener;

  private playerMap = new Map<string, PlayerState>();

  constructor(wowEventListener: WowEventListener) {
    this.pump = new Pump(() => this.getEnemies());
    this.alterTime = new AlterTime(() => this.getEnemies());
    this.shield = new Barrier();
    this.cc = new CC(() => this.getEnemies());
    this.decurse = new Decurse();
    this.fakeCast = new FakeCast();
    this.interrupt = new Interrupt(() => this.getEnemies());
    this.spellsteal = new Spellstealer(() => this.getEnemies(false));
    this.block = new Block();
    this.waiting = new Waiting();
    this.stomper = new Stomper(() => this.getEnemies());
    this.clickclickboom = new ClickClickBoom(() => this.getEnemies());

    this.wowEventListener = wowEventListener;
  }

  getNextAction() {
    if (WoWLua.GetAuraRemainingTime(GetPlayerAura(MageAura.Invisibility)) !== 0) {
      return null;
    }

    const blockSpell = this.block.getNextSpell();
    if (this.shouldReturnSpell(blockSpell)) {
      return blockSpell;
    }

    const interruptSpell = this.interrupt.getNextSpell();
    if (interruptSpell) {
      return interruptSpell;
    }

    const spellSteal = this.spellsteal.getNextSpell();
    if (this.shouldReturnSpell(spellSteal)) {
      return spellSteal;
    }

    const alterTime = this.alterTime.getNextSpell();
    if (this.shouldReturnSpell(alterTime)) {
      return alterTime;
    }

    const stomper = this.stomper.getNextSpell();
    if (this.shouldReturnSpell(stomper)) {
      return stomper;
    }

    const shield = this.shield.getNextSpell();
    if (this.shouldReturnSpell(shield)) {
      return shield;
    }

    const decurse = this.decurse.getNextSpell();
    if (this.shouldReturnSpell(decurse)) {
      return decurse;
    }

    const ccb = this.clickclickboom.getNextSpell();
    if (this.shouldReturnSpell(ccb)) {
      return ccb;
    }

    const cc = this.cc.getNextSpell();
    if (this.shouldReturnSpell(cc)) {
      return cc;
    }

    const target = this.getEnemies().find((x) => UnitGUID("target") === x.guid());
    const reaction = UnitReaction("player", "target");

    if ((!target || target.shouldDamage()) && reaction && reaction < 5) {
      const pump = this.pump.getNextSpell();
      if (this.shouldReturnSpell(pump)) {
        return pump;
      }
    }

    const waiting = this.waiting.getNextSpell();
    if (this.shouldReturnSpell(waiting)) {
      return waiting;
    }

    return null;
  }

  updateArenaUnitsIfChanged() {
    const enemyGuids: string[] = ["arena1", "arena2", "arena3"].map((x) => UnitGUID(x as any));

    const [playerFaction] = UnitFactionGroup("player");
    let faction: PlayerFaction = PlayerFaction.Neutral;
    if (playerFaction === "Alliance") {
      faction = PlayerFaction.Alliance;
    } else if (playerFaction === "Horde") {
      faction = PlayerFaction.Horde;
    }

    const bgUnits = GetBattlegroundPlayers(faction).map((x) => x.guid);
    enemyGuids.push(...bgUnits);

    for (const enemyGuid of enemyGuids) {
      if (this.playerMap.has(enemyGuid)) {
        if (this.playerMap.get(enemyGuid).guid() !== enemyGuid) {
          const maybePlayerState = PlayerStateFactory.create(
            SetMouseOver(enemyGuid) as any,
            this.wowEventListener
          );
          if (maybePlayerState) {
            this.playerMap.set(enemyGuid, maybePlayerState);
          }
        }
      } else {
        const maybePlayerState = PlayerStateFactory.create(
          SetMouseOver(enemyGuid) as any,
          this.wowEventListener
        );
        if (maybePlayerState) {
          this.playerMap.set(enemyGuid, maybePlayerState);
        }
      }
    }
  }

  blinkPolyPosition(playerGuid: string) {
    const [playerX, playerY, playerZ] = GetUnitPosition("player");
    const [targetX, targetY, targetZ] = GetUnitPosition(playerGuid);
    if (!playerX || !playerZ || !playerZ || !targetX || !targetY || !targetZ) {
      return null;
    }
    const losFlags = bit.bor(0x10, 0x100, 0x1);

    let blinkPositions = [];
    for (let i = 0; i < math.pi * 2; i += (math.pi * 2) / 48) {
      const x = 20 * math.cos(i) + playerX;
      const y = 20 * math.sin(i) + playerY;
      const z = GetGroundZCoord(x, y);

      const distance = DistanceFromPoints(targetX, targetY, targetZ, x, y, playerZ);
      if (distance <= 28) {
        const [blinkHit, collisionX, collisionY, collisionZ] = TraceLine(
          x,
          y,
          z,
          playerX,
          playerY,
          playerZ + 2,
          losFlags
        );

        if (blinkHit === 0) {
          const [hit] = TraceLine(targetX, targetY, targetZ + 2.25, x, y, playerZ + 2.25, losFlags);
          if (hit === 0) {
            blinkPositions.push({
              i,
              x,
              y,
              z: playerZ,
              distance,
            });
          }
        } else if (blinkHit === 1) {
          const [hit] = TraceLine(
            targetX,
            targetY,
            targetZ + 2.25,
            collisionX,
            collisionY,
            collisionZ + 2.25,
            losFlags
          );
          if (hit === 0) {
            blinkPositions.push({
              i,
              x: collisionX,
              y: collisionY,
              z: collisionZ,
              distance,
            });
          }
        }
      }
    }

    blinkPositions = blinkPositions
      .filter((x) => math.abs(playerZ - x.z) <= 2)
      .sort((a, b) => math.abs(20 - b.distance - a.distance));

    if (blinkPositions.length > 0) {
      // is this sort inplace? whatever, just reassign it anyways

      // todo find a blink position that is still in LOS of healer
      return new Blink(blinkPositions[0].i);
    }

    return null;
  }

  private shouldReturnSpell(spell: Spell | null) {
    return spell && spell.canCastSpell();
  }

  private getEnemies(los: boolean = true) {
    // return [this.arena1, this.arena2, this.arena3].filter(
    //   (x) =>
    //     x !== null &&
    //     !UnitIsDead(x.unitId) &&
    //     UnitIsPlayer(x.unitId) &&
    //     (los ? WoWLua.IsUnitInOfLineOfSight("player", x.unitId) : true)
    // ) as PlayerState[];
    const enemies = [];
    for (const player of this.playerMap.values()) {
      if (!UnitIsDead(player.unitId) && UnitIsPlayer(player.unitId) && IsGuid(player.guid())) {
        if (los) {
          if (WoWLua.IsUnitInOfLineOfSight("player", player.unitId)) {
            enemies.push(player);
          }
        } else {
          enemies.push(player);
        }
      }
    }
    return enemies;
  }
}
