import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, Filter, Plus, Upload, BookOpen, Trash2, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { studentService } from '@services/studentService';
import { useAuth } from '@context/AuthContext';

// Note type isn't exported from lib/supabase in this workspace; use a local minimal type
interface Note {
  id: string;
  title: string;
  description: string;
  pdf_url: string;
  course_id: string;
  created_at: string;
}

interface PersonalNote {
  id: string;
  user_id: string;
  title: string;
  type: 'link' | 'pdf';
  content_url: string;
  created_at: string;
}

export const NotesTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'official' | 'personal'>('official');
  const [notes, setNotes] = useState<Note[]>([]);
  const [personalNotes, setPersonalNotes] = useState<PersonalNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showPersonalUploadForm, setShowPersonalUploadForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadNotes();
    if (user) {
      loadPersonalNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    filterNotes();
  }, [notes, searchTerm, selectedCourse]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await studentService.getAllNotes();
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalNotes = async () => {
    if (!user || !user.id) return;
    try {
      const data = await studentService.getPersonalNotes(user.id!);
      setPersonalNotes(data);
    } catch (error) {
      console.error('Failed to load personal notes:', error);
    }
  };

  const filterNotes = () => {
    let filtered = notes;

    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCourse !== 'all') {
      filtered = filtered.filter(note => note.course_id === selectedCourse);
    }

    setFilteredNotes(filtered);
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDeletePersonalNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this log?')) return;
    try {
      await studentService.deletePersonalNote(id);
      setPersonalNotes(personalNotes.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const courses = [...new Set(notes.map(note => note.course_id))];

  if (showPersonalUploadForm && user) {
    return (
      <PersonalNoteUploadForm
        onSave={(newNote) => {
          setPersonalNotes([newNote, ...personalNotes]);
          setShowPersonalUploadForm(false);
        }}
        onCancel={() => setShowPersonalUploadForm(false)}
      />
    );
  }

  return (
    <div className="p-6 min-h-screen animate-fade-in text-[#EAEAEA]">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#00FF88]/10 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
              Field <span className="text-[#00FF88]">Notes</span>
            </h1>
            <p className="text-[#00B37A] font-mono text-sm mt-1">OPERATIONAL INTELLIGENCE</p>
          </div>
          <div className="flex items-center gap-4">
            {activeTab === 'personal' && (
              <button
                onClick={() => setShowPersonalUploadForm(true)}
                className="flex items-center space-x-2 bg-[#00FF88] text-black px-4 py-2 rounded-lg hover:bg-[#00CC66] transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] font-bold text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>ADD LOG</span>
              </button>
            )}
            <div className="h-10 w-10 rounded bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-[#00FF88]" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-[#00FF88]/10">
          <button
            onClick={() => setActiveTab('official')}
            className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'official'
              ? 'border-[#00FF88] text-[#00FF88]'
              : 'border-transparent text-[#EAEAEA]/50 hover:text-[#EAEAEA]'
              }`}
          >
            Official Intel
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'personal'
              ? 'border-[#00FF88] text-[#00FF88]'
              : 'border-transparent text-[#EAEAEA]/50 hover:text-[#EAEAEA]'
              }`}
          >
            Personal Logs
          </button>
        </div>

        {activeTab === 'official' ? (
          <>
            {/* Search and Filters */}
            <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#00B37A] group-focus-within:text-[#00FF88] transition-colors" />
                  <input
                    type="text"
                    placeholder="SEARCH DATABASE..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-[#00FF88]/20 bg-black text-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#00FF88] focus:shadow-[0_0_15px_rgba(0,255,136,0.1)] placeholder-[#00B37A]/50 font-mono text-sm transition-all"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#00B37A]" />
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-[#00FF88]/20 bg-black text-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#00FF88] appearance-none font-mono text-sm cursor-pointer hover:border-[#00FF88]/40 transition-colors"
                  >
                    <option value="all">ALL MISSIONS</option>
                    {courses.map(courseId => (
                      <option key={courseId} value={courseId}>
                        {courseId.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notes Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF88] mx-auto mb-4"></div>
                <p className="text-[#00B37A] font-mono animate-pulse">DECRYPTING FILES...</p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-[#00FF88]/20 rounded-xl bg-[#0A0F0A]/50">
                <div className="text-[#00FF88]/20 mb-6">
                  <FileText className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">No Files Found</h3>
                <p className="text-[#00B37A]">
                  {searchTerm || selectedCourse !== 'all'
                    ? 'Adjust search parameters to locate files.'
                    : 'Intelligence database is currently empty.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note) => (
                  <div key={note.id} className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 overflow-hidden hover:border-[#00FF88]/30 transition-all duration-300 group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00FF88]/0 via-[#00FF88]/0 to-[#00FF88]/0 group-hover:via-[#00FF88]/5 transition-all duration-500" />

                    <div className="p-6 relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 rounded bg-[#00FF88]/10 border border-[#00FF88]/20">
                              <FileText className="h-5 w-5 text-[#00FF88]" />
                            </div>
                            <h3 className="font-bold text-white group-hover:text-[#00FF88] transition-colors line-clamp-1 text-lg tracking-tight">
                              {note.title}
                            </h3>
                          </div>
                          <p className="text-[#00B37A] text-sm mb-4 line-clamp-2 leading-relaxed">
                            {note.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#EAEAEA]/50 font-mono mb-6 border-t border-[#00FF88]/10 pt-4">
                        <span className="bg-[#00FF88]/10 text-[#00FF88] px-2 py-1 rounded border border-[#00FF88]/20 uppercase tracking-wider">
                          {note.course_id.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </span>
                        <span>{new Date(note.created_at).toLocaleDateString()}</span>
                      </div>

                      <button
                        onClick={() => handleDownload(note.pdf_url)}
                        className="w-full flex items-center justify-center space-x-2 bg-[#00FF88] text-black py-3 rounded-lg hover:bg-[#00CC66] transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] font-bold uppercase tracking-wide"
                      >
                        <Download className="h-4 w-4" />
                        <span>ACCESS FILE</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Personal Notes Tab */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalNotes.length === 0 ? (
              <div className="col-span-full text-center py-20 border border-dashed border-[#00FF88]/20 rounded-xl bg-[#0A0F0A]/50">
                <div className="text-[#00FF88]/20 mb-6">
                  <FileText className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">No Personal Logs</h3>
                <p className="text-[#00B37A]">Upload PDFs or add external links to track your own intelligence.</p>
              </div>
            ) : (
              personalNotes.map((note) => (
                <div key={note.id} className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 overflow-hidden hover:border-[#00FF88]/30 transition-all duration-300 group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00FF88]/0 via-[#00FF88]/0 to-[#00FF88]/0 group-hover:via-[#00FF88]/5 transition-all duration-500" />

                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="p-2 rounded bg-[#00FF88]/10 border border-[#00FF88]/20">
                            {note.type === 'pdf' ? (
                              <FileText className="h-5 w-5 text-[#00FF88]" />
                            ) : (
                              <LinkIcon className="h-5 w-5 text-[#00FF88]" />
                            )}
                          </div>
                          <h3 className="font-bold text-white group-hover:text-[#00FF88] transition-colors line-clamp-1 text-lg tracking-tight">
                            {note.title}
                          </h3>
                        </div>
                        <p className="text-[#00B37A] text-xs font-mono mb-4">
                          {note.type === 'pdf' ? 'ENCRYPTED PDF DOCUMENT' : 'EXTERNAL INTELLIGENCE LINK'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeletePersonalNote(note.id)}
                        className="text-red-500/50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#EAEAEA]/50 font-mono mb-6 border-t border-[#00FF88]/10 pt-4">
                      <span className="bg-[#00FF88]/10 text-[#00FF88] px-2 py-1 rounded border border-[#00FF88]/20 uppercase tracking-wider">
                        {note.type.toUpperCase()}
                      </span>
                      <span>{new Date(note.created_at).toLocaleDateString()}</span>
                    </div>

                    <button
                      onClick={() => handleDownload(note.content_url)}
                      className="w-full flex items-center justify-center space-x-2 bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20 py-3 rounded-lg hover:bg-[#00FF88]/20 transition-all font-bold uppercase tracking-wide"
                    >
                      {note.type === 'pdf' ? <Download className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                      <span>{note.type === 'pdf' ? 'ACCESS FILE' : 'OPEN LINK'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-[#0A0F0A] border border-[#00FF88]/10 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,255,136,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_3s_infinite]" />
          <div className="relative z-10">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#00FF88]" />
              Field Manual Access
            </h3>
            <div className="text-[#00B37A] space-y-2 text-sm font-mono">
              <p>• Classified documentation for all operational modules.</p>
              <p>• Compiled by senior field operatives.</p>
              <p>• Authorized for offline review and mission planning.</p>
              <p>• Synchronized with latest threat intelligence.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Personal Note Upload Form
interface PersonalNoteUploadFormProps {
  onSave: (note: PersonalNote) => void;
  onCancel: () => void;
}

const PersonalNoteUploadForm: React.FC<PersonalNoteUploadFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'link' as 'link' | 'pdf',
    content_url: ''
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.id) return;

    if (formData.type === 'pdf' && !pdfFile) {
      alert('Please select a PDF file');
      return;
    }

    if (formData.type === 'link' && !formData.content_url) {
      alert('Please enter a valid URL');
      return;
    }

    try {
      setUploading(true);
      let contentUrl = formData.content_url;

      if (formData.type === 'pdf' && pdfFile) {
        contentUrl = await studentService.uploadPersonalFile(pdfFile);
      }

      const newNote = await studentService.addPersonalNote({
        user_id: user.id!,
        title: formData.title,
        type: formData.type,
        content_url: contentUrl
      });

      onSave(newNote);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to save log');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-black text-[#EAEAEA]">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-[#00FF88]/10 pb-6">
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
            Add Personal <span className="text-[#00FF88]">Log</span>
          </h1>
          <button
            onClick={onCancel}
            className="text-[#00B37A] hover:text-white transition-colors font-mono uppercase tracking-wider text-sm"
          >
            Abort
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0A0F0A] border border-[#00FF88]/10 rounded-xl p-8 space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00FF88]/5 to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-2">
                Log Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-[#00FF88]/20 bg-black text-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#00FF88] focus:shadow-[0_0_15px_rgba(0,255,136,0.1)] font-mono text-sm"
                placeholder="e.g., MY RESEARCH NOTES"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-2">
                Log Type
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'link' }))}
                  className={`flex-1 py-3 rounded-lg border font-mono uppercase tracking-wider text-sm transition-all ${formData.type === 'link'
                    ? 'bg-[#00FF88]/10 border-[#00FF88] text-[#00FF88]'
                    : 'bg-black border-[#00FF88]/20 text-[#00B37A] hover:border-[#00FF88]/50'
                    }`}
                >
                  External Link
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'pdf' }))}
                  className={`flex-1 py-3 rounded-lg border font-mono uppercase tracking-wider text-sm transition-all ${formData.type === 'pdf'
                    ? 'bg-[#00FF88]/10 border-[#00FF88] text-[#00FF88]'
                    : 'bg-black border-[#00FF88]/20 text-[#00B37A] hover:border-[#00FF88]/50'
                    }`}
                >
                  PDF Document
                </button>
              </div>
            </div>

            {formData.type === 'link' ? (
              <div>
                <label className="block text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-2">
                  External URL
                </label>
                <input
                  type="url"
                  value={formData.content_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_url: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#00FF88]/20 bg-black text-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#00FF88] focus:shadow-[0_0_15px_rgba(0,255,136,0.1)] font-mono text-sm"
                  placeholder="https://drive.google.com/..."
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-2">
                  Upload PDF
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="w-full px-4 py-3 border border-[#00FF88]/20 bg-black text-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#00FF88] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#00FF88]/10 file:text-[#00FF88] hover:file:bg-[#00FF88]/20 font-mono text-sm"
                  required
                />
                {pdfFile && (
                  <p className="text-xs text-[#00FF88] mt-2 font-mono">SELECTED: {pdfFile.name}</p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4 border-t border-[#00FF88]/10">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-[#00FF88]/20 text-[#00B37A] rounded-lg hover:bg-[#00FF88]/5 transition-colors font-mono uppercase tracking-wider text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-2 bg-[#00FF88] text-black rounded-lg hover:bg-[#00CC66] disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] font-bold uppercase tracking-wide flex items-center space-x-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    <span>SAVING...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>SAVE LOG</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};