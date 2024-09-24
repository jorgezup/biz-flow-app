import {useTranslations} from 'next-intl';
 
export default function NotFoundPage() {
  const t = useTranslations('notFound');
  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <p className="text-lg">{t('message')}</p>
    </div>
  );
}