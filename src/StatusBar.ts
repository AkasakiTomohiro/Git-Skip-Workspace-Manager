import { ExtensionContext, StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { commandIdAction } from './Config';

export let myStatusBarItem: StatusBarItem;

export function createStatusBar(context: ExtensionContext): void {
	myStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
	myStatusBarItem.command = commandIdAction;
	context.subscriptions.push(myStatusBarItem);
	myStatusBarItem.text = "Git Skip Workspace";
	myStatusBarItem.show();
}