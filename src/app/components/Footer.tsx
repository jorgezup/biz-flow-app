import { useTranslations } from 'next-intl'; 

const Footer = () => {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-2 w-full no-print">
      <div className="container mx-auto text-center">
        <p className="text-xs">© {currentYear} Jorge Zupirolli. {t('copyright')}</p>
      </div>
    </footer>
  );
};

export default Footer;
