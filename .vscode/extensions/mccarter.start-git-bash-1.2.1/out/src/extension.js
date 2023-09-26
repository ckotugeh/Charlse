'use strict';
var vscode = require('vscode');
var path = require('path');
var spawn = require('child_process').spawn;
/**
 * Attempts to open git-bash at the given path
 * @param {string} activateOnPath - The path where git-bash should start
 */
function spawnGitBash(activateOnPath) {
    // Check pre-conditions
    if (!activateOnPath || activateOnPath.length == 0)
        return false;
    console.log("Attempting to open git-bash in folder: " + activateOnPath);
    // Try and spawn a git-bash.exe process
    var pathArg = "--cd=" + activateOnPath;
    var gitProcess = spawn('git-bash.exe', [pathArg]);
    gitProcess.on('error', function (error) {
        var missingGitBash = 'Failed to start bash - is git-bash.exe on the system path?';
        console.error(missingGitBash + '   Underlying spawn error: ' + error);
        vscode.window.showErrorMessage(missingGitBash);
    });
    // Log a message that we think we succeeded in opening a bash window
    console.log('Bash started @ "' + activateOnPath + '"');
    return true;
}
/**
 * Start bash in the current VSCode workspace root folder
 */
function startBash(forceWorkspace) {
    try {
        // If spawn wasn't successfully loaded there's nothing we can do
        if (!spawn) {
            vscode.window.showErrorMessage('Could not start bash - no spawn function found (sorry).');
            return;
        }
        // If there's a file open we'll try and it's directory - even without a workspace
        var activeEditor = vscode.window.activeTextEditor;
        if (activeEditor != null && forceWorkspace !== true) {
            var filePath = path.dirname(activeEditor.document.fileName);
            spawnGitBash(filePath);
            return;
        }
        // No open file, try launching git-bash in the root of the current workspace
        // http://stackoverflow.com/questions/36587904/how-to-start-bash-in-a-directory-in-windows-bat
        // git-bash.exe" --cd=D:\mozdev
        var workspace = vscode.workspace;
        if (!workspace)
            return; // If there's no open work space there's nothing we can do
        spawnGitBash(workspace.rootPath);
    }
    catch (e) {
        var errorMessage = 'Sorry, something went wrong with start-git-bash.  ';
        console.error(errorMessage + e);
        vscode.window.showErrorMessage(errorMessage + '  See the VSCode log for details.');
    } //catch
}
// This method is called when your extension is activated
// The extension will be activated the very first time the command is executed
function activate(context) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('extension.startGitBash', function () { return startBash(false); });
    var workspaceDisposable = vscode.commands.registerCommand('extension.startWorkspaceGitBash', function () { return startBash(true); });
    context.subscriptions.push(disposable);
    context.subscriptions.push(workspaceDisposable);
}
exports.activate = activate;
// This method is called when the extension is deactivated
function deactivate() {
    // Empty
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map