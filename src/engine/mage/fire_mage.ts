import { Kite } from "./cars/kite";
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
  GetAuraRemainingTime,
  GetPlayerAura,
  IsSpellUsable,
  IsUnitInOfLineOfSight,
} from "../wowutils/wow_utils";
import { MageAura, MageSpell } from "../state/utils/mage_utils";
import { Meteor } from "./spells/meteor";
import { PlayerState } from "../state/players/player_state";
import { PlayerStateFactory } from "../state/players/player_state_factory";
import { WowEventListener } from "../wow_event_listener";
import { Spell } from "./spells/ispell";
import { Stomper } from "./cars/stomper";
import { Blink } from "./spells/blink";
import { UnitReaction } from "../wowutils/unlocked_functions";
import { ClickClickBoom } from "./cars/clickclickboom";
import { RingOfFrost } from "./spells/ring_of_frost";

export class Mage {
  pump: Pump;
  alterTime: AlterTime;
  shield: Barrier;
  kite: Kite;
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

  arena1: PlayerState | null;
  arena2: PlayerState | null;
  arena3: PlayerState | null;

  constructor(wowEventListener: WowEventListener) {
    this.arena1 = PlayerStateFactory.create("arena1", wowEventListener);
    this.arena2 = PlayerStateFactory.create("arena2", wowEventListener);
    this.arena3 = PlayerStateFactory.create("arena3", wowEventListener);

    this.pump = new Pump(() => this.getEnemies());
    this.alterTime = new AlterTime(() => this.getEnemies());
    this.shield = new Barrier();
    this.cc = new CC(() => this.getEnemies());
    this.decurse = new Decurse();
    this.fakeCast = new FakeCast();
    this.interrupt = new Interrupt(() => this.getEnemies());
    this.spellsteal = new Spellstealer(() => this.getEnemies(false));
    this.kite = new Kite(() => this.getEnemies());
    this.block = new Block();
    this.waiting = new Waiting();
    this.stomper = new Stomper(() => this.getEnemies());
    this.clickclickboom = new ClickClickBoom(() => this.getEnemies());

    this.wowEventListener = wowEventListener;
  }

  getNextAction() {
    if (GetAuraRemainingTime(GetPlayerAura(MageAura.Invisibility)) !== 0) {
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
    if (cc && cc.spellName === MageSpell.RingOfFrost) {
      console.log("return cc?");
      console.log(cc.canCastSpell());
    }
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
    const arena1Name = this.arena1 ? this.arena1.name : null;
    const arena2Name = this.arena2 ? this.arena2.name : null;
    const arena3Name = this.arena3 ? this.arena3.name : null;

    if (GetUnitName("arena1", true) !== arena1Name) {
      this.arena1 = PlayerStateFactory.create("arena1", this.wowEventListener);
    }

    if (GetUnitName("arena2", true) !== arena2Name) {
      this.arena2 = PlayerStateFactory.create("arena2", this.wowEventListener);
    }

    if (GetUnitName("arena3", true) !== arena3Name) {
      this.arena3 = PlayerStateFactory.create("arena3", this.wowEventListener);
    }
  }

  blinkPolyPosition(playerGuid: string) {
    const [playerX, playerY, playerZ] = GetUnitPosition("player");
    const [targetX, targetY, targetZ] = GetUnitPosition(playerGuid);
    if (!playerX || !playerZ || !playerZ || !targetX || !targetY || !targetZ) {
      return null;
    }
    // very simple check to see if we can blink poly 365 degrees
    const losFlags = bit.bor(0x10, 0x100, 0x1);

    for (let i = 0; i <= 360; i++) {
      const x = 20 * math.cos(i) + playerX;
      const y = 20 * math.sin(i) + playerY;

      const distance = math.sqrt(math.pow(playerX - x, 2) + math.pow(playerY - y, 2));
      if (distance <= 40) {
        const [blinkHit] = TraceLine(
          playerX,
          playerY,
          playerZ + 2.25,
          x,
          y,
          playerZ + 2.25,
          losFlags
        );

        if (blinkHit === 0) {
          const [hit] = TraceLine(x, y, playerZ + 2.25, targetX, targetY, targetZ + 2.25, losFlags);
          if (hit === 0) {
            FaceDirection(i);
            return new Blink();
          }
        }
      }
    }

    return null;
  }

  private shouldReturnSpell(spell: Spell | null) {
    return spell && spell.canCastSpell();
  }

  private getEnemies(los: boolean = true) {
    return [this.arena1, this.arena2, this.arena3].filter(
      (x) =>
        x !== null &&
        !UnitIsDead(x.unitId) &&
        UnitIsPlayer(x.unitId) &&
        (los ? IsUnitInOfLineOfSight("player", x.unitId) : true)
    ) as PlayerState[];
  }
}
