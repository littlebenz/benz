export enum PumpingStatus {
  Dumped = 0,
  WarmingUp = 1,
  Hot = 2,
  Pumping = 3,
}

let pumpingState: PumpingStatus = PumpingStatus.Dumped;
export function GetPumpingState() {
  return pumpingState;
}

export function SetPumpingState(state: PumpingStatus) {
  pumpingState = state;
}
