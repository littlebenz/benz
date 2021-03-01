import { PlayerState } from "../players/player_state";

export function GetKillTarget(enemies: PlayerState[]): PlayerState | null {
  const maybeKillTarget = enemies.find((x) => x.isKillTarget());
  if (maybeKillTarget) {
    return maybeKillTarget;
  }

  return null;
}
