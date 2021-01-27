import { workspace } from "vscode";

export function config(): Config {
    const configuredView = workspace.getConfiguration().get<string[]>('gitSkipWorkspaceManager.paths') ?? [];
    console.log(configuredView);
    return {paths: configuredView};
}

export type Config = {
    paths: string[]
};
