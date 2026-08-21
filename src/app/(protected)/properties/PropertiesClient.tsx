"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Bed, Bath, Trash2, Home, X, Filter, Edit, Edit2, BedDouble, MoreVertical, FileText, Globe, CheckCircle, Share, ChevronRight, MessageSquare, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { StyledInput } from '@/components/ui/StyledInput';
import { ImageUploadBox } from '@/components/ui/ImageUploadBox';
import { AnimatedTooltip } from '@/components/ui/AnimatedTooltip';
import { createProperty, updateProperty, deleteProperty } from './actions';
import MatchingLeadsSection from '@/components/ui/properties/MatchingLeadsSection';
import { GLOBAL_COUNTRIES } from '@/lib/constants/locations';

async function generatePropertyFlyerImage(property: any, agentInfo: any, formattedPrice: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas 2D context not supported'));

        canvas.width = 1080;
        canvas.height = 1350;

        // Background dark luxury gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
        bgGrad.addColorStop(0, '#0F0913');
        bgGrad.addColorStop(0.5, '#1A0B1A');
        bgGrad.addColorStop(1, '#0A050D');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1080, 1350);

        const renderDetails = (imgLoaded: boolean, imgObj?: HTMLImageElement) => {
            // Draw image card container with rounded corners
            const imgX = 60;
            const imgY = 60;
            const imgW = 960;
            const imgH = 680;
            const radius = 32;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(imgX + radius, imgY);
            ctx.lineTo(imgX + imgW - radius, imgY);
            ctx.quadraticCurveTo(imgX + imgW, imgY, imgX + imgW, imgY + radius);
            ctx.lineTo(imgX + imgW, imgY + imgH - radius);
            ctx.quadraticCurveTo(imgX + imgW, imgY + imgH, imgX + imgW - radius, imgY + imgH);
            ctx.lineTo(imgX + radius, imgY + imgH);
            ctx.quadraticCurveTo(imgX, imgY + imgH, imgX, imgY + imgH - radius);
            ctx.lineTo(imgX, imgY + radius);
            ctx.quadraticCurveTo(imgX, imgY, imgX + radius, imgY);
            ctx.closePath();
            ctx.clip();

            if (imgLoaded && imgObj) {
                const imgRatio = imgObj.width / imgObj.height;
                const cardRatio = imgW / imgH;
                let sW = imgObj.width;
                let sH = imgObj.height;
                let sx = 0;
                let sy = 0;
                if (imgRatio > cardRatio) {
                    sW = imgObj.height * cardRatio;
                    sx = (imgObj.width - sW) / 2;
                } else {
                    sH = imgObj.width / cardRatio;
                    sy = (imgObj.height - sH) / 2;
                }
                ctx.drawImage(imgObj, sx, sy, sW, sH, imgX, imgY, imgW, imgH);
            } else {
                const placeholderGrad = ctx.createLinearGradient(imgX, imgY, imgX + imgW, imgY + imgH);
                placeholderGrad.addColorStop(0, '#2D1B28');
                placeholderGrad.addColorStop(1, '#4A1D36');
                ctx.fillStyle = placeholderGrad;
                ctx.fillRect(imgX, imgY, imgW, imgH);
            }

            // Bottom gradient overlay on image
            const imgOverlay = ctx.createLinearGradient(imgX, imgY + imgH - 200, imgX, imgY + imgH);
            imgOverlay.addColorStop(0, 'rgba(0,0,0,0)');
            imgOverlay.addColorStop(1, 'rgba(0,0,0,0.7)');
            ctx.fillStyle = imgOverlay;
            ctx.fillRect(imgX, imgY, imgW, imgH);
            ctx.restore();

            // Status Badge on Image
            const statusText = (property.status || 'Available').toUpperCase();
            ctx.font = 'bold 22px sans-serif';
            const statusWidth = ctx.measureText(statusText).width + 44;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            roundRect(ctx, 90, 90, statusWidth, 48, 24, true);
            ctx.fillStyle = property.status === 'Sold' ? '#F43F5E' : '#10B981';
            ctx.beginPath();
            ctx.arc(114, 114, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(statusText, 130, 122);

            // Floating Price Badge (Bottom Right of Image)
            ctx.font = 'bold 44px sans-serif';
            const priceText = formattedPrice;
            const priceWidth = ctx.measureText(priceText).width + 50;
            const priceX = 1080 - 90 - priceWidth;
            const priceY = 660;

            const pillGrad = ctx.createLinearGradient(priceX, priceY, priceX + priceWidth, priceY + 70);
            pillGrad.addColorStop(0, '#853953');
            pillGrad.addColorStop(1, '#612D53');
            ctx.fillStyle = pillGrad;
            roundRect(ctx, priceX, priceY, priceWidth, 70, 20, true);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(priceText, priceX + 25, priceY + 50);

            // Property Title (Wrapped up to 2 lines)
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 46px sans-serif';
            const title = property.title || 'Exclusive Property Listing';
            wrapText(ctx, title, 60, 800, 960, 56, 2);

            // Location with pin
            ctx.fillStyle = '#94A3B8';
            ctx.font = '500 28px sans-serif';
            const locText = `📍 ${property.location || 'Prime Location'}`;
            ctx.fillText(locText, 60, 930);

            // Property Specs Chips (Beds, Baths, Type)
            const chips = [
                `🛏️ ${property.bedrooms || 0} Beds`,
                `🛁 ${property.bathrooms || 0} Baths`,
                `🏷️ ${property.propertyType || 'Residential'}`
            ];

            let chipX = 60;
            const chipY = 970;
            chips.forEach(chip => {
                ctx.font = 'bold 24px sans-serif';
                const chipW = ctx.measureText(chip).width + 36;
                ctx.fillStyle = '#1E1424';
                roundRect(ctx, chipX, chipY, chipW, 54, 16, true, '#3B2034', 1.5);
                ctx.fillStyle = '#E2E8F0';
                ctx.fillText(chip, chipX + 18, chipY + 36);
                chipX += chipW + 16;
            });

            // Divider line
            ctx.strokeStyle = '#2D1B2D';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(60, 1070);
            ctx.lineTo(1020, 1070);
            ctx.stroke();

            // Agent Branding Footer Card
            const footerX = 60;
            const footerY = 1110;
            const footerW = 960;
            const footerH = 170;

            const footerGrad = ctx.createLinearGradient(footerX, footerY, footerX + footerW, footerY + footerH);
            footerGrad.addColorStop(0, '#190E1E');
            footerGrad.addColorStop(1, '#271125');
            ctx.fillStyle = footerGrad;
            roundRect(ctx, footerX, footerY, footerW, footerH, 24, true, '#4A2341', 2);

            const agentName = agentInfo?.name || 'Licensed Agent';
            const initials = agentName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'AG';

            const avatarX = footerX + 40;
            const avatarY = footerY + 45;
            const avatarGrad = ctx.createLinearGradient(avatarX, avatarY, avatarX + 80, avatarY + 80);
            avatarGrad.addColorStop(0, '#853953');
            avatarGrad.addColorStop(1, '#612D53');
            ctx.fillStyle = avatarGrad;
            ctx.beginPath();
            ctx.arc(avatarX + 40, avatarY + 40, 40, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 30px sans-serif';
            const initW = ctx.measureText(initials).width;
            ctx.fillText(initials, avatarX + 40 - initW / 2, avatarY + 50);

            // Agent Name & Company
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 34px sans-serif';
            ctx.fillText(agentName, footerX + 150, footerY + 75);

            ctx.fillStyle = '#94A3B8';
            ctx.font = '500 24px sans-serif';
            ctx.fillText(agentInfo?.company || 'Formative Real Estate', footerX + 150, footerY + 115);

            // WhatsApp / Phone pill on right
            const phone = agentInfo?.phone || '';
            const phoneText = phone ? `💬 ${phone}` : '💬 Share on WhatsApp';
            ctx.font = 'bold 24px sans-serif';
            const phoneW = ctx.measureText(phoneText).width + 36;
            const phoneX = footerX + footerW - 30 - phoneW;
            const phoneY = footerY + 58;

            ctx.fillStyle = '#25D366';
            roundRect(ctx, phoneX, phoneY, phoneW, 54, 27, true);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(phoneText, phoneX + 18, phoneY + 36);

            canvas.toBlob(blob => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas export failed'));
            }, 'image/png');
        };

        function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill = true, strokeColor?: string, strokeW = 1) {
            c.save();
            c.beginPath();
            c.moveTo(x + r, y);
            c.lineTo(x + w - r, y);
            c.quadraticCurveTo(x + w, y, x + w, y + r);
            c.lineTo(x + w, y + h - r);
            c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            c.lineTo(x + r, y + h);
            c.quadraticCurveTo(x, y + h, x, y + h - r);
            c.lineTo(x, y + r);
            c.quadraticCurveTo(x, y, x + r, y);
            c.closePath();
            if (fill) c.fill();
            if (strokeColor) {
                c.strokeStyle = strokeColor;
                c.lineWidth = strokeW;
                c.stroke();
            }
            c.restore();
        }

        function wrapText(c: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number, maxLines: number) {
            const words = text.split(' ');
            let line = '';
            let linesDrawn = 0;
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = c.measureText(testLine);
                if (metrics.width > maxW && n > 0) {
                    c.fillText(line.trim(), x, y);
                    line = words[n] + ' ';
                    y += lineH;
                    linesDrawn++;
                    if (linesDrawn >= maxLines - 1 && n < words.length - 1) {
                        const rest = words.slice(n).join(' ');
                        let truncated = rest;
                        while (c.measureText(truncated + '...').width > maxW && truncated.length > 0) {
                            truncated = truncated.slice(0, -1);
                        }
                        c.fillText(truncated + '...', x, y);
                        return;
                    }
                } else {
                    line = testLine;
                }
            }
            c.fillText(line.trim(), x, y);
        }

        const images = property.images ? (typeof property.images === 'string' ? JSON.parse(property.images) : property.images) : [];
        const heroUrl = images.length > 0 ? images[0] : null;

        if (heroUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => renderDetails(true, img);
            img.onerror = () => renderDetails(false);
            img.src = heroUrl;
        } else {
            renderDetails(false);
        }
    });
}

export default function PropertiesClient({ initialProperties, locationGroups, agentInfo }: { initialProperties: any[], locationGroups?: any[], agentInfo?: any }) {
    const [properties, setProperties] = useState(initialProperties);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const [viewingMatchesOf, setViewingMatchesOf] = useState<any | null>(null);
    const [viewingNotesOf, setViewingNotesOf] = useState<any | null>(null);
    const [isSharingId, setIsSharingId] = useState<string | null>(null);
    
    // Global Currency
    const [currency, setCurrency] = useState('USD');
    const currencyMap: Record<string, {symbol: string, rate: number}> = {
        'USD': {symbol: '$', rate: 1},
        'EUR': {symbol: '€', rate: 0.92},
        'NGN': {symbol: '₦', rate: 1550},
        'GBP': {symbol: '£', rate: 0.79}
    };

    // Search/Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [bedsFilter, setBedsFilter] = useState('All');
    const [demandFilter, setDemandFilter] = useState('All');
    const [locFilter, setLocFilter] = useState('All');

    // Menu state
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    // Form state
    const [formParams, setFormParams] = useState({
        title: '',
        country: 'United States',
        cityArea: '',
        locationId: '',
        price: '',
        beds: '',
        baths: '',
        status: 'Available',
        propertyType: 'House'
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notesText, setNotesText] = useState('');

    const convertPrice = (priceUSD: number) => {
        const rate = currencyMap[currency]?.rate || 1;
        const sym = currencyMap[currency]?.symbol || '$';
        return `${sym}${(priceUSD * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    };

    const getDemandLevel = (matchCount: number) => {
        if (matchCount >= 6) return { label: 'High Demand', color: 'bg-emerald-500', text: 'text-white' };
        if (matchCount >= 3) return { label: 'Medium Demand', color: 'bg-amber-500', text: 'text-white' };
        return { label: 'Low Demand', color: 'bg-slate-400', text: 'text-white' };
    };

    const handleShareWhatsApp = async (p: any) => {
        setIsSharingId(p.id);
        const formattedPrice = convertPrice(p.price);

        const caption = [
            `🏡 *${p.title}*`,
            `📍 Location: ${p.location}`,
            `💰 Price: ${formattedPrice}`,
            `🛏️ ${p.bedrooms} Beds | 🛁 ${p.bathrooms} Baths | 🏷️ ${p.propertyType}`,
            ``,
            `📞 Contact: ${agentInfo?.name || 'Agent'}${agentInfo?.phone ? ' (' + agentInfo.phone + ')' : ''}`
        ].join('\n');

        try {
            const blob = await generatePropertyFlyerImage(p, agentInfo, formattedPrice);
            const fileName = `${(p.title || 'property').replace(/[^a-zA-Z0-9]/g, '_')}_flyer.png`;
            const file = new File([blob], fileName, { type: 'image/png' });

            // 1. Try native Web Share API with image file attachment
            if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: p.title,
                    text: caption,
                    files: [file]
                });
            } else {
                // 2. Direct client-side auto-download + open WhatsApp web/app intent
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                const waUrl = `https://wa.me/?text=${encodeURIComponent(caption)}`;
                window.open(waUrl, '_blank');
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('WhatsApp share notice:', err);
                const waUrl = `https://wa.me/?text=${encodeURIComponent(caption)}`;
                window.open(waUrl, '_blank');
            }
        } finally {
            setIsSharingId(null);
        }
    };

    const filteredProps = properties.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        const matchesType = typeFilter === 'All' || p.propertyType === typeFilter;
        const matchesLoc = locFilter === 'All' || p.locationId === locFilter || p.location.toLowerCase().includes(locFilter.toLowerCase());
        
        let matchesBeds = true;
        if (bedsFilter !== 'All') {
            if (bedsFilter === '4+') matchesBeds = p.bedrooms >= 4;
            else matchesBeds = p.bedrooms.toString() === bedsFilter;
        }

        let matchesDemand = true;
        const matchCount = p.matches?.length || 0;
        if (demandFilter !== 'All') {
            const dl = getDemandLevel(matchCount).label;
            matchesDemand = dl === demandFilter;
        }

        return matchesSearch && matchesStatus && matchesType && matchesBeds && matchesDemand && matchesLoc;
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const openEdit = (p: any) => {
        setFormParams({
            title: p.title,
            country: 'United States',
            cityArea: p.location || '',
            locationId: p.locationId || '',
            price: p.price.toString(),
            beds: p.bedrooms.toString(),
            baths: p.bathrooms.toString(),
            status: p.status,
            propertyType: p.propertyType
        });
        setPreviewUrl(p.images && p.images.length > 0 ? JSON.parse(p.images)[0] : null);
        setEditingId(p.id);
        setIsAdding(true);
    };

    const handleSave = async () => {
        if (!formParams.title || (!formParams.cityArea && !formParams.locationId)) {
            alert("Please fill out the property title and location (city/area or country).");
            return;
        }
        
        let formattedLocation = formParams.cityArea ? `${formParams.cityArea} (${formParams.country})` : formParams.country;
        if (formParams.locationId) {
            for (const g of (locationGroups || [])) {
                const loc = g.locations.find((l: any) => l.id === formParams.locationId);
                if (loc) {
                    formattedLocation = `${formParams.cityArea || loc.name} (${formParams.country})`;
                    break;
                }
            }
        }

        setIsSubmitting(true);
        try {
            const data: any = {
                title: formParams.title,
                location: formattedLocation,
                price: parseInt(formParams.price.replace(/[^0-9]/g, '')) || 0,
                bedrooms: parseInt(formParams.beds) || 0,
                bathrooms: parseFloat(formParams.baths) || 0,
                status: formParams.status,
                propertyType: formParams.propertyType,
                images: previewUrl ? [previewUrl] : []
            };
            if (formParams.locationId && formParams.locationId.trim() !== '') {
                data.locationId = formParams.locationId.trim();
            }

            if (editingId) {
                const updated = await updateProperty(editingId, data);
                setProperties(properties.map(p => p.id === editingId ? updated : p));
            } else {
                const created = await createProperty({ ...data, currency: 'USD' });
                setProperties([created, ...properties]);
            }
            setIsAdding(false);
            setEditingId(null);
            setFormParams({ title: '', country: 'United States', cityArea: '', locationId: '', price: '', beds: '', baths: '', status: 'Available', propertyType: 'House' });
            setPreviewUrl(null);
        } catch (error: any) {
            console.error("Save property error:", error);
            alert(error?.message || "Failed to save property");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Delete failed");
            setProperties(properties.filter(p => p.id !== id));
            setIsDeletingId(null);
        } catch (err: any) {
            alert("Failed to delete property");
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const updated = await updateProperty(id, { status: newStatus });
            setProperties(properties.map(p => p.id === id ? { ...p, status: newStatus } : p));
            setActiveMenuId(null);
        } catch (error) {
            alert("Failed to update status");
        }
    };

    // Outside click for menu
    useEffect(() => {
        const handleClick = () => setActiveMenuId(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    if (isAdding) {
        return (
            <div className="p-8 max-w-4xl mx-auto w-full animation-slide-up">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">{editingId ? 'Edit Property' : 'Add New Property'}</h1>
                    </div>
                    <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-slate-500 font-bold px-4 py-2 hover:bg-slate-100 rounded-lg">Cancel</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Property Title</label>
                            <StyledInput value={formParams.title} onChange={(e) => setFormParams({ ...formParams, title: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Country / Region</label>
                                <select value={formParams.country} onChange={(e) => setFormParams({ ...formParams, country: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none bg-white font-medium text-slate-800">
                                    {GLOBAL_COUNTRIES.map((c: string) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">City / Neighborhood</label>
                                <StyledInput 
                                    placeholder="e.g. Miami Beach, FL or Victoria Island" 
                                    value={formParams.cityArea} 
                                    onChange={(e) => setFormParams({ ...formParams, cityArea: e.target.value })} 
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Price (USD)</label>
                                <StyledInput type="text" value={formParams.price} onChange={(e) => setFormParams({ ...formParams, price: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Beds</label>
                                <StyledInput type="number" min="0" value={formParams.beds} onChange={(e) => setFormParams({ ...formParams, beds: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Baths</label>
                                <StyledInput type="number" min="0" value={formParams.baths} onChange={(e) => setFormParams({ ...formParams, baths: e.target.value })} />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                                <select value={formParams.status} onChange={e => setFormParams({...formParams, status: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none bg-white">
                                    <option value="Available">Available</option>
                                    <option value="Reserved">Reserved</option>
                                    <option value="Under Negotiation">Under Negotiation</option>
                                    <option value="Sold">Sold</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Property Type</label>
                                <select value={formParams.propertyType} onChange={e => setFormParams({...formParams, propertyType: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none bg-white">
                                    <option value="House">House</option>
                                    <option value="Apartment">Apartment</option>
                                    <option value="Duplex">Duplex</option>
                                    <option value="Penthouse">Penthouse</option>
                                    <option value="Condo">Condo</option>
                                    <option value="Land">Land</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-bold text-slate-700 mb-2 block">Property Images</label>
                            <ImageUploadBox onChange={handleFileChange} selectedFileUrl={previewUrl} />
                        </div>
                        <div className="pt-4">
                            <button onClick={handleSave} disabled={isSubmitting} className="w-full bg-[#853953] hover:bg-[#612D53] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                                <Plus className="w-5 h-5" /> {isSubmitting ? 'Saving...' : 'Save Property'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                        <Home className="w-8 h-8 text-[#853953]" /> Catalog & Management
                    </h1>
                    <p className="text-slate-500 mt-2">Manage properties, track demand, and send automated pitches to matching leads.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <select value={currency} onChange={e => setCurrency(e.target.value)} className="bg-transparent text-sm font-bold text-slate-700 outline-none">
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="NGN">NGN (₦)</option>
                        </select>
                    </div>
                    <button onClick={() => { setIsAdding(true); }} className="flex items-center gap-2 bg-[#853953] hover:bg-[#612D53] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
                        <Plus className="w-5 h-5" /> Add Property
                    </button>
                </div>
            </div>
            
            {properties.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-2xl mx-auto my-12 bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-md flex flex-col items-center"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#853953] to-[#612D53] flex items-center justify-center text-white mb-6 shadow-xl shadow-[#853953]/10">
                        <Home className="w-8 h-8 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Add your first property</h2>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-md mb-8">
                        Formative automatically matches property profiles, budgets, and location preferences with your lead database, giving you real-time scoring and recommendation matches.
                    </p>
                    <button
                        onClick={() => { setIsAdding(true); }}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#853953] text-white rounded-xl text-sm font-bold hover:bg-[#612D53] transition-all active:scale-95 shadow-lg shadow-[#853953]/10"
                    >
                        <Plus className="w-4 h-4" /> Add Property
                    </button>
                </motion.div>
            ) : (
                <>
                    {/* Advanced Filters */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 shadow-sm">
                        <div className="relative lg:col-span-2">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search Title or Address..." 
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#853953] outline-none h-full"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select value={locFilter} onChange={e => setLocFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-[#853953] bg-white">
                            <option value="All">All Locations</option>
                            {(locationGroups || []).map((g: any) => (
                                <optgroup key={g.id} label={g.name}>
                                    {g.locations.map((loc: any) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                </optgroup>
                            ))}
                        </select>
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-[#853953] bg-white">
                            <option value="All">All Types</option>
                            <option value="House">House</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Duplex">Duplex</option>
                            <option value="Penthouse">Penthouse</option>
                            <option value="Condo">Condo</option>
                        </select>
                        <select value={bedsFilter} onChange={e => setBedsFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-[#853953] bg-white">
                            <option value="All">Beds: Any</option>
                            <option value="1">1 Bed</option>
                            <option value="2">2 Beds</option>
                            <option value="3">3 Beds</option>
                            <option value="4+">4+ Beds</option>
                        </select>
                        <select value={demandFilter} onChange={e => setDemandFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-[#853953] bg-white">
                            <option value="All">Demand: Any</option>
                            <option value="High Demand">High Demand</option>
                            <option value="Medium Demand">Medium Demand</option>
                            <option value="Low Demand">Low Demand</option>
                        </select>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-[#853953] bg-white lg:col-span-full xl:col-span-1">
                            <option value="All">Status: All</option>
                            <option value="Available">Available</option>
                            <option value="Reserved">Reserved</option>
                            <option value="Under Negotiation">Under Negotiation</option>
                            <option value="Sold">Sold</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredProps.map(p => {
                            const images = p.images ? JSON.parse(p.images) : [];
                            const heroImg = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=400&h=300';
                            const matchCount = p.matches?.length || 0;
                            const demand = getDemandLevel(matchCount);

                            return (
                                <div key={p.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-full group overflow-visible">
                                    {/* Card Image Wrapper */}
                                    <div className="h-48 bg-slate-100 relative overflow-hidden rounded-t-3xl shrink-0">
                                        <img src={heroImg} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        
                                        {/* Badges */}
                                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                            <span className={`backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${demand.color} ${demand.text}`}>
                                                {demand.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Moved Dropdown outside of overflow-hidden image wrapper */}
                                    <div className="absolute top-4 right-4 z-40">
                                        <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === p.id ? null : p.id); }} className="p-2 bg-white/90 backdrop-blur-md hover:bg-white text-slate-700 rounded-lg shadow-sm">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                        {activeMenuId === p.id && (
                                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-[100] transform origin-top-right transition-all max-h-[400px] overflow-y-auto scrollbar-hide">
                                                <button onClick={() => { openEdit(p); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium">
                                                    <Edit2 className="w-4 h-4 text-slate-400" /> Edit Listing
                                                </button>
                                                <button 
                                                    onClick={() => { handleShareWhatsApp(p); setActiveMenuId(null); }} 
                                                    disabled={isSharingId === p.id}
                                                    className="w-full text-left px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 font-medium transition-colors"
                                                >
                                                    {isSharingId === p.id ? <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" /> : <MessageSquare className="w-4 h-4 text-emerald-600" />}
                                                    {isSharingId === p.id ? 'Generating flyer...' : 'Share on WhatsApp'}
                                                </button>
                                                <button onClick={() => { setViewingMatchesOf(p); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium">
                                                    <Share className="w-4 h-4 text-slate-400" /> Send To Leads
                                                </button>
                                                <button onClick={() => { setViewingNotesOf(p); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium">
                                                    <FileText className="w-4 h-4 text-slate-400" /> Internal Notes
                                                </button>
                                                <div className="border-t border-slate-100 my-2"></div>
                                                <div className="px-4 py-1">
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 mt-1">Status</div>
                                                    <div className="flex flex-col gap-0.5">
                                                        {['Available', 'Reserved', 'Under Negotiation', 'Sold'].map(st => (
                                                            <button key={st} onClick={() => handleStatusChange(p.id, st)} className={`w-full text-left px-4 py-2 text-xs font-bold rounded-md hover:bg-slate-100 transition-colors ${p.status === st ? 'bg-[#853953]/5 text-[#853953]' : 'text-slate-600'}`}>
                                                                {st}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="border-t border-slate-100 my-1"></div>
                                                <button onClick={(e) => { e.stopPropagation(); setIsDeletingId(p.id); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                                                    <Trash2 className="w-4 h-4 text-rose-500" /> Delete Property
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Content Wrapper */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-extrabold text-lg text-slate-900 leading-tight line-clamp-2">{p.title}</h3>
                                            <span className="font-black text-[#853953] bg-[#853953]/5 px-2 py-1 rounded-lg text-sm shrink-0 ml-3">
                                                {convertPrice(p.price)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-4">
                                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{p.location}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mt-auto">
                                            <span className="flex items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100"><BedDouble className="w-3.5 h-3.5 mr-1.5 text-[#853953]" /> {p.bedrooms} Beds</span>
                                            <span className="flex items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100"><Bath className="w-3.5 h-3.5 mr-1.5 text-[#853953]" /> {p.bathrooms} Baths</span>
                                            <span className="flex items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 ml-auto whitespace-nowrap">
                                                <div className={`w-2 h-2 rounded-full mr-2 ${p.status === 'Available' ? 'bg-emerald-500' : p.status === 'Sold' ? 'bg-rose-500' : 'bg-amber-500'} animate-pulse`} />
                                                {p.status}
                                            </span>
                                        </div>
                                        
                                        {/* Matches Button (Standard layout) */}
                                        <div className="mt-5 pt-4 border-t border-slate-100">
                                            <button onClick={() => setViewingMatchesOf(p)} className="flex items-center justify-between w-full p-3 rounded-xl bg-[#853953]/5 hover:bg-[#853953]/10 border-[#853953]/10 hover:border-[#853953]/20 transition-all group/btn">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-[#612D53] animate-pulse" />
                                                    <span className="text-sm font-extrabold text-[#612D53]">{matchCount} Matching Leads</span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-[#853953] group-hover/btn:text-[#612D53] group-hover/btn:translate-x-0.5 transition-all" />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Delete Overlay */}
                                    {isDeletingId === p.id && (
                                        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center animation-fade-in rounded-3xl">
                                            <Trash2 className="w-10 h-10 text-rose-500 mb-3" />
                                            <h4 className="font-bold text-slate-900 mb-1">Delete Property?</h4>
                                            <p className="text-sm text-slate-500 mb-6 font-medium">This wipes it and all existing leads matches permanently.</p>
                                            <div className="flex gap-3 w-full">
                                                <button onClick={() => setIsDeletingId(null)} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors">Cancel</button>
                                                <button onClick={() => handleDelete(p.id)} className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors shadow-sm">Delete</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {filteredProps.length === 0 && (
                            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100"><Home className="w-8 h-8 text-slate-300" /></div>
                                <h3 className="text-lg font-bold text-slate-900">No properties match your filters</h3>
                                <p className="text-slate-500 font-medium">Try adjusting criteria above or add a new property.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {viewingMatchesOf && (
                <>
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setViewingMatchesOf(null)} />
                    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-4xl bg-white shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col">
                        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-8 py-5 border-b border-slate-200 flex items-center justify-between z-10 shadow-sm">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900 line-clamp-1 pr-4">{viewingMatchesOf.title}</h2>
                                <p className="text-xs font-bold text-[#853953] uppercase tracking-widest mt-1">Lead Matching Pipeline</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => handleShareWhatsApp(viewingMatchesOf)}
                                    disabled={isSharingId === viewingMatchesOf.id}
                                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                >
                                    {isSharingId === viewingMatchesOf.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                                    {isSharingId === viewingMatchesOf.id ? 'Generating...' : 'Share on WhatsApp'}
                                </button>
                                <button onClick={() => setViewingMatchesOf(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors shrink-0">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                            <MatchingLeadsSection property={viewingMatchesOf} />
                        </div>
                    </div>
                </>
            )}

            {/* View Notes Modal Wrapper (Using simple component below) */}
            {viewingNotesOf && <PropertyNotesDrawer property={viewingNotesOf} onClose={() => setViewingNotesOf(null)} />}
        </div>
    );
}

// Inline Notes Drawer Component
function PropertyNotesDrawer({ property, onClose }: { property: any, onClose: () => void }) {
    const [notes, setNotes] = useState<any[]>([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/properties/${property.id}/notes`)
            .then(r => r.json())
            .then(d => { setNotes(d.notes || []); setLoading(false); });
    }, [property.id]);

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        try {
            const res = await fetch(`/api/properties/${property.id}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newNote })
            });
            const { note } = await res.json();
            setNotes([note, ...notes]);
            setNewNote('');
        } catch (err) {
            alert("Failed to add note");
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        setDeletingId(noteId);
        try {
            const res = await fetch(`/api/properties/${property.id}/notes?noteId=${noteId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setNotes(prev => prev.filter(n => n.id !== noteId));
            }
        } catch (err) {
            console.error('Failed to delete property note', err);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform border-l border-slate-200">
                <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-5 border-b border-slate-200 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2"><FileText className="w-5 h-5 text-[#853953]"/> Internal Notes</h2>
                        <p className="text-xs font-medium text-slate-500 mt-1 truncate max-w-[200px]">{property.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full shrink-0"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <textarea 
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        placeholder="e.g., Owner flexible on price, urgent sale, private swimming pool..."
                        className="w-full h-24 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#853953] text-sm resize-none"
                    />
                    <button onClick={handleAddNote} disabled={!newNote.trim()} className="mt-3 w-full bg-[#853953] hover:bg-[#612D53] disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm cursor-pointer">
                        Save Note & Re-Match Leads
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
                    {loading ? <p className="text-slate-400 text-sm text-center py-10">Loading notes...</p> : notes.length === 0 ? <p className="text-slate-400 text-sm text-center py-10 italic">No internal notes yet.</p> : (
                        notes.map(n => (
                            <div key={n.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative group">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-900">{n.agentName}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-bold text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                                        <button
                                            onClick={() => handleDeleteNote(n.id)}
                                            disabled={deletingId === n.id}
                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 rounded transition-opacity cursor-pointer"
                                            title="Delete Note"
                                        >
                                            {deletingId === n.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
