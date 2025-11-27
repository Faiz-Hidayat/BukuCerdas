import React from 'react';
import { ShoppingBag, Star, StarHalf } from 'lucide-react';
import { motion } from 'framer-motion';

const books = [
  { title: 'Atomic Habits', author: 'James Clear', price: 'Rp 185.000', rating: 5, img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80' },
  { title: 'The Psychology of Money', author: 'Morgan Housel', price: 'Rp 120.000', rating: 5, img: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80' },
  { title: 'Design of Everyday Things', author: 'Don Norman', price: 'Rp 210.000', rating: 5, img: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80' },
  { title: 'Sapiens: A Brief History', author: 'Yuval Noah Harari', price: 'Rp 195.000', rating: 4.5, img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80' },
];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex text-amber-400 text-xs">
      {[...Array(Math.floor(rating))].map((_, i) => (
        <Star key={i} className="w-3 h-3 fill-current" />
      ))}
      {rating % 1 !== 0 && <StarHalf className="w-3 h-3 fill-current" />}
    </div>
  );
};

const BestSellers: React.FC = () => {
  return (
    <section id="katalog" className="py-24 bg-white relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight mb-4">Buku Terlaris Minggu Ini</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Pilihan favorit para pembaca cerdas kami. Jangan sampai kehabisan stok.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {books.map((book, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative aspect-[2/3] bg-slate-100 rounded-lg overflow-hidden mb-5 shadow-sm group-hover:shadow-xl transition-all duration-300">
                <img src={book.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={book.title} />
                <button className="absolute bottom-4 right-4 bg-white text-slate-900 p-2.5 rounded-full shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-slate-900 hover:text-white">
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 leading-tight mb-1 group-hover:text-amber-800 transition-colors">{book.title}</h3>
                <p className="text-sm text-slate-500 mb-2">{book.author}</p>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-900">{book.price}</span>
                  <StarRating rating={book.rating} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;