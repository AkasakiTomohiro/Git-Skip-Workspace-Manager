# Git Skip Worktree Manager README

An extension to manage the `git update-index --skip-worktree` Git command.

## Features

![Image](https://raw.githubusercontent.com/AkasakiTomohiro/GitSkipWorktreeManager/master/images/image.gif)
![Image](https://raw.githubusercontent.com/AkasakiTomohiro/GitSkipWorktreeManager/master/images/image2.gif)
![Image](https://raw.githubusercontent.com/AkasakiTomohiro/GitSkipWorktreeManager/master/images/image3.gif)

The following three methods can be used to register a file for `skip-worktree`.

- Adding a file with the Git command
- Right-click the file in Explorer and select `Skip Worktree Toggle`.
- Define it in `gitSkipWorktreeManager.paths` in setting.json
- On the `GIT UPDATE INDEX MANAGER` tab, click the `+` button next to the file name.

If you want to disable all files registered in the SkipWorktree, click the `All Git Skip Worktree Disable` button on the status bar.
If you want to exclude a file from management, right-click the target file in the `GIT UPDATE INDEX MANAGER` tab and select `Delete`. However, you cannot delete the files defined in `gitSkipWorktreeManager.paths`.

## Requirements

Have a Git version installed that can use `git update-index --skip-worktree`.

## Extension Settings

By defining files in `gitSkipWorktreeManager.paths` as relative paths from the workspace, you can make them the default target files for the workspace.

``` setting.json
{
  "gitSkipWorktreeManager.paths": []
}
```

## Release Notes

### 1.0.0

Initial release

### 1.0.1

Add an icon

### 1.0.2

Update Gif URL in Readme.

### 1.0.3

Update Gif URL in Readme.
