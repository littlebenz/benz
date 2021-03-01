export class DRTracker {
  private tracker: Map<DRType, DRTrackCount>;

  constructor() {
    this.tracker = new Map();

    this.tracker.set(DRType.Disorient, {
      lastDR: 0,
      drCount: 0,
      timeRemaining: 0,
    });
    this.tracker.set(DRType.Incapacitate, {
      lastDR: 0,
      drCount: 0,
      timeRemaining: 0,
    });
    this.tracker.set(DRType.Root, {
      lastDR: 0,
      drCount: 0,
      timeRemaining: 0,
    });
    this.tracker.set(DRType.Silence, {
      lastDR: 0,
      drCount: 0,
      timeRemaining: 0,
    });
    this.tracker.set(DRType.Stun, {
      lastDR: 0,
      drCount: 0,
      timeRemaining: 0,
    });
  }

  addDiminishingReturn(diminishingReturn: DRType, drLength: number | undefined) {
    const dr = this.tracker.get(diminishingReturn);

    this.tracker.set(diminishingReturn, {
      lastDR: drLength ? drLength + GetTime() : GetTime(),
      drCount: dr ? dr.drCount + 1 : 1,
      timeRemaining: 18 + (drLength ? drLength : 0),
    });
  }

  getDiminishingReturns() {
    const time = GetTime();

    for (const [_, trackCount] of this.tracker) {
      if (time - trackCount.lastDR >= 18) {
        trackCount.lastDR = 0;
        trackCount.drCount = 0;
      }
      trackCount.timeRemaining = 18 - (time - trackCount.lastDR);
    }

    return this.tracker;
  }
}

export interface DRTrackCount {
  lastDR: number;
  drCount: number;
  timeRemaining: number;
}

export enum DRType {
  Root = "Root",
  Stun = "Stun",
  Incapacitate = "Incap",
  Disorient = "Disorient",
  Silence = "Silence",
}

export const SpellNameToDiminishingReturnSchool = new Map<string, DRType>();
SpellNameToDiminishingReturnSchool.set("Imprison", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Incapacitating Roar", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Freezing Trap", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Wyvern Sting", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Polymorph", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Ring of Frost", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Breath of Fire", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Paralysis", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Ring of Peace", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Repentance", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Mind Control", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Holy Word: Chastise", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Psychic Horror", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Shackle Undead", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Gouge", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Sap", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Hex", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Banish", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Blood Horror", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Mortal Coil", DRType.Incapacitate);
SpellNameToDiminishingReturnSchool.set("Quaking Palm", DRType.Incapacitate);

SpellNameToDiminishingReturnSchool.set("Asphyxiate", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Gnaw", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Dark Transformation", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Remorseless Winter", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Chaos Nova", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Fel Eruption", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Maim", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Mighty Bash", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Rake", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Binding Shot", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Intimidation", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Deep Freeze", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Charging Ox Wave", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Fists of Fury", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Leg Sweep", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Hammer of Justice", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Fist of Justice", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Holy Wrath", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Cheap Shot", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Kidney Shot", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Pulverize", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Capacitor Totem", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Axe Toss", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Shadowfury", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Summon Infernal", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Summon Abyssal", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Shockwave", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("Storm Bolt", DRType.Stun);
SpellNameToDiminishingReturnSchool.set("War Stomp", DRType.Stun);

SpellNameToDiminishingReturnSchool.set("Chains of Ice", DRType.Root);
SpellNameToDiminishingReturnSchool.set("Entangling Roots", DRType.Root);
SpellNameToDiminishingReturnSchool.set("Force of Nature", DRType.Root);
SpellNameToDiminishingReturnSchool.set("Mass Entanglement", DRType.Root);
SpellNameToDiminishingReturnSchool.set("Charge", DRType.Root);
SpellNameToDiminishingReturnSchool.set("Narrow Escape", DRType.Root);
SpellNameToDiminishingReturnSchool.set("Entrapment", DRType.Root);
SpellNameToDiminishingReturnSchool.set("Frostjaw", DRType.Root);
SpellNameToDiminishingReturnSchool.set("Freeze", DRType.Root);
SpellNameToDiminishingReturnSchool.set("Frost Nova", DRType.Root);
SpellNameToDiminishingReturnSchool.set("Ice Ward", DRType.Root);
SpellNameToDiminishingReturnSchool.set("Disable", DRType.Root);
SpellNameToDiminishingReturnSchool.set("Mind Blast", DRType.Root);
SpellNameToDiminishingReturnSchool.set("Glyph of Mind Blast", DRType.Root);
SpellNameToDiminishingReturnSchool.set("Void Tendrils", DRType.Root);
SpellNameToDiminishingReturnSchool.set("Earthgrab Totem", DRType.Root);
SpellNameToDiminishingReturnSchool.set("Frost Shock", DRType.Root);
SpellNameToDiminishingReturnSchool.set("Frozen Power", DRType.Root);
SpellNameToDiminishingReturnSchool.set("Grimoire of Supremacy", DRType.Root);

SpellNameToDiminishingReturnSchool.set("Cyclone", DRType.Disorient);
SpellNameToDiminishingReturnSchool.set("Dragon's Breath", DRType.Disorient);
SpellNameToDiminishingReturnSchool.set("Blinding Light", DRType.Disorient);
SpellNameToDiminishingReturnSchool.set("Turn Evil", DRType.Disorient);
SpellNameToDiminishingReturnSchool.set("Psychic Scream", DRType.Disorient);
SpellNameToDiminishingReturnSchool.set("Blind", DRType.Disorient);
SpellNameToDiminishingReturnSchool.set("Fear", DRType.Disorient);
SpellNameToDiminishingReturnSchool.set("Howl of Terror", DRType.Disorient);
SpellNameToDiminishingReturnSchool.set("Mesmerize", DRType.Disorient);
SpellNameToDiminishingReturnSchool.set("Seduction", DRType.Disorient);
SpellNameToDiminishingReturnSchool.set("Intimidating Shout", DRType.Disorient);

SpellNameToDiminishingReturnSchool.set("Asphyxiate", DRType.Silence);
SpellNameToDiminishingReturnSchool.set("Strangulate", DRType.Silence);
SpellNameToDiminishingReturnSchool.set("Faerie Fire", DRType.Silence);
SpellNameToDiminishingReturnSchool.set("Solar Beam", DRType.Silence);
SpellNameToDiminishingReturnSchool.set("Frostjaw", DRType.Silence);
SpellNameToDiminishingReturnSchool.set("Avenger's Shield", DRType.Silence);
SpellNameToDiminishingReturnSchool.set("Silence", DRType.Silence);
SpellNameToDiminishingReturnSchool.set("Garrote", DRType.Silence);
SpellNameToDiminishingReturnSchool.set("Arcane Torrent", DRType.Silence);
