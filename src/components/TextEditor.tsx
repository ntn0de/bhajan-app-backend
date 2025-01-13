"use client";
import {
  EditorProvider,
  Editor,
  Toolbar,
  BtnBold,
  BtnItalic,
} from "react-simple-wysiwyg";

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
  className?: string;
}

export default function TextEditor({
  value,
  onChange,
  className = "",
}: EditorProps) {
  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <EditorProvider>
        <Editor
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            minHeight: "350px",
            width: "100%",
          }}
        >
          <Toolbar>
            <BtnBold />
            <BtnItalic />
          </Toolbar>
        </Editor>
      </EditorProvider>
      {/* Add character count or other helpful information */}
      <div className="p-2 text-sm text-gray-500 border-t">
        Characters: {value.length}
      </div>
    </div>
  );
}
