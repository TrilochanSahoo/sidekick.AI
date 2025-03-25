import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2 } from 'lucide-react';

export default function Home() {
  const [projectName, setProjectName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      navigate('/preview', { state: { projectName } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="flex items-center justify-center mb-8">
          <Code2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Website Builder
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          Create your website with just a few clicks
        </p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter your project name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}