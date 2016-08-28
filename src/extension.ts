'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


function findSequenceInLine(document : vscode.TextDocument, lineNumber : number, s : string) : number
{
    let line = document.lineAt(lineNumber);
    return line.text.indexOf(s);
}

function findMaxIndex(lines : Map<number, number>)
{
    let lineIndices = Array.from(lines.values());
    return Math.max(...lineIndices);
}

function findSequenceInLines(document : vscode.TextDocument, startLine : number, sequence : string) : Map<number, number>
{
    let lineNumber = startLine;
    let lines : Map<number, number> = new Map;

    let charIndex;
    while((charIndex = findSequenceInLine(document, lineNumber, sequence)) != -1)
    {
        lines = lines.set(lineNumber, charIndex);
        lineNumber = lineNumber + 1;
    }
    lineNumber = startLine - 1;
    while((charIndex = findSequenceInLine(document, lineNumber, sequence)) != -1)
    {
        lines = lines.set(lineNumber, charIndex);
        lineNumber = lineNumber - 1;
    }
    return lines;
}

function insertSpaces(editor : vscode.TextEditor, lines : Map<number, number>) : Thenable<boolean>
{
    let max = findMaxIndex(lines);

    return editor.edit(e =>
        {
            lines.forEach((char, line) =>
                {
                    let filler = " ".repeat(max - char);
                    let pos = new vscode.Position(line, char);
                    e.insert(pos, filler)
                }
            )
        }
    );
}

function align(editor : vscode.TextEditor, sequence : string) : Thenable<boolean>
{
    let lineNumber = editor.selection.active.line
    let indices = findSequenceInLines(editor.document, lineNumber, sequence)
    return insertSpaces(editor, indices);
}

export function activate(context: vscode.ExtensionContext) {


    let tabularize = vscode.commands.registerCommand('vscode-tabularize.tabularize', () =>
        {
            if(vscode.window.activeTextEditor)
            {
                let editor = vscode.window.activeTextEditor
                let text = editor.document.getText(editor.selection)
                align(editor, text);
            }
        }
    );

    let tabularizeInput = vscode.commands.registerCommand('vscode-tabularize.tabularize-input', () =>
        {
            let answer = vscode.window.showInputBox();
            answer.then((text) =>
                {
                    if(vscode.window.activeTextEditor)
                    {
                        let editor = vscode.window.activeTextEditor
                        align(editor, text);
                    }
                }
            );
        }
    );

    context.subscriptions.push(tabularize);
    context.subscriptions.push(tabularizeInput);
}

// this method is called when your extension is deactivated
export function deactivate() {
}