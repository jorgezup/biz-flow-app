import { useTranslations } from 'next-intl';


export default function Page() {
  const t = useTranslations('index');

  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-5xl font-bold mb-4">{t('title')}</h1>
      <p className="text-lg mb-4">{t('subtitle')}</p>
    </div>
  );
}

