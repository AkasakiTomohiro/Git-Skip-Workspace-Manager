import {
  commands,
  ExtensionContext,
  OutputChannel,
  StatusBarAlignment,
  StatusBarItem,
  window,
} from "vscode";
import { WorkspaceState } from "./WorkspaceState";

export class Container {
  public static readonly disableActionId = "git-skip-workspace-manager.disableAction";
  public static readonly reloadActionId = "git-skip-workspace-manager.reloadAction";

  /** ExtensionContext */
  public static context: ExtensionContext;

  /** StatusBar */
  public static myStatusBarItem: StatusBarItem;

  /** OutputChannel */
  public static outChannel: OutputChannel;

  public static create(context: ExtensionContext): void {
    Container.context = context;
    Container.createCommand();
    Container.createStatusBar();
    Container.createOutputChannel();
  }

  public static setup(): void {

  }

  // ####################################################################
  // ### Command
  // ####################################################################
  private static createCommand(): void {
    let disableAction = commands.registerCommand(Container.disableActionId, WorkspaceState.allSkipWorkspaceFileDisable);
    Container.context.subscriptions.push(disableAction);
    let reloadAction = commands.registerCommand(Container.reloadActionId, WorkspaceState.getLocalSkipWorkspaceFiles);
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
    Container.myStatusBarItem.text = "All Git Skip Workspace Disable";
    Container.myStatusBarItem.show();
  }

  // ####################################################################
  // ### OutputChannel
  // ####################################################################

  private static createOutputChannel(): void {
    Container.outChannel = window.createOutputChannel("Git Skip Workspace");
    Container.outChannel.show();
  }
}
