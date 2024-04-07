import * as vscode from "vscode";
import { StringConvertFactory } from "./StringConvertFactory";
import { LSPAnalysisTypeForSelected } from "./LSPAnalysisTypeForSelected";

export function activate(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand("changeCasePlus", async () => {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    let originalName = editor.document.getText(editor.selection);
    if (!originalName) {
      return;
    }

    const fileType = editor.document.languageId;
    const converterNameList = getConverterNameListByFileType(fileType);

    const factory = new StringConvertFactory();
    const allCases = factory.getAllCases(originalName, converterNameList);

    const allOptionList: { label: string; picked: boolean }[] = [];

    allCases.forEach((name, index) => {
      if (index === 0) {
        allOptionList.push({ label: name, picked: false });
      } else {
        allOptionList.push({ label: name, picked: false });
      }
    });

    let selectedOption = await vscode.window.showQuickPick(allOptionList, {
      placeHolder: "Select a new name",
    });

    if (!selectedOption || selectedOption.label === originalName) {
      return;
    }

    // executeRenameUseCommand(
    //   editor.document,
    //   editor.selection.active,
    //   selectedOption.label
    // );

    let lsp =new LSPAnalysisTypeForSelected(editor);
    lsp.start();
    
  });
}

function getConverterNameListByFileType(fileType: string): string[] {
  if (!fileType) {
    return [];
  }
  const configuration = vscode.workspace.getConfiguration("converterList");
  let list = configuration.get(fileType, []) as string[];
  if (list.length === 0) {
    list = configuration.get("defaultList", []) as string[];
  }
  return list;
}

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
