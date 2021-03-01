export enum TalentSpec {
  DK_Blood = 250,
  DK_Frost = 251,
  DK_Unholy = 252,
  DH_Havoc = 577,
  DH_Vengeance = 581,
  Druid_Balance = 102,
  Druid_Feral = 103,
  Druid_Guardian = 104,
  Druid_Restoration = 105,
  Hunter_BeastMastery = 253,
  Hunter_Marksmanship = 254,
  Hunter_Survival = 255,
  Mage_Arcane = 52,
  Mage_Fire = 63,
  Mage_Frost = 64,
  Monk_Brewmaster = 268,
  Monk_Mistweaver = 270,
  Monk_Windwalker = 269,
  Paladin_Holy = 65,
  Paladin_Protection = 66,
  Paladin_Retribution = 70,
  Priest_Discipline = 256,
  Priest_Holy = 257,
  Priest_Shadow = 258,
  Rogue_Assassination = 259,
  Rogue_Outlaw = 260,
  Rogue_Subtlety = 261,
  Shaman_Elemental = 262,
  Shaman_Enhancement = 263,
  Shaman_Restoration = 264,
  Warlock_Afflication = 265,
  Warlock_Demonology = 266,
  Warlock_Destruction = 267,
  Warrior_Arms = 71,
  Warrior_Fury = 72,
  Warrior_Protection = 73,
}

export const TalentSpecToString = new Map<TalentSpec, string>();
TalentSpecToString.set(TalentSpec.DK_Blood, "Blood DK");
TalentSpecToString.set(TalentSpec.DK_Frost, "Frost DK");
TalentSpecToString.set(TalentSpec.DK_Unholy, "Unholy DK");
TalentSpecToString.set(TalentSpec.DH_Havoc, "Havoc DH");
TalentSpecToString.set(TalentSpec.DH_Vengeance, "Vengeance DH");
TalentSpecToString.set(TalentSpec.Druid_Balance, "Balance");
TalentSpecToString.set(TalentSpec.Druid_Feral, "Feral");
TalentSpecToString.set(TalentSpec.Druid_Guardian, "Boomkin");
TalentSpecToString.set(TalentSpec.Druid_Restoration, "Resto");
TalentSpecToString.set(TalentSpec.Hunter_BeastMastery, "BM");
TalentSpecToString.set(TalentSpec.Hunter_Marksmanship, "Marksman");
TalentSpecToString.set(TalentSpec.Hunter_Survival, "Survival");
TalentSpecToString.set(TalentSpec.Mage_Arcane, "Arcane Mage");
TalentSpecToString.set(TalentSpec.Mage_Fire, "Fire Mage");
TalentSpecToString.set(TalentSpec.Mage_Frost, "Frost Mage");
TalentSpecToString.set(TalentSpec.Monk_Brewmaster, "Brewmaster");
TalentSpecToString.set(TalentSpec.Monk_Mistweaver, "Mistweaver");
TalentSpecToString.set(TalentSpec.Monk_Windwalker, "WW");
TalentSpecToString.set(TalentSpec.Paladin_Holy, "Holy Paladin");
TalentSpecToString.set(TalentSpec.Paladin_Protection, "Prot Paladin");
TalentSpecToString.set(TalentSpec.Paladin_Retribution, "Ret");
TalentSpecToString.set(TalentSpec.Priest_Discipline, "Disc");
TalentSpecToString.set(TalentSpec.Priest_Holy, "Holy Priest");
TalentSpecToString.set(TalentSpec.Priest_Shadow, "Shadow Priest");
TalentSpecToString.set(TalentSpec.Rogue_Assassination, "Asassination");
TalentSpecToString.set(TalentSpec.Rogue_Outlaw, "Outlaw");
TalentSpecToString.set(TalentSpec.Rogue_Subtlety, "Subtlety");
TalentSpecToString.set(TalentSpec.Shaman_Elemental, "Elemental Shaman");
TalentSpecToString.set(TalentSpec.Shaman_Enhancement, "Enh Shaman");
TalentSpecToString.set(TalentSpec.Shaman_Restoration, "Resto Shaman");
TalentSpecToString.set(TalentSpec.Warlock_Afflication, "Aff Lock");
TalentSpecToString.set(TalentSpec.Warlock_Demonology, "Demo Lock");
TalentSpecToString.set(TalentSpec.Warlock_Destruction, "Destro Lock");
TalentSpecToString.set(TalentSpec.Warrior_Arms, "Arms War");
TalentSpecToString.set(TalentSpec.Warrior_Fury, "Fury War");
TalentSpecToString.set(TalentSpec.Warrior_Protection, "Prot War");
