import { PlayerSpell } from "../../wowutils/wow_utils";
import { TalentSpec } from "../players/TalentSpec";

export interface InterruptSpell {
  name: PlayerSpell;
  lockDuration: number;
  cooldown: number;
  range: number;
  specs: TalentSpec[];
}

export interface PumpSpell {
  name: PlayerSpell;
  cooldown: number;
  specs: TalentSpec[];
}
