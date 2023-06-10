
exports.activate = function() {
    // Do work when the extension is activated
}

exports.deactivate = function() {
    // Clean up state before the extension is deactivated
}


var repoUrls = {};

function getOutput(exe: string, args: string[], cwd?: string) {
	const options = {
		args,
		cwd
	};
	const process = new Process(location, options);
    var lines = [];
	process.onStdout(line => lines.push(line));

	const p = new Promise((resolve, reject) => {
		process.onDidExit(status => {
			console.log(`Exited ${exe} ${args} in ${cwd} with code ${status}`);
			const action = status == 0 ? resolve : reject;

			action(status);
		});
	});

	process.start();
	return onExit;
}

nova.commands.register("open-on-github.openURL", (workspace) => {
    var options = {
        "placeholder": "https://foobar.com",
        "prompt": "Open"
    };
    nova.workspace.showInputPanel("Enter the URL to open:", options, function(result) {
        if (result) {
            nova.openURL(result, function(success) {

            });
        }
    });
});


nova.commands.register("open-on-github.runExternalTool", (workspace) => {
    var options = {
        "placeholder": "/path/to/tool",
        "prompt": "Run"
    };
    nova.workspace.showInputPanel("Enter the path to the external tool:", options, function(result) {
        if (result) {
            var options = {
                // "args": [],
                // "env": {},
                // "stdin": <any buffer or string>
            };

            var process = new Process(result, options);
            var lines = [];

            process.onStdout(function(data) {
                if (data) {
                    lines.push(data);
                }
            });

            process.onDidExit(function(status) {
                var string = "External Tool Exited with Stdout:\n" + lines.join("");
                nova.workspace.showInformativeMessage(string);
            });

            process.start();
        }
    });
});


function getRemoteUrl() {
  let path = editor.path;
  let path = nova.path.dirname(editor.path);
  console.log("editor", path);
  var options = {}

  var process = new Process(["git", "remote", "-v"], options);
            process.onStdout(function(data) {
                if (data) {
                    lines.push(data);
                }
            });

            process.onDidExit(function(status) {
                var string = "External Tool Exited with Stdout:\n" + lines.join("");
                nova.workspace.showInformativeMessage(string);
            });

            process.start();
}
