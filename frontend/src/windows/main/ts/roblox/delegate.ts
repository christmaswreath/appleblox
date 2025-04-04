import { toast } from 'svelte-sonner';
import { getValue } from '../../components/settings';
import { libraryPath } from '../libraries';
import { shell } from '../tools/shell';

const urlscheme = libraryPath('urlscheme');

async function setUrlscheme(
	uri: string,
	bundleId: string
): Promise<{ toggled: true } | { toggled: false; stdErr: string; stdOut: string }> {
	const command = await shell(`${urlscheme}`, ['set', uri, bundleId], { skipStderrCheck: true });
	if (!command.stdOut.includes('Successfully') && !command.stdErr.includes('Successfully')) {
		return { toggled: false, stdErr: command.stdErr, stdOut: command.stdOut };
	}
	return { toggled: true };
}

export class RobloxDelegate {
	/** Checks if the app is already redirected */
	static async check(retoggle = false) {
		// If it's not active but toggled in settings, retoggle.
		const cmd = await shell(`${urlscheme}`, ['check', 'roblox-player', 'ch.origaming.appleblox'], { skipStderrCheck: true });
		const toggled = cmd.stdOut.includes('true') || cmd.stdErr.includes('true');
		if (!toggled && retoggle && (await getValue<boolean>('roblox.behavior.delegate')) === true) {
			await this.toggle(true);
			return true;
		} else if (toggled && retoggle && (await getValue<boolean>('roblox.behavior.delegate')) === false) {
			await this.toggle(false);
			return false;
		}
		return toggled;
	}

	/** Enable/disable delegation */
	static async toggle(delegate: boolean) {
		if (delegate) {
			const toggledPlayer = await setUrlscheme('roblox-player', 'ch.origaming.appleblox');
			const toggleApp = await setUrlscheme('roblox', 'ch.origaming.appleblox');
			if (!toggledPlayer.toggled || !toggleApp.toggled) {
				toast.error("Couldn't set Roblox's URI");
				console.error("Couldn't set Roblox's URI:", { app: toggleApp, player: toggledPlayer });
			}
		} else {
			const toggledPlayer = await setUrlscheme('roblox-player', 'com.roblox.RobloxPlayer');
			const toggleApp = await setUrlscheme('roblox', 'com.roblox.RobloxPlayer');
			if (!toggledPlayer.toggled || !toggleApp.toggled) {
				toast.error("Couldn't set Roblox's URI");
				console.error("Couldn't set Roblox's URI:", { app: toggleApp, player: toggledPlayer });
			}
		}
	}
}
