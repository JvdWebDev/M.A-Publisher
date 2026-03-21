'use client';
import { useState, useEffect, useRef } from 'react';
import { uploadToGitHub } from './actions';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Upload, Book as BookIcon, Trash2, Edit, X,
  Plus, LayoutDashboard, Loader2, CheckCircle, AlertCircle, LogOut, FileText, Heart, Bell, Send, Calendar, RefreshCw
} from 'lucide-react';

// Rich Text Editor Imports
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-[300px] bg-stone-50 animate-pulse rounded-2xl" />
});
import 'react-quill-new/dist/quill.snow.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [duas, setDuas] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'duas' | 'notifications'>('library');
  
  // Edit States
  const [editingId, setEditingId] = useState<number | null>(null);
  const [duaContent, setDuaContent] = useState(''); 
  
  // Notification State
  const [notifData, setNotifData] = useState({ title: '', message: '', url: '', schedule_time: '' });
  const [editingNotifId, setEditingNotifId] = useState<string | null>(null); // NEW: Track notification edit
  const [pastNotifications, setPastNotifications] = useState<any[]>([]);
  const [fetchingNotifs, setFetchingNotifs] = useState(false);

  // Suggestions State
  const [authors, setAuthors] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  // File Name States
  const [pdfName, setPdfName] = useState('');
  const [coverName, setCoverName] = useState('');

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
    };
    checkUser();
    fetchBooks();
    fetchDuas();
    fetchSuggestions();
  }, []);

  // Fetch history when notification tab is active
  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotificationHistory();
    }
  }, [activeTab]);

  async function fetchBooks() {
    const { data } = await supabase.from('books').select('*').order('id', { ascending: false });
    if (data) setBooks(data);
  }

  async function fetchSuggestions() {
    const { data } = await supabase.from('books').select('author, category');
    if (data) {
      const uniqueAuthors = Array.from(new Set(data.map(b => b.author).filter(Boolean)));
      const uniqueCats = Array.from(new Set(data.map(b => b.category).filter(Boolean)));
      setAuthors(uniqueAuthors as string[]);
      setCategories(uniqueCats as string[]);
    }
  }

  // --- FETCH NOTIFICATION HISTORY ---
  async function fetchNotificationHistory() {
    setFetchingNotifs(true);
    try {
      const res = await fetch('/api/notification');
      const data = await res.json();
      if (data.notifications) setPastNotifications(data.notifications);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setFetchingNotifs(false);
    }
  }

  // --- CANCEL SCHEDULED NOTIFICATION ---
  async function cancelNotification(id: string) {
    if (!confirm("Are you sure you want to cancel this scheduled notification?")) return;
    try {
      const res = await fetch(`/api/notification?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', msg: 'Notification cancelled successfully!' });
        fetchNotificationHistory();
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to cancel notification' });
    }
  }

  // --- NEW: EDIT NOTIFICATION LOGIC ---
  const handleEditNotif = (n: any) => {
    setEditingNotifId(n.id);
    const date = new Date(n.send_after * 1000);
    const localISO = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                    .toISOString()
                    .slice(0, 16);
    setNotifData({
      title: n.headings?.en || '',
      message: n.contents?.en || '',
      url: n.url || '',
      // OneSignal timing is in seconds, convert to local datetime-local format
      schedule_time: localISO
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (book: any) => {
    setActiveTab('library');
    setEditingId(book.id);
    setShowForm(true);
    setPdfName('Current PDF');
    setCoverName('Current Cover');
    setTimeout(() => {
      if (formRef.current) {
        (formRef.current.elements.namedItem('title') as HTMLInputElement).value = book.title;
        (formRef.current.elements.namedItem('author') as HTMLInputElement).value = book.author;
        (formRef.current.elements.namedItem('category') as HTMLInputElement).value = book.category;
        (formRef.current.elements.namedItem('description') as HTMLTextAreaElement).value = book.description || '';
      }
    }, 100);
  };

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (!error) {
      setBooks(books.filter(b => b.id !== id));
      setStatus({ type: 'success', msg: 'Book deleted successfully!' });
    }
  }

  async function fetchDuas() {
    const { data } = await supabase.from('duas').select('*').order('id', { ascending: false });
    if (data) setDuas(data);
  }

  const handleEditDua = (dua: any) => {
    setActiveTab('duas');
    setEditingId(dua.id);
    setDuaContent(dua.content);
    setShowForm(true);
    setTimeout(() => {
      if (formRef.current) {
        (formRef.current.elements.namedItem('duaTitle') as HTMLInputElement).value = dua.title;
      }
    }, 100);
  };

  async function handleDeleteDua(id: number) {
    if (!confirm('Delete this Dua?')) return;
    const { error } = await supabase.from('duas').delete().eq('id', id);
    if (!error) {
      setDuas(duas.filter(d => d.id !== id));
      setStatus({ type: 'success', msg: 'Dua removed!' });
    }
  }

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalScheduleTime = "";
    if (notifData.schedule_time) {
      const date = new Date(notifData.schedule_time);
      finalScheduleTime = date.toString();
    }

    try {
      const method = editingNotifId ? 'PUT' : 'POST';
      const bodyData = editingNotifId 
        ? { id: editingNotifId, ...notifData, schedule_time: finalScheduleTime }
        : { ...notifData, schedule_time: finalScheduleTime || null };

      const res = await fetch('/api/notification', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      
      const data = await res.json();
      
      if (data.id || data.success) {
        setStatus({ 
          type: 'success', 
          msg: editingNotifId ? 'Notification updated!' : (notifData.schedule_time ? 'Notification scheduled!' : 'Notification sent!') 
        });
        setNotifData({ title: '', message: '', url: '', schedule_time: '' });
        setEditingNotifId(null);
        fetchNotificationHistory();
      } else {
        throw new Error(data.errors?.[0] || "Action failed");
      }
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setEditingNotifId(null);
    setShowForm(false);
    setPdfName('');
    setCoverName('');
    setDuaContent('');
    setNotifData({ title: '', message: '', url: '', schedule_time: '' });
    if (formRef.current) formRef.current.reset();
  };

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;

    const slugify = (text: string) => {
      const gujaratiToLatin: { [key: string]: string } = {
        'અ': 'a', 'આ': 'aa', 'ઇ': 'i', 'ઈ': 'ee', 'ઉ': 'u', 'ઊ': 'oo', 'એ': 'e', 'ઐ': 'ai', 'ઓ': 'o', 'ઔ': 'au',
        'ક': 'k', 'ખ': 'kh', 'ગ': 'g', 'ઘ': 'gh', 'ઙ': 'n',
        'ચ': 'ch', 'છ': 'chh', 'જ': 'j', 'ઝ': 'jh', 'ઞ': 'n',
        'ટ': 't', 'ઠ': 'th', 'ડ': 'd', 'ઢ': 'dh', 'ણ': 'n',
        'ત': 't', 'થ': 'th', 'દ': 'd', 'ધ': 'dh', 'ન': 'n',
        'પ': 'p', 'ફ': 'f', 'બ': 'b', 'ભ': 'bh', 'મ': 'm',
        'ય': 'y', 'ર': 'r', 'લ': 'l', 'વ': 'v', 'શ': 'sh', 'ષ': 'sh', 'સ': 's', 'હ': 'h', 'ળ': 'l',
        'ા': 'a', 'િ': 'i', 'ી': 'ee', 'ુ': 'u', 'ૂ': 'oo', 'ે': 'e', 'ૈ': 'ai', 'ો': 'o', 'ૌ': 'au', 'ં': 'n'
      };

      return text
        .split('')
        .map(char => gujaratiToLatin[char] || char)
        .join('')
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') 
        .trim()
        .replace(/[\s_-]+/g, '-') 
        .replace(/^-+|-+$/g, '');
    };

    try {
      if (activeTab === 'library') {
        setStatus({ type: 'info', msg: editingId ? 'Updating...' : 'Uploading to GitHub...' });
        const title = (form.elements.namedItem('title') as HTMLInputElement).value;
        const author = (form.elements.namedItem('author') as HTMLInputElement).value;
        const category = (form.elements.namedItem('category') as HTMLInputElement).value;
        const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
        const pdfFile = (form.elements.namedItem('pdf') as HTMLInputElement).files?.[0];
        const coverFile = (form.elements.namedItem('cover') as HTMLInputElement).files?.[0];

        let pdfUrl = books.find(b => b.id === editingId)?.pdf_url;
        let coverUrl = books.find(b => b.id === editingId)?.cover_url;

        if (pdfFile) {
          const pdfData = new FormData();
          pdfData.append('file', pdfFile);
          pdfUrl = await uploadToGitHub(pdfData);
        }
        if (coverFile) {
          const coverData = new FormData();
          coverData.append('file', coverFile);
          coverUrl = await uploadToGitHub(coverData);
        }

        const payload = { title, author, category, description, pdf_url: pdfUrl, cover_url: coverUrl };
        const { error } = editingId ? await supabase.from('books').update(payload).eq('id', editingId) : await supabase.from('books').insert([payload]);
        if (error) throw error;
        fetchBooks();
      } else if (activeTab === 'duas') {
        setStatus({ type: 'info', msg: 'Saving Dua...' });
        const title = (form.elements.namedItem('duaTitle') as HTMLInputElement).value;
        let finalSlug = slugify(title);
        if (!editingId) finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 5)}`;
        const { error } = editingId 
          ? await supabase.from('duas').update({ title, content: duaContent }).eq('id', editingId) 
          : await supabase.from('duas').insert([{ title, content: duaContent, slug: finalSlug }]);
        if (error) throw error;
        fetchDuas();
      }
      setStatus({ type: 'success', msg: 'Successfully Saved!' });
      resetForm();
      fetchSuggestions();
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message || 'Action failed.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex">
      <div className="w-64 bg-emerald-900 text-white p-6 hidden md:flex flex-col">
        <h2 className="text-xl font-bold mb-10 flex items-center gap-2 text-emerald-100">
          <LayoutDashboard size={24} /> Admin Panel
        </h2>
        <nav className="space-y-4 flex-1">
          <button onClick={() => { setActiveTab('library'); resetForm(); }} className={`w-full text-left p-3 rounded-xl flex items-center gap-2 transition ${activeTab === 'library' && !showForm ? 'bg-emerald-800 shadow-inner' : 'hover:bg-emerald-800'}`}>
            <BookIcon size={18} /> Manage Library
          </button>
          <button onClick={() => { setActiveTab('duas'); resetForm(); }} className={`w-full text-left p-3 rounded-xl flex items-center gap-2 transition ${activeTab === 'duas' && !showForm ? 'bg-emerald-800 shadow-inner' : 'hover:bg-emerald-800'}`}>
            <Heart size={18} /> Daily Duas
          </button>
          <button onClick={() => { setActiveTab('notifications'); resetForm(); }} className={`w-full text-left p-3 rounded-xl flex items-center gap-2 transition ${activeTab === 'notifications' ? 'bg-emerald-800 shadow-inner' : 'hover:bg-emerald-800'}`}>
            <Bell size={18} /> Notifications
          </button>
          <hr className="border-emerald-800" />
          <button onClick={() => { setShowForm(true); }} className={`w-full text-left p-3 rounded-xl flex items-center gap-2 transition hover:bg-emerald-700 bg-emerald-600/20 border border-emerald-500/30 ${activeTab === 'notifications' ? 'hidden' : ''}`}>
            <Plus size={18} /> Add New {activeTab === 'library' ? 'Book' : 'Dua'}
          </button>
        </nav>
        <button onClick={handleLogout} className="mt-auto w-full text-left p-3 rounded-xl flex items-center gap-2 hover:bg-red-800 transition text-emerald-200">
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 font-serif">
              {activeTab === 'notifications' ? 'Marketing Notifications' : (showForm ? (editingId ? 'Edit Entry' : 'New Publication') : (activeTab === 'library' ? 'Library' : 'Daily Duas'))}
            </h1>
            {(showForm || editingNotifId) && (
              <button onClick={resetForm} className="bg-stone-200 text-stone-600 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-stone-300 transition">
                <X size={18} /> Cancel
              </button>
            )}
          </div>

          {status.msg && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'}`}>
              {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
              <span className="font-medium">{status.msg}</span>
            </div>
          )}

          {activeTab === 'notifications' ? (
            <div className="space-y-10">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200 relative">
                {editingNotifId && (
                  <div className="absolute top-4 right-8 text-emerald-600 text-xs font-bold uppercase flex items-center gap-1">
                    <Edit size={12} /> Editing Mode
                  </div>
                )}
                <form onSubmit={sendNotification} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1.5">Notification Title</label>
                      <input 
                        type="text" 
                        value={notifData.title}
                        onChange={(e) => setNotifData({...notifData, title: e.target.value})}
                        placeholder="Navi Book Aavi Gai!"
                        className="w-full border-2 border-stone-100 p-3.5 rounded-2xl focus:border-emerald-500 outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1.5 flex items-center gap-2">
                        <Calendar size={16} className="text-emerald-600" /> Schedule (Optional)
                      </label>
                      <input 
                        type="datetime-local" 
                        value={notifData.schedule_time}
                        onChange={(e) => setNotifData({...notifData, schedule_time: e.target.value})}
                        className="w-full border-2 border-stone-100 p-3.5 rounded-2xl focus:border-emerald-500 outline-none transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1.5">Message Body</label>
                    <textarea 
                      value={notifData.message}
                      onChange={(e) => setNotifData({...notifData, message: e.target.value})}
                      placeholder="Aaj ni khas dua vachva mate click karo."
                      className="w-full border-2 border-stone-100 p-3.5 rounded-2xl focus:border-emerald-500 outline-none transition resize-none"
                      rows={2}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1.5">Click URL</label>
                    <input 
                      type="text" 
                      value={notifData.url}
                      onChange={(e) => setNotifData({...notifData, url: e.target.value})}
                      placeholder="https://your-site.com/link"
                      className="w-full border-2 border-stone-100 p-3.5 rounded-2xl focus:border-emerald-500 outline-none transition"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all flex justify-center items-center gap-3 ${editingNotifId ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-800 text-white hover:bg-emerald-900'}`}
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (editingNotifId ? <CheckCircle size={20} /> : <Send size={20} />)}
                    {editingNotifId ? 'Update Notification' : (notifData.schedule_time ? 'Schedule Now' : 'Send Instant Broadcast')}
                  </button>
                </form>
              </div>

              {/* HISTORY SECTION */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                    <FileText size={20} className="text-stone-400" /> Recent History
                  </h3>
                  <button 
                    onClick={fetchNotificationHistory} 
                    className="p-2 hover:bg-stone-200 rounded-lg transition text-stone-500"
                    title="Refresh History"
                  >
                    <RefreshCw size={18} className={fetchingNotifs ? 'animate-spin' : ''} />
                  </button>
                </div>
                
                <div className="bg-white rounded-[1.5rem] shadow-sm border border-stone-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-stone-50 text-stone-500 text-[10px] uppercase tracking-widest">
                      <tr>
                        <th className="p-4 font-bold">Message Info</th>
                        <th className="p-4 font-bold text-center">Status</th>
                        <th className="p-4 font-bold">Time</th>
                        <th className="p-4 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {pastNotifications.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-stone-400 text-sm">No recent notifications found.</td></tr>
                      ) : pastNotifications.map((n) => {
                        const isScheduled = n.send_after && (n.send_after * 1000) > Date.now();
                        return (
                          <tr key={n.id} className="text-sm hover:bg-stone-50/50">
                            <td className="p-4">
                              <div className="font-bold text-stone-800">{n.headings?.en || "No Title"}</div>
                              <div className="text-xs text-stone-500 line-clamp-1">{n.contents?.en}</div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${isScheduled ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600'}`}>
                                {isScheduled ? 'SCHEDULED' : 'SENT'}
                              </span>
                            </td>
                            <td className="p-4 text-stone-500 text-xs">
                              {new Date((n.send_after || n.queued_at) * 1000).toLocaleString()}
                            </td>
                            <td className="p-4 text-right">
                              {isScheduled && (
                                <div className="flex gap-2 justify-end">
                                  <button 
                                    onClick={() => handleEditNotif(n)}
                                    className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition"
                                    title="Edit Notification"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button 
                                    onClick={() => cancelNotification(n.id)}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                                    title="Cancel Schedule"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : showForm ? (
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200">
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
                {activeTab === 'library' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1.5">Book Title</label>
                        <input name="title" required className="w-full border-2 border-stone-100 p-3.5 rounded-2xl focus:border-emerald-500 outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1.5">Author</label>
                        <input name="author" list="authors-list" required className="w-full border-2 border-stone-100 p-3.5 rounded-2xl focus:border-emerald-500 outline-none" />
                        <datalist id="authors-list">{authors.map(a => <option key={a} value={a} />)}</datalist>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1.5">Category</label>
                        <input name="category" list="cats-list" required className="w-full border-2 border-stone-100 p-3.5 rounded-2xl focus:border-emerald-500 outline-none" />
                        <datalist id="cats-list">{categories.map(c => <option key={c} value={c} />)}</datalist>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1.5">Description</label>
                        <textarea name="description" rows={3} className="w-full border-2 border-stone-100 p-3.5 rounded-2xl focus:border-emerald-500 outline-none resize-none"></textarea>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className={`border-3 border-dashed p-8 rounded-[2rem] text-center ${pdfName ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 bg-stone-50'}`}>
                        <label className="cursor-pointer block">
                          <Upload className="mx-auto mb-3" size={32} />
                          <span className="text-sm font-bold block">{pdfName || "Select PDF"}</span>
                          <input type="file" name="pdf" accept=".pdf" className="hidden" onChange={(e) => setPdfName(e.target.files?.[0]?.name || '')} />
                        </label>
                      </div>
                      <div className={`border-3 border-dashed p-8 rounded-[2rem] text-center ${coverName ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 bg-stone-50'}`}>
                        <label className="cursor-pointer block">
                          <Upload className="mx-auto mb-3" size={32} />
                          <span className="text-sm font-bold block">{coverName || "Select Cover"}</span>
                          <input type="file" name="cover" accept="image/*" className="hidden" onChange={(e) => setCoverName(e.target.files?.[0]?.name || '')} />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1.5">Dua Title</label>
                      <input name="duaTitle" required className="w-full border-2 border-stone-100 p-3.5 rounded-2xl focus:border-emerald-500 outline-none transition" placeholder="e.g. Safar ki Dua" />
                    </div>
                    <div className="h-[400px] mb-12">
                      <label className="block text-sm font-bold text-stone-700 mb-1.5">Dua Content (Text & Images)</label>
                      <ReactQuill theme="snow" value={duaContent} onChange={setDuaContent} className="h-[300px]" />
                    </div>
                  </div>
                )}
                
                <button disabled={loading} className="w-full bg-emerald-800 text-white py-4.5 rounded-2xl font-bold hover:bg-emerald-900 shadow-xl transition-all flex justify-center items-center gap-3 text-lg">
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} />}
                  {loading ? 'Processing...' : 'Save Changes'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-widest">
                  <tr>
                    <th className="p-6 font-bold">{activeTab === 'library' ? 'Book' : 'Dua Name'}</th>
                    <th className="p-6 font-bold">{activeTab === 'library' ? 'Category' : 'Date'}</th>
                    <th className="p-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {(activeTab === 'library' ? books : (activeTab === 'duas' ? duas : [])).map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/50 transition">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          {activeTab === 'library' && <img src={item.cover_url} className="w-12 h-16 object-cover rounded-lg shadow-sm" />}
                          <div>
                            <div className="font-bold text-stone-800 text-lg">{item.title}</div>
                            {activeTab === 'library' && <div className="text-sm text-stone-500">{item.author}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-sm text-stone-500 font-medium">
                        {activeTab === 'library' ? item.category : new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => activeTab === 'library' ? handleEdit(item) : handleEditDua(item)} className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl border border-stone-100"><Edit size={18} /></button>
                          <button onClick={() => activeTab === 'library' ? handleDelete(item.id) : handleDeleteDua(item.id)} className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl border border-stone-100"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}