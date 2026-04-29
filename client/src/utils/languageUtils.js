export const LANGUAGES = [
  { label: "JavaScript", value: "javascript", ext: "js",   id: 63, icon: "/JavaScript.png" },
  { label: "Python",     value: "python",     ext: "py",   id: 71, icon: "/Python.png" },
  { label: "C++",        value: "cpp",        ext: "cpp",  id: 54, icon: "/C++.png" },
  { label: "Java",       value: "java",       ext: "java", id: 62, icon: "/Java.png" },
  { label: "TypeScript", value: "typescript", ext: "ts",   id: 74, icon: "/TypeScript.png" },
  { label: "C",          value: "c",          ext: "c",    id: 50, icon: "/C.png" },
];

export const DEFAULT_CODE = {
  javascript: `// JavaScript\nconsole.log("Hello, World!");`,
  python:     `# Python\nprint("Hello, World!")`,
  cpp:        `// C++\n#include<iostream>\nusing namespace std;\nint main(){\n  cout << "Hello, World!" << endl;\n  return 0;\n}`,
  java:       `// Java\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}`,
  typescript: `// TypeScript\nconsole.log("Hello, World!");`,
  c:          `// C\n#include<stdio.h>\nint main(){\n  printf("Hello, World!\\n");\n  return 0;\n}`,
};

export const getLangByExt = (ext) =>
  LANGUAGES.find((l) => l.ext === ext) || LANGUAGES[0];

export const getLangByValue = (value) =>
  LANGUAGES.find((l) => l.value === value) || LANGUAGES[0];

export const getFileIcon = (name) => {
  const ext = name.split(".").pop();
  return LANGUAGES.find((l) => l.ext === ext)?.icon || "📄";
};

// Rename file when language changes e.g. main.js -> main.py
export const renameFileExt = (filename, newExt) => {
  const base = filename.includes(".")
    ? filename.substring(0, filename.lastIndexOf("."))
    : filename;
  return `${base}.${newExt}`;
};