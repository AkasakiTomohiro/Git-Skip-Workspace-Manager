import {
  commands,
  ExtensionContext,
  OutputChannel,
  StatusBarAlignment,
  StatusBarItem,
  window,
} from "vscode";
import { SkipWorktreeProvider } from "./SkipWorktreeProvider";
import { WorktreeState } from "./WorktreeState";

export class Container {
  public static readonly disableActionId = "git-skip-worktree-manager.disableAction";
  public static readonly reloadActionId = "git-skip-worktree-manager.reloadAction";

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

  public static setup(): void {

  }

  // ####################################################################
  // ### Command
  // ####################################################################
  private static createCommand(): void {
    let disableAction = commands.registerCommand(Container.disableActionId, WorktreeState.allSkipWorktreeFileDisable);
    Container.context.subscriptions.push(disableAction);
    let reloadAction = commands.registerCommand(Container.reloadActionId, WorktreeState.getLocalSkipWorktreeFiles);
    Container.context.subscriptions.push(reloadAction);
  }

  // ####################################################################
  // ### StatusBar
  // ####################################################################

  private static createStatusBar(): void {
    Container.myStatusBarItem = window.createStatusBarItem(
      StatusBarAlignment.Left
    );
    Container.myStatusBarItem.command = Container.disableActionId;
    Container.context.subscriptions.push(Container.myStatusBarItem);
    Container.myStatusBarItem.text = "All Git Skip Worktree Disable";
    Container.myStatusBarItem.show();
  }

  // ####################################################################
  // ### OutputChannel
  // ####################################################################

  private static createOutputChannel(): void {
    Container.outChannel = window.createOutputChannel("Git Skip Worktree");
    Container.outChannel.show();
  }

  // ####################################################################
  // ### Provider
  // ####################################################################

  private static createProvider(): void {
    Container.providerTrue = new SkipWorktreeProvider(true);
    window.registerTreeDataProvider('skipWorktreeTrue', Container.providerTrue);
    
    Container.providerFalse = new SkipWorktreeProvider(false);
    window.registerTreeDataProvider('skipWorktreeFalse', Container.providerFalse);

    commands.registerCommand('skipWorktree.refreshEntry', () => {
      Container.providerTrue.refresh();
      Container.providerFalse.refresh();
    });
  }
}
