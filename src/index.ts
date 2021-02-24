import { Libdraw } from "../wow/libdraw";
import { Driver } from "./engine/driver";
import { Blink } from "./engine/mage/spells/blink";
import { GetGroundZCoord } from "./engine/wowutils/wow_utils";

export let ewtLoaded = false;

let printOnce = true;

ToggleBenz = () => {
  console.log(`Benz ${!benz_rotation_enabled ? "Enabled" : "Disabled"}`);
  benz_rotation_enabled = !benz_rotation_enabled;
};
benz_rotation_enabled = false;

const frame = CreateFrame("Frame");
frame.SetScript("OnUpdate", () => {
  if (CallSecureFunction !== null) {
    ewtLoaded = true;
    if (printOnce) {
      printOnce = false;
      console.log("started benz. this a baby benz -- a class");

      const driver = new Driver();
      driver.start();

      const party: WoWAPI.UnitId[] = ["party1", "party2", "party2", "party3", "party4"];
      const losFlags = bit.bor(0x10, 0x100, 0x1, 0x2, 0x20, 0x100000);

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
