import { execSync } from "child_process";
import { EOL, type } from "os";
import { workspace } from "vscode";
import { Container } from "./Container";

export class WorkspaceState {
  private static readonly skipWorkspaceFileId = "skipWorkspaceFileId";
  private static skipWorkspaceFiles: SkipWorkspaceFile[];

  /**
   * ワークスペースの設定を読み出し
   */
  public static load(): void {
    WorkspaceState.skipWorkspaceFiles = Container.context.workspaceState.get<SkipWorkspaceFile[]>(WorkspaceState.skipWorkspaceFileId) ?? [];
    WorkspaceState.getLocalSkipWorkspaceFiles();
  }

  /**
   * 指定したファイルの変更履歴を設定
   * @param filePath 対象とするファイルパス
   * @param skipEnable 変更履歴を監視するか
   */
  public static saveSkipWorkspaceFile(filePath: string, skipEnable: boolean): void {
    const item = WorkspaceState.skipWorkspaceFiles.find(i => i.filePath === filePath);
    if(item === undefined) {
      WorkspaceState.skipWorkspaceFiles.push({ filePath: filePath, skipEnable: skipEnable });
    } else {
      item.skipEnable = true;
    }
    Container.context.workspaceState.update(WorkspaceState.skipWorkspaceFileId, WorkspaceState.skipWorkspaceFiles);
  }

  /**
   * 変数に格納されているファイルパス全てをNo Skip Workspaceにする
   */
  public static allSkipWorkspaceFileDisable(): void {
    WorkspaceState.skipWorkspaceFiles.forEach(f => {
      f.skipEnable = false;
    });
    Container.context.workspaceState.update(WorkspaceState.skipWorkspaceFileId, WorkspaceState.skipWorkspaceFiles);
  }

  /**
   * ローカルにある.gitに保存されているSkip Workspaceを取得し自身の変数に反映させる
   */
  public static getLocalSkipWorkspaceFiles(): void {
    // ワークスペース開いているか
    const workspaceFolders = workspace.workspaceFolders;
    if(workspaceFolders === undefined) {
      return;
    }

    // 既にローカルでSkipWorkspaceが登録されているかを確認
    var command = "";
    var files: string[] = [];
    switch(type()) {
      case "Windows_NT":
        command = 'git ls-files -v . | findstr "^S"';
        break;
      default:
        command = 'git ls-files -v . | grep ^S';
        break;
    }
    try{
      Container.outChannel.appendLine(command);
      const child = execSync(command, {
        cwd: `${workspaceFolders[0].uri.fsPath}`
      });
      const result = Buffer.from(child).toString();
      Container.outChannel.appendLine(result);
      files = result.split(EOL);
    }catch(e){
      Container.outChannel.appendLine("No Skip Workspace");
      files = [];
    }

    // 既にローカルでSkipWorkspaceが登録されている場合は変数に設定する
    files.forEach(f => {
      f = f.replace("S ", "");
      const item = WorkspaceState.skipWorkspaceFiles.find(i => i.filePath === f);
      if(item === undefined) {
        WorkspaceState.skipWorkspaceFiles.push({ filePath: f, skipEnable: true });
      } else {
        item.skipEnable = true;
      }
    });
    WorkspaceState.allSkipWorkspaceFileDisable();
  }
}

/**
 * Skip Workspaceの対象ファイルとSkip Workspaceの対象とするかを管理する型
 */
export type SkipWorkspaceFile = {
  /**
   * ファイルパス
   */
  filePath: string;

  /**
   * Skip Workspaceの対象とするか
   */
  skipEnable: boolean;
};
