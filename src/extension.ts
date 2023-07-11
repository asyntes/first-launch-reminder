import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "first-launch-reminder" is now active!');

	// Retrieve the message from the global state, or use a default message if there is no saved message
	let message = context.globalState.get<string>('message') || 'Do not forget to do X!';

	// Create and show a new Webview when the extension is activated
	const panel = vscode.window.createWebviewPanel('reminder', 'Reminder', vscode.ViewColumn.One, {
		// Enable scripts in the webview
		enableScripts: true,
	});

	panel.webview.html = getWebviewContent(message);

	// Listen to messages sent from the webview
	panel.webview.onDidReceiveMessage(async message => {
		if (message.command === 'updateMessage') {
			const newMessage = await vscode.window.showInputBox({ prompt: 'Enter a new message' });
			if (newMessage !== undefined) {
				// Save the new message in the global state
				await context.globalState.update('message', newMessage);
				// Update the webview with the new message
				panel.webview.html = getWebviewContent(newMessage);
			}
		}
	}, undefined, context.subscriptions);

	context.subscriptions.push(panel);
}

function getWebviewContent(message: string) {
	// Use the provided message as the content of the webview
	return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reminder</title>
            <style>
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    height: 100vh;
                    font-size: 2em;
                    font-family: Arial, sans-serif;
                }
                button {
                    margin-top: 2em;
                    padding: 1em 2em;
                    font-size: 0.5em;
                }
            </style>
        </head>
        <body>
            <div>
                ${message}
            </div>
            <button id="updateButton">Update Message</button>
            <script>
                const vscode = acquireVsCodeApi();
                document.getElementById('updateButton').addEventListener('click', () => {
                    vscode.postMessage({ command: 'updateMessage' });
                });
            </script>
        </body>
        </html>
    `;
}

export function deactivate() { }
