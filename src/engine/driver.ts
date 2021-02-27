import { UnitId } from "@wartoshika/wow-declarations";
import { Mage } from "./mage/fire_mage";
import { Blink } from "./mage/spells/blink";
import { MageSpell } from "./state/utils/mage_utils";
import { StatusFrame, UIStatusFrame } from "./ui/status_frame";
import { FaceUnit, WoWLua } from "./wowutils/wow_utils";
import { WowEventListener } from "./wow_event_listener";

declare let benzFrameNumber: number;
benzFrameNumber = 0;

export class Driver {
  private mage: Mage;
  private wowEventListener: WowEventListener;
  private lastTargetGuid: string | null = null;
  private waitUntilForNextAction: number = 0;

  constructor() {
    this.wowEventListener = new WowEventListener();
    this.mage = new Mage(this.wowEventListener);
  }

  start() {
    const actionFrame = CreateFrame("Frame", "ActionFrame");
    actionFrame.SetScript("OnUpdate", () => {
      if (!benz_rotation_enabled) {
        return;
      }
      benzFrameNumber++;

      this.mage.updateArenaUnitsIfChanged();

      const castingInfo = WoWLua.UnitCastingInfoTyped("player");
      if (castingInfo) {
        this.waitUntilForNextAction = castingInfo.endTimeMS;
        if (
          castingInfo.spell === MageSpell.Polymorph &&
          castingInfo.castTimeRemaining <= 0.3 &&
          this.lastTargetGuid &&
          ((IsGuid(this.lastTargetGuid) &&
            !WoWLua.IsUnitInOfLineOfSight("player", SetMouseOver(this.lastTargetGuid))) ||
            WoWLua.DistanceFromUnit("player", SetMouseOver(this.lastTargetGuid)) > 30)
        ) {
          const blink = this.mage.blinkPolyPosition(this.lastTargetGuid);
          if (blink && blink.canCastSpell()) {
            blink.cast();
          }
        } else if (castingInfo.castTimeRemaining <= 0.4 && this.lastTargetGuid) {
          // FaceUnit(this.lastTargetGuid);
        }
      } else if (GetTime() * 1000 <= this.waitUntilForNextAction) {
        this.waitUntilForNextAction = 0;
      }

      const nextAction = this.mage.getNextAction();
      if (nextAction) {
        if (nextAction.isOnGCD) {
          if (GetTime() * 1000 >= this.waitUntilForNextAction + 100) {
            nextAction.cast();
          }
        } else {
          nextAction.cast();
        }
        this.lastTargetGuid = nextAction.targetGuid;
      }
    });

    const combatLogFrame = CreateFrame("Frame");
    combatLogFrame.RegisterEvent("COMBAT_LOG_EVENT_UNFILTERED");
    combatLogFrame.SetScript("OnEvent", () => {
      const eventObject = WoWLua.GetCurrentEventLogInfo();

      this.wowEventListener.parse(eventObject);
    });

    const arenaLoadFrame = CreateFrame("Frame", "ArenaLoadFrame");
    arenaLoadFrame.RegisterEvent("ADDON_LOADED");
    arenaLoadFrame.SetScript("OnEvent", (frame, eventName, ...args: any[]) => {
      if (eventName === "ADDON_LOADED" && args[0] === "Blizzard_ArenaUI") {
        this.mage = new Mage(this.wowEventListener);
      }
    });
  }
}
