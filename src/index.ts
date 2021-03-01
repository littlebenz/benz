import { Libdraw } from "../wow/libdraw";
import { Driver } from "./engine/driver";
import { Blink } from "./engine/mage/spells/blink";
import { UIStatusFrame } from "./engine/ui/status_frame";
import { GetGroundZCoord } from "./engine/wowutils/wow_utils";

let needToLoadBenz = true;
Benz_KillTarget = "target";

// Slash commands
declare let SLASH_BENZ1: string;
SLASH_BENZ1 = "/benz";
declare const SlashCmdList: any;

const benz = "BENZ" as any;
SlashCmdList[benz] = function (message: string, editbox: any) {
  if (message === "move") {
    UIStatusFrame.toggleMovable();
  }
};

Benz_Toggle = () => {
  console.log(`Benz ${!Benz_Enabled ? "Enabled" : "Disabled"}`);
  Benz_Enabled = !Benz_Enabled;
  if (Benz_Enabled) {
    UIStatusFrame.show();
  } else {
    UIStatusFrame.hide();
  }
};

Benz_Enabled = true;

const frame = CreateFrame("Frame");
frame.SetScript("OnUpdate", () => {
  if (CallSecureFunction !== null) {
    if (needToLoadBenz) {
      needToLoadBenz = false;
      console.log("started benz. we've been upgraded to a c class");

      const driver = new Driver();
      driver.start();

      const party: WoWAPI.UnitId[] = ["party1", "party2", "party2", "party3", "party4"];

      const libdraw = new Libdraw();
      libdraw.sync(() => {
        libdraw.clearCanvas();
        const [playerX, playerY, playerZ] = GetUnitPosition("player");
        if (!playerX || !playerY || !playerZ) {
          return;
        }

        // for (let i = 0; i < math.pi * 2; i += (math.pi * 2) / 48) {
        //   const x = 20 * math.cos(i) + playerX;
        //   const y = 20 * math.sin(i) + playerY;
        //   const z = GetGroundZCoord(x, y);

        //   const [blinkHit, collisionX, collisionY, collisionZ] = TraceLine(
        //     x,
        //     y,
        //     z,
        //     playerX,
        //     playerY,
        //     playerZ + 2,
        //     losFlags
        //   );

        //   if (math.abs(playerZ - z) <= 4) {
        //     libdraw.setColorRaw(1, 1, 1, 1);
        //     if (blinkHit === 1) {
        //       libdraw.circle(collisionX, collisionY, collisionZ, 1);
        //     } else {
        //       libdraw.circle(x, y, z, 1);
        //     }
        //   }
        // }

        const player = GetUnitName("player", false);

        libdraw.setColorRaw(0, 1, 0, 1);

        for (const partyMember of party) {
          const arena1 = GetUnitName(partyMember, false);
          if (arena1 && arena1 !== player) {
            const [targetX, targetY, targetZ] = GetUnitPosition(partyMember);
            if (targetX && targetY && targetZ) {
              libdraw.line(playerX, playerY, playerZ, targetX, targetY, targetZ);
            }
          }
        }
      });
      libdraw.enable(0.01);
    }
  }
});

// const drawFrame = CreateFrame("Frame");
// drawFrame.SetScript("OnUpdate", () => {
//     if (Draw2DText === null) {
//         return;
//     }
//     const [sWidth, sHeight] = GetWoWWindow();
//     Draw2DText(sWidth * 0.5, sHeight * 0.5, "THIS IS A TEST");
//     const player = GetUnitName("player", false);
//     const arena1 = GetUnitName("arena1", false);
//     if (arena1 && arena1 !== player) {
//         Draw2DLine("player", "arena1", 1);
//     }
//     const arena2 = GetUnitName("arena2", false);
//     if (arena2 && arena2 !== player) {
//         Draw2DLine("player", "arena2", 1);
//     }
//     const target = GetUnitName("target", false);
//     if (target !== null) {
//         SetDrawColor(1, 1, 1, 1);
//         const drawed = Draw2DLine("player", "target");
//     }
// });
