# Teknik Genel Bakış

## Giriş

Retro App, Next.js 15, Supabase ve TypeScript ile geliştirilmiş modern, gerçek zamanlı bir retrospektif toplantı yönetim uygulamasıdır. Takımların özelleştirilebilir şablonlar, gerçek zamanlı işbirliği ve sürükle-bırak fonksiyonları ile yapılandırılmış retrospektif oturumları yürütmesine olanak tanır.

## Proje Vizyonu

Uygulama, takım retrospektif toplantılarını şu özellikleri sağlayarak kolaylaştırmayı amaçlar:

- **Gerçek Zamanlı İşbirliği**: Birden fazla takım üyesi aynı anda yorum ekleyebilir ve taşıyabilir
- **Şablon Tabanlı İş Akışı**: Önceden tanımlanmış şablonlar (örn. Başla/Dur/Devam Et) retrospektif yapısına rehberlik eder
- **Takım Yönetimi**: Davet tokenleri ile güvenli takım tabanlı erişim
- **Modern UX**: Sürükle-bırak etkileşimleri ile temiz, sezgisel arayüz

## Temel Özellikler

### 1. Kimlik Doğrulama ve Takım Yönetimi

- Supabase Auth üzerinden güvenli kimlik doğrulama
- Takım tabanlı erişim kontrolü
- Takım katılımı için davet token sistemi
- Takım ilişkilendirmeleri için kullanıcı metadata depolama

### 2. Retrospektif Yönetimi

- Özelleştirilebilir şablonlarla retro oluşturma
- Çoklu şablon desteği (Başla/Dur/Devam Et, vb.)
- Şablon tabanlı kolon yapısı
- Retro geçmişi ve arşivleme

### 3. Gerçek Zamanlı İşbirliği

- Supabase Realtime üzerinden WebSocket tabanlı gerçek zamanlı güncellemeler
- Canlı yorum eklemeleri, güncellemeleri ve silme işlemleri
- Kolonlar arası sürükle-bırak yorum yeniden sıralama
- Akıcı kullanıcı deneyimi için iyimser UI güncellemeleri

### 4. Yorum Sistemi

- Belirli kolonlara yorum ekleme
- Kendi yorumlarınızı düzenleme ve silme
- Sürükle-bırak ile kolonlar arası yorum taşıma
- Tüm bağlı istemciler arasında gerçek zamanlı senkronizasyon

## Teknoloji Yığını

### Frontend

- **Next.js 15.5.2**: App Router ile React framework
- **React 19.1.0**: Server Components desteği olan UI kütüphanesi
- **TypeScript**: Type-safe geliştirme
- **TailwindCSS 4**: Utility-first CSS framework
- **shadcn/ui**: Radix UI üzerine inşa edilmiş yüksek kaliteli React bileşenleri
- **React Hook Form**: Zod validation ile form state yönetimi
- **TanStack Query**: Server state yönetimi ve önbellekleme
- **React DnD**: Sürükle-bırak fonksiyonalitesi

### Backend ve Altyapı

- **Supabase**: Backend-as-a-Service
    - PostgreSQL veritabanı
    - Gerçek zamanlı abonelikler
    - Kimlik doğrulama
    - Row Level Security (RLS)
- **Bun**: JavaScript runtime ve paket yöneticisi

### Geliştirici Araçları

- **ESLint**: Kod linting
- **Prettier**: Kod formatlama
- **TypeScript**: Statik tip kontrolü

## Mimari Genel Bakış

Uygulama modern, ölçeklenebilir bir mimari izler:

```
┌─────────────────────────────────────────────────────────────┐
│                    İstemci (Tarayıcı)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Sayfalar   │  │  Bileşenler  │  │  Contextler  │     │
│  │ (App Router) │  │    (UI)      │  │   (State)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Queries    │  │   Actions    │  │  Middleware  │
│  (İstemci)   │  │   (Server)   │  │    (Auth)    │
└──────────────┘  └──────────────┘  └──────────────┘
         │                 │                 │
         └─────────────────┴─────────────────┘
                          │
                          ▼
               ┌──────────────────────┐
               │   Supabase Backend   │
               │  ┌───────────────┐   │
               │  │   PostgreSQL  │   │
               │  ├───────────────┤   │
               │  │     Auth      │   │
               │  ├───────────────┤   │
               │  │   Realtime    │   │
               │  └───────────────┘   │
               └──────────────────────┘
```

## Proje Yapısı

```
retro-app/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Kimlik doğrulama sayfaları
│   │   ├── (main)/              # Ana uygulama
│   │   └── layout.tsx           # Root layout
│   │
│   ├── actions/                  # Server Actions
│   │   ├── auth.ts              # Kimlik doğrulama işlemleri
│   │   └── retro.ts             # Retro CRUD işlemleri
│   │
│   ├── queries/                  # İstemci tarafı queries
│   │   ├── auth.ts              # Auth queries ve mutations
│   │   └── retro.ts             # Retro queries ve mutations
│   │
│   ├── components/               # React bileşenleri
│   │   ├── Auth/                # Kimlik doğrulama formları
│   │   ├── Retro/               # Retro ile ilgili bileşenler
│   │   ├── RetroCreate/         # Retro oluşturma akışı
│   │   ├── Layouts/             # Layout bileşenleri
│   │   ├── Shared/              # Paylaşılan araçlar
│   │   └── ui/                  # shadcn/ui bileşenleri
│   │
│   ├── contexts/                 # React Context providers
│   │   ├── AuthContext.tsx      # Kimlik doğrulama durumu
│   │   └── RetroContext.tsx     # Retro durumu ve gerçek zamanlı güncellemeler
│   │
│   ├── lib/                      # Yardımcı araçlar ve yapılandırmalar
│   │   ├── supabase/            # Supabase clientları ve schema
│   │   ├── constants.ts         # Uygulama sabitleri
│   │   └── utils.ts             # Yardımcı fonksiyonlar
│   │
│   └── middleware.ts             # Route koruması için Next.js middleware
│
├── public/                       # Statik varlıklar
├── docs/                         # Dokümantasyon
└── .cursor/                      # Cursor AI kuralları
```

## Veritabanı Şeması

### Tablolar

**teams**

- `id`: UUID (Primary Key)
- `name`: Text
- `invite_token`: Text (unique)
- `created_at`: Timestamp

**retros**

- `id`: UUID (Primary Key)
- `name`: Text
- `team_id`: UUID (Foreign Key → teams)
- `template_id`: UUID (Foreign Key → retro_templates)
- `created_at`: Timestamp

**retro_templates**

- `id`: UUID (Primary Key)
- `title`: Text
- `description`: Text
- `template_columns`: JSON (kolon tanımları dizisi)
- `cover_url`: Text
- `background_color`: Text
- `category_id`: UUID
- `created_at`: Timestamp

**retro_comments**

- `id`: UUID (Primary Key)
- `retro_id`: UUID (Foreign Key → retros)
- `column_id`: Text
- `comment`: Text
- `user_id`: UUID
- `created_at`: Timestamp

### İlişkiler

- Bir **team**'in birçok **retro**'su vardır
- Bir **retro**, bir **team**'e ve bir **template**'e aittir
- Bir **retro**'nun birçok **comment**'i vardır
- Bir **template**, retrolar için yapıyı (kolonları) tanımlar

## Temel Kavramlar

### Server vs Client Bileşenleri

Uygulama, Next.js App Router'ın hibrit render'ını kullanır:

**Server Bileşenleri** (varsayılan):

- Sayfa layout'ları
- İlk veri çekme işlemleri
- SEO-kritik içerik
- Azaltılmış JavaScript bundle boyutu

**Client Bileşenleri** (`'use client'`):

- Etkileşimli UI öğeleri
- Validation içeren formlar
- Gerçek zamanlı abonelikler
- Context provider'lar

### Veri Akışı

1. **İlk Yükleme**: Server Componentler, Server Actions üzerinden veri çeker
2. **Client Hydration**: Veri, props üzerinden Client Componentlere aktarılır
3. **Kullanıcı Etkileşimleri**: Client Componentler TanStack Query mutation'larını kullanır
4. **Gerçek Zamanlı Güncellemeler**: Supabase Realtime değişiklikleri tüm istemcilere yayınlar
5. **İyimser Güncellemeler**: UI anında güncellenir, arka planda sunucu ile senkronize olur

## Güvenlik

- **Row Level Security (RLS)**: Supabase policy'leri takım tabanlı erişimi zorunlu kılar
- **Middleware Koruması**: Route'lar edge'de korunur
- **Takım İzolasyonu**: Kullanıcılar sadece kendi takımlarının verilerine erişir
- **Davet Tokenleri**: Güvenli takım katılımı
- **Environment Variables**: Hassas verilar `.env.local` dosyasında

## Sonraki Adımlar

- [Başlangıç Kılavuzu](./02-baslangic.md)
- [Mimari Detayları](./03-mimari.md)
- [Kimlik Doğrulama Sistemi](./04-kimlik-dogrulama.md)
- [Veri Katmanı](./05-veri-katmani.md)
- [Bileşen Kılavuzu](./06-bilesenler.md)
- [Deployment](./07-deployment.md)
