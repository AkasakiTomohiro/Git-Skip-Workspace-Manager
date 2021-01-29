import { execSync } from "child_process";
import { type } from "os";
import { workspace } from "vscode";
import { Container } from "./Container";
var path = require('path');

export class WorktreeState {
  public static skipWorktreeFiles: SkipWorktreeFile[];
  private static readonly skipWorktreeFileId = "skipWorktreeFileId";

  /**
   * ワークスペースの設定を読み出し
   */
  public static load(): void {
    // Container.context.workspaceState.update(WorktreeState.skipWorktreeFileId, []);
    WorktreeState.skipWorktreeFiles = Container.context.workspaceState.get<SkipWorktreeFile[]>(WorktreeState.skipWorktreeFileId) ?? [];
    WorktreeState.getLocalSkipWorktreeFiles();
  }

  /**
   * 指定したファイルの変更履歴を設定
   * @param filePath 対象とするファイルパス
   * @param skipEnable 変更履歴を監視するか
   */
  public static toggleSkipWorktreeFile(filePath: string): void {
    const index = WorktreeState.skipWorktreeFiles.findIndex(i => i.filePath === filePath);
    if(index === -1) {
      if(WorktreeState.skipWorktree(filePath, true)){
        WorktreeState.skipWorktreeFiles.push({ filePath: filePath, fileName: path.parse(filePath).base, skipEnable: true });
      }
    } else {
      if(WorktreeState.skipWorktree(filePath, false)){
        WorktreeState.skipWorktreeFiles[index].skipEnable = false;
      }
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
      files = result.split("\n").filter(f => f !== "");
    }catch(e){
      Container.outChannel.appendLine("No Skip Worktree");
      files = [];
    }

    // 既にローカルでSkipWorktreeが登録されている場合は変数に設定する
    files.forEach(f => {
      const item = f.replace("S ", "");
      const index = WorktreeState.skipWorktreeFiles.findIndex(i => i.filePath === item);
      console.log(`filePath: ${item}`);
      if(index === -1) {
        WorktreeState.skipWorktreeFiles.push({ filePath: item, fileName: path.parse(item).base, skipEnable: true });
      } else {
        WorktreeState.skipWorktreeFiles[index].skipEnable = true;
      }
    });
    WorktreeState.skipWorktreeFiles.forEach(f => {
      const index = files.findIndex(i => i.replace("S ", "") === f.filePath);
      if(index === -1) {
        f.skipEnable = false;
      }
    });
    Container.context.workspaceState.update(WorktreeState.skipWorktreeFileId, WorktreeState.skipWorktreeFiles);
  }

  private static skipWorktree(filePath: string, skipEnable: boolean): boolean {
    // ワークスペース開いているか
    const worktreeFolders = workspace.workspaceFolders;
    if(worktreeFolders === undefined) {
      return false;
    }

    const command = skipEnable ? `git update-index --skip-worktree ${filePath}` : `git update-index --no-skip-worktree ${filePath}`;
    
    try{
      Container.outChannel.appendLine(command);
      execSync(command, {
        cwd: `${worktreeFolders[0].uri.fsPath}`
      });
      return true;
    }catch(e){
      console.log(e);
      Container.outChannel.appendLine("No Skip Worktree");
      return false;
    }
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
   * ファイル名
   */
  fileName: string;

  /**
   * Skip Worktreeの対象とするか
   */
  skipEnable: boolean;
};
