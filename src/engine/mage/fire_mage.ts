import { Pump } from "./cars/pump";
import { GetPumpingState, PumpingStatus, SetPumpingState } from "../state/utils/pumping_status";
import { AutoAlterTime } from "./cars/alter_time";
import { Barrier } from "./cars/barrier";
import { CC } from "./cars/cc";
import { Decurse } from "./cars/decurse";
import { FakeCast } from "./cars/fake_cast";
import { Interrupt } from "./cars/interrupt";
import { Spellstealer } from "./cars/spellstealer";
import { Block } from "./cars/block";
import { Waiting } from "./cars/waiting";
import {
  DistanceFromPoints,
  GetGroundZCoord,
  GetPlayerAura,
  PlayerHasAura,
  WoWLua,
} from "../wowutils/wow_utils";
import { MageAura, MageSpell } from "../state/utils/mage_utils";
import { PlayerState } from "../state/players/player_state";
import { PlayerStateFactory } from "../state/players/player_state_factory";
import { WowEventListener } from "../wow_event_listener";
import { Spell } from "./spells/ispell";
import { Stomper } from "./cars/stomper";
import { Blink } from "./spells/blink";
import { ClickClickBoom } from "./cars/clickclickboom";
import { UnitReaction } from "../wowutils/unlocked_functions";
import { NightFaeAura } from "../state/utils/night_fae_utils";
import { UIStatusFrame } from "../ui/status_frame";
import { Meteor } from "./spells/meteor";

export class Mage {
  pump: Pump;
  alterTime: AutoAlterTime;
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
  private canCastAt: number | null = null;

  arena1: PlayerState | null;
  arena2: PlayerState | null;
  arena3: PlayerState | null;

  party1: PlayerState | null;
  party2: PlayerState | null;

  player: PlayerState;

  constructor(wowEventListener: WowEventListener) {
    this.arena1 = PlayerStateFactory.create("arena1", wowEventListener);
    this.arena2 = PlayerStateFactory.create("arena2", wowEventListener);
    this.arena3 = PlayerStateFactory.create("arena3", wowEventListener);

    this.party1 = PlayerStateFactory.create("party1", wowEventListener);
    this.party2 = PlayerStateFactory.create("party2", wowEventListener);
    this.player = PlayerStateFactory.create("player", wowEventListener)!;

    this.pump = new Pump(() => this.getEnemies());
    this.alterTime = new AutoAlterTime(
      () => this.getEnemies(),
      () => this.getAllies()
    );
    this.shield = new Barrier(() => this.getAllies());
    this.cc = new CC(() => this.getEnemies());
    this.decurse = new Decurse();
    this.fakeCast = new FakeCast(
      (time: number) => {
        this.canCastAt = time;
      },
      () => this.getEnemies(false)
    );
    this.interrupt = new Interrupt(() => this.getEnemies());
    this.spellsteal = new Spellstealer(() => this.getEnemies(false));
    this.block = new Block();
    this.waiting = new Waiting();
    this.stomper = new Stomper(() => this.getEnemies());
    this.clickclickboom = new ClickClickBoom(() => this.getEnemies());

    this.wowEventListener = wowEventListener;
  }

  getNextAction() {
    this.updatePumpingStatus();

    if (PlayerHasAura(MageAura.Invisibility) || PlayerHasAura(NightFaeAura.Podtender)) {
      return null;
    }

    if (UnitGUID("target") !== null) {
      return new Meteor({
        unitTarget: "target",
      });
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

    const fakeCast = this.fakeCast.getNextSpell();
    if (this.shouldReturnSpell(fakeCast)) {
      return fakeCast;
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
    const arena1Name = this.arena1 ? this.arena1.name : null;
    const arena2Name = this.arena2 ? this.arena2.name : null;
    const arena3Name = this.arena3 ? this.arena3.name : null;

    const party1Name = this.party1 ? this.party1.name : null;
    const party2Name = this.party2 ? this.party2.name : null;

    if (GetUnitName("arena1", true) !== arena1Name) {
      this.arena1 = PlayerStateFactory.create("arena1", this.wowEventListener);
    }

    if (GetUnitName("arena2", true) !== arena2Name) {
      this.arena2 = PlayerStateFactory.create("arena2", this.wowEventListener);
    }

    if (GetUnitName("arena3", true) !== arena3Name) {
      this.arena3 = PlayerStateFactory.create("arena3", this.wowEventListener);
    }

    if (GetUnitName("party1", true) !== party1Name) {
      this.party1 = PlayerStateFactory.create("party1", this.wowEventListener);
    }

    if (GetUnitName("party2", true) !== party2Name) {
      this.party2 = PlayerStateFactory.create("party2", this.wowEventListener);
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
      return new Blink({ direction: blinkPositions[0].i });
    }

    return null;
  }

  private shouldReturnSpell(spell: Spell | null) {
    if (!spell) {
      return false;
    }

    if (!spell.canCastSpell()) {
      return false;
    }

    if (this.canCastAt && !spell.isInstant && this.canCastAt > GetTime()) {
      return false;
    }

    return true;
  }

  private getEnemies(los: boolean = true) {
    return [this.arena1, this.arena2, this.arena3].filter(
      (x) =>
        x !== null &&
        !UnitIsDead(x.unitId) &&
        UnitIsPlayer(x.unitId) &&
        (los ? WoWLua.IsUnitInOfLineOfSight("player", x.unitId) : true)
    ) as PlayerState[];
  }

  private getAllies() {
    return [this.party1, this.party2].filter(
      (x) => x !== null && !UnitIsDead(x.unitId) && UnitIsPlayer(x.unitId)
    ) as PlayerState[];
  }

  private updatePumpingStatus() {
    if (PlayerHasAura(MageAura.Combustion)) {
      SetPumpingState(PumpingStatus.Pumping);
    } else if (!WoWLua.IsSpellUsable(MageSpell.Combustion) && !PlayerHasAura(MageAura.Combustion)) {
      SetPumpingState(PumpingStatus.Dumped);
    } else if (WoWLua.IsSpellUsable(MageSpell.Combustion)) {
      const fireBlastCharges = WoWLua.GetSpellChargesTyped(MageSpell.FireBlast);
      const hotStreak = GetPlayerAura(MageAura.HotStreak);
      if (hotStreak && fireBlastCharges.maxCharges === fireBlastCharges.currentCharges) {
        SetPumpingState(PumpingStatus.Hot);
      } else {
        SetPumpingState(PumpingStatus.WarmingUp);
      }
    }

    UIStatusFrame.pumpStatus(GetPumpingState());
    UIStatusFrame.arenaStatus(this.getEnemies(false));
  }
}
