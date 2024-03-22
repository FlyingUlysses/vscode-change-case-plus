import * as vscode from "vscode";
import { StringConvertFactory } from "./StringConvertFactory";

vscode.commands.registerCommand("extension.changeCasePlus", async () => {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return; 
  }
  let originalName = editor.document.getText(editor.selection);
  if (!originalName) {
    return; 
  }

  const factory =new StringConvertFactory(originalName);
  const allCases = factory.getAllCases();
  let newNames = allCases;

  let selectedName = await vscode.window.showQuickPick(newNames, {
    placeHolder: "Select a new name",
  });

  if (!selectedName || selectedName === originalName) {
    return; 
  }

  executeRenameUseCommand(editor.document, editor.selection.active, selectedName);

});

/**
 * Invoke the rename command and apply all changes associated with the edit.
 * 
 * @param document The edited document
 * @param position selected position
 * @param selectedName changed string, maybe with method name or variable name or class name or just a string
 */
async function executeRenameUseCommand(
  document: vscode.TextDocument | undefined,
  position: vscode.Position | undefined,
  selectedName: string | undefined
) {
  const workspaceEdit = (await vscode.commands.executeCommand(
    "vscode.executeDocumentRenameProvider",
    document?.uri,
    position,
    selectedName
  )) as vscode.WorkspaceEdit;

  if (workspaceEdit) {
    await vscode.workspace.applyEdit(workspaceEdit);
    console.log("Rename successfully applied");
  } else {
    console.log("Rename operation could not be applied");
  }
}

async function getAllRefs() {
  let document = vscode.window?.activeTextEditor?.document;
  let position = vscode.window?.activeTextEditor?.selection.active;

  const refs = (await vscode.commands.executeCommand(
    "vscode.executeReferenceProvider",
    document?.uri,
    position
  )) as vscode.Location[];
  console.log("refs:", refs);

  const imps = (await vscode.commands.executeCommand(
    "vscode.executeImplementationProvider",
    document?.uri,
    position
  )) as vscode.Location[];
  console.log("imps:", imps);

  const declarations = (await vscode.commands.executeCommand(
    "vscode.executeDeclarationProvider",
    document?.uri,
    position
  )) as vscode.Location[];
  console.log("declarations:", declarations);

  let typeDefs = (await vscode.commands.executeCommand(
    "vscode.executeTypeDefinitionProvider",
    document?.uri,
    position
  ));
  console.log("typeDefs:", typeDefs);

  const methodDefs = (await vscode.commands.executeCommand(
    "vscode.executeDefinitionProvider",
    document?.uri,
    position
  )) as vscode.Location[];
  console.log("methodDefs:", methodDefs);
  
  return refs.concat(imps,declarations);
}

async function changeAllByPosition(
  refs: vscode.Location[],
  selectedName: string | undefined
) {
  let edit = new vscode.WorkspaceEdit();
  refs.forEach((ref) => {
    // 确认范围有效后，添加替换操作
    if (ref.range) {
      edit.replace(ref.uri, ref.range, selectedName ?? "");
    } else {
      console.error("无效的替换范围，文件:", ref.uri.path);
      // 如果某个替换范围无效，你可以选择抛出错误或跳过
    }
  });

  await vscode.workspace.applyEdit(edit);
}
