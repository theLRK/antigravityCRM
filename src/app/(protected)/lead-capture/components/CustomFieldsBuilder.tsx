'use client';

import { useState } from 'react';
import { updateCustomFields } from '../actions';
import { Plus, GripVertical, Settings2, Trash2, Check, Loader2 } from 'lucide-react';

interface CustomFieldsBuilderProps {
    formId: string;
    initialFieldsJson: string;
}

export type CustomFieldType = 'short_text' | 'paragraph' | 'dropdown' | 'yes_no' | 'checkbox';

export interface CustomField {
    id: string; // Internal UUID for rendering keys
    type: CustomFieldType;
    label: string;
    required: boolean;
    options?: string[]; // Used strictly for 'dropdown'
}

export function CustomFieldsBuilder({ formId, initialFieldsJson }: CustomFieldsBuilderProps) {
    const [fields, setFields] = useState<CustomField[]>(() => {
        try {
            return JSON.parse(initialFieldsJson);
        } catch {
            return [];
        }
    });

    const [isPending, setIsPending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Helpers
    const generateId = () => Math.random().toString(36).substr(2, 9);

    const addField = (type: CustomFieldType) => {
        const newField: CustomField = {
            id: generateId(),
            type,
            label: `New ${type.replace('_', ' ')} question`,
            required: false,
            options: (type === 'dropdown' || type === 'checkbox') ? ['Option A', 'Option B'] : undefined
        };
        setFields(prev => [...prev, newField]);
    };

    const removeField = (id: string) => {
        setFields(prev => prev.filter(f => f.id !== id));
    };

    const updateField = (id: string, updates: Partial<CustomField>) => {
        setFields(prev => prev.map(f => (f.id === id ? { ...f, ...updates } : f)));
    };

    const updateDropdownOption = (fieldId: string, index: number, value: string) => {
        setFields(prev => prev.map(f => {
            if (f.id !== fieldId || !f.options) return f;
            const newOptions = [...f.options];
            newOptions[index] = value;
            return { ...f, options: newOptions };
        }));
    };

    const addDropdownOption = (fieldId: string) => {
        setFields(prev => prev.map(f => {
            if (f.id !== fieldId || !f.options) return f;
            return { ...f, options: [...f.options, `New Option`] };
        }));
    };

    const removeDropdownOption = (fieldId: string, index: number) => {
        setFields(prev => prev.map(f => {
            if (f.id !== fieldId || !f.options) return f;
            return { ...f, options: f.options.filter((_, i) => i !== index) };
        }));
    };

    // Save to Database via Server Action
    const handleSave = async () => {
        setIsPending(true);
        setIsSuccess(false);

        // Sanitize before saving (e.g., remove empty options)
        const sanitizedFields = fields.map(f => {
            if ((f.type === 'dropdown' || f.type === 'checkbox') && f.options) {
                return { ...f, options: f.options.filter(o => o.trim() !== '') };
            }
            return f;
        });

        try {
            await updateCustomFields(formId, JSON.stringify(sanitizedFields));
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save custom fields", error);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="space-y-6">

            {fields.length === 0 ? (
                <div className="text-center py-8 rounded-lg border-2 border-dashed border-slate-300">
                    <Settings2 className="mx-auto h-8 w-8 text-slate-300" />
                    <h3 className="mt-2 text-sm font-semibold text-slate-900">No custom fields added yet</h3>
                    <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                        Inject dynamic questions into Step 4 of the Public Form Wizard to gather specialized information.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="relative bg-white border border-slate-200 shadow-sm rounded-lg p-4 group">

                            {/* Drag handle (Visual only for MVP) */}
                            <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col items-center justify-center cursor-move text-slate-300 group-hover:text-slate-400 bg-slate-50 border-r border-slate-100 rounded-l-lg hover:bg-slate-100 transition-colors">
                                <GripVertical className="w-4 h-4" />
                            </div>

                            <div className="pl-6 flex flex-col sm:flex-row gap-4">
                                <div className="flex-grow space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex-grow">
                                            <input
                                                type="text"
                                                value={field.label}
                                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                className="block w-full border-0 border-b-2 border-slate-200 bg-transparent py-1.5 focus:ring-0 focus:border-indigo-600 sm:text-sm font-medium text-slate-900 px-0 transition-colors"
                                                placeholder="Question title"
                                            />
                                        </div>
                                        <div className="flex items-center gap-4 flex-shrink-0 pt-2 border-l border-slate-200 pl-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={field.required}
                                                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 h-4 w-4"
                                                />
                                                <span className="text-xs font-medium text-slate-500">Required</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Preview Renderer based on Type */}
                                    <div className="pt-2">
                                        {field.type === 'short_text' && (
                                            <input disabled className="block w-full rounded-md border-0 py-1.5 text-slate-400 bg-slate-50 ring-1 ring-inset ring-slate-200 sm:text-sm placeholder:text-slate-400 cursor-not-allowed" placeholder="Short text answer..." />
                                        )}
                                        {field.type === 'paragraph' && (
                                            <textarea disabled rows={3} className="block w-full rounded-md border-0 py-1.5 text-slate-400 bg-slate-50 ring-1 ring-inset ring-slate-200 sm:text-sm placeholder:text-slate-400 cursor-not-allowed" placeholder="Long paragraph answer..." />
                                        )}
                                        {field.type === 'yes_no' && (
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 opacity-50"><input type="radio" disabled className="h-4 w-4 text-indigo-600 border-slate-300" /><span className="text-sm">Yes</span></label>
                                                <label className="flex items-center gap-2 opacity-50"><input type="radio" disabled className="h-4 w-4 text-indigo-600 border-slate-300" /><span className="text-sm">No</span></label>
                                            </div>
                                        )}
                                        {(field.type === 'dropdown' || field.type === 'checkbox') && (
                                            <div className="space-y-2 max-w-md">
                                                {field.options?.map((opt, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <div className={`h-4 w-4 flex-shrink-0 ${field.type === 'checkbox' ? 'rounded border border-slate-300' : 'rounded-full bg-slate-300'}`} />
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => updateDropdownOption(field.id, i, e.target.value)}
                                                            className="block w-full rounded-md border-0 py-1 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-xs"
                                                        />
                                                        {field.options!.length > 1 && (
                                                            <button onClick={() => removeDropdownOption(field.id, i)} className="text-slate-400 hover:text-red-500 focus:outline-none"><XIcon className="w-4 h-4" /></button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button onClick={() => addDropdownOption(field.id)} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-2 block">+ Add another option</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:items-end sm:border-l sm:border-slate-100 sm:pl-4 justify-between min-w-[120px]">
                                    <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200 mb-4 sm:mb-0 w-fit sm:w-auto self-start sm:self-auto">
                                        {field.type.replace('_', ' ').toUpperCase()}
                                    </span>
                                    <button
                                        onClick={() => removeField(field.id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors p-1 -mr-1"
                                        title="Delete Field"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Field Type Selector Grid */}
            <div className="pt-6 border-t border-slate-200 border-dashed">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Add Field Template</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button onClick={() => addField('short_text')} className="flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 rounded-lg p-3 transition-colors group">
                        <span className="text-xs font-medium">Short Text</span>
                    </button>
                    <button onClick={() => addField('paragraph')} className="flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 rounded-lg p-3 transition-colors group">
                        <span className="text-xs font-medium">Paragraph</span>
                    </button>
                    <button onClick={() => addField('dropdown')} className="flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 rounded-lg p-3 transition-colors group">
                        <span className="text-xs font-medium">Dropdown</span>
                    </button>
                    <button onClick={() => addField('yes_no')} className="flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 rounded-lg p-3 transition-colors group">
                        <span className="text-xs font-medium">Yes / No</span>
                    </button>
                    <button onClick={() => addField('checkbox')} className="flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 rounded-lg p-3 transition-colors group">
                        <span className="text-xs font-medium">Checkboxes</span>
                    </button>
                </div>
            </div>

            {/* Save Action */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isPending || fields.length === 0}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {isSuccess ? <Check className="w-4 h-4 mr-2" /> : null}
                    {isSuccess ? 'JSON Config Saved' : 'Save Form Schema'}
                </button>
            </div>
        </div>
    );
}

// Inline XIcon for cleanup since lucide doesn't export raw 'XIcon' it exports 'X'
function XIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}
