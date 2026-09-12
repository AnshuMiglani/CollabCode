export const LANGUAGES = [
  { label: "C++", value: "cpp", ext: "cpp", color: "#00599c", isRunnable: true },
  { label: "C", value: "c", ext: "c", color: "#a8b9cc", isRunnable: true },
  { label: "Python", value: "python", ext: "py", color: "#3776ab", isRunnable: true },
  { label: "JavaScript", value: "javascript", ext: "js", color: "#f7df1e", isRunnable: true },
  { label: "TypeScript", value: "typescript", ext: "ts", color: "#3178c6", isRunnable: true },
  { label: "Java", value: "java", ext: "java", color: "#ed8b00", isRunnable: true },
  { label: "HTML", value: "html", ext: "html", color: "#e34f26", isRunnable: false },
  { label: "CSS", value: "css", ext: "css", color: "#1572b6", isRunnable: false },
  { label: "JSON", value: "json", ext: "json", color: "#cbd5e1", isRunnable: false },
  { label: "Rust", value: "rust", ext: "rs", color: "#dea584", isRunnable: true },
  { label: "Go", value: "go", ext: "go", color: "#00add8", isRunnable: true },
];

// Judge0 CE Language IDs (Free, Public, No-Auth, Real-Time Online Compilers)
export const JUDGE0_LANGUAGES = {
  cpp: 54,        // C++ (GCC 9.2.0)
  c: 50,          // C (GCC 9.2.0)
  python: 71,     // Python 3 (3.8.1)
  javascript: 93, // JavaScript (Node.js 18.15.0)
  typescript: 94, // TypeScript (5.0.3)
  java: 62,       // Java (OpenJDK 13.0.1)
  rust: 73,       // Rust (1.40.0)
  go: 60,         // Go (1.13.5)
};

export const DEFAULT_TEMPLATES = {
  cpp: `// C++ Playground\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from C++ in CollabCode! 🚀" << endl;\n    return 0;\n}\n`,
  c: `// C Playground\n#include <stdio.h>\n\nint main() {\n    printf("Hello from C in CollabCode!\\n");\n    return 0;\n}\n`,
  python: `# Python Playground\ndef greet(name):\n    return f"Hello, {name}! 🚀"\n\nprint(greet("Developer"))\n`,
  javascript: `// JavaScript Playground\nfunction fibonacci(n) {\n  const seq = [0, 1];\n  for (let i = 2; i < n; i++) {\n    seq.push(seq[i - 1] + seq[i - 2]);\n  }\n  return seq;\n}\n\nconsole.log("Fibonacci Sequence:", fibonacci(8));\n`,
  typescript: `// TypeScript Playground\ninterface Collaborator {\n  id: string;\n  name: string;\n}\n\nconst user: Collaborator = { id: "collab-1", name: "Alex" };\nconsole.log(\`Collaborator: \${user.name}\`);\n`,
  java: `// Java Playground\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java in CollabCode!");\n    }\n}\n`,
  html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Preview</title>\n  <style>\n    body { font-family: sans-serif; padding: 2rem; background: #0f111a; color: #fff; text-align: center; }\n    h1 { color: #38bdf8; }\n  </style>\n</head>\n<body>\n  <h1>Live HTML Preview</h1>\n  <p>Collaborative frontend editing made simple.</p>\n</body>\n</html>\n`,
  css: `/* CSS Styles */\nbody {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n  background: #090a0f;\n  color: #f1f5f9;\n  font-family: system-ui, sans-serif;\n}\n`,
  json: `{\n  "project": "CollabCode",\n  "version": "2.0.0",\n  "status": "production-ready",\n  "realtime": true\n}\n`,
  rust: `// Rust Playground\nfn main() {\n    println!("Hello from Rust in CollabCode!");\n}\n`,
  go: `// Go Playground\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Go in CollabCode!")\n}\n`
};

export const getLangByExt = (ext) => {
  const cleanExt = ext?.toLowerCase().replace(/^\./, "");
  return LANGUAGES.find((l) => l.ext === cleanExt) || LANGUAGES[0];
};

export const getLangByValue = (val) => {
  return LANGUAGES.find((l) => l.value === val) || LANGUAGES[0];
};

export const renameFileExt = (filename, newExt) => {
  const base = filename.includes(".")
    ? filename.substring(0, filename.lastIndexOf("."))
    : filename;
  return `${base}.${newExt}`;
};