import React, { useState } from 'react';
import { 
  BookCopy, Search, PlusCircle, 
  MapPin, MessageSquare, 
  Filter, BookOpen,
  ArrowLeftRight, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

const BookSwap: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'BROWSE' | 'MY_LISTINGS'>('BROWSE');
  const [books, setBooks] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', condition: 'Near Mint', price: 'Swap Only', color: '#8b5cf6' });

  React.useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      if (res.ok) setBooks(await res.json());
    } catch(e) { console.error(e); }
  };

  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author) return;
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBook, ownerId: user?.id })
      });
      if (res.ok) {
        setShowAdd(false);
        setNewBook({ title: '', author: '', condition: 'Near Mint', price: 'Swap Only', color: '#8b5cf6' });
        fetchBooks();
      }
    } catch(e) { console.error(e); }
  };

  const handleRequestTrade = async (id: string) => {
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REQUESTED', requestorId: user?.id })
      });
      if (res.ok) fetchBooks();
    } catch(e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookCopy className="text-primary" /> Book Swap Nexus
          </h1>
          <p className="text-white/50">Sustainable resource sharing for the modern student</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">
             <Star size={18} /> Wishlist
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <PlusCircle size={18} /> List a Book
          </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-white/5 rounded-2xl w-fit border border-white/5">
        {['BROWSE', 'MY_LISTINGS'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            {tab === 'BROWSE' ? 'Browse Exchange' : 'Manage My Vault'}
          </button>
        ))}
      </div>

      <div className="flex gap-4 p-4 glass rounded-2xl border border-white/10 items-center justify-between">
         <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none" placeholder="Search by title, author, or ISBN..." />
         </div>
         <div className="flex gap-2">
            <button className="btn-secondary py-2 text-xs">
              <Filter size={14} /> Subject
            </button>
            <button className="btn-secondary py-2 text-xs">
              <MapPin size={14} /> Semester
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book, idx) => (
          <motion.div 
            key={book.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 flex flex-col gap-5 group hover:border-primary/30"
          >
            <div className="flex items-start gap-4">
               <div className="w-20 h-28 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/10 relative overflow-hidden group-hover:border-primary/20">
                  <BookOpen size={40} className="group-hover:text-primary transition-colors" />
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: book.color }} />
               </div>
               <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-lg leading-tight line-clamp-2">{book.title}</h3>
                  <p className="text-xs text-white/40">{book.author}</p>
                  <div className="pt-2 flex flex-wrap gap-1">
                     <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[8px] font-bold text-white/40 uppercase uppercase tracking-tighter">S7 Core</span>
                     <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[8px] font-bold text-white/40 uppercase tracking-tighter">{book.condition}</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/40">
                    {book.owner_name?.charAt(0) || '?'}
                  </div>
                  <span className="text-xs font-medium text-white/60">{book.owner_name || 'Anonymous'}</span>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Price / Deal</p>
                   <p className="text-xs font-bold text-accent italic">{book.price}</p>
                </div>
            </div>

            <div className="flex gap-2">
               {book.status === 'AVAILABLE' ? (
                 <button onClick={() => handleRequestTrade(book.id)} className="flex-1 btn-primary py-3 text-xs justify-center font-bold">
                   Request Trade <ArrowLeftRight size={14} className="ml-2" />
                 </button>
               ) : (
                 <button disabled className="flex-1 btn-primary bg-white/5 border-white/10 text-white/40 py-3 text-xs justify-center font-bold">
                   Requested
                 </button>
               )}
               <button className="w-12 h-12 glass rounded-xl flex items-center justify-center hover:bg-white/10 text-white/40 hover:text-white transition-all">
                 <MessageSquare size={18} />
               </button>
            </div>
          </motion.div>
        ))}
        {books.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 p-12 text-center text-white/30 italic glass rounded-[2rem] border border-white/5">
            The book vault is currently empty. Be the first to list a resource!
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-lg glass p-8 rounded-3xl space-y-6">
                <h2 className="text-2xl font-bold italic tracking-tighter">Vault Deposit Record</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Manifest Title</label>
                    <input value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50" placeholder="e.g. Introduction to Algorithms" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Author</label>
                      <input value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50" placeholder="e.g. CLRS" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Physical State</label>
                      <select value={newBook.condition} onChange={e => setNewBook({...newBook, condition: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50">
                        <option value="Mint" className="bg-[#050505]">Mint (S-Tier)</option>
                        <option value="Near Mint" className="bg-[#050505]">Near Mint (A-Tier)</option>
                        <option value="Good" className="bg-[#050505]">Good (B-Tier)</option>
                        <option value="Worn" className="bg-[#050505]">Worn (C-Tier)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Exchange terms</label>
                    <input value={newBook.price} onChange={e => setNewBook({...newBook, price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50" placeholder="e.g. Swap Only or ₹2000" />
                  </div>
                </div>
                <button className="w-full btn-primary py-4 justify-center" onClick={handleAddBook}>Deposit Artifact</button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookSwap;
