import * as vscode from "vscode";
import * as fs from "fs";
import { Liquid } from "liquidjs";

interface IDocFramework {
  key: string;
  label: string;
  url: string;
  description: string;
  template: string;
}

interface IQuickPickOption {
  key: string;
  label: string;
  description: string;
  detail: string;
  action: () => Promise<void>;
}


export class DocsViewerProvider implements vscode.WebviewViewProvider {
  private extensionContext: vscode.ExtensionContext;
  private webviewView: vscode.WebviewView | undefined;

  private memento: vscode.Memento;

  private readonly supportedDocFrameworks: IDocFramework[] = [
    {
      "key": "elements",
      "label": "Stoplight Elements",
      "url": "https://github.com/stoplightio/elements",
      "description": "Build beautiful, interactive API Docs with embeddable React or Web Components, powered by OpenAPI and Markdown.",
      "template": "elements.html",
    },
    {
      "key": "swagger",
      "label": "Swagger UI",
      "url": "https://github.com/swagger-api/swagger-ui",
      "description": "Swagger UI is a collection of HTML, JavaScript, and CSS assets that dynamically generate beautiful documentation from a Swagger-compliant API.",
      "template": "swagger.html",
    },
    {
      "key": "rapidoc",
      "label": "RapiDoc",
      "url": "https://github.com/rapi-doc/RapiDoc",
      "description": "Custom Element for Open-API spec viewing",
      "template": "rapidoc.html",
    },
  ];
  private readonly defaultDocFramework: IDocFramework = this.supportedDocFrameworks[0];
  private selectedDocFramework: IDocFramework | undefined = this.defaultDocFramework;

  private readonly defaultSchemaUrl = "https://petstore.swagger.io/v2/swagger.json";
  private schemaUrl = this.defaultSchemaUrl;

  constructor(context: vscode.ExtensionContext) {
    this.extensionContext = context;
    this.memento = context.workspaceState;
    this.restoreState();
  }

  restoreState() {
    this.schemaUrl = this.memento.get("schemaUrl", this.defaultSchemaUrl);
    const selectedDocFrameworkKey = this.memento.get("selectedDocFrameworkKey", this.defaultDocFramework.key);
    this.selectedDocFramework = this.supportedDocFrameworks.find(framework => framework.key === selectedDocFrameworkKey);
  }

  saveState() {
    this.memento.update("schemaUrl", this.schemaUrl);
    this.memento.update("selectedDocFrameworkKey", this.selectedDocFramework?.key);
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true
    };
    this.webviewView = webviewView;
    this.renderWebview();
  }

  async renderWebview(isPreviewMode = false, previewFramework?: IDocFramework) {
    if (!this.webviewView) {
      return;
    }

    this.webviewView.webview.html = await this.getWebviewHTML(previewFramework);

    if (!isPreviewMode) {
      this.saveState();
    }
  }

  private async getWebviewHTML(previewFramework?: IDocFramework) {
    if (!this.webviewView) {
      return "";
    }

    const selectedFramework = previewFramework || this.selectedDocFramework || this.defaultDocFramework;
    const templatePath = vscode.Uri.joinPath(this.extensionContext.extensionUri, "src", "templates", selectedFramework.template);
    const templateStr = fs.readFileSync(templatePath.fsPath, "utf-8");

    const darkThemes = [ vscode.ColorThemeKind.Dark, vscode.ColorThemeKind.HighContrast ];
    const isDarkTheme = darkThemes.includes(vscode.window.activeColorTheme.kind);

    const engine = new Liquid();
    return await engine.parseAndRender(
      templateStr,
      {
        url: this.schemaUrl,
        theme: isDarkTheme ? "dark" : "light"
      }
    );
  }

  async showQuickPick() {
    const options: IQuickPickOption[] = [
      {
        key: "schemaUrl",
        label: "Schema URL",
        detail: "Set the URL of the OpenAPI schema",
        description: `Currently: ${this.schemaUrl}`,
        action: this.showPickSchemaUrl.bind(this)
      },
      {
        key: "docFramework",
        label: "Display Framework",
        detail: "Select a framework to render OpenAPI docs",
        description: `Currently: ${this.selectedDocFramework?.label || this.defaultDocFramework.label}`,
        action: this.showPickDocFramework.bind(this)
      }
    ];
		const quickPick = vscode.window.createQuickPick();
    quickPick.title = "OpenAPI Docs Viewer Configuration";
		quickPick.items = options;
		quickPick.onDidChangeSelection(selection => {
			if (selection[0]) {
				(selection[0] as IQuickPickOption)
          .action()
          .catch(console.error);
			}
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
  }

  private async showPickDocFramework() {
    const self = this;
    let items = this.supportedDocFrameworks.map((framework) => {
      const item = new SettingsItem(framework.key, framework.label, framework.url, framework.description);
      const isPicked = framework.key === this.selectedDocFramework?.key;
      item.picked = isPicked;
      item.iconPath = isPicked ? new vscode.ThemeIcon("check") : undefined;
      return item;
    });
    items = items.sort((a, b) => {
      if (a.picked) {
        return -1;
      }
      if (b.picked) {
        return 1;
      }
      return 0;
    });

    const result = await vscode.window.showQuickPick(items, {
      title: "Select Display Framework",
      placeHolder: "Select a framework to render OpenAPI docs (Up/Down to preview, Enter to select)",
      onDidSelectItem(item) {
        const framework = self.supportedDocFrameworks.find(f => f.key === (item as SettingsItem).key);
        self.renderWebview(true, framework);
      }
    });

    if (result) {
      this.selectedDocFramework = this.supportedDocFrameworks.find(framework => framework.key === result.key);
    }

    this.renderWebview();
  }

  private async showPickSchemaUrl() {
    const result = await vscode.window.showInputBox({
      value: this.schemaUrl,
      prompt: "Enter the URL of the OpenAPI schema",
      placeHolder: "https://example.com/openapi.json",
      validateInput: text => {
        try {
          const url = new URL(text);

          if (url.protocol !== "http:" && url.protocol !== "https:") {
            return "Invalid protocol";
          }

          return null;
        } catch (error) {
          return "Invalid URL";
        }
      }
    });

    if (result) {
      this.schemaUrl = result;
    }

    this.renderWebview();
  }
}

class SettingsItem implements vscode.QuickPickItem {
  picked?: boolean | undefined;
  iconPath?: vscode.Uri | { light: vscode.Uri; dark: vscode.Uri; } | vscode.ThemeIcon | undefined;
  constructor(public readonly key: string, public readonly label: string, public readonly description: string, public readonly detail: string) {}
}
