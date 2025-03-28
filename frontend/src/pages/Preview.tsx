import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { ChevronDown, ChevronRight, File, Folder, Moon, Sun, Code, Eye, MessageSquare, ListTodo } from 'lucide-react';
import {Backend_URL} from "../../config"
import axios from 'axios';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
}

interface Steps {
  fileName : string,
  status : string
}

export default function Preview() {
  const location = useLocation();
  const projectName = location.state?.projectName || 'Untitled Project';
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const [steps,setSteps] = useState<Steps[]>([])

  // todo: use Useeffect to call template api, then chat api 
    //  todo : use xml parser to generate the the steps 

  const initialFiles: FileNode[] = [
    {
      name: 'src',
      type: 'folder',
      children: [
        {
          name: 'components',
          type: 'folder',
          children: [
            {
              name: 'Header.tsx',
              type: 'file',
              content: 'export default function Header() {\n  return <header>Header</header>;\n}'
            }
          ]
        },
        {
          name: 'App.tsx',
          type: 'file',
          content: 'function App() {\n  return <div>Hello World</div>;\n}'
        }
      ]
    },
    {
      name: 'public',
      type: 'folder',
      children: [
        {
          name: 'index.html',
          type: 'file',
          content: '<!DOCTYPE html>\n<html>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>'
        }
      ]
    }
  ];

  const [files] = useState<FileNode[]>(initialFiles);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderFileTree = (nodes: FileNode[], path = '') => {
    return nodes.map((node) => {
      const currentPath = `${path}/${node.name}`;
      const isExpanded = expandedFolders.has(currentPath);

      if (node.type === 'folder') {
        return (
          <div key={currentPath}>
            <button
              className="flex items-center w-full hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1.5 rounded-md"
              onClick={() => toggleFolder(currentPath)}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Folder className="w-4 h-4 text-blue-500 mx-1" />
              <span className="text-sm">{node.name}</span>
            </button>
            {isExpanded && node.children && (
              <div className="ml-4">
                {renderFileTree(node.children, currentPath)}
              </div>
            )}
          </div>
        );
      }

      return (
        <button
          key={currentPath}
          className={`flex items-center w-full hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1.5 rounded-md ${
            selectedFile === currentPath ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
          onClick={() => setSelectedFile(currentPath)}
        >
          <File className="w-4 h-4 text-gray-500 mx-1" />
          <span className="text-sm">{node.name}</span>
        </button>
      );
    });
  };

  const findFileContent = (nodes: FileNode[], targetPath: string): string | null => {
    for (const node of nodes) {
      if (node.type === 'file' && targetPath.endsWith(node.name)) {
        return node.content || '';
      }
      if (node.type === 'folder' && node.children) {
        const content = findFileContent(node.children, targetPath);
        if (content !== null) return content;
      }
    }
    return null;
  };

  function parseFiles(input : string) {
    const fileObjects = [];
    const regex = /(.*?):\n```([\s\S]*?)\n```/g;
    
    let match;
    while ((match = regex.exec(input)) !== null) {
      fileObjects.push({ fileName: match[1], status: 'completed' });
    }
    
    return fileObjects;
  }

  function parseFileContent(input : string) {
    const fileObjects = [];
    const regex = /(.*?):\n```([\s\S]*?)\n```/g;
    
    let match;
    while ((match = regex.exec(input)) !== null) {
      fileObjects.push({ name: match[1], type: 'file', content: match[2].trim() });
    }
    
    return fileObjects;
  }
  

  useEffect(()=>{
    const templateRes = async ()=>{
      // console.log(projectName)
      const res = await axios.post("http://localhost:3000/api/template",{
        prompts : projectName
      })

      const {prompts,uiPrompts} = res.data
      setSteps(parseFiles(uiPrompts))

      console.log(parseFileContent(uiPrompts))

      const chatRes = await axios.post("http://localhost:3000/api/chat",{
        messages : [
          {
            "role" : "user",
            "content" : prompts[0]
          },
          {
            "role" : "user",
            "content" : prompts[1]
          },
          {
            "role" : "user",
            "content" : projectName
          },
        ]
      })

      console.log(chatRes.data)
      
    }
    templateRes()
  },[])

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{projectName}</h1>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - 50% combined */}
        <div className="w-1/4 flex flex-col border-r border-gray-200 dark:border-gray-700">
          {/* User Prompt Section - 25% */}
          <div className="h-1/4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="h-full bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-semibold text-gray-900 dark:text-white">User Prompt</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Create a modern landing page with a hero section, features grid, and contact form
              </p>
            </div>
          </div>

          {/* Steps Section - 75% */}
          <div className="h-3/4 bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center gap-2 mb-4">
              <ListTodo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Build Steps</h2>
            </div>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    step.status === 'completed'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900'
                      : step.status === 'current'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900'
                      : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        step.status === 'completed'
                          ? 'bg-green-500'
                          : step.status === 'current'
                          ? 'bg-blue-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span className="text-white text-sm">{index + 1}</span>
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{step.fileName}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* File Explorer - 25% */}
        {/* <div className="w-1/4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <FolderTree className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Files</h2>
            </div>
            <div className="space-y-1">
              {renderFileTree(files)}
            </div>
          </div>
        </div> */}

        <div className="w-1/4 border-r border-gray-700 flex flex-col">
        <div className="p-2 text-sm font-medium flex items-center">
          <span className="ml-2">Files</span>
        </div>
        <div className="overflow-y-auto flex-1">{renderFileTree(files)}</div>
        <div className="p-2 text-xs text-gray-500 border-t border-gray-700">{/* File Explorer - 25% */}</div>
      </div>

        {/* Right Content - 25% */}
        <div className="w-1/2 flex flex-col bg-gray-50 dark:bg-gray-900">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <button
              className={`px-4 py-3 flex items-center gap-2 ${
                activeTab === 'code'
                  ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('code')}
            >
              <Code className="w-4 h-4" />
              Code
            </button>
            <button
              className={`px-4 py-3 flex items-center gap-2 ${
                activeTab === 'preview'
                  ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('preview')}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'code' && selectedFile ? (
              <Editor
                height="100%"
                defaultLanguage="typescript"
                theme={isDarkMode ? 'vs-dark' : 'light'}
                value={findFileContent(files, selectedFile) || ''}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  readOnly: true
                }}
              />
            ) : activeTab === 'preview' ? (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                Preview will be shown here
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                Select a file to view its contents
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}