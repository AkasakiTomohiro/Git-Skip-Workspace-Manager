import { execSync } from "child_process";
import { EOL, type } from "os";
import { workspace } from "vscode";
import { Container } from "./Container";

export class WorktreeState {
  public static skipWorktreeFiles: SkipWorktreeFile[];
  private static readonly skipWorktreeFileId = "skipWorktreeFileId";

  /**
   * ワークスペースの設定を読み出し
   */
  public static load(): void {
    WorktreeState.skipWorktreeFiles = Container.context.workspaceState.get<SkipWorktreeFile[]>(WorktreeState.skipWorktreeFileId) ?? [];
    WorktreeState.getLocalSkipWorktreeFiles();
  }

  /**
   * 指定したファイルの変更履歴を設定
   * @param filePath 対象とするファイルパス
   * @param skipEnable 変更履歴を監視するか
   */
  public static saveSkipWorktreeFile(filePath: string, skipEnable: boolean): void {
    const item = WorktreeState.skipWorktreeFiles.find(i => i.filePath === filePath);
    if(item === undefined) {
      WorktreeState.skipWorktreeFiles.push({ filePath: filePath, skipEnable: skipEnable });
    } else {
      item.skipEnable = true;
    }
    Container.context.workspaceState.update(WorktreeState.skipWorktreeFileId, WorktreeState.skipWorktreeFiles);
  }

  /**
   * 変数に格納されているファイルパス全てをNo Skip Worktreeにする
   */
  public static allSkipWorktreeFileDisable(): void {
    WorktreeState.skipWorktreeFiles.forEach(f => {
      f.skipEnable = false;
    });
    Container.context.workspaceState.update(WorktreeState.skipWorktreeFileId, WorktreeState.skipWorktreeFiles);
  }

  /**
   * ローカルにある.gitに保存されているSkip Worktreeを取得し自身の変数に反映させる
   */
  public static getLocalSkipWorktreeFiles(): void {
    // ワークスペース開いているか
    const worktreeFolders = workspace.workspaceFolders;
    if(worktreeFolders === undefined) {
      return;
    }

    // 既にローカルでSkipWorktreeが登録されているかを確認
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
        cwd: `${worktreeFolders[0].uri.fsPath}`
      });
      const result = Buffer.from(child).toString();
      Container.outChannel.appendLine(result);
      files = result.split(EOL);
    }catch(e){
      Container.outChannel.appendLine("No Skip Worktree");
      files = [];
    }

    // 既にローカルでSkipWorktreeが登録されている場合は変数に設定する
    files.forEach(f => {
      f = f.replace("S ", "");
      const index = WorktreeState.skipWorktreeFiles.findIndex(i => i.filePath === f);
      if(index === -1) {
        WorktreeState.skipWorktreeFiles.push({ filePath: f, skipEnable: true });
      } else {
        WorktreeState.skipWorktreeFiles[index].skipEnable = true;
      }
    });
  }
}

/**
 * Skip Worktreeの対象ファイルとSkip Worktreeの対象とするかを管理する型
 */
export type SkipWorktreeFile = {
  /**
   * ファイルパス
   */
  filePath: string;

  /**
   * Skip Worktreeの対象とするか
   */
  skipEnable: boolean;
};
