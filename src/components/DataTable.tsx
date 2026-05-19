import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Download } from 'lucide-react';
import { SensorData } from '../types';

interface DataTableProps {
  data: SensorData[];
}

const DataTable = ({ data }: DataTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof SensorData>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const filteredData = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const effectiveItemsPerPage = itemsPerPage === 9999 ? filteredData.length : itemsPerPage;

  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return sortDirection === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const totalPages = Math.ceil(sortedData.length / effectiveItemsPerPage);
  const startIndex = (currentPage - 1) * effectiveItemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + effectiveItemsPerPage);

  const handleSort = (field: keyof SensorData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleItemsPerPageChange = (val: number) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Kelembapan Tanah', 'Kelembapan Udara', 'Suhu Udara', 'Kecerahan', 'Waktu'];
    const csvContent = [
      headers.join(','),
      ...sortedData.map((item) =>
        [item.id, item.kelembapanTanah, item.kelembapanUdara, item.suhuUdara, item.kecerahan, item.waktu].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sensor_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: keyof SensorData }) => {
    if (sortField !== field) return <span className="text-gray-300 ml-1">⇅</span>;
    return <span className="text-emerald-500 ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const getStatusBadge = (value: number, type: string) => {
    let color = 'bg-green-100 text-green-700';
    if (type === 'tanah') {
      if (value < 40) color = 'bg-red-100 text-red-700';
      else if (value > 80) color = 'bg-yellow-100 text-yellow-700';
    } else if (type === 'udara_hum') {
      if (value < 50) color = 'bg-orange-100 text-orange-700';
      else if (value > 85) color = 'bg-blue-100 text-blue-700';
    } else if (type === 'suhu') {
      if (value < 20) color = 'bg-blue-100 text-blue-700';
      else if (value > 35) color = 'bg-red-100 text-red-700';
    } else if (type === 'cahaya') {
      if (value < 300) color = 'bg-gray-100 text-gray-700';
      else if (value > 800) color = 'bg-yellow-100 text-yellow-700';
    }
    return color;
  };

  const showPagination = effectiveItemsPerPage < sortedData.length && totalPages > 1;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">📋 Data Sensor</h3>
            <p className="text-sm text-gray-500 mt-1">Total: {filteredData.length} data ditemukan</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari data..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
              />
            </div>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('id')}
              >
                ID <SortIcon field="id" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('kelembapanTanah')}
              >
                Kelembapan Tanah <SortIcon field="kelembapanTanah" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('kelembapanUdara')}
              >
                Kelembapan Udara <SortIcon field="kelembapanUdara" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('suhuUdara')}
              >
                Suhu Udara <SortIcon field="suhuUdara" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('kecerahan')}
              >
                Kecerahan <SortIcon field="kecerahan" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('waktu')}
              >
                Waktu <SortIcon field="waktu" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedData.map((item) => (
              <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">#{item.id}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.kelembapanTanah, 'tanah')}`}>
                    {item.kelembapanTanah}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.kelembapanUdara, 'udara_hum')}`}>
                    {item.kelembapanUdara}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.suhuUdara, 'suhu')}`}>
                    {item.suhuUdara}°C
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.kecerahan, 'cahaya')}`}>
                    {item.kecerahan} Lux
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{item.waktu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <p className="text-sm text-gray-500">
          Menampilkan {startIndex + 1}-{Math.min(startIndex + effectiveItemsPerPage, sortedData.length)} dari {sortedData.length} data
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <label htmlFor="rowsPerPage" className="font-medium text-gray-700 whitespace-nowrap">Tampilkan:</label>
            <select
              id="rowsPerPage"
              value={itemsPerPage}
              onChange={(e) => {
                const val = Number(e.target.value);
                handleItemsPerPageChange(val);
              }}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={9999}>Semua</option>
            </select>
            <span className="font-medium text-gray-700">baris</span>
          </div>
          {showPagination && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page = i + 1;
                if (totalPages > 5) {
                  if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center border ${
                      currentPage === page
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                        : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50 hover:shadow-sm hover:border-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataTable;

