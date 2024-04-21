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

type IQuickPickItem = IQuickPickOption | IQuickPickSeparator;

interface IQuickPickOption {
  key: string;
  label: string;
  description: string;
  detail: string;
  action: () => Promise<void>;
}

interface IQuickPickSeparator {
  label: string;
  kind: vscode.QuickPickItemKind.Separator;
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
  private defaultRenderer: IRender = this.supportedRenderers.find(renderer => renderer.key === "elements")!;
  private selectedRenderer: IRender = this.defaultRenderer;

  private defaultTheme: "system" | "light" | "dark" = "system";
  private selectedTheme: "system" | "light" | "dark" = this.defaultTheme;

  private readonly defaultSchemaUrl = "https://petstore.swagger.io/v2/swagger.json";
  private schemaUrl = this.defaultSchemaUrl;

  constructor(context: vscode.ExtensionContext) {
    this.extensionContext = context;
    this.memento = context.workspaceState;
    this.restoreState();
  }

  restoreState() {
    const configuration = vscode.workspace.getConfiguration();

    const configuredDefaultRenderer = configuration.get<string>("openapi-docs-viewer.defaultRenderer");
    if (configuredDefaultRenderer) {
      this.selectedRenderer = this.supportedRenderers.find(renderer => renderer.key === configuredDefaultRenderer) || this.defaultRenderer;
    } else {
      this.selectedRenderer = this.defaultRenderer;
    }

    const configuredDefaultTheme = configuration.get<string>("openapi-docs-viewer.defaultTheme");
    if (configuredDefaultTheme) {
      this.selectedTheme = configuredDefaultTheme as "system" | "light" | "dark" || this.defaultTheme;
    } else {
      this.selectedTheme = this.defaultTheme;
    }

    this.schemaUrl = this.memento.get("schemaUrl", this.defaultSchemaUrl);
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

  async renderWebview(overrides?: { renderer?: IRender, theme?: "system" | "light" | "dark" }) {
    if (!this.webviewView) {
      return;
    }

    this.webviewView.webview.html = await this.getWebviewHTML(overrides);
  }

  private async getWebviewHTML(overrides?: { renderer?: IRender, theme?: "system" | "light" | "dark" }) {
    if (!this.webviewView) {
      return "";
    }

    const selectedRenderer = overrides?.renderer || this.selectedRenderer;
    const templatePath = vscode.Uri.joinPath(this.extensionContext.extensionUri, "src", "templates", selectedRenderer.template);
    const templateStr = fs.readFileSync(templatePath.fsPath, "utf-8");

    const selectedTheme = overrides?.theme || this.selectedTheme;
    const darkThemes = [ vscode.ColorThemeKind.Dark, vscode.ColorThemeKind.HighContrast ];
    const isDarkTheme = (
      selectedTheme === "dark" ||
      (selectedTheme === "system" && darkThemes.includes(vscode.window.activeColorTheme.kind))
    );

    const engine = new Liquid();
    return await engine.parseAndRender(
      templateStr,
      {
        url: this.schemaUrl,
        theme: isDarkTheme ? "dark" : "light",
        isSystemTheme: selectedTheme === "system",
      }
    );
  }

  async showQuickPick() {
    const items: IQuickPickItem[] = [
      {
        key: "schemaUrl",
        label: "Set Schema URL",
        detail: "URL of the OpenAPI schema to render",
        description: `Currently: ${this.schemaUrl}`,
        action: this.showPickSchemaUrl.bind(this)
      },
      {
        label: "Extension Settings",
        kind: vscode.QuickPickItemKind.Separator,
      },
      {
        key: "schemaRenderer",
        label: "Select Schema Renderer",
        detail: "Updates Workspace Setting: openapi-docs-viewer.defaultRenderer",
        description: `Currently: ${this.selectedRenderer?.label || this.defaultRenderer.label}`,
        action: this.showPickRenderer.bind(this)
      },
      {
        key: "schemaTheme",
        label: "Select Theme",
        detail: "Updates Workspace Setting: openapi-docs-viewer.defaultTheme",
        description: `Currently: ${this.selectedTheme}`,
        action: this.showPickTheme.bind(this)
      }
    ];
		const quickPick = vscode.window.createQuickPick();
    quickPick.title = "OpenAPI Docs Viewer Configuration";
		quickPick.items = items;
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
        self.renderWebview({
          renderer: renderer,
        });
      }
    });

    if (result) {
      this.selectedRenderer = this.supportedRenderers.find(renderer => renderer.key === result.key) || this.defaultRenderer;
      await vscode.workspace.getConfiguration().update("openapi-docs-viewer.defaultRenderer", this.selectedRenderer.key, vscode.ConfigurationTarget.Workspace);
    }

    this.renderWebview();
  }

  private async showPickTheme() {
    const self = this;
    let items = [
      {
        key: "system",
        label: "System",
        description: "Use the system theme",
        detail: "System theme",
      },
      {
        key: "light",
        label: "Light",
        description: "Use the light theme",
        detail: "Light theme",
      },
      {
        key: "dark",
        label: "Dark",
        description: "Use the dark theme",
        detail: "Dark theme",
      }
    ].map((theme) => {
      const item = new SettingsItem(theme.key, theme.label, theme.description, theme.detail);
      const isPicked = theme.key === this.selectedTheme;
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
      title: "Select Theme",
      placeHolder: "Select a theme (Up/Down to preview, Enter to select)",
      onDidSelectItem(item) {
        self.renderWebview({
          theme: (item as SettingsItem).key as "system" | "light" | "dark",
        });
      }
    });

    if (result) {
      this.selectedTheme = result.key as "system" | "light" | "dark";
      await vscode.workspace.getConfiguration().update("openapi-docs-viewer.defaultTheme", this.selectedTheme, vscode.ConfigurationTarget.Workspace);
    }

    this.renderWebview();
  }
}

class SettingsItem implements vscode.QuickPickItem {
  picked?: boolean | undefined;
  iconPath?: vscode.Uri | { light: vscode.Uri; dark: vscode.Uri; } | vscode.ThemeIcon | undefined;
  kind?: vscode.QuickPickItemKind | undefined;
  constructor(public readonly key: string, public readonly label: string, public readonly description: string, public readonly detail: string) {}
}
