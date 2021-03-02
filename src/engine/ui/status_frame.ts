import { Frame, FontString } from "@wartoshika/wow-declarations";
import { PlayerState } from "../state/players/player_state";
import { GetKillTarget } from "../state/utils/kill_target_utils";
import { MageAura, MageSpell } from "../state/utils/mage_utils";
import { PumpingStatus } from "../state/utils/pumping_status";
import { GetPlayerAura, SpellCooldownRemainingSeconds, WoWLua } from "../wowutils/wow_utils";

class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class StatusFrame {
  private frame: Frame;
  private fontString: FontString;
  private framePoint: Point;

  private arenaFrame: Frame;
  private arenaFrameString: FontString;
  private arenaFramePoint: Point;

  private pumpFrame: Frame;
  private pumpFontString: FontString;
  private pumpFramePoint: Point;

  private messages: string[] = [];
  private lastMessage: string = "";

  moving: boolean;

  constructor() {
    const points = ReadFile(GetExeDirectory() + "coords.txt")
      .split("\n")
      .map((c) => new Point(parseInt(c.split(",")[0]), parseInt(c.split(",")[1])));
    this.frame = CreateFrame("Frame", "BenzStatusFrame", UIParent, "BackdropTemplate");
    this.framePoint = points[0];
    this.frame.SetPoint("CENTER", this.framePoint.x, this.framePoint.y);

    this.pumpFrame = CreateFrame("Frame", "BenzPumpFrame", UIParent, "BackdropTemplate");
    this.pumpFramePoint = points[1];
    this.pumpFrame.SetPoint("CENTER", this.pumpFramePoint.x, this.pumpFramePoint.y);

    this.arenaFrame = CreateFrame("Frame", "BenzArneaFrame", UIParent, "BackdropTemplate");
    this.arenaFramePoint = points[2];
    this.arenaFrame.SetPoint("CENTER", this.arenaFramePoint.x, this.arenaFramePoint.y);

    this.moving = false;

    const frames = [this.frame, this.pumpFrame, this.arenaFrame];
    for (const frame of frames) {
      frame.SetWidth(250);
      frame.SetHeight(50);

      frame.SetMovable(false);
      frame.EnableMouse(false);
    }

    this.fontString = this.frame.CreateFontString("BenzFontString", "ARTWORK");
    this.fontString.SetFont("Fonts\\ARIALN.ttf", 24, "OUTLINE");
    this.fontString.SetPoint("CENTER", 0, 0);

    this.pumpFontString = this.pumpFrame.CreateFontString("BenzFontString", "ARTWORK");
    this.pumpFontString.SetFont("Fonts\\ARIALN.ttf", 24, "OUTLINE");
    this.pumpFontString.SetPoint("CENTER", 0, 0);

    this.arenaFrameString = this.arenaFrame.CreateFontString("BenzFontString", "ARTWORK");
    this.arenaFrameString.SetFont("Fonts\\ARIALN.ttf", 24, "OUTLINE");
    this.arenaFrameString.SetPoint("CENTER", 0, 0);
    this.arenaFrameString.SetJustifyH("LEFT");

    this.arenaFrameString.SetText("Kill Target: " + Benz_KillTarget);
  }

  show() {
    // this.frame.Show();
    this.fontString.Show();
  }

  hide() {
    this.fontString.Hide();
  }

  addMessage(message: string) {
    if (this.lastMessage === message) {
      return;
    }

    const messageWithTimestamp = message + "#" + GetTime();
    this.messages.push(messageWithTimestamp);
    C_Timer.After(5, () => {
      this.messages = this.messages.filter((x) => x !== messageWithTimestamp);
      this.updateFrame();
    });

    this.updateFrame();
    this.lastMessage = message;
  }

  pumpStatus(pumpStatus: PumpingStatus) {
    let pumpStatusString = "";
    if (pumpStatus === PumpingStatus.Dumped) {
      const combustion = WoWLua.IsSpellCastable(MageSpell.Combustion);
      pumpStatusString =
        "|cff878787Dumped for " + math.ceil(SpellCooldownRemainingSeconds(combustion));
    } else if (pumpStatus === PumpingStatus.Pumping) {
      pumpStatusString = "|cffff5042Pumping";
    } else if (pumpStatus === PumpingStatus.WarmingUp) {
      const fireBlastCharges = WoWLua.GetSpellChargesTyped(MageSpell.FireBlast);

      if (fireBlastCharges.maxCharges - 1 === fireBlastCharges.currentCharges) {
        pumpStatusString =
          "|cffffae42Warming Up in " +
          math.ceil(
            math.abs(GetTime() - fireBlastCharges.cooldownStart - fireBlastCharges.cooldownDuration)
          );
      } else {
        pumpStatusString = "|cffffae42Warming Up";
      }
    } else if (pumpStatus === PumpingStatus.Hot) {
      const hotstreak = GetPlayerAura(MageAura.HotStreak);
      pumpStatusString = "|cffffae42Hot for " + math.ceil(WoWLua.GetAuraRemainingTime(hotstreak));
    }

    this.pumpFontString.SetText(pumpStatusString);
  }

  arenaStatus(arenaPlayers: PlayerState[]) {
    // this.arenaFrameString.SetText(
    //   arenaPlayers.map((x) => x.unitId + ": " + x.statusToString()).join("\n")
    // );

    this.arenaFrameString.SetText("Kill Target: " + Benz_KillTarget);
  }

  toggleMovable() {
    this.moving = !this.moving;

    const frames = [this.frame, this.pumpFrame, this.arenaFrame];
    for (const frame of frames) {
      frame.EnableMouse(this.moving);
      if (this.moving) {
        frame.SetMovable(true);
        frame.SetBackdrop({
          bgFile: "Interface/Tooltips/UI-Tooltip-Background",
          tileSize: 256,
          edgeFile: "Interface\\FriendsFrame\\UI-Toast-Border",
          tile: true,
          edgeSize: 3,
          insets: {
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
          },
        });

        frame.SetScript("OnMouseDown", () => {
          // const [a1, , a2, x, y] = this.frame.GetPoint();
          frame.StartMoving();
        });

        frame.SetScript("OnMouseUp", () => {
          frame.StopMovingOrSizing();
        });
      } else {
        frame.SetMovable(false);
        frame.SetBackdrop({
          insets: {
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
          },
        });

        frame.SetScript("OnMouseDown", () => {});

        frame.SetScript("OnMouseUp", () => {});
      }
    }

    if (!this.moving) {
      this.serializeSave();
    }
  }

  private updateFrame() {
    let string = "";
    for (const message of this.messages) {
      string += "|cffffffff" + message.substr(0, message.indexOf("#")) + "\n";
    }

    this.fontString.SetText(string);
  }

  private serializeSave() {
    const coords = [this.frame, this.pumpFrame, this.arenaFrame]
      .map((t) => {
        const [, , , x, y] = t.GetPoint();
        return { x, y };
      })
      .map((x) => x.x + "," + x.y)
      .join("\n");
    WriteFile(GetExeDirectory() + "coords.txt", coords, false);
  }
}

export const UIStatusFrame = new StatusFrame();
