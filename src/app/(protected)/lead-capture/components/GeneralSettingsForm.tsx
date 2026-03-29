'use client';

import { useState } from 'react';
import { updateFormSettings } from '../actions';
import { Check, Loader2 } from 'lucide-react';

interface GeneralSettingsFormProps {
    formId: string;
    title: string;
    description: string;
    welcomeMessage: string;
    successMessage: string;
    isActive: boolean;
    autoSendFirstMessage: boolean;
    currencySymbol: string;
}

export function GeneralSettingsForm({
    formId,
    title,
    description,
    welcomeMessage,
    successMessage,
    isActive: initialIsActive,
    autoSendFirstMessage: initialAutoSend,
    currencySymbol
}: GeneralSettingsFormProps) {
    const [isPending, setIsPending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isActive, setIsActive] = useState(initialIsActive);
    const [autoSendFirstMessage, setAutoSendFirstMessage] = useState(initialAutoSend);

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        setIsSuccess(false);

        // Map the boolean state into the formData explicitly before sending to Server Action
        if (isActive) {
            formData.append('isActive', 'on');
        }
        if (autoSendFirstMessage) {
            formData.append('autoSendFirstMessage', 'on');
        }

        try {
            await updateFormSettings(formData);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to update settings", error);
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <input type="hidden" name="formId" value={formId} />

            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                    <h4 className="text-sm font-medium text-slate-900">Form Status</h4>
                    <p className="text-xs text-slate-500">Toggle whether this form is publicly accessible to capture leads.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`${isActive ? 'bg-indigo-600' : 'bg-slate-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
                    role="switch"
                    aria-checked={isActive}
                >
                    <span
                        aria-hidden="true"
                        className={`${isActive ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                </button>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                    <h4 className="text-sm font-medium text-slate-900">Auto-Send First Message</h4>
                    <p className="text-xs text-slate-500">Automatically send AI drafted response to new leads.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setAutoSendFirstMessage(!autoSendFirstMessage)}
                    className={`${autoSendFirstMessage ? 'bg-indigo-600' : 'bg-slate-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
                    role="switch"
                    aria-checked={autoSendFirstMessage}
                >
                    <span
                        aria-hidden="true"
                        className={`${autoSendFirstMessage ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                </button>
            </div>

            <div>
                <label htmlFor="title" className="block text-sm font-medium leading-6 text-slate-900">Form Title</label>
                <div className="mt-2">
                    <input type="text" name="title" id="title" defaultValue={title} required className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                </div>
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium leading-6 text-slate-900">Short Description</label>
                <div className="mt-2">
                    <textarea id="description" name="description" rows={2} defaultValue={description} className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="welcomeMessage" className="block text-sm font-medium leading-6 text-slate-900">Welcome Message</label>
                    <div className="mt-2">
                        <input type="text" name="welcomeMessage" id="welcomeMessage" defaultValue={welcomeMessage} className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                    </div>
                </div>
                <div>
                    <label htmlFor="successMessage" className="block text-sm font-medium leading-6 text-slate-900">Confirmation Message</label>
                    <div className="mt-2">
                        <input type="text" name="successMessage" id="successMessage" defaultValue={successMessage} className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                    </div>
                </div>
                <div>
                    <label htmlFor="currencySymbol" className="block text-sm font-medium leading-6 text-slate-900">Currency Settings</label>
                    <div className="mt-2">
                        <select name="currencySymbol" id="currencySymbol" defaultValue={currencySymbol || '$'} className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                            <option value="$">US Dollar ($)</option>
                            <option value="€">Euro (€)</option>
                            <option value="£">British Pound (£)</option>
                            <option value="¥">Japanese Yen (¥)</option>
                            <option value="₹">Indian Rupee (₹)</option>
                            <option value="A$">Australian Dollar (A$)</option>
                            <option value="C$">Canadian Dollar (C$)</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {isSuccess ? <Check className="w-4 h-4 mr-2" /> : null}
                    {isSuccess ? 'Saved' : 'Save Content'}
                </button>
            </div>
        </form>
    );
}
