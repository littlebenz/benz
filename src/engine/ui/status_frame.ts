import { Frame, FontString } from "@wartoshika/wow-declarations";

export class StatusFrame {
  private frame: Frame;
  private fontString: FontString;

  private messages: string[] = [];
  private lastMessage: string = "";

  constructor() {
    this.frame = CreateFrame("Frame", "BenzStatusFrame", UIParent, "BackdropTemplate");
    this.frame.SetWidth(250);
    this.frame.SetHeight(50);

    this.frame.SetPoint("CENTER", 0, 300);
    // this.frame.SetBackdrop({
    //   bgFile: "Interface/Tooltips/UI-Tooltip-Background",
    //   tileSize: 256,
    //   edgeFile: "Interface\\FriendsFrame\\UI-Toast-Border",
    //   tile: true,
    //   edgeSize: 3,
    //   insets: {
    //     top: 0,
    //     right: 0,
    //     left: 0,
    //     bottom: 0,
    //   },
    // });

    this.fontString = this.frame.CreateFontString("BenzFontString", "ARTWORK");
    this.fontString.SetFont("Fonts\\ARIALN.ttf", 24, "OUTLINE");
    this.fontString.SetPoint("CENTER", 0, 0);

    this.fontString.SetText("");
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
    C_Timer.After(3.5, () => {
      this.messages = this.messages.filter((x) => x !== messageWithTimestamp);
      this.updateFrame();
    });

    this.updateFrame();
    this.lastMessage = message;
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
