# benz
WoW Fire Mage Arena Bot

Trash WoWAdvanced PVP CR

Discord: https://discord.gg/KPfg4Ky9rB

## Alpha Installation

- WoWAdvanced
- Create file `DeveloperConfig.json` next to your `WowAdvanced.exe` and put in `{"toExposeApi": true}`
- Download latest release from https://github.com/littlebenz/benz/releases and put it in your wow addons
- Log In
- Go to Addon Keybinds and add a new keybind for benz toggle (gotta start that car bro)
- Press the button
- Also `/benz move` will unlock/lock the small UI frames that you see.

## Building from source 
- Clone
- `npm install`
- update your `tsconfig` to point to the correct wow directory if you want
- `npm run dev` (will auto build based off of changes you have)
- Requires `DeveloperConfig.json` from above.

## Fire Mage

Fire mage isn't polished. But probably better than squid lol. With the exception of Meteors. They're pretty dumb and trash. 

### List of Features (not everything is included here)

- [x] Alter Time Logic - Actually pretty good

- [x] Fake cast. Add in logic to count when the enemy team is trying to interrupt at what % and try to fake cast -10% minus that. 

- [x] Better time CC around goes - 80% still needs work

- [x] Interrupt Priority based on CDs available and your teammates CDs - half implemented. 

- [x] Put large warning text on screen so that you can communicate to your teammates what the bot is doing.

- [ ] Add skip button to next action (separate buttons for cc/spellsteal/stomp/etc ...?) we want to take. (i.e., skip next poly if your hpal says he wants to hoj off instead of wasting time trying to poly a RE)

- [ ] Convenent Abilities

- [ ] Defensively Ring of Frost (yourself or your partners)

- [ ] Auto Trinket on pump when your healer is CC or healer doesn't have cleanse.

- [ ] Rune of Power mini-go logic

- [ ] Flamestrike to stop drink

- [ ] Add warning for when we think is a good block time (big goes, healer CC'd, no off heals, we think you're gonna die), maybe add setting to auto block logic?

- [x] Save Fire Blast for pump

- [x]  Stomp totems, war banner, etc.

- [x]  Poly on DRs

- [x]  Auto block

- [x]  Auto create food

- [x]  Smart Spellsteal abilities based off priority

- [x]  Blink poly LOS

- [x]  Dumb Meteor

- [x] Auto Decurse (dumb)

- [x]  Counterspell (dumb)
