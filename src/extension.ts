import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	const provider = new Conversor(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(Conversor.viewType, provider));

}

class Conversor implements vscode.WebviewViewProvider {

	public static readonly viewType = 'converter.timesstamp';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'colorSelected':
					{
						vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
						break;
					}
			}
		});
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
		const jquery = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'jquery.min.js'));

		// Do the same for the stylesheet.
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>Convert Times</title>
			</head>
			<body>
				<label>Languange:</label>
				<select id="lang">
					<option value="br">Portuguese-Br</option>
					<option value="en">English</option>
				</select>
				<br><hr><br><br>

				<center>Timestamp to Date</center>
				<label class="alert"></label>
				<input type="text" id="timesstamp">
				<div class="chk">
					<input type="checkbox" id="horas" value="1"><label for="horas">Hours</label>
					<input type="checkbox" id="form" value="1"><label for="form">Y-m-d</label>
					<input type="checkbox" id="op" value="1"><label for="op">Manual</label>
					<input type="text" id="timesstampmanual" placeholder="Manual format">
				</div>
				<button class="convert">Converter</button>
				<div class="result" id="result"></div>
				<br><br><br>

				<center>Date to Timestamp</center>
				<label class="alert2"></label>
				<input type="datetime-local" id="datasdate">
				<button class="convertdate">Converter</button>
				<div class="result" id="result2"></div>

				<script nonce="${nonce}" src="${jquery}"></script>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}