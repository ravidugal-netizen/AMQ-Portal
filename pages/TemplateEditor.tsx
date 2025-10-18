import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { ServiceCardData, TemplateData, CtaConfig, CustomTemplate, Tenant, ViewMode, ViewAs, User } from '../types';
import EditServiceCardModal from '../components/EditServiceCardModal';
import EditCtaModal from '../components/EditCtaModal';
import { ChevronRightIcon, iconMap, EditIcon, SpinnerIcon, TrashIcon, SaveIcon, EnterFullScreenIcon, ExitFullScreenIcon } from '../components/Icons';
import { generateTemplateFromPrompt, generateNewCardFromContext } from '../lib/gemini';
import SaveBaseTemplateModal from '../components/SaveBaseTemplateModal';
import DeleteBaseTemplateModal from '../components/DeleteBaseTemplateModal';

type SidebarTab = 'templates' | 'colors' | 'brand' | 'amq-assistant';


// --- Modals for Save/Load ---
const SaveTemplateModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (name: string) => void; }> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    if (!isOpen) return null;

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-brand-surface text-slate-800 dark:text-slate-200 rounded-lg shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-slate-200 dark:border-brand-dark">
                    <h2 className="text-xl font-bold">Save as Custom Template</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Save the current design as a new custom template for this tenant.</p>
                </div>
                <div className="p-6">
                    <label htmlFor="templateName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Template Name</label>
                    <input
                        id="templateName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Summer Campaign Version"
                        className="w-full bg-white dark:bg-brand-dark border border-slate-300 dark:border-brand-dark rounded-md px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                </div>
                <div className="p-4 bg-slate-50 dark:bg-black/20 flex justify-end space-x-2 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-white dark:bg-brand-dark border border-slate-300 dark:border-brand-dark text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-brand-dark/80">Cancel</button>
                    <button onClick={handleSave} disabled={!name.trim()} className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary-hover disabled:bg-slate-400 dark:disabled:bg-slate-600">Save</button>
                </div>
            </div>
        </div>
    );
};


// --- Inline Editable Component ---
const InlineEditable: React.FC<{
  value: string;
  onSave: (newValue: string) => void;
  viewMode: ViewMode;
  as?: 'h1' | 'h2' | 'p' | 'span' | 'textarea';
  className?: string;
  inputClassName?: string;
  textareaClassName?: string;
  style?: React.CSSProperties;
}> = ({ value, onSave, viewMode, as = 'span', className, inputClassName, textareaClassName, style }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      textareaRef.current?.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (currentValue !== value) {
        onSave(currentValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && as !== 'textarea') {
      handleSave();
    } else if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  const Tag = as === 'textarea' ? 'p' : as;
  
  if (viewMode !== 'Edit' || !isEditing) {
    return (
      <Tag
        style={style}
        className={`${className} ${viewMode === 'Edit' ? 'cursor-pointer hover:outline-dashed hover:outline-1 hover:outline-slate-400 dark:hover:outline-slate-500 rounded-sm -m-px p-px transition-all' : ''}`}
        onClick={() => viewMode === 'Edit' && setIsEditing(true)}
      >
        {value || ' '}
      </Tag>
    );
  }

  if (as === 'textarea') {
    return (
      <textarea
        ref={textareaRef}
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`${className} ${textareaClassName} bg-white/20 dark:bg-black/20 rounded-md ring-2 ring-brand-primary focus:outline-none w-full`}
        rows={3}
      />
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={currentValue}
      onChange={(e) => setCurrentValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      className={`${className} ${inputClassName} bg-white/20 dark:bg-black/20 rounded-md ring-2 ring-brand-primary focus:outline-none w-full`}
    />
  );
};


// --- Sidebar Components ---
const HorizontalTabButton: React.FC<{ label: string, isActive: boolean, onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            isActive
                ? 'border-brand-primary text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-brand-dark hover:text-slate-700 dark:hover:text-slate-200'
        }`}
    >
        {label}
    </button>
);

const AmqAssistantPanel: React.FC<{ onGenerate: (prompt: string) => void; isGenerating: boolean; }> = ({ onGenerate, isGenerating }) => {
    const [prompt, setPrompt] = useState('');

    const handleGenerate = () => {
        if (prompt.trim() && !isGenerating) {
            onGenerate(prompt.trim());
        }
    };
    
    return (
        <div className="p-4 space-y-4 flex flex-col h-full">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AMQ Assistant</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Describe the website you want to create. The AI assistant will generate a new template with contextual branding and content.</p>
            <div className="flex-grow flex flex-col space-y-2">
                <label htmlFor="ai-prompt" className="text-sm font-medium text-slate-700 dark:text-slate-300">Prompt</label>
                <textarea
                    id="ai-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., a modern website for a financial consulting firm targeting young professionals"
                    className="w-full flex-grow bg-white dark:bg-brand-dark border border-slate-300 dark:border-brand-dark rounded-md p-2 text-slate-900 dark:text-white resize-none"
                    rows={8}
                />
            </div>
            <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isGenerating ? <SpinnerIcon className="animate-spin w-5 h-5 mr-2" /> : 'Generate Template'}
            </button>
        </div>
    );
};


const ColorsPanel: React.FC<{ templateData: TemplateData, onUpdate: (data: Partial<TemplateData>) => void }> = ({ templateData, onUpdate }) => {
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ colorPalette: { ...templateData.colorPalette, [e.target.name]: e.target.value } });
    };

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Colors</h3>
            {Object.entries(templateData.colorPalette).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">{value}</span>
                        <input type="color" name={key} value={value} onChange={handleColorChange} className="w-8 h-8 bg-transparent border-none cursor-pointer" />
                    </div>
                </div>
            ))}
        </div>
    );
};

const BrandPanel: React.FC<{ templateData: TemplateData, onUpdate: (data: Partial<TemplateData>) => void }> = ({ templateData, onUpdate }) => {
    const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ brand: { ...templateData.brand, [e.target.name]: e.target.value } });
    };

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Brand</h3>
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Brand Name</label>
                <input type="text" name="name" value={templateData.brand.name} onChange={handleBrandChange} className="w-full bg-white dark:bg-brand-dark border border-slate-300 dark:border-brand-dark rounded-md p-2 text-slate-900 dark:text-white" />
            </div>
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Logo URL (Optional)</label>
                <input type="text" name="logoUrl" value={templateData.brand.logoUrl || ''} onChange={handleBrandChange} className="w-full bg-white dark:bg-brand-dark border border-slate-300 dark:border-brand-dark rounded-md p-2 text-slate-900 dark:text-white" />
            </div>
        </div>
    );
};

const TemplatesPanel: React.FC<{ 
    currentTemplateId: string,
    baseTemplates: Record<string, TemplateData>,
    onSelectBaseTemplate: (templateId: string) => void,
    onApplyStyle: (templateId: string) => void,
    onSaveClick: () => void;
    onSaveAsBaseClick: () => void;
    onDeleteBaseClick: (templateId: string) => void;
    customTemplates: CustomTemplate[];
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
    currentUser: User;
}> = ({ currentTemplateId, baseTemplates, onSelectBaseTemplate, onApplyStyle, onSaveClick, onSaveAsBaseClick, onDeleteBaseClick, customTemplates, onLoad, onDelete, currentUser }) => (
    <div className="p-4 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Templates</h3>
         <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">Save Options</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button onClick={onSaveClick} className="w-full bg-slate-200 dark:bg-brand-dark hover:bg-slate-300 dark:hover:bg-brand-dark/80 text-slate-800 dark:text-white font-semibold py-2 px-4 rounded-md text-sm flex items-center justify-center space-x-2">
                  <SaveIcon className="w-4 h-4" />
                  <span>Save as Custom</span>
              </button>
              {currentUser.role === 'super-admin' && (
                <button onClick={onSaveAsBaseClick} className="w-full bg-purple-200 dark:bg-purple-800/60 hover:bg-purple-300 dark:hover:bg-purple-800/90 text-purple-800 dark:text-purple-200 font-semibold py-2 px-4 rounded-md text-sm flex items-center justify-center space-x-2">
                    <SaveIcon className="w-4 h-4" />
                    <span>Save as Base</span>
                </button>
              )}
            </div>
            
            <h4 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400 pt-2">Custom Templates</h4>
            <div className="max-h-40 overflow-y-auto pr-1">
                {customTemplates.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">No custom templates saved yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {customTemplates.map(ct => (
                            <li key={ct.id} className="p-2 border border-slate-200 dark:border-brand-dark rounded-lg flex justify-between items-center bg-slate-50 dark:bg-black/20">
                                <div>
                                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{ct.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Saved: {new Date(ct.savedAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button onClick={() => onLoad(ct.id)} className="px-3 py-1 text-xs rounded-md bg-brand-primary text-white hover:bg-brand-primary-hover">Load</button>
                                    <button onClick={() => onDelete(ct.id)} className="p-2 rounded-full hover:bg-red-500/10" title={`Delete ${ct.name}`}>
                                        <TrashIcon className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
        <hr className="border-slate-200 dark:border-brand-dark my-4"/>
        <h4 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">Base Templates</h4>
        <ul className="space-y-2">
            {(Object.keys(baseTemplates)).map((templateId) => {
                const template = baseTemplates[templateId];
                const isSelected = templateId === currentTemplateId;
                const canDelete = currentUser.role === 'super-admin' && Object.keys(baseTemplates).length > 1;
                return (
                    <li key={templateId} className={`group p-3 rounded-lg ${isSelected ? "bg-slate-200 dark:bg-brand-dark/80 border border-brand-primary" : "bg-white dark:bg-brand-surface"}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{template.name}</p>
                                <div className="flex space-x-1 mt-1">
                                    {Object.values(template.colorPalette).slice(0, 5).map((color, i) => (
                                        <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                                    ))}
                                </div>
                            </div>
                            {canDelete && (
                                <button onClick={() => onDeleteBaseClick(templateId)} className="p-1 rounded-full text-slate-400 hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title={`Delete ${template.name}`}>
                                    <TrashIcon className="w-4 h-4"/>
                                </button>
                            )}
                        </div>
                        <div className="flex items-center justify-end mt-2 space-x-2">
                            <button
                                onClick={() => onApplyStyle(templateId)}
                                className="text-xs px-3 py-1 rounded bg-slate-100 dark:bg-brand-dark text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-brand-dark/80 w-20"
                            >
                                Apply Style
                            </button>
                            <button
                                className={`text-xs px-3 py-1 rounded w-20 flex items-center justify-center ${isSelected ? "bg-brand-primary text-white" : "bg-slate-500 dark:bg-slate-600 hover:bg-slate-600 dark:hover:bg-slate-500 text-white"}`}
                                onClick={() => !isSelected && onSelectBaseTemplate(templateId)}
                                disabled={isSelected}
                            >
                                {isSelected ? "Selected" : "Select"}
                            </button>
                        </div>
                    </li>
                );
            })}
        </ul>
    </div>
);


interface EditorSidebarProps {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  templateData: TemplateData;
  onUpdateTemplate: (data: Partial<TemplateData>) => void;
  baseTemplates: Record<string, TemplateData>;
  onSelectBaseTemplate: (templateId: string) => void;
  onApplyStyle: (templateId: string) => void;
  onGenerateTemplate: (prompt: string) => void;
  isGenerating: boolean;
  onSaveClick: () => void;
  onSaveAsBaseClick: () => void;
  onDeleteBaseClick: (templateId: string) => void;
  customTemplates: CustomTemplate[];
  onLoadTemplate: (id: string) => void;
  onDeleteCustomTemplate: (id: string) => void;
  currentUser: User;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({ 
    activeTab, setActiveTab, templateData, onUpdateTemplate, 
    baseTemplates, onSelectBaseTemplate, onApplyStyle, onGenerateTemplate, 
    isGenerating, onSaveClick, onSaveAsBaseClick, onDeleteBaseClick, customTemplates, 
    onLoadTemplate, onDeleteCustomTemplate, currentUser
}) => {
    const tabs: { id: SidebarTab; label: string }[] = [
        { id: 'templates', label: 'Templates' },
        { id: 'colors', label: 'Colors' },
        { id: 'brand', label: 'Brand' },
        { id: 'amq-assistant', label: 'AMQ Assistant' },
    ];
    
  return (
    <aside className="bg-slate-100 dark:bg-brand-surface flex flex-col h-full border-r border-slate-200 dark:border-brand-dark">
        <div className="flex-shrink-0 border-b border-slate-200 dark:border-brand-dark">
            <nav className="flex space-x-1" aria-label="Tabs">
                {tabs.map(tab => (
                    <HorizontalTabButton
                        key={tab.id}
                        label={tab.label}
                        isActive={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                    />
                ))}
            </nav>
        </div>
      <div className="flex-grow overflow-y-auto">
        {activeTab === 'templates' && 
            <TemplatesPanel 
                currentTemplateId={templateData.templateId}
                baseTemplates={baseTemplates}
                onSelectBaseTemplate={onSelectBaseTemplate} 
                onApplyStyle={onApplyStyle} 
                onSaveClick={onSaveClick}
                onSaveAsBaseClick={onSaveAsBaseClick}
                onDeleteBaseClick={onDeleteBaseClick}
                customTemplates={customTemplates}
                onLoad={onLoadTemplate}
                onDelete={onDeleteCustomTemplate}
                currentUser={currentUser}
            />
        }
        {activeTab === 'colors' && <ColorsPanel templateData={templateData} onUpdate={onUpdateTemplate} />}
        {activeTab === 'brand' && <BrandPanel templateData={templateData} onUpdate={onUpdateTemplate} />}
        {activeTab === 'amq-assistant' && <AmqAssistantPanel onGenerate={onGenerateTemplate} isGenerating={isGenerating} />}
      </div>
    </aside>
  );
};


// --- Preview Components ---
const ClickToEdit: React.FC<{ onClick: (e: React.MouseEvent) => void, viewMode: ViewMode, className?: string }> = ({ onClick, viewMode, className }) => {
    if (viewMode !== 'Edit') return null;
    return (
        <div className={`absolute -top-1 -right-1 cursor-pointer p-1.5 bg-slate-200 text-slate-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 ${className}`} onClick={onClick}>
            <EditIcon className="w-4 h-4" />
        </div>
    );
};

const CardActions: React.FC<{ viewMode: ViewMode; onEdit: () => void; onDelete: () => void; }> = ({ viewMode, onEdit, onDelete }) => {
    if (viewMode !== 'Edit') return null;
    const TrashIcon = iconMap['TrashIcon'];
    return (
        <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 bg-slate-200 text-slate-700 rounded-full hover:bg-slate-300">
                <EditIcon className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600">
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
    );
};


interface PreviewProps {
    template: TemplateData;
    onUpdate: (data: Partial<TemplateData>) => void;
    onEditCard: (card: ServiceCardData) => void;
    onDeleteCard: (cardId: number) => void;
    onReorderCards: (draggedId: number, targetId: number) => void;
    onAddCard: () => Promise<void>;
    isAddingCard: boolean;
    onEditRequest: (tab: SidebarTab) => void;
    onEditCta: (cta: CtaConfig) => void;
    viewAs: ViewAs;
    viewMode: ViewMode;
}

const GridPreview: React.FC<PreviewProps> = ({ template, onUpdate, onEditCard, onDeleteCard, onReorderCards, onAddCard, isAddingCard, onEditRequest, onEditCta, viewAs, viewMode }) => {
    const { colorPalette: colors, brand, ctas, testimonials } = template;
    const [dragOverId, setDragOverId] = useState<number | null>(null);
    const filteredCards = template.serviceCards.filter(card => 
        viewAs === 'Internal' ? card.access === 'Internal' || card.access === 'Both' : card.access === 'External' || card.access === 'Both'
    );
    
    return (
    <div style={{ backgroundColor: colors.background, color: colors.text }} className="p-4 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center py-4 relative group">
          <ClickToEdit onClick={() => onEditRequest('brand')} viewMode={viewMode} className="!top-4 !-left-4" />
          {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} className="h-10" /> : 
          <InlineEditable as="h1" value={brand.name} viewMode={viewMode} onSave={(newValue) => onUpdate({ brand: { ...brand, name: newValue } })} className="text-2xl font-bold" />}
        </header>
        <main>
          <section className="text-center py-20 relative">
            <InlineEditable as="h2" value={template.hero.title} onSave={newValue => onUpdate({ hero: { ...template.hero, title: newValue }})} viewMode={viewMode} className="text-5xl font-extrabold" style={{ color: colors.heroText }} />
            <InlineEditable as="textarea" value={template.hero.subtitle} onSave={newValue => onUpdate({ hero: { ...template.hero, subtitle: newValue }})} viewMode={viewMode} className="mt-4 max-w-2xl mx-auto text-lg" />
            <div className="mt-8 flex justify-center space-x-4">
              <div className="relative group">
                <button style={{backgroundColor: colors.primary, color: colors.background}} className="font-bold py-3 px-8 rounded-lg">
                  <InlineEditable value={ctas.primary.text} onSave={newValue => onUpdate({ ctas: { ...ctas, primary: { ...ctas.primary, text: newValue }} })} viewMode={viewMode} />
                </button>
                <ClickToEdit onClick={() => onEditCta(ctas.primary)} viewMode={viewMode} />
              </div>
              <div className="relative group">
                <button style={{backgroundColor: colors.secondary, color: colors.text}} className="font-bold py-3 px-8 rounded-lg">
                  <InlineEditable value={ctas.secondary.text} onSave={newValue => onUpdate({ ctas: { ...ctas, secondary: { ...ctas.secondary, text: newValue }} })} viewMode={viewMode} />
                </button>
                <ClickToEdit onClick={() => onEditCta(ctas.secondary)} viewMode={viewMode} />
              </div>
            </div>
          </section>
          <section className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredCards.map(card => {
                const Icon = iconMap[card.icon];
                if (!Icon) return null;
                return (
                 <div 
                    key={card.id} 
                    draggable={viewMode === 'Edit'}
                    onDragStart={(e) => { e.dataTransfer.setData("cardId", card.id.toString()); }}
                    onDragOver={(e) => { e.preventDefault(); setDragOverId(card.id); }}
                    onDragLeave={() => setDragOverId(null)}
                    onDrop={(e) => {
                        e.preventDefault();
                        const draggedCardId = parseInt(e.dataTransfer.getData("cardId"), 10);
                        if (draggedCardId !== card.id) onReorderCards(draggedCardId, card.id);
                        setDragOverId(null);
                    }}
                    className={`relative p-6 rounded-lg text-center transition-all ${viewMode === 'Edit' ? 'group cursor-pointer' : ''} ${dragOverId === card.id ? 'outline-2 outline-dashed outline-brand-primary' : ''}`} 
                    style={{ backgroundColor: colors.cardBackground }}
                    onClick={() => viewMode === 'Edit' && onEditCard(card)}
                    >
                    <CardActions viewMode={viewMode} onEdit={() => onEditCard(card)} onDelete={() => onDeleteCard(card.id)} />
                    <div className="bg-slate-200 dark:bg-brand-dark inline-block p-4 rounded-full">
                        <Icon className="w-8 h-8" style={{color: colors.accent}} />
                    </div>
                    <h3 className="mt-4 text-xl font-bold" style={{ color: colors.cardText }}>{card.title}</h3>
                    <p className="mt-2" style={{ color: colors.cardText, opacity: 0.8 }}>{card.description}</p>
                    <div className="mt-6 text-white font-bold py-2 px-6 rounded-lg transition-colors" style={{backgroundColor: colors.primary, color: colors.background }}>
                        {card.linkText}
                    </div>
                 </div>
                );
            })}
             {viewMode === 'Edit' && (
                <button 
                    onClick={onAddCard}
                    disabled={isAddingCard}
                    className="flex flex-col items-center justify-center w-full h-full min-h-[280px] bg-slate-200/50 dark:bg-brand-surface/50 border-2 border-dashed border-slate-300 dark:border-brand-dark rounded-lg text-slate-500 dark:text-slate-500 hover:bg-slate-200/80 dark:hover:bg-brand-surface/80 hover:border-slate-400 dark:hover:border-brand-dark transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isAddingCard ? (
                        <>
                            <SpinnerIcon className="w-8 h-8 animate-spin mb-2" />
                            <span>Generating...</span>
                        </>
                    ) : (
                        <>
                            <span className="text-4xl">+</span>
                            <span>Add New Card</span>
                        </>
                    )}
                </button>
             )}
          </section>
          {testimonials.length > 0 && (
             <section className="py-16">
                <h3 className="text-3xl font-bold text-center mb-10">What Our Community Says</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {testimonials.map(t => (
                        <blockquote key={t.id} style={{backgroundColor: colors.cardBackground}} className="p-6 rounded-lg">
                            <InlineEditable as="textarea" value={t.quote} viewMode={viewMode} className="text-lg italic"
                                style={{ color: colors.cardText }}
                                onSave={newValue => {
                                    const updated = testimonials.map(item => item.id === t.id ? { ...item, quote: newValue } : item);
                                    onUpdate({ testimonials: updated });
                                }}
                            />
                            <footer className="mt-4 font-semibold">
                                <InlineEditable value={t.author} viewMode={viewMode}
                                    style={{ color: colors.cardText }}
                                    onSave={newValue => {
                                        const updated = testimonials.map(item => item.id === t.id ? { ...item, author: newValue } : item);
                                        onUpdate({ testimonials: updated });
                                    }}
                                />
                                ,{' '}
                                <span className="text-slate-500 dark:text-slate-400">
                                    <InlineEditable value={t.title} viewMode={viewMode}
                                        onSave={newValue => {
                                            const updated = testimonials.map(item => item.id === t.id ? { ...item, title: newValue } : item);
                                            onUpdate({ testimonials: updated });
                                        }}
                                    />
                                </span>
                            </footer>
                        </blockquote>
                    ))}
                </div>
            </section>
          )}
        </main>
      </div>
    </div>
    );
};

const ElegantSpaPreview: React.FC<PreviewProps> = ({ template, onUpdate, onEditCard, onDeleteCard, onReorderCards, onAddCard, isAddingCard, onEditRequest, onEditCta, viewAs, viewMode }) => {
    const { colorPalette: colors, brand, ctas, testimonials } = template;
    const [dragOverId, setDragOverId] = useState<number | null>(null);
    const filteredCards = template.serviceCards.filter(card => 
        viewAs === 'Internal' ? card.access === 'Internal' || card.access === 'Both' : card.access === 'External' || card.access === 'Both'
    );
    return (
    <div style={{ backgroundColor: colors.background, color: colors.text }} className="p-4 h-full overflow-y-auto font-serif">
      <div className="max-w-5xl mx-auto">
        <header className="text-center py-12 border-b-2 relative group" style={{ borderColor: colors.secondary }}>
            <ClickToEdit onClick={() => onEditRequest('brand')} viewMode={viewMode} />
            <InlineEditable as="h1" value={brand.name} viewMode={viewMode} onSave={newValue => onUpdate({ brand: { ...brand, name: newValue }})} className="text-4xl tracking-widest uppercase" />
        </header>
        <main>
            <section className="text-center py-20">
                <InlineEditable as="h2" value={template.hero.title} onSave={newValue => onUpdate({ hero: { ...template.hero, title: newValue }})} viewMode={viewMode} className="text-5xl" style={{ color: colors.heroText }}/>
                <InlineEditable as="textarea" value={template.hero.subtitle} onSave={newValue => onUpdate({ hero: { ...template.hero, subtitle: newValue }})} viewMode={viewMode} className="mt-4 max-w-2xl mx-auto text-lg" />
                 <div className="relative group inline-block mt-8">
                    <button style={{backgroundColor: colors.primary, color: colors.background}} className="font-bold py-3 px-8 rounded-full tracking-wider uppercase">
                        <InlineEditable value={ctas.primary.text} onSave={newValue => onUpdate({ ctas: { ...ctas, primary: { ...ctas.primary, text: newValue }} })} viewMode={viewMode} />
                    </button>
                    <ClickToEdit onClick={() => onEditCta(ctas.primary)} viewMode={viewMode} />
                 </div>
            </section>
            <section className="py-12">
                 <h3 className="text-2xl text-center mb-8" style={{color: colors.heroText}}>Our Services</h3>
                 <ul className="space-y-4">
                    {filteredCards.map(card => {
                        const Icon = iconMap[card.icon];
                        if (!Icon) return null;
                        return (
                            <li 
                                key={card.id}
                                draggable={viewMode === 'Edit'}
                                onDragStart={(e) => { e.dataTransfer.setData("cardId", card.id.toString()); }}
                                onDragOver={(e) => { e.preventDefault(); setDragOverId(card.id); }}
                                onDragLeave={() => setDragOverId(null)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const draggedCardId = parseInt(e.dataTransfer.getData("cardId"), 10);
                                    if (draggedCardId !== card.id) onReorderCards(draggedCardId, card.id);
                                    setDragOverId(null);
                                }}
                                className={`relative flex items-center space-x-6 p-6 rounded-lg shadow-md transition-all ${viewMode === 'Edit' ? 'group cursor-pointer' : ''} ${dragOverId === card.id ? 'outline-2 outline-dashed outline-brand-primary' : ''}`}
                                style={{backgroundColor: colors.cardBackground}}
                                onClick={() => viewMode === 'Edit' && onEditCard(card)}
                            >
                                <CardActions viewMode={viewMode} onEdit={() => onEditCard(card)} onDelete={() => onDeleteCard(card.id)} />
                                <div className="p-4 rounded-full" style={{backgroundColor: colors.secondary}}>
                                    <Icon className="w-8 h-8" style={{color: colors.accent}}/>
                                </div>
                                <div className="flex-grow">
                                    <h4 className="text-xl font-semibold" style={{ color: colors.cardText }}>{card.title}</h4>
                                    <p style={{ color: colors.cardText, opacity: 0.8 }}>{card.description}</p>
                                </div>
                                <div className="font-bold tracking-wider flex items-center" style={{ color: colors.cardText }}>
                                    {card.linkText} <ChevronRightIcon className="w-5 h-5 ml-1" />
                                </div>
                            </li>
                        );
                    })}
                 </ul>
                 {viewMode === 'Edit' && (
                    <button 
                        onClick={onAddCard}
                        disabled={isAddingCard}
                        className="w-full mt-4 flex items-center justify-center py-4 bg-slate-200/50 dark:bg-brand-surface/50 border-2 border-dashed border-slate-300 dark:border-brand-dark rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-brand-surface/80 hover:border-slate-400 dark:hover:border-brand-dark transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                    >
                         {isAddingCard ? (
                            <>
                                <SpinnerIcon className="w-5 h-5 animate-spin mr-2" />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <span>+ Add New Service</span>
                        )}
                    </button>
                 )}
            </section>
            {testimonials.length > 0 && (
             <section className="py-16">
                <div className="text-center">
                   <blockquote className="max-w-3xl mx-auto">
                        <InlineEditable as="textarea" value={testimonials[0].quote} viewMode={viewMode} className="text-2xl italic"
                            onSave={newValue => {
                                const updated = testimonials.map(item => item.id === testimonials[0].id ? { ...item, quote: newValue } : item);
                                onUpdate({ testimonials: updated });
                            }}
                        />
                        <footer className="mt-6 font-semibold text-lg">
                             <InlineEditable value={testimonials[0].author} viewMode={viewMode}
                                onSave={newValue => {
                                    const updated = testimonials.map(item => item.id === testimonials[0].id ? { ...item, author: newValue } : item);
                                    onUpdate({ testimonials: updated });
                                }}
                            />
                            ,{' '}
                            <span style={{color: colors.accent}}>
                                <InlineEditable value={testimonials[0].title} viewMode={viewMode}
                                    onSave={newValue => {
                                        const updated = testimonials.map(item => item.id === testimonials[0].id ? { ...item, title: newValue } : item);
                                        onUpdate({ testimonials: updated });
                                    }}
                                />
                            </span>
                        </footer>
                    </blockquote>
                </div>
            </section>
          )}
        </main>
      </div>
    </div>
    );
};

const CorporateHelpdeskPreview: React.FC<PreviewProps> = ({ template, onUpdate, onEditCard, onDeleteCard, onReorderCards, onAddCard, isAddingCard, onEditRequest, onEditCta, viewAs, viewMode }) => {
    const { colorPalette: colors, brand, ctas } = template;
    const [dragOverId, setDragOverId] = useState<number | null>(null);
    const filteredCards = template.serviceCards.filter(card => 
        viewAs === 'Internal' ? card.access === 'Internal' || card.access === 'Both' : card.access === 'External' || card.access === 'Both'
    );
    
    const [activeCard, setActiveCard] = useState<ServiceCardData | null>(filteredCards[0] || null);

    useEffect(() => {
        const activeCardIsVisible = filteredCards.some(c => c.id === activeCard?.id);
        if (!activeCardIsVisible) {
            setActiveCard(filteredCards[0] || null);
        }
    }, [filteredCards, activeCard]);
    
    return (
    <div style={{backgroundColor: colors.background, color: colors.text}} className="h-full flex flex-col">
        <header style={{backgroundColor: colors.cardBackground, borderColor: colors.secondary}} className="border-b p-4 flex items-center justify-between flex-shrink-0 relative group">
            <ClickToEdit onClick={() => onEditRequest('brand')} viewMode={viewMode} />
            <InlineEditable as="h1" value={brand.name} viewMode={viewMode} onSave={newValue => onUpdate({ brand: { ...brand, name: newValue }})} className="text-xl font-bold" />
            <input type="search" placeholder={`Search...`} style={{backgroundColor: colors.background, borderColor: colors.secondary}} className="border rounded-md px-4 py-2 w-96 text-sm"/>
        </header>
        <div className="flex flex-grow overflow-hidden">
            <aside style={{backgroundColor: colors.cardBackground, borderColor: colors.secondary}} className="w-64 border-r p-4 overflow-y-auto flex-shrink-0 flex flex-col">
                <nav className="flex-grow">
                    <ul className="space-y-1">
                        {filteredCards.map(card => {
                            const Icon = iconMap[card.icon];
                            if (!Icon) return null;
                            const isActive = activeCard?.id === card.id;
                            return (
                            <li 
                                key={card.id}
                                draggable={viewMode === 'Edit'}
                                onDragStart={(e) => { e.dataTransfer.setData("cardId", card.id.toString()); }}
                                onDragOver={(e) => { e.preventDefault(); setDragOverId(card.id); }}
                                onDragLeave={() => setDragOverId(null)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const draggedCardId = parseInt(e.dataTransfer.getData("cardId"), 10);
                                    if (draggedCardId !== card.id) onReorderCards(draggedCardId, card.id);
                                    setDragOverId(null);
                                }}
                                className={`relative group transition-all ${dragOverId === card.id ? 'outline-1 outline-dashed outline-brand-primary rounded-md' : ''}`}
                            >
                                <button 
                                    onClick={() => setActiveCard(card)}
                                    className={`w-full text-left flex items-center space-x-3 p-2 rounded-md text-sm font-medium ${viewMode === 'Edit' ? 'cursor-move' : 'cursor-pointer'}`}
                                    style={{
                                        backgroundColor: isActive ? colors.accent+'20' : 'transparent',
                                        color: isActive ? colors.accent : colors.cardText
                                    }}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="flex-grow">{card.title}</span>
                                </button>
                                {viewMode === 'Edit' && (
                                    <div className="absolute top-1/2 -translate-y-1/2 right-0 opacity-0 group-hover:opacity-100">
                                        <CardActions viewMode={viewMode} onEdit={() => onEditCard(card)} onDelete={() => onDeleteCard(card.id)} />
                                    </div>
                                )}
                            </li>
                        )})}
                    </ul>
                </nav>
                 {viewMode === 'Edit' && (
                    <button 
                        onClick={onAddCard}
                        disabled={isAddingCard}
                        className="w-full mt-2 flex items-center justify-center py-2 text-sm bg-slate-200/10 dark:bg-white/5 border-2 border-dashed border-slate-300 dark:border-brand-dark rounded-lg text-slate-500 dark:text-slate-500 hover:bg-slate-200/20 dark:hover:bg-white/10 hover:border-slate-400 dark:hover:border-brand-dark transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                    >
                         {isAddingCard ? (
                            <>
                                <SpinnerIcon className="w-4 h-4 animate-spin mr-2" />
                                <span>Adding...</span>
                            </>
                        ) : (
                            <span>+ Add Item</span>
                        )}
                    </button>
                 )}
            </aside>
            <main className="flex-grow p-8 overflow-y-auto">
                {activeCard ? (
                    <div>
                        <h2 className="text-3xl font-bold">{activeCard.title}</h2>
                        <p className="mt-2 max-w-2xl">{activeCard.description}</p>
                        <div className="relative group inline-block mt-6">
                            <button className="text-white font-bold py-2 px-5 rounded-md" style={{backgroundColor: colors.primary}}>
                                {activeCard.linkText}
                            </button>
                            <ClickToEdit onClick={() => onEditCard(activeCard)} viewMode={viewMode} />
                        </div>
                    </div>
                ) : (
                    <div>
                        <InlineEditable as="h2" value={template.hero.title} viewMode={viewMode} onSave={newValue => onUpdate({ hero: { ...template.hero, title: newValue }})} className="text-3xl font-bold" />
                        <InlineEditable as="textarea" value={template.hero.subtitle} viewMode={viewMode} onSave={newValue => onUpdate({ hero: { ...template.hero, subtitle: newValue }})} className="mt-2 max-w-2xl" />
                         <div className="mt-8 flex items-center space-x-4">
                            <div className="relative group">
                                <button style={{backgroundColor: colors.primary}} className="font-bold py-2 px-5 rounded-md text-white">
                                    <InlineEditable value={ctas.primary.text} onSave={newValue => onUpdate({ ctas: { ...ctas, primary: { ...ctas.primary, text: newValue }} })} viewMode={viewMode} />
                                </button>
                                <ClickToEdit onClick={() => onEditCta(ctas.primary)} viewMode={viewMode} />
                            </div>
                         </div>
                    </div>
                )}
            </main>
        </div>
    </div>
    );
};


const TemplatePreview: React.FC<PreviewProps> = (props) => {
    switch (props.template.templateId) {
        case 'senior-living':
        case 'modern-tech':
            return <GridPreview {...props} />;
        case 'elegant-spa':
            return <ElegantSpaPreview {...props} />;
        case 'corporate-helpdesk':
            return <CorporateHelpdeskPreview {...props} />;
        default:
            // Fallback for custom/new base templates
            return <GridPreview {...props} />;
    }
};

const PreviewHeader: React.FC<{ 
    viewMode: ViewMode, 
    setViewMode: (mode: ViewMode) => void,
    viewAs: ViewAs, 
    setViewAs: (view: ViewAs) => void,
    isFullScreen: boolean,
    setIsFullScreen: (isFullScreen: boolean) => void,
}> = ({ viewMode, setViewMode, viewAs, setViewAs, isFullScreen, setIsFullScreen }) => (
    <div className="bg-slate-100 dark:bg-brand-surface p-2 border-b border-slate-200 dark:border-brand-dark flex justify-between items-center flex-shrink-0">
        <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Mode:</span>
            <div className="flex items-center bg-slate-200 dark:bg-brand-black rounded-md p-1">
                <button 
                onClick={() => setViewMode('Edit')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'Edit' ? 'bg-brand-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-brand-dark'}`}
                >
                Edit
                </button>
                <button 
                onClick={() => setViewMode('Preview')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'Preview' ? 'bg-brand-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-brand-dark'}`}
                >
                Preview
                </button>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">View as:</span>
            <div className="flex items-center bg-slate-200 dark:bg-brand-black rounded-md p-1">
                <button 
                onClick={() => setViewAs('External')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${viewAs === 'External' ? 'bg-brand-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-brand-dark'}`}
                >
                External
                </button>
                <button 
                onClick={() => setViewAs('Internal')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${viewAs === 'Internal' ? 'bg-brand-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-brand-dark'}`}
                >
                Internal
                </button>
            </div>
            <button 
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 ml-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-brand-dark transition-colors"
                title={isFullScreen ? 'Exit Full Screen' : 'Full Screen Preview'}
                aria-label={isFullScreen ? 'Exit Full Screen' : 'Full Screen Preview'}
            >
                {isFullScreen ? <ExitFullScreenIcon className="w-5 h-5" /> : <EnterFullScreenIcon className="w-5 h-5" />}
            </button>
        </div>
    </div>
  );

interface TemplateEditorPageProps {
  user: User;
  tenant: Tenant;
  tenants: Tenant[];
  baseTemplates: Record<string, TemplateData>;
  onUpdateTemplate: (newTemplateData: TemplateData) => void;
  onSaveTemplate: (name: string) => void;
  onSaveAsBaseTemplate: (name: string, templateData: TemplateData) => void;
  onDeleteBaseTemplate: (templateId: string) => void;
  onLoadTemplate: (id: string) => void;
  onDeleteCustomTemplate: (id: string) => void;
  isFullScreen: boolean;
  setIsFullScreen: (isFullScreen: boolean) => void;
}

const TemplateEditorPage: React.FC<TemplateEditorPageProps> = ({ user, tenant, tenants, baseTemplates, onUpdateTemplate, onSaveTemplate, onSaveAsBaseTemplate, onDeleteBaseTemplate, onLoadTemplate, onDeleteCustomTemplate, isFullScreen, setIsFullScreen }) => {
  const [templateData, setTemplateData] = useState<TemplateData>(tenant.template);
  const [editingCard, setEditingCard] = useState<ServiceCardData | null>(null);
  const [editingCta, setEditingCta] = useState<CtaConfig | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isCtaModalOpen, setIsCtaModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaveBaseModalOpen, setIsSaveBaseModalOpen] = useState(false);
  const [isDeleteBaseModalOpen, setIsDeleteBaseModalOpen] = useState(false);
  const [baseTemplateToDelete, setBaseTemplateToDelete] = useState<[string, string] | null>(null);
  const [viewAs, setViewAs] = useState<ViewAs>('External');
  const [viewMode, setViewMode] = useState<ViewMode>('Edit');
  const [activeTab, setActiveTab] = useState<SidebarTab>('templates');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);

  const availableBaseTemplates = useMemo(() => {
    // Super admin sees all base templates only when editing a master tenant.
    // When editing a regular tenant, they see what that tenant is allowed to see.
    if (user.role === 'super-admin' && tenant.isMaster) {
      return baseTemplates;
    }

    const currentTenant = tenants.find(t => t.id === tenant.id);
    if (!currentTenant) return {};

    // Use the tenant's specific list of template IDs if it exists.
    // This allows for per-tenant restrictions set by the super admin.
    if (currentTenant.accessibleBaseTemplateIds) {
      return Object.keys(baseTemplates)
        .filter(key => currentTenant.accessibleBaseTemplateIds!.includes(key))
        .reduce((obj, key) => {
          obj[key] = baseTemplates[key];
          return obj;
        }, {} as Record<string, TemplateData>);
    }

    // Fallback for older tenants: use the master tenant's list.
    if (currentTenant.masterTenantId) {
      const masterTenant = tenants.find(t => t.id === currentTenant.masterTenantId);
      if (masterTenant && masterTenant.accessibleBaseTemplateIds) {
        return Object.keys(baseTemplates)
          .filter(key => masterTenant.accessibleBaseTemplateIds!.includes(key))
          .reduce((obj, key) => {
            obj[key] = baseTemplates[key];
            return obj;
          }, {} as Record<string, TemplateData>);
      }
    }

    // Default to an empty object if no access rules are found.
    return {};
  }, [user.role, tenant, tenants, baseTemplates]);


  useEffect(() => {
    setTemplateData(tenant.template);
  }, [tenant.template]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isFullScreen) {
            setIsFullScreen(false);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen, setIsFullScreen]);
  
  const handlePartialUpdate = (data: Partial<TemplateData>) => {
      const newTemplateData = { ...templateData, ...data };
      setTemplateData(newTemplateData);
      onUpdateTemplate(newTemplateData);
  };

  const handleEditCard = (card: ServiceCardData) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  };
  
  const handleEditCta = (cta: CtaConfig) => {
    setEditingCta(cta);
    setIsCtaModalOpen(true);
  };

  const handleDeleteCard = (cardId: number) => {
    const newServiceCards = templateData.serviceCards.filter(card => card.id !== cardId);
    handlePartialUpdate({ serviceCards: newServiceCards });
  };
  
  const handleAddCard = async () => {
    setIsAddingCard(true);
    try {
        const generatedContent = await generateNewCardFromContext(templateData);
        const newCard: ServiceCardData = {
            ...generatedContent,
            id: Date.now(),
            access: 'Both',
            connectorType: 'URL',
            url: '#'
        };
        handlePartialUpdate({ serviceCards: [...templateData.serviceCards, newCard] });
    } catch (error) {
        console.error("Failed to generate card content:", error);
        // Fallback to a blank card
        const newCard: ServiceCardData = {
          id: Date.now(),
          icon: 'PuzzlePieceIcon', // A generic icon
          title: 'New Service',
          description: 'AI generation failed. Please fill in the details.',
          linkText: 'Configure',
          access: 'Both',
          connectorType: 'URL',
          url: '#'
        };
        handlePartialUpdate({ serviceCards: [...templateData.serviceCards, newCard] });
        alert("Sorry, we couldn't generate content for the new card. A placeholder has been added.");
    } finally {
        setIsAddingCard(false);
    }
  };
  
  const handleReorderCards = (draggedCardId: number, targetCardId: number) => {
    const cards = [...templateData.serviceCards];
    const draggedIndex = cards.findIndex(c => c.id === draggedCardId);
    const targetIndex = cards.findIndex(c => c.id === targetCardId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const [draggedItem] = cards.splice(draggedIndex, 1);
    cards.splice(targetIndex, 0, draggedItem);
    handlePartialUpdate({ serviceCards: cards });
  };

  const handleCloseModals = () => {
    setIsCardModalOpen(false);
    setEditingCard(null);
    setIsCtaModalOpen(false);
    setEditingCta(null);
    setIsSaveModalOpen(false);
    setIsSaveBaseModalOpen(false);
    setIsDeleteBaseModalOpen(false);
    setBaseTemplateToDelete(null);
  };

  const handleSaveCard = (updatedCard: ServiceCardData) => {
    const newServiceCards = templateData.serviceCards.map(card =>
      card.id === updatedCard.id ? updatedCard : card
    );
    handlePartialUpdate({ serviceCards: newServiceCards });
    handleCloseModals();
  };

  const handleSaveCta = (updatedCta: CtaConfig) => {
      const newCtas = { ...templateData.ctas, [updatedCta.id]: updatedCta };
      handlePartialUpdate({ ctas: newCtas });
      handleCloseModals();
  };

  const handleSelectBaseTemplate = (templateId: string) => {
    const newTemplate = JSON.parse(JSON.stringify(availableBaseTemplates[templateId]));
    onUpdateTemplate(newTemplate);
  };

  const handleApplyStyle = (templateId: string) => {
    const styleTemplate = availableBaseTemplates[templateId];
    const newTemplateData = {
        ...templateData,
        templateId: styleTemplate.templateId,
        colorPalette: styleTemplate.colorPalette,
    };
    setTemplateData(newTemplateData);
    onUpdateTemplate(newTemplateData);
  };
  
  const handleGenerateTemplate = async (prompt: string) => {
    setIsGenerating(true);
    try {
        const newTemplate = await generateTemplateFromPrompt(prompt);
        onUpdateTemplate(newTemplate);
    } catch (error) {
        console.error("Template generation failed:", error);
        alert("Sorry, we couldn't generate the template. Please try a different prompt.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleEditRequest = (tab: SidebarTab) => {
      setActiveTab(tab);
  };

  const handleSaveTemplateWithName = (name: string) => {
    onSaveTemplate(name);
    handleCloseModals();
  };

  const handleSaveBaseTemplateWithName = (name: string) => {
    onSaveAsBaseTemplate(name, templateData);
    handleCloseModals();
  };
  
  const handleLoadTemplate = (id: string) => {
    onLoadTemplate(id);
    handleCloseModals();
  };
  
  const openDeleteBaseModal = (templateId: string) => {
    const templateName = baseTemplates[templateId]?.name;
    if (templateName) {
      setBaseTemplateToDelete([templateId, templateName]);
      setIsDeleteBaseModalOpen(true);
    }
  };

  const confirmDeleteBaseTemplate = () => {
    if (baseTemplateToDelete) {
      onDeleteBaseTemplate(baseTemplateToDelete[0]);
      handleCloseModals();
    }
  };


  return (
    <div className={`h-full ${isFullScreen ? '' : 'grid grid-cols-[380px_1fr]'}`}>
      {!isFullScreen && (
          <EditorSidebar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            templateData={templateData}
            onUpdateTemplate={handlePartialUpdate}
            baseTemplates={availableBaseTemplates}
            onSelectBaseTemplate={handleSelectBaseTemplate}
            onApplyStyle={handleApplyStyle}
            onGenerateTemplate={handleGenerateTemplate}
            isGenerating={isGenerating}
            onSaveClick={() => setIsSaveModalOpen(true)}
            onSaveAsBaseClick={() => setIsSaveBaseModalOpen(true)}
            onDeleteBaseClick={openDeleteBaseModal}
            customTemplates={tenant.customTemplates}
            onLoadTemplate={handleLoadTemplate}
            onDeleteCustomTemplate={onDeleteCustomTemplate}
            currentUser={user}
          />
      )}
      <div className="flex flex-col h-full overflow-hidden">
        <PreviewHeader 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
            viewAs={viewAs} 
            setViewAs={setViewAs} 
            isFullScreen={isFullScreen}
            setIsFullScreen={setIsFullScreen}
        />
        <div className="flex-grow overflow-auto">
            <TemplatePreview 
              template={templateData} 
              onUpdate={handlePartialUpdate}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
              onReorderCards={handleReorderCards}
              onAddCard={handleAddCard}
              isAddingCard={isAddingCard}
              onEditRequest={handleEditRequest}
              onEditCta={handleEditCta}
              viewAs={viewAs} 
              viewMode={viewMode} />
        </div>
      </div>
      {editingCard && (
        <EditServiceCardModal
          isOpen={isCardModalOpen}
          onClose={handleCloseModals}
          onSave={handleSaveCard}
          cardData={editingCard}
        />
      )}
      {editingCta && (
        <EditCtaModal
            isOpen={isCtaModalOpen}
            onClose={handleCloseModals}
            onSave={handleSaveCta}
            ctaData={editingCta}
        />
      )}
      <SaveTemplateModal 
        isOpen={isSaveModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveTemplateWithName}
      />
      <SaveBaseTemplateModal
        isOpen={isSaveBaseModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveBaseTemplateWithName}
      />
      {baseTemplateToDelete && (
        <DeleteBaseTemplateModal
          isOpen={isDeleteBaseModalOpen}
          onClose={handleCloseModals}
          onConfirm={confirmDeleteBaseTemplate}
          templateName={baseTemplateToDelete[1]}
        />
      )}
    </div>
  );
};

export default TemplateEditorPage;
