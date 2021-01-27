// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { config } from './config';
import os = require('os');

let myStatusBarItem: vscode.StatusBarItem;
let flag: boolean = true;
let channel: vscode.OutputChannel;
import { execSync } from 'child_process';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const myCommandId = 'git-skip-workspace-manager.action';
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "git-skip-workspace-manager" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand(myCommandId, gitSkipWorkspaceAction);

	context.subscriptions.push(disposable);

	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	myStatusBarItem.command = myCommandId;
	context.subscriptions.push(myStatusBarItem);

	myStatusBarItem.text = "Git Skip Workspace";
	myStatusBarItem.show();

	channel = vscode.window.createOutputChannel("Git Skip Workspace");
	channel.show();
	config();
	getSkipWorkspaceFiles();
}

// this method is called when your extension is deactivated
export function deactivate() {}

function getSkipWorkspaceFiles(): string[] {
	const workspace = vscode.workspace.workspaceFolders;
	if(workspace !== undefined) {
		var command = "";
		switch(os.type()) {
			case "Windows_NT":
				command = 'git ls-files -v . | findstr "^S"';
				break;
			default:
				command = 'git ls-files -v . | grep ^S';
				break;
		}
		try{
			channel.appendLine(command);
			const child = execSync(command, {
				cwd: `${workspace[0].uri.fsPath}`
			});
			const result = Buffer.from(child).toString();
			channel.appendLine(result);
			return result.split(os.EOL);
		}catch(e){
			channel.appendLine("Not Skip Workspace");
			return [];
		}
	}
	return [];
}

function gitSkipWorkspaceAction():void {
	if(flag) {
		gitSkipWorkspace();
	}else{
		gitNoSkipWorkspace();
	}
	flag = !flag;
}

function gitSkipWorkspace():void {
	vscode.window.showInformationMessage('Git Skip Workspace');
	myStatusBarItem.text = "Git No Skip Workspace";
}

function gitNoSkipWorkspace():void {
	vscode.window.showInformationMessage('Git No Skip Workspace');
	myStatusBarItem.text = "Git Skip Workspace";
}
