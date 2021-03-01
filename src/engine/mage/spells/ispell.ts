import {
  FaceUnit,
  GetSpellInfoTyped,
  StopCast,
  UnitCastOrChannel,
  WoWLua,
} from "../../wowutils/wow_utils";
import { MageSpell } from "../../state/utils/mage_utils";
import { CastSpellByName } from "../../wowutils/unlocked_functions";
import { UnitId } from "@wartoshika/wow-declarations";
import { StatusFrame, UIStatusFrame } from "../../ui/status_frame";

let lastUpdatedDirection: number = 0;
export interface SpellParameters {
  unitTarget?: UnitId;
  afterCast?: () => void;
  messageOnCast?: string;
  shouldStopCasting?: () => boolean;
}

export abstract class Spell {
  abstract isOnGCD: boolean;
  abstract isInstant: boolean;
  abstract spellName: MageSpell;
  abstract isSelfCast: boolean;

  targetGuid: string;
  protected castTime() {
    return GetSpellInfoTyped(this.spellName).castTime;
  }

  protected afterCast: () => void;
  protected shouldStopCasting: () => boolean;
  protected messageOnCast: string | undefined;
  protected castDoneAt: number | null;

  constructor(parameters?: SpellParameters) {
    if (!parameters) {
      parameters = {};
    }

    const afterCast = parameters.afterCast ? parameters.afterCast : () => {};
    const shouldStopCasting = parameters.shouldStopCasting
      ? parameters.shouldStopCasting
      : () => false;

    this.targetGuid = parameters.unitTarget ? UnitGUID(parameters.unitTarget) : UnitGUID("target");
    this.afterCast = () => afterCast();
    this.shouldStopCasting = () => shouldStopCasting();
    this.messageOnCast = parameters.messageOnCast;
    this.castDoneAt = null;
  }

  cast() {
    if (GetTime() - lastUpdatedDirection > 0.5) {
      lastUpdatedDirection = GetTime();
      const direction = UnitFacing("player" as string);
      UpdateMovement();
      FaceUnit(this.targetGuid);
      UpdateMovement();

      CastSpellByName(this.spellName, this.targetGuid);

      UpdateMovement();
      FaceDirection(direction);
      UpdateMovement();
    } else {
      CastSpellByName(this.spellName, this.targetGuid);
    }

    C_Timer.After(0.25, () => {
      const cast = WoWLua.UnitCastingInfoTypedCacheBusted("player");
      if (cast) {
        this.castDoneAt = cast.endTimeMS / 1000;
        this.checkStopCast();
      }
    });

    if (this.messageOnCast) {
      UIStatusFrame.addMessage(this.messageOnCast);
    }

    this.afterCast();
  }

  canCastSpell() {
    if (!this.isSelfCast) {
      if (!WoWLua.IsUnitInOfLineOfSight("player", SetMouseOver(this.targetGuid))) {
        return false;
      }

      if (IsSpellInRange(this.spellName, SetMouseOver(this.targetGuid)) === 0) {
        return false;
      }
    }

    const spellUsable = WoWLua.IsSpellUsable(this.spellName);

    return spellUsable;
  }

  private checkStopCast() {
    if (this.shouldStopCasting()) {
      StopCast();
      return;
    }

    if (this.castDoneAt !== null && this.castDoneAt > GetTime()) {
      C_Timer.After(0.25, () => {
        this.checkStopCast();
      });
    }
  }
}
