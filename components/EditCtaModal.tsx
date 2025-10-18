import React, { useState, useEffect } from 'react';
import type { CtaConfig } from '../types';
import { bots, knowledgeBases, dataMcps, agents } from '../constants';

interface EditCtaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ctaData: CtaConfig) => void;
  ctaData: CtaConfig;
}

const EditCtaModal: React.FC<EditCtaModalProps> = ({ isOpen, onClose, onSave, ctaData }) => {
  const [formData, setFormData] = useState<CtaConfig>(ctaData);

  useEffect(() => {
    setFormData(ctaData);
  }, [ctaData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "connectorType") {
      setFormData(prev => ({
        ...prev,
        connectorType: value as CtaConfig['connectorType'],
        url: undefined,
        botId: undefined,
        knowledgeBaseId: undefined,
        playlistId: undefined,
        dataMcpId: undefined,
        apiEndpoint: undefined,
        agentId: undefined,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    onSave(formData);
  };

  if (!isOpen) return null;

  const renderConnectorFields = () => {
    switch (formData.connectorType) {
      case 'URL':
        return (
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-1">URL</label>
              <input
                type="text"
                id="url"
                name="url"
                value={formData.url || ''}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
        );
      case 'Bot':
        return (
            <div>
              <label htmlFor="botId" className="block text-sm font-medium text-slate-700 mb-1">Bot</label>
              <select
                id="botId"
                name="botId"
                value={formData.botId || ''}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="" disabled>Select a bot</option>
                {bots.map(bot => <option key={bot.id} value={bot.id}>{bot.name}</option>)}
              </select>
            </div>
        );
      case 'Knowledge Base':
        return (
            <div>
              <label htmlFor="knowledgeBaseId" className="block text-sm font-medium text-slate-700 mb-1">Knowledge Base</label>
              <select
                id="knowledgeBaseId"
                name="knowledgeBaseId"
                value={formData.knowledgeBaseId || ''}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="" disabled>Select a knowledge base</option>
                {knowledgeBases.map(kb => <option key={kb.id} value={kb.id}>{kb.name}</option>)}
              </select>
            </div>
        );
      case 'Learning Videos':
        return (
            <div>
                <label htmlFor="playlistId" className="block text-sm font-medium text-slate-700 mb-1">Playlist ID</label>
                <input
                    type="text"
                    id="playlistId"
                    name="playlistId"
                    value={formData.playlistId || ''}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        );
      case 'Data MCP':
        return (
            <div>
                <label htmlFor="dataMcpId" className="block text-sm font-medium text-slate-700 mb-1">Data MCP</label>
                <select
                    id="dataMcpId"
                    name="dataMcpId"
                    value={formData.dataMcpId || ''}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value="" disabled>Select a Data MCP</option>
                    {dataMcps.map(mcp => <option key={mcp.id} value={mcp.id}>{mcp.name}</option>)}
                </select>
            </div>
        );
      case 'API':
        return (
            <div>
                <label htmlFor="apiEndpoint" className="block text-sm font-medium text-slate-700 mb-1">API Endpoint</label>
                <input
                    type="text"
                    id="apiEndpoint"
                    name="apiEndpoint"
                    value={formData.apiEndpoint || ''}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        );
      case 'RAG':
        return (
            <div>
                <label htmlFor="agentId" className="block text-sm font-medium text-slate-700 mb-1">Agent</label>
                <select
                    id="agentId"
                    name="agentId"
                    value={formData.agentId || ''}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value="" disabled>Select an Agent</option>
                    {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                </select>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white text-slate-800 rounded-lg shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold">Edit CTA Button</h2>
          <p className="text-sm text-slate-500">Make changes to the button text and connector settings.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-slate-700 mb-1">Button Text</label>
            <input
              type="text"
              id="text"
              name="text"
              value={formData.text}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="p-4 border border-slate-200 rounded-md space-y-4">
            <h3 className="font-semibold text-slate-800">Connector Settings</h3>
             <div>
                <label htmlFor="connectorType" className="block text-sm font-medium text-slate-700 mb-1">Connector Type</label>
                <select
                  id="connectorType"
                  name="connectorType"
                  value={formData.connectorType}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option>URL</option>
                  <option>Bot</option>
                  <option>Knowledge Base</option>
                  <option>Learning Videos</option>
                  <option>Data MCP</option>
                  <option>API</option>
                  <option>RAG</option>
                </select>
             </div>
             {renderConnectorFields()}
          </div>
        </div>
        <div className="p-6 bg-slate-50 flex justify-end space-x-2 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-100">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditCtaModal;
