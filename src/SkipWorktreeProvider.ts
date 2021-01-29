import { Event, EventEmitter, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from "vscode";
import { SkipWorktreeFile, WorktreeState } from "./WorktreeState";

export class SkipWorktreeProvider implements TreeDataProvider<SkipWorktreeItem> {
	private _onDidChangeTreeData: EventEmitter<SkipWorktreeItem | undefined | void> = new EventEmitter<SkipWorktreeItem | undefined | void>();
  public onDidChangeTreeData?: Event<void | SkipWorktreeItem | null | undefined> | undefined = this._onDidChangeTreeData.event;
 
  public constructor(private readonly skipEnable: boolean) { }

	public refresh(): void {
		this._onDidChangeTreeData.fire();
	}
  
  public getTreeItem(element: SkipWorktreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  public getChildren(element?: SkipWorktreeItem): ProviderResult<SkipWorktreeItem[]> {
    if(element) {
      return [];
    } else {
      return WorktreeState.skipWorktreeFiles.filter(f => f.skipEnable === this.skipEnable).map(m => new SkipWorktreeItem(m, TreeItemCollapsibleState.None));
    }
  }
}

export class SkipWorktreeItem extends TreeItem {
  public contextValue = 'skipWorktreeItem';
  
  public constructor(public readonly state: SkipWorktreeFile, public readonly collapsibleState: TreeItemCollapsibleState) {
    super(state.fileName, collapsibleState);
    this.tooltip = state.filePath;
  }

  public toggle(): void {
    WorktreeState.toggleSkipWorktreeFile(this.state.filePath);
  }
}