import { PlayerState } from "./player_state";
import { Defensive } from "./Defensive";
import { WoWClass } from "./WoWClass";

export class NPC extends PlayerState {
  class = WoWClass.NPC;
  canBeIncapacitated(): boolean {
    return true;
  }
  canPump(): boolean {
    return false;
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
  shouldInterrupt(): boolean {
    return false;
  }
}
