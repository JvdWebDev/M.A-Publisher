'use client';
import { useState, useEffect, useRef } from 'react';
import { uploadToGitHub } from './actions';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Upload, Book as BookIcon, Trash2, Edit, X,
  Plus, LayoutDashboard, Loader2, CheckCircle, AlertCircle, LogOut, FileText
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [showForm, setShowForm] = useState(false);
  
  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Suggestions State
  const [authors, setAuthors] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  // File Name States
  const [pdfName, setPdfName] = useState('');
  const [coverName, setCoverName] = useState('');

  // Form reference for resetting and filling
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };
    checkUser();
    fetchBooks();
    fetchSuggestions();
  }, []);

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

  // Handle Edit Click
  const handleEdit = (book: any) => {
    setEditingId(book.id);
    setShowForm(true);
    setPdfName('Current PDF');
    setCoverName('Current Cover');
    
    // Fill form after state update
    setTimeout(() => {
      if (formRef.current) {
        (formRef.current.elements.namedItem('title') as HTMLInputElement).value = book.title;
        (formRef.current.elements.namedItem('author') as HTMLInputElement).value = book.author;
        (formRef.current.elements.namedItem('category') as HTMLInputElement).value = book.category;
        (formRef.current.elements.namedItem('description') as HTMLTextAreaElement).value = book.description || '';
      }
    }, 100);
  };

  // Reset/Cancel Form
  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setPdfName('');
    setCoverName('');
    if (formRef.current) formRef.current.reset();
  };

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (!error) {
      setBooks(books.filter(b => b.id !== id));
      setStatus({ type: 'success', msg: 'Book deleted successfully!' });
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: 'info', msg: editingId ? 'Updating...' : 'Uploading to GitHub...' });

    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const author = (form.elements.namedItem('author') as HTMLInputElement).value;
    const category = (form.elements.namedItem('category') as HTMLInputElement).value;
    const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
    
    const pdfFile = (form.elements.namedItem('pdf') as HTMLInputElement).files?.[0];
    const coverFile = (form.elements.namedItem('cover') as HTMLInputElement).files?.[0];

    try {
      let pdfUrl = books.find(b => b.id === editingId)?.pdf_url;
      let coverUrl = books.find(b => b.id === editingId)?.cover_url;

      // Only upload if new file is selected
      if (pdfFile) {
        const pdfData = new FormData();
        pdfData.append('file', pdfFile);
        pdfUrl = await uploadToGitHub(pdfData);
      }

      if (coverFile) {
        setStatus({ type: 'info', msg: 'Uploading Cover Image...' });
        const coverData = new FormData();
        coverData.append('file', coverFile);
        coverUrl = await uploadToGitHub(coverData);
      }

      const bookPayload = {
        title,
        author,
        category,
        description,
        pdf_url: pdfUrl,
        cover_url: coverUrl
      };

      let error;
      if (editingId) {
        const result = await supabase.from('books').update(bookPayload).eq('id', editingId);
        error = result.error;
      } else {
        if (!pdfFile || !coverFile) throw new Error("Please select files for new book.");
        const result = await supabase.from('books').insert([bookPayload]);
        error = result.error;
      }

      if (error) throw error;

      setStatus({ type: 'success', msg: editingId ? 'Updated!' : 'Published!' });
      resetForm();
      fetchBooks(); 
      fetchSuggestions();
    } catch (err: any) {
      console.error("Error:", err);
      setStatus({ type: 'error', msg: err.message || 'Action failed.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex">
      {/* Sidebar */}
      <div className="w-64 bg-emerald-900 text-white p-6 hidden md:flex flex-col">
        <h2 className="text-xl font-bold mb-10 flex items-center gap-2 text-emerald-100">
          <LayoutDashboard size={24} /> Admin Panel
        </h2>
        <nav className="space-y-4 flex-1">
          <button onClick={resetForm} className={`w-full text-left p-3 rounded-xl flex items-center gap-2 transition ${!showForm ? 'bg-emerald-800 shadow-inner' : 'hover:bg-emerald-800'}`}>
            <BookIcon size={18} /> Manage Library
          </button>
          <button onClick={() => { resetForm(); setShowForm(true); }} className={`w-full text-left p-3 rounded-xl flex items-center gap-2 transition ${showForm && !editingId ? 'bg-emerald-800 shadow-inner' : 'hover:bg-emerald-800'}`}>
            <Plus size={18} /> Add New Book
          </button>
        </nav>
        <button onClick={handleLogout} className="mt-auto w-full text-left p-3 rounded-xl flex items-center gap-2 hover:bg-red-800 transition text-emerald-200 hover:text-white">
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 font-serif">
              {editingId ? 'Edit Book' : showForm ? 'New Book Publication' : 'Library Management'}
            </h1>
            {showForm ? (
                <button onClick={resetForm} className="bg-stone-200 text-stone-600 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-stone-300 transition">
                    <X size={18} /> Cancel
                </button>
            ) : (
              <button 
                onClick={() => setShowForm(true)}
                className="bg-emerald-700 text-white px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-emerald-800 transition shadow-lg active:scale-95"
              >
                <Plus size={18} /> New Entry
              </button>
            )}
          </div>

          {status.msg && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'}`}>
              {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
              <span className="font-medium">{status.msg}</span>
            </div>
          )}

          {showForm ? (
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200 transition-all duration-300">
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Text Data */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1.5">Book Title</label>
                      <input name="title" required className="w-full border-2 border-stone-100 p-3.5 rounded-2xl focus:border-emerald-500 outline-none transition" placeholder="e.g. Kulsum nu Kismat" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1.5">Author</label>
                      <input name="author" list="authors-list" required className="w-full border-2 border-stone-100 p-3.5 rounded-2xl focus:border-emerald-500 outline-none transition" placeholder="Search or type new author..." />
                      <datalist id="authors-list">
                        {authors.map(a => <option key={a} value={a} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1.5">Category</label>
                      <input name="category" list="cats-list" required className="w-full border-2 border-stone-100 p-3.5 rounded-2xl focus:border-emerald-500 outline-none transition" placeholder="Search or type new category..." />
                      <datalist id="cats-list">
                        {categories.map(c => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1.5">Description (Optional)</label>
                      <textarea name="description" rows={3} className="w-full border-2 border-stone-100 p-3.5 rounded-2xl focus:border-emerald-500 outline-none transition resize-none" placeholder="Brief about the book content..."></textarea>
                    </div>
                  </div>

                  {/* Right Column: Files */}
                  <div className="space-y-6">
                    <div className={`border-3 border-dashed p-8 rounded-[2rem] text-center transition-all ${pdfName ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 bg-stone-50'}`}>
                      <label className="cursor-pointer block">
                        <Upload className={`mx-auto mb-3 ${pdfName ? 'text-emerald-600' : 'text-stone-400'}`} size={32} />
                        <span className={`text-sm font-bold block mb-1 ${pdfName ? 'text-emerald-700' : 'text-stone-600'}`}>
                          {pdfName ? pdfName : "Select PDF Document"}
                        </span>
                        {pdfName && <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold">✓ Selected</span>}
                        <input type="file" name="pdf" accept=".pdf" className="hidden" onChange={(e) => setPdfName(e.target.files?.[0]?.name || '')} />
                      </label>
                    </div>

                    <div className={`border-3 border-dashed p-8 rounded-[2rem] text-center transition-all ${coverName ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 bg-stone-50'}`}>
                      <label className="cursor-pointer block">
                        <Upload className={`mx-auto mb-3 ${coverName ? 'text-emerald-600' : 'text-stone-400'}`} size={32} />
                        <span className={`text-sm font-bold block mb-1 ${coverName ? 'text-emerald-700' : 'text-stone-600'}`}>
                          {coverName ? coverName : "Select Cover Image"}
                        </span>
                        {coverName && <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold">✓ Selected</span>}
                        <input type="file" name="cover" accept="image/*" className="hidden" onChange={(e) => setCoverName(e.target.files?.[0]?.name || '')} />
                      </label>
                    </div>

                    <button 
                      disabled={loading}
                      className="w-full bg-emerald-800 text-white py-4.5 rounded-2xl font-bold hover:bg-emerald-900 shadow-xl transition-all active:scale-95 disabled:bg-stone-300 flex justify-center items-center gap-3 text-lg"
                    >
                      {loading ? <Loader2 className="animate-spin" size={24} /> : editingId ? <CheckCircle size={24} /> : <Upload size={24} />}
                      {loading ? 'Processing...' : editingId ? 'Update Book' : 'Publish to Library'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* Books Table */
            <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-widest">
                  <tr>
                    <th className="p-6 font-bold">Book</th>
                    <th className="p-6 font-bold">Category</th>
                    <th className="p-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {books.map((book) => (
                    <tr key={book.id} className="hover:bg-stone-50/50 transition">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <img src={book.cover_url} alt="cover" className="w-14 h-20 object-cover rounded-xl shadow-md border border-stone-100" />
                          <div>
                            <div className="font-bold text-stone-800 text-lg leading-tight">{book.title}</div>
                            <div className="text-sm text-stone-500 mt-1">{book.author}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                          {book.category}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(book)} className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-2xl transition shadow-sm bg-white border border-stone-100">
                            <Edit size={20} />
                          </button>
                          <button onClick={() => handleDelete(book.id)} className="p-3 text-red-600 hover:bg-red-50 rounded-2xl transition shadow-sm bg-white border border-stone-100">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {books.length === 0 && (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="bg-stone-100 p-6 rounded-full text-stone-300">
                    <BookIcon size={48} />
                  </div>
                  <p className="text-stone-400 font-medium italic">Your library is waiting for its first masterpiece.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}