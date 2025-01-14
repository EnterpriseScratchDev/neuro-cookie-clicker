# Neuro-sama Integration for Cookie Clicker 

This mod can be downloaded from its [Steam Workshop page](https://steamcommunity.com/sharedfiles/filedetails/?id=3406562828).
The only dependency you need to download is [CCSE](https://steamcommunity.com/sharedfiles/filedetails/?id=2685465009), which is also downloaded from the Steam Workshop.

The [Zod](https://zod.dev/) schema validation library is included in this mod.
It's used to validate all incoming and outgoing WebSocket messages to ensure errors are detected as early as possible.

## Installation via the Steam Workshop

1. Subscribe to [CCSE](https://steamcommunity.com/sharedfiles/filedetails/?id=2685465009) and [Neuro-sama API Integration](https://steamcommunity.com/sharedfiles/filedetails/?id=3406562828) on the Steam Workshop.
2. Launch Cookie Clicker and open the options menu.
3. Scroll down to the "Mods" section and click "Manage Mods". You should see "CCSE" and "Neuro-sama API Integration".
4. Enable both of the mods. Move "CCSE" above "Neuro-sama API Integration".
5. Click "Restart with new changes". You should now see version numbers for both mods in the lower left corner of the screen.


## Manual Installation

If you want to avoid using the Steam Workshop, you can manually install this mod.

1. Download the contents of this repository. If you downloaded a zip file, extract it to a folder. The entire folder will be loaded as a mod.
2. Open the directory where Cookie Clicker is installed. The folder path should end with something like `steamapps/common/Cookie Clicker`.
3. Open `resources` > `app` > `mods` > `local`. The folder path should end with something like `steamapps/common/Cookie Clicker/resource/app/mods/local`.
4. Move the folder you downloaded from this repository into this folder. To make sure you've done it correctly, open the folder. You should see an `info.txt` file.
5. Follow the same process for CCSE, which can be downloaded [here](https://github.com/klattmose/klattmose.github.io/tree/master/CookieClicker/SteamMods/CCSE).
6. Launch Cookie Clicker and open the options menu.
7. Scroll down to the "Mods" section and click "Manage Mods". You should see "CCSE" and "Neuro-sama API Integration". If you don't see them, click "Open /mods folder" and try to figure out where the mods went.
8. Enable both of the mods. Move "CCSE" above "Neuro-sama API Integration".
9. Click "Restart with new changes". You should now see version numbers for both mods in the lower left corner of the screen.

An alternative way to install the mods locally is to install them from the Steam Workstop, then drag them from the `/mods/workshop` directory to the `/mods/local` directory, then unsubscribe from them on the Steam Workshop.
