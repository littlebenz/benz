/**
 *
 * If no interrupts available, do nothing
 *
 * If no interrupt in range, do nothing
 *
 * If casting interruptable skill
 *  - Poly
 *  - Ring of Frost
 *
 * Cast 25%.
 * Cancel.
 * Only allow global to be casted.
 * Cast 50% cancel.
 * Only allow global to be casted.
 *
 * If I want to pump, we need the CC.
 * If they haven't attempted to very interrupt me yet, just hardcast.
 * Otherwise, do one more short 33% cast then just hard cast and accept the interrupt
 */
import { Car } from "./car";

export class FakeCast implements Car {
  getNextSpell() {
    return null;
  }
}
