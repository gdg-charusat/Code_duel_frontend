import { useState } from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor() {
  const [code, setCode] = useState<string>("// Start coding here...");
  const [language, setLanguage] = useState<string>("javascript");

  return (
    <div style={{ padding: "20px" }}>
      <h2>Live Code Duel</h2>

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="python">Python</option>
        <option value="cpp">C++</option>
      </select>

      <div style={{ marginTop: "10px" }}>
        <Editor
          height="500px"
          language={language}
          value={code}
          theme="vs-dark"
          onChange={(value) => setCode(value || "")}
        />
      </div>
    </div>
  );
}