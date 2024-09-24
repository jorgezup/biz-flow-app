import { useEffect, useState } from 'react';
import apiUrl from '@/utils/api';
import { useTranslations } from 'next-intl';


interface EntityListProps<T> {
  endpoint: string;
  columns: Array<{ header: string; accessor: (item: T) => React.ReactNode }>;
  entityName: string;
  createLink: string;
  rowKey: (item: T) => string | number;
}

const EntityList = <T,>({
  endpoint,
  columns,
  entityName,
  createLink,
  rowKey,
}: EntityListProps<T>) => {
  const [entities, setEntities] = useState<T[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const c = useTranslations('common');
  const m = useTranslations('messages');

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const response = await fetch(`${apiUrl}/${endpoint}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${entityName}`);
        }
        const data: T[] = await response.json();
        setEntities(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, [endpoint, entityName]);

  const filteredEntities = entities.filter((entity) =>
    columns.some((col) => {
      const value = col.accessor(entity);
      return (
        typeof value === 'string' &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
  );

  if (loading) {
    return <div className="flex justify-center items-center h-screen">{m('loading')}</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">{c(`${entityName}s`)}</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <div className="mb-4 w-full space-x-4 flex items-center justify-center">
          <input
            type="text"
            placeholder={c('searchByName')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-2 px-4 border rounded flex-1"
          />
          <a className="bg-blue-500 text-white rounded py-2 px-4" href={createLink}>
            {c('new')} {c(`${entityName}`)}
          </a>
        </div>
        {entities.length === 0 ? (
          <div className="text-red-500 mt-4 text-center">{c('noDataFound')}</div>
        ) : (
          <table className="mt-4 w-full bg-white table-auto">
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <th key={index} className="py-2 px-4 border-b border-gray-200">
                    {c(`${col.header}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEntities.map((entity) => (
                <tr key={rowKey(entity)} className="hover:bg-gray-100">
                  {columns.map((col, index) => (
                    <td key={index} className="py-2 px-4 border-b border-gray-200 text-center">
                      {col.accessor(entity)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EntityList;
