// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { config } from './LoadSettingJson';
import os = require('os');

import { execSync } from 'child_process';
import { createOutputChannel, outChannel } from './OutputChannel';
import { createStatusBar } from './StatusBar';
import { createCommand } from './command';
import { ExtensionContext, workspace } from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "git-skip-workspace-manager" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	createCommand(context);
	createStatusBar(context);
	createOutputChannel();

	config();
	getSkipWorkspaceFiles();
}

// this method is called when your extension is deactivated
export function deactivate() {}

function getSkipWorkspaceFiles(): string[] {
	const workspaceFolders = workspace.workspaceFolders;
	if(workspaceFolders !== undefined) {
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
			outChannel.appendLine(command);
			const child = execSync(command, {
				cwd: `${workspaceFolders[0].uri.fsPath}`
			});
			const result = Buffer.from(child).toString();
			outChannel.appendLine(result);
			return result.split(os.EOL);
		}catch(e){
			outChannel.appendLine("Not Skip Workspace");
			return [];
		}
	}
	return [];
}

