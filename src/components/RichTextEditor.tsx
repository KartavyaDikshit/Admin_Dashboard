'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import to avoid SSR issues as ReactQuill accesses the DOM
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 animate-pulse border rounded-md" />
});

interface RichTextEditorProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
  readOnly?: boolean;
}

export default function RichTextEditor({ value, onChange, label, id, readOnly }: RichTextEditorProps) {
  const [isSourceMode, setIsSourceMode] = useState(false);

  const modules = useMemo(() => ({
    toolbar: readOnly ? false : [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  }), [readOnly]);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'indent',
    'align',
    'link'
  ];

  const toggleSourceMode = () => {
    setIsSourceMode(!isSourceMode);
  };

  return (
    <div className="rich-text-editor mb-6">
      <div className="flex justify-between items-center mb-1">
        {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>}
        {!readOnly && (
          <button
            type="button"
            onClick={toggleSourceMode}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
          >
            {isSourceMode ? 'Switch to Editor' : 'View Source'}
          </button>
        )}
      </div>
      <div className={`bg-white border rounded-md overflow-hidden ${readOnly ? 'bg-gray-50' : ''}`}>
        {isSourceMode ? (
          <textarea
            id={id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-64 p-4 font-mono text-sm resize-y focus:outline-none"
            placeholder="Enter HTML here..."
          />
        ) : (
          <ReactQuill
            id={id}
            theme="snow"
            value={value || ''}
            onChange={onChange}
            modules={modules}
            formats={formats}
            readOnly={readOnly}
            className={`h-64 ${readOnly ? '' : 'mb-12'}`} // Height for the editor content
          />
        )}
      </div>
    </div>
  );
}
