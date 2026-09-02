import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col gap-10 justify-center items-center">
      <div className="flex gap-5 justify-center items-center">
        <Image
            src="/notfoundicon.png"
            alt="Page Not Found Background"
            width={900}
            height={900}
            priority
            className="h-auto w-50 object-contain"
          />

          <h1 className="font-black text-3xl text-blue-600">Halaman Tidak Ditemukan</h1>
      </div>

      <Link href={'/'} className="bg-blue-600 text-white px-4 py-2 font-bold rounded-md cursor-pointer hover:scale-110 transition">Kembali</Link>
    </div>
  );
}