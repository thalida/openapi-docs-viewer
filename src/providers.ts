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
      "url": "",
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
    this.renderWebviewView();
  }

  private async renderWebviewView() {
    if (!this.webviewView) {
      return;
    }

    this.webviewView.webview.html = await this.getWebviewHTML();
    this.saveState();
  }

  private async getWebviewHTML() {
    if (!this.webviewView) {
      return "";
    }

    const selectedFramework = this.selectedDocFramework || this.defaultDocFramework;
    const templatePath = vscode.Uri.joinPath(this.extensionContext.extensionUri, "src", "templates", selectedFramework.template);
    const templateStr = fs.readFileSync(templatePath.fsPath, "utf-8");

    const engine = new Liquid();
    return await engine.parseAndRender(
      templateStr,
      {
        url: this.schemaUrl,
      }
    );
  }

  async showQuickPick() {
    const options: { [key: string]: () => Promise<void> } = {
			"Set Schema URL": this.showPickSchemaUrl.bind(this),
			"Set Doc Framework": this.showPickDocFramework.bind(this),
		};
		const quickPick = vscode.window.createQuickPick();
		quickPick.items = Object.keys(options).map(label => ({ label }));
		quickPick.onDidChangeSelection(selection => {
			if (selection[0]) {
				options[selection[0].label]()
					.catch(console.error);
			}
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
  }

  private async showPickDocFramework() {
    const options = this.supportedDocFrameworks.map((framework) => {
      return new SettingsItem(framework.key, framework.label, framework.url, framework.description);
    });
    const result = await vscode.window.showQuickPick(options, {
      placeHolder: "Select a framework to render OpenAPI docs"
    });

    if (result) {
      this.selectedDocFramework = this.supportedDocFrameworks.find(framework => framework.key === result.key);
    }

    this.renderWebviewView();
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

    this.renderWebviewView();
  }
}

class SettingsItem implements vscode.QuickPickItem {
  constructor(public readonly key: string, public readonly label: string, public readonly description: string, public readonly detail: string) {}
}
