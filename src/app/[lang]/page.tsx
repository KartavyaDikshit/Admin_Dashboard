'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CategoryList from '@/components/public/CategoryList';
import ReportList from '@/components/public/ReportList';

// --- MOCK DATA ---
const mockCategories = {
  en: [ { id: '1', name: 'Technology' }, { id: '2', name: 'Health' }, { id: '3', name: 'Finance' }, { id: '4', name: 'Science' }, { id: '5', name: 'Travel' }, { id: '6', name: 'Business' }, ],
  de: [ { id: '1', name: 'Technologie' }, { id: '2', name: 'Gesundheit' }, { id: '3', name: 'Finanzen' }, { id: '4', name: 'Wissenschaft' }, { id: '5', name: 'Reisen' }, { id: '6', name: 'Geschäft' }, ],
  ko: [ { id: '1', name: '기술' }, { id: '2', name: '건강' }, { id: '3', name: '금융' }, { id: '4', name: '과학' }, { id: '5', name: '여행' }, { id: '6', name: '사업' }, ],
};
const mockReports = {
  en: [ { id: '1', title: 'The Future of AI', summary: 'An in-depth look at the future of artificial intelligence and its impact on society.', imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500' }, { id: '2', title: 'Advances in Renewable Energy', summary: 'Exploring the latest breakthroughs in solar and wind power.', imageUrl: 'https://images.unsplash.com/photo-1497435334364-802844927144?w=500' }, { id: '3', title: 'Global Economic Outlook 2025', summary: 'Predictions and analysis of the world economy for the coming year.', imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=500' }, ],
  de: [ { id: '1', title: 'Die Zukunft der KI', summary: 'Ein detaillierter Blick auf die Zukunft der künstlichen Intelligenz und ihre Auswirkungen auf die Gesellschaft.', imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500' }, { id: '2', title: 'Fortschritte bei erneuerbaren Energien', summary: 'Erkundung der neuesten Durchbrüche in der Solar- und Windenergie.', imageUrl: 'https://images.unsplash.com/photo-1497435334364-802844927144?w=500' }, { id: '3', title: 'Globaler Wirtschaftsausblick 2025', summary: 'Prognosen und Analysen der Weltwirtschaft für das kommende Jahr.', imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=500' }, ],
  ko: [ { id: '1', title: 'AI의 미래', summary: '인공 지능의 미래와 사회에 미치는 영향에 대한 심층 분석.', imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500' }, { id: '2', title: '재생 에너지의 발전', summary: '태양광 및 풍력 발전의 최신 혁신 기술 탐구.', imageUrl: 'https://images.unsplash.com/photo-1497435334364-802844927144?w=500' }, { id: '3', title: '2025년 세계 경제 전망', summary: '내년 세계 경제에 대한 예측 및 분석.', imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=500' }, ],
};
// --- END MOCK DATA ---

export default function PublicHomePage() {
  const params = useParams();
  const lang = (Array.isArray(params.lang) ? params.lang[0] : params.lang) || 'en';

  const [categories, setCategories] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const safeLang = lang in mockCategories ? lang : 'en';
    setCategories(mockCategories[safeLang]);
    setReports(mockReports[safeLang]);
  }, [lang]);

  return (
    <div>
      <div className="relative bg-indigo-800">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600"
            alt="People working"
          />
          <div className="absolute inset-0 bg-indigo-800 mix-blend-multiply" aria-hidden="true" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            TBI Knowledge Hub
          </h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
            Explore our latest reports and browse by category to stay informed on the latest trends and insights.
          </p>
        </div>
      </div>

      <CategoryList categories={categories} />
      <ReportList reports={reports} />
    </div>
  );
}
