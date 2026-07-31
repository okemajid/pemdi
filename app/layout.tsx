import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PEMDI - Pemerintahan Digital",
  description: "Sistem Penyimpanan Bukti Dukung Pemerintahan Digital Kabupaten Ciamis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var originalFetch = window.fetch;
                window.fetch = async function() {
                  var args = arguments;
                  var res = await originalFetch.apply(this, args);
                  try {
                    var request = args[0];
                    var config = args[1] || {};
                    var method = 'GET';
                    if (request && typeof request === 'object' && request.method) {
                       method = request.method;
                    } else if (config.method) {
                       method = config.method;
                    }
                    method = method.toUpperCase();
                    
                    if (res.ok && ['POST', 'PUT', 'DELETE'].includes(method)) {
                      var url = typeof request === 'string' ? request : (request && request.url ? request.url : '');
                      if (url && !url.includes('/api/log') && !url.includes('/api/login')) {
                        var aksi = method === 'POST' ? 'Tambah Data' : method === 'PUT' ? 'Update Data' : 'Hapus Data';
                        var detail = '';
                        
                        try {
                          if (config.body && typeof config.body === 'string') {
                             var bodyObj = JSON.parse(config.body);
                             if (bodyObj.nama) detail = 'Data: ' + bodyObj.nama;
                             else if (bodyObj.email) detail = 'Data: ' + bodyObj.email;
                          } else if (config.body && config.body.get) {
                             var nama = config.body.get('nama');
                             if (nama) detail = 'Data: ' + nama.toString();
                          }
                        } catch(e) {}
                        
                        var path = url;
                        try {
                          var urlObj = new URL(url, window.location.origin);
                          path = urlObj.pathname;
                          if (path.indexOf('/api/') === 0) path = path.substring(5);
                        } catch(e) {}
                        
                        detail = detail ? detail + ' pada ' + path : 'Proses ' + method + ' pada ' + path;

                        var currentUserRaw = sessionStorage.getItem("logged_in_user");
                        if (currentUserRaw) {
                          var u = JSON.parse(currentUserRaw);
                          if (u && u.nama) {
                            originalFetch('/api/log', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ userId: u.nama, aksi: aksi, detail: detail })
                            }).catch(function(){});
                          }
                        }
                      }
                    }
                  } catch (e) {}
                  return res;
                };
              })();
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
