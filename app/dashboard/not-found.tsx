import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mt-4">
        Halaman Tidak Ditemukan
      </h2>
      <p className="text-gray-500 mt-2 max-w-md">
        Maaf, halaman yang kamu cari mungkin telah dihapus, diubah namanya, atau tidak pernah ada.
      </p>
      
      <Link
        href="/"
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}