import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { WoWClass } from "./WoWClass";
import { InterruptableSpell, InterruptSpell, PumpSpell } from "../utils/interrupt_spell";

export class NPC extends PlayerState {
  class = WoWClass.NPC;
  pumpSpells: PumpSpell[] = [];
  interruptSpells: InterruptSpell[] = [];
  spellToInterrupt: InterruptableSpell[] = [];
  canBeIncapacitated(): boolean {
    return true;
  }
  isPumping(): boolean {
    return false;
  }
  isDefensive(): Defensive {
    return Defensive.None;
  }
  shouldStomp(): boolean {
    return false;
  }
}
