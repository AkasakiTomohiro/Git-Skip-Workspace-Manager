import { OutputChannel, window } from 'vscode';

export let outChannel: OutputChannel;
export function createOutputChannel(): void {
	outChannel = window.createOutputChannel("Git Skip Workspace");
	outChannel.show();
}
