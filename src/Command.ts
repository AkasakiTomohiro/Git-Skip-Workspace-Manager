import { ExtensionContext, commands, window } from 'vscode';
import { commandIdAction } from './Config';
import { myStatusBarItem } from './StatusBar';

export function createCommand(context: ExtensionContext): void {
	let disposable = commands.registerCommand(commandIdAction, gitSkipWorkspaceAction);
	context.subscriptions.push(disposable);
}

let flag: boolean = true;
function gitSkipWorkspaceAction():void {
	if(flag) {
		gitSkipWorkspace();
	}else{
		gitNoSkipWorkspace();
	}
	flag = !flag;
}

function gitSkipWorkspace():void {
	window.showInformationMessage('Git Skip Workspace');
	myStatusBarItem.text = "Git No Skip Workspace";
}

function gitNoSkipWorkspace():void {
	window.showInformationMessage('Git No Skip Workspace');
	myStatusBarItem.text = "Git Skip Workspace";
}
