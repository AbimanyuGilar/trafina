import crypto from 'crypto'

export const generateSlug = (text: string): string => {
  return text
    .toString()                         // 1. Pastikan input berupa string
    .toLowerCase()                      // 2. Ubah semua huruf menjadi huruf kecil
    .trim()                             // 3. Hapus spasi berlebih di awal & akhir teks
    .normalize('NFD')                   // 4. Pisahkan huruf aksen (misal: "é" -> "e")
    .replace(/[\u0300-\u036f]/g, '')     // 5. Hapus tanda diakritik/aksen tersebut
    .replace(/[^a-z0-9 -]/g, '')        // 6. Hapus semua karakter khusus selain huruf, angka, spasi, & strip
    .replace(/\s+/g, '-')               // 7. Ganti satu atau beberapa spasi berturut-turut dengan satu tanda strip (-)
    .replace(/-+/g, '-')                // 8. Cegah strip ganda (misal: "a--b" -> "a-b")
    .replace(/^-+|-+$/g, '')            // 9. Hapus strip di paling awal atau paling akhir jika ada
}

export const generateUniqueSlug = (name: string) => {
  const baseSlug = generateSlug(name)
  const randomBytes = crypto.randomBytes(3).toString('hex')

  return baseSlug ? `${baseSlug}-${randomBytes}` : randomBytes
}