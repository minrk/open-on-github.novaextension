exports.activate = function () {
  // Do work when the extension is activated
};

exports.deactivate = function () {
  // Clean up state before the extension is deactivated
};

nova.commands.register("open-on-github.openFile", async (workspace) => {
  var url = await getUrl(workspace);
  nova.openURL(url);
});

// TODO: option?
const git = "/usr/bin/git";

/**
 * @param {string} exe
 * @param {string[]} args
 * @param {string} cwd
 * @returns {string}
 */
function getOutput(exe, args, cwd) {
  const options = {
    args,
    cwd,
  };
  const process = new Process(exe, options);
  var stdoutLines = [];
  process.onStdout((line) => stdoutLines.push(line));
  process.onStderr((line) => console.log(line));
  const stdoutPromise = new Promise((resolve, reject) => {
    process.onDidExit((status) => {
      console.log(`${exe} ${args} in ${cwd} exited with code ${status}`);
      const action = status == 0 ? resolve : reject;

      action(stdoutLines.join("").trim());
    });
  });

  process.start();
  return stdoutPromise;
}

async function getRemoteUrl(repoRoot, remote) {
  const out = await getOutput(git, ["remote", "-v"], repoRoot);
  console.log("out", out);
  let url;
  for (var line of out.split("\n")) {
    line = line.trim();
    var cols = line.split(/\s+/);
    let lineRemote = cols[0];
    if (lineRemote === remote) {
      url = cols[1];
      break;
    }
  }
  // TODO: handle remote not found
  if (url) console.log("found", url);
  if (url.slice(-4) === ".git") {
    // trim trailing .git
    url = url.slice(0, -4);
  }
  // light parsing of URLs
  if (url.indexOf("@")) {
    // turn git@github.com:minrk/foo
    // into https://github.com/minrk/foo
    const parts = url.slice(url.indexOf("@") + 1).split(":");
    const host = parts[0];
    const path = parts[1];
    url = `https://${host}/${path}`;
  }
  // TODO: check that it's GitHub
  return url;
}

async function getUrl(workspace) {
  const editor = workspace.activeTextEditor;
  const doc = editor.document;
  let repoRoot = await getOutput(
    git,
    ["rev-parse", "--show-toplevel"],
    nova.path.dirname(doc.path)
  );
  let HEAD = await getOutput(git, ["rev-parse", "HEAD"], repoRoot);
  // assumes HEAD is available as a ref on origin (works 99% for me)
  // TODO: resolve default branch or tracking branch
  console.log(repoRoot);
  let pathInRepo = nova.path.relative(doc.path, repoRoot);
  console.log("editor", doc, doc.path, repoRoot, pathInRepo);
  let remoteUrl = await getRemoteUrl(repoRoot, "origin");
  let range = editor.selectedRange;
  let lines = rangeToLines(doc, range);
  let lineSlug = `L${lines.start}`;
  if (lines.end > lines.start) {
    lineSlug = `L${lines.start}L${lines.end}`;
  }
  const url = `${remoteUrl}/blob/${HEAD}/${pathInRepo}#${lineSlug}`;
  return url;
}

// adapted from https://github.com/apexskier/nova-typescript/blob/main/src/lspNovaConversions.ts
// MIT License
function rangeToLines(document, range) {
  const fullContents = document.getTextInRange(new Range(0, range.end));
  let offset = 0;
  let startLine = 0;
  let endLine = 0;

  const lines = fullContents.split(document.eol);
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineLength = lines[lineIndex].length + document.eol.length;
    const lineEnd = offset + lineLength;
    if (startLine == 0 && lineEnd > range.start) {
      startLine = lineIndex + 1;
    }
    if (endLine == 0 && lineEnd >= range.end) {
      endLine = lineIndex + 1;
      return { start: startLine, end: endLine };
    }
    offset += lineLength;
  }
  return null;
}
