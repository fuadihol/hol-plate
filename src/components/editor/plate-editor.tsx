'use client';

import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { ParagraphPlugin, Plate } from '@udecode/plate/react';

import { useCreateEditor } from '@/components/editor/use-create-editor';
import { SettingsDialog } from '@/components/editor/settings';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { useState } from 'react';
import { useEffect } from 'react';

export function PlateEditor() {
  const [value, setValue] = useState(JSON.stringify([
    {
      children: [{ text: 'Playground' }],
      type: 'h1',
    },
    {
      children: [
        { text: 'A rich-text editor with AI capabilities. Try the ' },
        { bold: true, text: 'AI commands' },
        { text: ' or use ' },
        { kbd: true, text: 'Cmd+J' },
        { text: ' to open the AI menu.' },
      ],
      type: ParagraphPlugin.key,
    },
  ]));
  
  // State baru untuk input textarea
  const [inputValue, setInputValue] = useState(JSON.stringify([
    {
      children: [{ text: 'Masukkan konten editor di sini...' }],
      type: 'p',
    },
  ], null, 2)); // Format JSON dengan indentasi untuk readability
  
  const [isInitialized, setIsInitialized] = useState(false);
  const editor = useCreateEditor();

  // Utility functions untuk mengupdate value secara programmatik
  const updateEditorValue = (newContent: any[]) => {
    setValue(JSON.stringify(newContent));
  };

  const clearEditor = () => {
    const emptyContent = [
      {
        type: 'p',
        children: [{ text: '' }]
      }
    ];
    updateEditorValue(emptyContent);
  };

  const setExampleContent = () => {
    const exampleContent = [
      {
        children: [{ text: 'Contoh Konten Baru' }],
        type: 'h1',
      },
      {
        children: [
          { text: 'Ini adalah contoh konten yang di-inject secara programmatik melalui state ' },
          { bold: true, text: 'value' },
          { text: '.' },
        ],
        type: ParagraphPlugin.key,
      },
      {
        children: [
          { text: 'Value akan selalu ter-sync antara state dan editor berkat useEffect yang telah dibuat.' },
        ],
        type: ParagraphPlugin.key,
      },
    ];
    updateEditorValue(exampleContent);
  };

  // Effect untuk inisialisasi awal editor
  useEffect(() => {
    if (!isInitialized && editor && value) {
      try {
        const parsedValue = JSON.parse(value);
        
        if (Array.isArray(parsedValue) && parsedValue.length > 0) {
          // Inisialisasi editor dengan nilai awal
          editor.tf.init({ 
            value: parsedValue, 
            autoSelect: 'end' 
          });
          setIsInitialized(true);
        }
      } catch (error) {
        console.warn('Error parsing initial value for editor:', error);
        // Fallback ke nilai default jika parsing gagal
        editor.tf.init({ 
          value: [{ type: 'p', children: [{ text: '' }] }], 
          autoSelect: 'start' 
        });
        setIsInitialized(true);
      }
    }
  }, [editor, value, isInitialized]);

  // Effect untuk mengupdate value editor ketika state value berubah (setelah inisialisasi)
  useEffect(() => {
    if (isInitialized && editor && value) {
      try {
        const parsedValue = JSON.parse(value);
        
        if (Array.isArray(parsedValue) && parsedValue.length > 0) {
          // Cek apakah value yang akan di-set berbeda dengan current editor value
          const currentValue = editor.children;
          const currentValueString = JSON.stringify(currentValue);
          
          if (currentValueString !== value) {
            // Update value editor menggunakan setValue
            editor.tf.setValue(parsedValue);
          }
        }
      } catch (error) {
        console.warn('Error parsing value for editor update:', error);
      }
    }
  }, [value, editor, isInitialized]);

  // Handler untuk update state ketika user mengedit di editor
  const handleEditorChange = (newValue: any) => {
    if (isInitialized) {
      const newValueString = JSON.stringify(newValue);
      if (newValueString !== value) {
        setValue(newValueString);
      }
    }
  };

  // Handler untuk submit inputValue ke editor
  const handleSubmitInput = () => {
    try {
      const parsedInput = JSON.parse(inputValue);
      
      if (Array.isArray(parsedInput) && parsedInput.length > 0) {
        setValue(inputValue); // Update setValue dengan inputValue
        // alert('Konten berhasil diupdate ke editor!');
      } else {
        alert('Format JSON tidak valid. Pastikan input adalah array dengan konten yang valid.');
      }
    } catch (error) {
      alert('Error parsing JSON: ' + error.message);
    }
  };

  // Handler untuk sync current editor value ke input textarea
  const syncEditorToInput = () => {
    setInputValue(JSON.stringify(JSON.parse(value), null, 2));
  };

  // Tampilkan loading jika editor belum terinisialisasi
  if (!isInitialized) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="p-4">
      {/* Contoh buttons untuk mendemonstrasikan controlled editor */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button 
          onClick={setExampleContent}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#007acc', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Set Contoh Konten
        </button>
        <button 
          onClick={clearEditor}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Editor
        </button>
        <button 
          onClick={syncEditorToInput}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sync Editor → Input
        </button>
      </div>

      {/* Layout side-by-side antara Input dan Editor */}
      <div style={{ display: 'flex', gap: '20px', height: '500px' }}>
        {/* Input Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' }}>
            JSON Input
          </h3>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Masukkan JSON content untuk editor di sini..."
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'Monaco, "Courier New", monospace',
              resize: 'none',
              outline: 'none',
              backgroundColor: '#fafafa'
            }}
          />
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button 
              onClick={handleSubmitInput}
              style={{ 
                flex: 1,
                padding: '12px 16px', 
                backgroundColor: '#007acc', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Submit ke Editor
            </button>
            <button 
              onClick={() => setInputValue('')}
              style={{ 
                padding: '12px 16px', 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Editor Section */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' }}>
            Plate Editor
          </h3>
          <div style={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
            <DndProvider backend={HTML5Backend}>
              <Plate editor={editor} onChange={handleEditorChange}>
                <EditorContainer>
                  <Editor variant="demo" />
                </EditorContainer>

                <SettingsDialog />
              </Plate>
            </DndProvider>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', fontSize: '12px' }}>
        <strong>Debug Info:</strong>
        <div>Current Value Length: {value.length} characters</div>
        <div>Input Value Length: {inputValue.length} characters</div>
        <div>Editor Initialized: {isInitialized ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
}
