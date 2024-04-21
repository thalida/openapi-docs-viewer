import * as vscode from "vscode";
import * as fs from "fs";
import { Liquid } from "liquidjs";

interface IRender {
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

  private readonly supportedRenderers: IRender[] = [
    {
      "key": "elements",
      "label": "Stoplight Elements",
      "url": "https://github.com/stoplightio/elements",
      "description": "Build beautiful, interactive API Docs with embeddable React or Web Components, powered by OpenAPI and Markdown.",
      "template": "elements.html",
    },
    {
      "key": "rapidoc",
      "label": "RapiDoc",
      "url": "https://github.com/rapi-doc/RapiDoc",
      "description": "Custom Element for Open-API spec viewing",
      "template": "rapidoc.html",
    },
    {
      "key": "redoc",
      "label": "ReDoc",
      "url": "https://github.com/Redocly/redoc",
      "description": "OpenAPI/Swagger-generated API Reference Documentation",
      "template": "redoc.html",
    },
    {
      "key": "swagger",
      "label": "Swagger UI",
      "url": "https://github.com/swagger-api/swagger-ui",
      "description": "Swagger UI is a collection of HTML, JavaScript, and CSS assets that dynamically generate beautiful documentation from a Swagger-compliant API.",
      "template": "swagger.html",
    },
  ];
  private readonly defaultRenderer: IRender = this.supportedRenderers[0];
  private selectedRenderer: IRender | undefined = this.defaultRenderer;

  private readonly defaultSchemaUrl = "https://petstore.swagger.io/v2/swagger.json";
  private schemaUrl = this.defaultSchemaUrl;

  constructor(context: vscode.ExtensionContext) {
    this.extensionContext = context;
    this.memento = context.workspaceState;
    this.restoreState();
  }

  restoreState() {
    this.schemaUrl = this.memento.get("schemaUrl", this.defaultSchemaUrl);
    const selectedRendererKey = this.memento.get("selectedRendererKey", this.defaultRenderer.key);
    this.selectedRenderer = this.supportedRenderers.find(renderer => renderer.key === selectedRendererKey);
  }

  saveState() {
    this.memento.update("schemaUrl", this.schemaUrl);
    this.memento.update("selectedRendererKey", this.selectedRenderer?.key);
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

  async renderWebview(isPreviewMode = false, previewRenderer?: IRender) {
    if (!this.webviewView) {
      return;
    }

    this.webviewView.webview.html = await this.getWebviewHTML(previewRenderer);

    if (!isPreviewMode) {
      this.saveState();
    }
  }

  private async getWebviewHTML(previewRenderer?: IRender) {
    if (!this.webviewView) {
      return "";
    }

    const selectedRenderer = previewRenderer || this.selectedRenderer || this.defaultRenderer;
    const templatePath = vscode.Uri.joinPath(this.extensionContext.extensionUri, "src", "templates", selectedRenderer.template);
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
        label: "Set Schema URL",
        detail: "Set the URL of the OpenAPI schema",
        description: `Currently: ${this.schemaUrl}`,
        action: this.showPickSchemaUrl.bind(this)
      },
      {
        key: "schemaRenderer",
        label: "Select Schema Renderer",
        detail: "Select an OpenAPI schema renderer",
        description: `Currently: ${this.selectedRenderer?.label || this.defaultRenderer.label}`,
        action: this.showPickRenderer.bind(this)
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

  private async showPickRenderer() {
    const self = this;
    let items = this.supportedRenderers.map((renderer) => {
      const item = new SettingsItem(renderer.key, renderer.label, renderer.url, renderer.description);
      const isPicked = renderer.key === this.selectedRenderer?.key;
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
      title: "Select Schema Renderer",
      placeHolder: "Select an OpenAPI schema renderer (Up/Down to preview, Enter to select)",
      onDidSelectItem(item) {
        const renderer = self.supportedRenderers.find(f => f.key === (item as SettingsItem).key);
        self.renderWebview(true, renderer);
      }
    });

    if (result) {
      this.selectedRenderer = this.supportedRenderers.find(renderer => renderer.key === result.key);
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
