'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
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
  const modules = useMemo(() => ({
    toolbar: readOnly ? false : [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ],
  }), [readOnly]);

  const formats = [
    'bold', 'italic', 'underline',
    'list',
    'align'
  ];

  return (
    <div className="rich-text-editor mb-6">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className={`bg-white border rounded-md overflow-hidden ${readOnly ? 'bg-gray-50' : ''}`}>
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
      </div>
    </div>
  );
}
