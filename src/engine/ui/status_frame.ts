import { Frame, FontString } from "@wartoshika/wow-declarations";
import { MageSpell } from "../state/utils/mage_utils";
import { PumpingStatus } from "../state/utils/pumping_status";
import { SpellCooldownRemainingSeconds, WoWLua } from "../wowutils/wow_utils";

export class StatusFrame {
  private frame: Frame;
  private pumpFrame: Frame;
  private fontString: FontString;
  private pumpFontString: FontString;

  private messages: string[] = [];
  private lastMessage: string = "";

  moving: boolean;

  constructor() {
    this.frame = CreateFrame("Frame", "BenzStatusFrame", UIParent, "BackdropTemplate");
    this.pumpFrame = CreateFrame("Frame", "BenzPumpFrame", UIParent, "BackdropTemplate");
    this.frame.SetPoint("CENTER", 0, 300);
    this.pumpFrame.SetPoint("CENTER", -300, 0);

    this.moving = false;

    const frames = [this.frame, this.pumpFrame];
    for (const frame of frames) {
      frame.SetWidth(250);
      frame.SetHeight(50);

      frame.SetPoint("CENTER", 0, 300);
      frame.SetMovable(false);
    }

    this.fontString = this.frame.CreateFontString("BenzFontString", "ARTWORK");
    this.fontString.SetFont("Fonts\\ARIALN.ttf", 24, "OUTLINE");
    this.fontString.SetPoint("CENTER", 0, 0);

    this.fontString.SetText("");

    this.pumpFontString = this.pumpFrame.CreateFontString("BenzFontString", "ARTWORK");
    this.pumpFontString.SetFont("Fonts\\ARIALN.ttf", 24, "OUTLINE");
    this.pumpFontString.SetPoint("CENTER", 0, 0);

    this.pumpFontString.SetText("");
  }

  show() {
    // this.frame.Show();
    this.fontString.Show();
  }

  hide() {
    this.fontString.Hide();
  }

  addMessage(message: string) {
    console.log(message);
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
      pumpStatusString = "|cff878787Dumped " + math.ceil(SpellCooldownRemainingSeconds(combustion));
    } else if (pumpStatus === PumpingStatus.Pumping) {
      pumpStatusString = "|cffff5042Pumping";
    } else if (pumpStatus === PumpingStatus.WarmingUp) {
      pumpStatusString = "|cffffae42Warming Up";
    } else if (pumpStatus === PumpingStatus.Hot) {
      pumpStatusString = "|cffffae42Hot - Combust Now!";
    }

    this.pumpFontString.SetText(pumpStatusString);
  }

  toggleMovable() {
    this.moving = !this.moving;

    const frames = [this.frame, this.pumpFrame];
    for (const frame of frames) {
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
          // const [a1, , a2, x, y] = this.frame.GetPoint();
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
  }

  private updateFrame() {
    let string = "";
    for (const message of this.messages) {
      string += "|cffffffff" + message.substr(0, message.indexOf("#")) + "\n";
    }

    this.fontString.SetText(string);
  }
}

export const UIStatusFrame = new StatusFrame();
