// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { DocsViewerProvider } from './providers';

export function activate(context: vscode.ExtensionContext) {
	const docsViewerProvider = new DocsViewerProvider(context);

	context.subscriptions.push(vscode.window.registerWebviewViewProvider(
		'openapi-docs-viewer.webview',
		docsViewerProvider
	));

	context.subscriptions.push(vscode.commands.registerCommand("openapi-docs-viewer.configiure", async () => {
		docsViewerProvider.showQuickPick();
	}));

	context.subscriptions.push(vscode.window.onDidChangeActiveColorTheme(() => {
		docsViewerProvider.renderWebview();
	}));

	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
		if (
			e.affectsConfiguration("openapi-docs-viewer.defaultRenderer")
			|| e.affectsConfiguration("openapi-docs-viewer.defaultTheme")
			|| e.affectsConfiguration("openapi-docs-viewer.defaultLayout")
		) {
			docsViewerProvider.restoreState();
			docsViewerProvider.renderWebview();
		}
	}));
}

export function deactivate() {}
