'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '@/store/uiSlice';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import BaseButton from '../ui/Buttons';
import { IEvent } from '@/types';
import eventService from '@/services/event.service';

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event?: IEvent | null;
}

export default function EventModal({ open, onClose, onSuccess, event }: EventModalProps) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [info, setInfo] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (event) {
      setName(event.name);
      setInfo(event.info || '');
      setExistingImages(event.images || []);
      setImages([]);
      setPreviewUrls([]);
    } else {
      setName('');
      setInfo('');
      setExistingImages([]);
      setImages([]);
      setPreviewUrls([]);
    }
  }, [event, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);

      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  const removeNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageUrl: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      dispatch(addToast({ type: 'error', message: 'Event name is required' }));
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('info', info);
    
    images.forEach((file) => {
      formData.append('images', file);
    });

    if (event) {
      // For updates, we might need to tell backend which images were removed
      const removedImages = event.images.filter(img => !existingImages.includes(img));
      removedImages.forEach(img => {
        formData.append('removeImages', img);
      });
    }

    try {
      if (event) {
        await eventService.updateEvent(event._id, formData);
        dispatch(addToast({ type: 'success', message: 'Event updated successfully' }));
      } else {
        await eventService.createEvent(formData);
        dispatch(addToast({ type: 'success', message: 'Event created successfully' }));
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving event:', error);
      dispatch(addToast({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to save event' 
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={event ? 'Edit Event' : 'Create New Event'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <Input
          label="Event Title"
          placeholder="Enter event title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Textarea
          label="Description"
          placeholder="Enter event details"
          value={info}
          onChange={(e) => setInfo(e.target.value)}
          rows={4}
        />

        <div className="space-y-3">
          <label className="label">Event Images</label>
          
          {/* Image Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Existing Images */}
            {existingImages.map((url, idx) => (
              <div key={`existing-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                <img src={url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL || ''}${url}`} alt="Event" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(url)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* New Previews */}
            {previewUrls.map((url, idx) => (
              <div key={`new-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border border-brand-100 shadow-sm bg-brand-50/30">
                <img src={url} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewImage(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-brand-500 text-[10px] text-white rounded font-medium">New</div>
              </div>
            ))}

            {/* Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl hover:border-brand-400 hover:bg-brand-50/50 transition-all text-gray-400 hover:text-brand-500"
            >
              <Plus className="w-8 h-8 mb-1" />
              <span className="text-xs font-medium">Add Image</span>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />
          <p className="text-[11px] text-gray-500 mt-2 flex items-center gap-1.5">
            <Upload className="w-3 h-3" />
            Supports JPEG, PNG, WEBP. You can upload multiple images.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 p-6">
          <BaseButton type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </BaseButton>
          <BaseButton type="submit" variant="primary" loading={loading}>
            {event ? 'Update Event' : 'Create Event'}
          </BaseButton>
        </div>
      </form>
    </Modal>
  );
}
