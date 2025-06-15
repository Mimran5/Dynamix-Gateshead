import React, { useState } from 'react';
import { newsItems } from '../data/news';
import { Calendar, ArrowRight } from 'lucide-react';

const NewsUpdates: React.FC = () => {
  const [expandedNews, setExpandedNews] = useState<string | null>(null);
  const toggleExpand = (id: string) => {
    setExpandedNews(expandedNews === id ? null : id);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <section id="news" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">News & Updates</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed about the latest happenings at our studio, from new classes and events to special promotions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg"
            >
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span 
                    className="text-xs font-semibold px-2 py-1 rounded-full"
                    style={{ backgroundColor: getCategoryColor(item.category), color: getCategoryTextColor(item.category) }}
                  >
                    {getCategoryLabel(item.category)}
                  </span>
                  <div className="flex items-center text-gray-500 text-sm ml-3">
                    <Calendar size={14} className="mr-1" />
                    {formatDate(item.date)}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                
                {expandedNews === item.id ? (
                  <div className="text-gray-600 mb-4 animate-fadeIn">
                    <p>{item.content}</p>
                    {item.action && (
                      <a
                        href={item.action.link}
                        target={item.action.link.startsWith('http') ? '_blank' : undefined}
                        rel={item.action.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="mt-4 inline-flex items-center bg-primary-600 text-white px-4 py-2 rounded-full font-medium hover:bg-primary-700 transition-colors"
                      >
                        {item.action.text}
                        <ArrowRight size={16} className="ml-2" />
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 mb-4">{item.excerpt}</p>
                )}
                
                <button 
                  onClick={() => toggleExpand(item.id)}
                  className="text-primary-600 font-medium inline-flex items-center hover:text-primary-800 transition-colors"
                >
                  {expandedNews === item.id ? 'Read Less' : 'Read More'}
                  <ArrowRight size={16} className={`ml-1 transition-transform duration-300 ${
                    expandedNews === item.id ? 'rotate-90' : ''
                  }`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

function getCategoryColor(category: string): string {
  switch (category) {
    case 'announcement':
      return '#E3F2FD';
    case 'event':
      return '#E8F5E9';
    case 'promotion':
      return '#FFF3E0';
    default:
      return '#F5F5F5';
  }
}

function getCategoryTextColor(category: string): string {
  switch (category) {
    case 'announcement':
      return '#1976D2';
    case 'event':
      return '#2E7D32';
    case 'promotion':
      return '#E65100';
    default:
      return '#616161';
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'announcement':
      return 'Announcement';
    case 'event':
      return 'Event';
    case 'promotion':
      return 'Promotion';
    default:
      return 'News';
  }
}

export default NewsUpdates;