import {
  ClickAtTarget,
  DistanceFromPoints,
  DistanceFromUnit,
  GetUnitAura,
  GetUnitAuras,
  IsPositionLineOfSight,
  IsSpellUsable,
  IsUnitInOfLineOfSight,
  UnitIsMoving,
  UnitMovingDirection,
} from "../../wowutils/wow_utils";
import { MageSpell } from "../../state/utils/mage_utils";
import { Spell } from "./ispell";
import { CastSpellByName, TargetUnit } from "../../wowutils/unlocked_functions";
import { WarlockAura } from "../../state/utils/warlock_utils";
import { PriestAura } from "../../state/utils/priest_utils";

export class RingOfFrost extends Spell {
  isOnGCD = true;
  spellName = MageSpell.RingOfFrost;
  isSelfCast = true;

  private getCoords() {
    let [x, y, z] = GetUnitPosition(this.targetGuid);
    const [px, py, pz] = GetUnitPosition("player");
    const unitMovingDirection = UnitMovingDirection(this.targetGuid);
    if (!unitMovingDirection) {
      return null;
    }

    const movingDirection = (unitMovingDirection + math.pi) % (math.pi * 1.5);
    // const movingDirectionRight = (movingDirection + math.pi) % (math.pi * 0.5);

    const getDirection = () => {
      if (UnitIsMoving(this.targetGuid)) {
        const directions = [];
        for (let i = 0; i < math.pi * 2; i += (math.pi * 2) / 12) {
          if (
            DistanceFromPoints(x - 5 * math.cos(i), y - 5 * math.sin(i), z, px, py, pz) < 30 &&
            IsPositionLineOfSight(x - 5 * math.cos(i), y - 5 * math.sin(i), z, px, py, pz)
          ) {
            directions.push(i);
          }
        }
        directions.sort((a, b) => math.abs(movingDirection - a) - math.abs(movingDirection - b));

        return directions[0];
      } else {
        for (let i = 0; i < math.pi * 2; i++) {
          if (
            DistanceFromPoints(x - 5 * math.cos(i), y - 5 * math.sin(i), z, px, py, pz) < 30 &&
            IsPositionLineOfSight(x - 5 * math.cos(i), y - 5 * math.sin(i), z, px, py, pz)
          ) {
            return i;
          }
        }
      }

      return null;
    };

    const direction = getDirection();
    const dir = UnitMovingDirection(this.targetGuid);

    if (direction && dir) {
      x = x - 5 * math.cos(direction);
      y = y - 5 * math.sin(direction);

      const [speed] = GetUnitSpeed(this.targetGuid);
      const auras = GetUnitAuras(SetMouseOver(this.targetGuid) as any);
      const dist =
        speed * +(1.8 / 4) + 0.25 ||
        ((auras.find((x) => x.name === WarlockAura.Fear) ||
          auras.find((x) => x.name === PriestAura.PsychicScream)) &&
          speed * (1.8 + 0.1 + 1 / GetFramerate())) ||
        speed / 5.6;
      const finalX = x + dist * math.cos(dir);
      const finalY = y + dist * math.sin(dir);
      return { x: finalX, y: finalY, z };
    }

    return null;
  }
  cast() {
    const coords = this.getCoords();
    if (coords && !UnitIsMoving("player")) {
      CastSpellByName(MageSpell.RingOfFrost, this.targetGuid);

      ClickPosition(coords.x, coords.y, coords.z);
    }
  }

  canCastSpell() {
    if (UnitIsMoving("player")) {
      return false;
    }

    const [start, duration, enabled] = GetSpellCooldown(
      MageSpell.RingOfFrost as any,
      BOOKTYPE_SPELL
    );
    return this.getCoords() !== null;
  }
}
