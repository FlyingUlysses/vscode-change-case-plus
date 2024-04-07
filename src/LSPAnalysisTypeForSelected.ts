import * as vscode from "vscode";
export class LSPAnalysisTypeForSelected {
    
    private fileType: string;

    private editor;

    private document: vscode.TextDocument;

    private selectedStart;

    private selectedEnd;

    private lastSymbol:Number;

    constructor(editor:any) {
        this.editor = editor;
        this.fileType = this.editor.document.languageId;
        this.document = this.editor.document;
        this.selectedStart = this.editor.selection.start;
        this.selectedEnd = this.editor.selection.end;
        this.lastSymbol = 999;
    }

    public async start(): Promise<string> {
    
        // 注册文档符号提供程序
        this.registerDocSymbolProvider();
    
        // 获取文档符号
        const symbols = await vscode.commands.executeCommand<
          vscode.DocumentSymbol[]
        >("vscode.executeDocumentSymbolProvider", this.document.uri);
        
        if (!symbols || symbols.length === 0) {
            return "";
         }
          // 遍历符号信息,找到包含选中范围的符号
        this.loopFindSymbolType(symbols);
        this.matchSymbolType();
        return "";
        
    }

    private containTheElement(sourceSymbol: vscode.DocumentSymbol) {
        return sourceSymbol.range.contains(this.selectedStart) &&
        sourceSymbol.range.contains(this.selectedEnd);
    }

    private loopFindSymbolType(symbols: vscode.DocumentSymbol[]) {
        for (const symbol of symbols) {
            if (this.containTheElement(symbol)) {
                this.lastSymbol = symbol.kind;
                if (symbol.children && symbol.children.length > 0) {
                    this.loopFindSymbolType(symbol.children);
                } 
            }
        }
    }

    private matchSymbolType() {
        switch (this.lastSymbol) {
            case vscode.SymbolKind.Variable:
                vscode.window.showInformationMessage(
                    "Selected symbol is a variable."
                );
                break;
            case vscode.SymbolKind.Method || vscode.SymbolKind.Function:
                vscode.window.showInformationMessage(
                    "Selected symbol is a method."
                );
                break;
            case vscode.SymbolKind.Constant:
                vscode.window.showInformationMessage(
                    "Selected symbol is a constant."
                );
                break;
            case vscode.SymbolKind.Property || vscode.SymbolKind.Field:
                vscode.window.showInformationMessage(
                    "Selected symbol is a property."
                );
                break;
            case vscode.SymbolKind.Interface || vscode.SymbolKind.Class:
                vscode.window.showInformationMessage(
                    "Selected symbol is a class."
                );
                break;
            default:
                vscode.window.showInformationMessage(
                    "Selected symbol is of unknown type."
                );
                break;
        }
    }

    /**
     * Registers a document symbol provider for the specified file type.
     */
    private registerDocSymbolProvider() {
         vscode.languages.registerDocumentSymbolProvider(
            { scheme: this.fileType },
            {
                provideDocumentSymbols(
                    document: vscode.TextDocument,
                    token: vscode.CancellationToken
                ) {
                    return vscode.commands.executeCommand<vscode.SymbolInformation[]>(
                        "vscode.executeDocumentSymbolProvider",
                        document.uri
                    );
                },
            }
        );
    }
}