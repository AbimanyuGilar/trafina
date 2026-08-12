interface InvitationTypes {
  url: string,
  org: string,
}

export function getInvitationHTML({url, org}: InvitationTypes) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f7; color: #51545e; margin: 0; padding: 20px; }
          .container { max-width: 570px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; border: 1px solid #eaeaec; }
          
          /* Tombol dengan warna bg-blue-600 Tailwind (#2563eb) */
          .button { 
            display: inline-block; 
            background-color: #2563eb; 
            color: #ffffff !important; 
            padding: 12px 24px; 
            border-radius: 6px; 
            text-decoration: none; 
            font-weight: 600; 
            margin-top: 20px; 
          }
          .button:hover {
            background-color: #1d4ed8; /* Tailwind blue-700 untuk efek hover */
          }

          .footer { margin-top: 30px; font-size: 12px; color: #a8aaaf; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Anda telah menerima undangan dari perusahaan ${org}</h2>
          <p>Silakan klik tombol di bawah untuk menerima undangan dan bergabung dengan ${org}</p>
          
          <!-- Tombol Menggunakan Hex dari blue-600 -->
          <a href="${url}" class="button" target="_blank">Terima Undangan</a>
          
          <p style="margin-top: 30px; font-size: 13px;">
            Jika tombol di atas tidak bisa diklik, salin dan tempel tautan berikut di browser Anda:<br>
            <a href="${url}" style="color: #2563eb;">${url}</a>
          </p>
          
          <div class="footer">
            <p>Jika Anda tidak merasa mendaftar akun ini, abaikan saja email ini.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}