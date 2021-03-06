import {
  commands,
  ExtensionContext,
  OutputChannel,
  StatusBarAlignment,
  StatusBarItem,
  Uri,
  window,
  workspace,
} from "vscode";
var path = require('path');
var fs = require('fs');

import { SkipWorktreeItem, SkipWorktreeProvider } from "./SkipWorktreeProvider";
import { WorktreeState } from "./WorktreeState";

export class Container {
  /** ExtensionContext */
  public static context: ExtensionContext;

  /** StatusBar */
  public static myStatusBarItem: StatusBarItem;

  /** OutputChannel */
  public static outChannel: OutputChannel;

  /** Provider */
  public static providerTrue: SkipWorktreeProvider;
  public static providerFalse: SkipWorktreeProvider;

  public static create(context: ExtensionContext): void {
    Container.context = context;
    Container.createCommand();
    Container.createStatusBar();
    Container.createOutputChannel();
    Container.createProvider();
  }

  // ####################################################################
  // ### Command
  // ####################################################################
  private static createCommand(): void {
    commands.registerCommand("skipWorktree.allItemDisableAction", () => {
      WorktreeState.allSkipWorktreeFileDisable();
      Container.providerTrue.refresh();
      Container.providerFalse.refresh();
    });
  }

  // ####################################################################
  // ### StatusBar
  // ####################################################################

  private static createStatusBar(): void {
    Container.myStatusBarItem = window.createStatusBarItem(
      StatusBarAlignment.Left
    );
    Container.myStatusBarItem.command = "skipWorktree.allItemDisableAction";
    Container.context.subscriptions.push(Container.myStatusBarItem);
    Container.myStatusBarItem.text = "All Git Skip Worktree Disable";
    Container.myStatusBarItem.show();
  }

  // ####################################################################
  // ### OutputChannel
  // ####################################################################

  private static createOutputChannel(): void {
    Container.outChannel = window.createOutputChannel("Git Skip Worktree");
  }

  // ####################################################################
  // ### Provider
  // ####################################################################

  private static createProvider(): void {
    Container.providerTrue = new SkipWorktreeProvider(true);
    window.registerTreeDataProvider('skipWorktreeTrue', Container.providerTrue);
    commands.registerCommand('skipWorktreeTrue.noSkipEntry', (item: SkipWorktreeItem) => {
      item.toggle();
      Container.providerTrue.refresh();
      Container.providerFalse.refresh();
    });
    
    Container.providerFalse = new SkipWorktreeProvider(false);
    window.registerTreeDataProvider('skipWorktreeFalse', Container.providerFalse);
    commands.registerCommand('skipWorktreeFalse.skipEntry', (item: SkipWorktreeItem) => {
      item.toggle();
      Container.providerTrue.refresh();
      Container.providerFalse.refresh();
    });

    commands.registerCommand('skipWorktree.refreshEntry', () => {
      WorktreeState.getLocalSkipWorktreeFiles();
      Container.providerTrue.refresh();
      Container.providerFalse.refresh();
    });
    commands.registerCommand("skipWorktree.toggleAction", (item: Uri) => {
      const worktreeFolders = workspace.workspaceFolders;
      if(worktreeFolders === undefined) {
        return;
      }
      if(fs.statSync(item.fsPath).isDirectory()) {
        window.showInformationMessage('Supports file only!');
        return;
      }
      const fsPath = path.relative(worktreeFolders[0].uri.fsPath, item.fsPath).replace(/\\/g, "/");
      WorktreeState.toggleSkipWorktreeFile(fsPath);
      Container.providerTrue.refresh();
      Container.providerFalse.refresh();
    });
	  commands.registerCommand('skipWorktree.deleteAction', (item: SkipWorktreeItem) => {
      WorktreeState.deleteWorktree(item.state.filePath);
      Container.providerTrue.refresh();
      Container.providerFalse.refresh();
    });
}
}
