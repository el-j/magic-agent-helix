import * as vscode from 'vscode';
let terminal;
export function activate(context) {
    // Register the main command
    let disposable = vscode.commands.registerCommand('magic-helix.run', () => {
        // Check for open workspace
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage('MagicAgentHelix: You must have a project or folder open.');
            return;
        }
        // Use the existing terminal or create a new one
        if (!terminal || terminal.exitStatus) {
            terminal = vscode.window.createTerminal('MagicAgentHelix');
        }
        terminal.show();
        terminal.sendText('npx magic-helix run');
        vscode.window.showInformationMessage('Running MagicAgentHelix...');
    });
    context.subscriptions.push(disposable);
}
// This method is called when your extension is deactivated
export function deactivate() {
    if (terminal) {
        terminal.dispose();
    }
}
//# sourceMappingURL=extension.js.map